import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';
import { ApiKeyManagerService } from 'src/common/aipKeyManager/api-key-manager.service';
import { routine_time_enum, subscription_status_enum } from '@prisma/client';
import { Order } from '@Constant/index';

const GEMINI_MODEL = 'gemini-2.5-flash';

@Injectable()
export class RoutinesService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(RoutinesService.name);

  constructor(
    private prisma: PrismaService,
    private apiKeyManager: ApiKeyManagerService,
  ) {
    const apiKey = this.apiKeyManager.getCurrentKey();
    this.ai = new GoogleGenAI({ apiKey });
  }

  private async generateContentWithRetry(
    modelName: string,
    contentParams: any,
  ) {
    let attempts = 0;

    while (attempts < this.apiKeyManager.totalKeys) {
      const apiKey = this.apiKeyManager.getCurrentKey();

      const ai = new GoogleGenAI({
        apiKey: apiKey,
      });

      try {
        return await ai.models.generateContent({
          model: modelName,
          contents: contentParams,
        });
      } catch (error: any) {
        const status = error?.status;
        const message = error?.message?.toLowerCase() || '';

        if (
          status === 429 ||
          message.includes('429') ||
          message.includes('quota')
        ) {
          this.logger.warn(`API key quota exceeded. Switching key...`);
          this.apiKeyManager.getNextKey();
          attempts++;
          continue;
        }

        if (status === 503 || message.includes('high demand')) {
          const delay = (attempts + 1) * 2000;
          this.logger.warn(`Model overloaded. Retrying in ${delay}ms`);

          await new Promise((resolve) => setTimeout(resolve, delay));
          attempts++;
          continue;
        }

        throw error;
      }
    }

    throw new BadRequestException(
      'All API keys exhausted or service unavailable',
    );
  }

  private toVNTime(date: Date): Date {
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
  }

  private toDateOnly(date: Date): Date {
    const vnDate = this.toVNTime(date);
    return new Date(
      Date.UTC(
        vnDate.getUTCFullYear(),
        vnDate.getUTCMonth(),
        vnDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
  }

  async createRoutine(params: {
    userId: string;
    skinAnalysisId: string;
    routinePackageId: string;
    comboId: string;
  }) {
    const { userId, skinAnalysisId, routinePackageId, comboId } = params;

    const analysis = await this.prisma.skin_analyses.findFirst({
      where: { id: skinAnalysisId, user_id: userId },
      include: { metrics: true, skin_type: true },
    });

    if (!analysis) {
      throw new NotFoundException('Skin analysis not found');
    }

    const combo = await this.prisma.skincare_combos.findUnique({
      where: { id: comboId },
      include: { combo_products: { include: { product: true } } },
    });

    if (!combo || !combo.combo_products.length) {
      throw new BadRequestException('Combo has no products');
    }

    const subscription = await this.prisma.user_package_subscriptions.findFirst(
      {
        where: {
          user_id: userId,
          routine_package_id: routinePackageId,
          status: subscription_status_enum.ACTIVE,
          end_date: { gt: new Date() },
        },
        include: { routine_package: true },
        orderBy: { created_at: Order.DESC },
      },
    );

    if (!subscription) {
      throw new BadRequestException(
        'No active subscription found. Please subscribe to the package first.',
      );
    }

    const metricsText = analysis.metrics
      .map((m) => `${m.metric_type}: ${m.score}`)
      .join(', ');

    const comboProductsText = combo.combo_products
      .map(
        (cp) =>
          `- ${cp.product.name} (id: ${cp.product.id}, role: ${cp.product.usage_role ?? 'N/A'})`,
      )
      .join('\n');

    const prompt = `
    You are an AI skincare routine expert.
    Based on this data, generate a DAILY skincare routine.
  
    Skin type: ${analysis.skin_type.code}
    Metrics: ${metricsText}
  
    Selected combo products:
    ${comboProductsText}
  
    Return ONLY valid JSON:
  
    {
      "morning": {
        "steps": [
          { "step": number, "title": string, "howTo": string, "productId": "uuid" }
        ]
      },
      "evening": {
        "steps": [
          { "step": number, "title": string, "howTo": string, "productId": "uuid" }
        ]
      }
    }
  
    Rules:
    - Use ONLY productId from the list above.
    - step must be number.
    - No markdown, no explanation.
    `;

    const res = await this.generateContentWithRetry(GEMINI_MODEL, [
      { role: 'user', parts: [{ text: prompt }] },
    ]);

    const raw =
      (res as any).text ?? res.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new BadRequestException('AI did not return JSON');

    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new BadRequestException('AI returned invalid JSON');
    }

    const validProductIds = combo.combo_products.map((cp) => cp.product.id);
    const normalizedNow = this.toDateOnly(new Date());

    return await this.prisma.$transaction(async (tx) => {
      await tx.user_routines.updateMany({
        where: {
          subscription: {
            user_id: userId,
          },
          is_active: true,
        },
        data: { is_active: false },
      });

      const saveRoutineData = async (time: routine_time_enum, steps: any[]) => {
        const routine = await tx.user_routines.create({
          data: {
            user_package_subscription_id: subscription.id,
            routine_time: time,
            skin_analysis_id: skinAnalysisId,
            created_at: normalizedNow,
            is_active: true,
          },
        });

        for (const step of steps) {
          if (!validProductIds.includes(step.productId)) continue;

          const productInfo = combo.combo_products.find(
            (cp) => cp.product.id === step.productId,
          )?.product;

          const createdStep = await tx.user_routine_steps.create({
            data: {
              user_routine_id: routine.id,
              step_order: step.step,
              instruction: `${step.title}: ${step.howTo}`,
              product_id: step.productId,
            },
          });

          if (productInfo?.usage_role) {
            const template = await tx.product_usage_instructions.findUnique({
              where: { usage_role: productInfo.usage_role },
              include: { sub_steps: { orderBy: { step_order: Order.ASC } } },
            });

            if (template?.sub_steps?.length) {
              await tx.user_routine_sub_steps.createMany({
                data: template.sub_steps.map((ss) => ({
                  user_routine_step_id: createdStep.id,
                  title: ss.title,
                  how_to: ss.how_to,
                  image_url: ss.image_url,
                })),
              });
            }
          }
        }
        return routine.id;
      };

      const morningRoutineId = await saveRoutineData(
        routine_time_enum.MORNING,
        parsed.morning.steps,
      );
      const eveningRoutineId = await saveRoutineData(
        routine_time_enum.EVENING,
        parsed.evening.steps,
      );

      return {
        subscriptionId: subscription.id,
        morningRoutineId,
        eveningRoutineId,
      };
    });
  }

  async getAllRoutinesByUser(userId: string) {
    return this.prisma.user_routines.findMany({
      where: {
        subscription: { user_id: userId },
      },
      include: {
        steps: {
          include: { product: true, sub_steps: true },
          orderBy: { step_order: Order.ASC },
        },
        subscription: true,
      },
      orderBy: {
        created_at: Order.DESC,
      },
    });
  }

  async getLatestRoutineByUser(userId: string) {
    const [morning, evening] = await Promise.all([
      this.prisma.user_routines.findFirst({
        where: {
          subscription: { user_id: userId },
          routine_time: 'MORNING',
          is_active: true,
        },
        include: {
          steps: {
            include: { product: true, sub_steps: true },
            orderBy: { step_order: Order.ASC },
          },
        },
        orderBy: {
          created_at: Order.DESC,
        },
      }),
      this.prisma.user_routines.findFirst({
        where: {
          subscription: { user_id: userId },
          routine_time: 'EVENING',
          is_active: true,
        },
        include: {
          steps: {
            include: { product: true, sub_steps: true },
            orderBy: { step_order: Order.ASC },
          },
        },
        orderBy: {
          created_at: Order.DESC,
        },
      }),
    ]);

    return { morning, evening };
  }

  async getRoutinePackages() {
    return this.prisma.routine_packages.findMany();
  }

  async getStepDetail(stepId: string) {
    const step = await this.prisma.user_routine_steps.findUnique({
      where: { id: stepId },
      include: { product: true, sub_steps: true },
    });
    if (!step) {
      throw new NotFoundException('Routine step not found');
    }
    return step;
  }
}
