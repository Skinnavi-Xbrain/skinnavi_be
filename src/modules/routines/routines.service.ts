import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ApiKeyManagerService } from 'src/common/aipKeyManager/api-key-manager.service';

const GEMINI_MODEL = 'gemini-2.5-flash';

@Injectable()
export class RoutinesService {
  private ai: GoogleGenAI;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
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
        if (
          error?.status === 429 ||
          error?.message?.includes('429') ||
          error?.message?.toLowerCase().includes('quota')
        ) {
          this.apiKeyManager.getNextKey();
          attempts++;
        } else {
          throw error;
        }
      }
    }
    throw new BadRequestException('All API keys exhausted');
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
    if (!analysis) throw new NotFoundException('Skin analysis not found');

    const pkg = await this.prisma.routine_packages.findUnique({
      where: { id: routinePackageId },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const combo = await this.prisma.skincare_combos.findUnique({
      where: { id: comboId },
      include: {
        combo_products: { include: { product: true } },
      },
    });
    if (!combo || !combo.combo_products.length) {
      throw new BadRequestException('Combo has no products');
    }

    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + pkg.duration_days);

    const subscription = await this.prisma.user_package_subscriptions.create({
      data: {
        user_id: userId,
        routine_package_id: routinePackageId,
        selected_combo_id: comboId,
        start_date: start,
        end_date: end,
      },
    });

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

    const saveRoutine = async (time: 'MORNING' | 'EVENING', steps: any[]) => {
      const routine = await this.prisma.user_routines.create({
        data: {
          user_package_subscription_id: subscription.id,
          routine_time: time,
        },
      });

      for (const step of steps) {
        if (!validProductIds.includes(step.productId)) {
          throw new BadRequestException(`Invalid productId: ${step.productId}`);
        }

        const productInfo = combo.combo_products.find(
          (cp) => cp.product.id === step.productId,
        )?.product;

        const createdStep = await this.prisma.user_routine_steps.create({
          data: {
            user_routine_id: routine.id,
            step_order: step.step,
            instruction: `${step.title}: ${step.howTo}`,
            product_id: step.productId,
          },
        });

        if (productInfo?.usage_role) {
          const instructionTemplate =
            await this.prisma.product_usage_instructions.findUnique({
              where: { usage_role: productInfo.usage_role },
              include: { sub_steps: { orderBy: { step_order: 'asc' } } },
            });

          if (instructionTemplate && instructionTemplate.sub_steps.length > 0) {
            const subStepsData = instructionTemplate.sub_steps.map((ss) => ({
              user_routine_step_id: createdStep.id,
              title: ss.title,
              how_to: ss.how_to,
              image_url: ss.image_url,
            }));

            await this.prisma.user_routine_sub_steps.createMany({
              data: subStepsData,
            });
          }
        }
      }
      return routine.id;
    };

    const morningRoutineId = await saveRoutine('MORNING', parsed.morning.steps);
    const eveningRoutineId = await saveRoutine('EVENING', parsed.evening.steps);

    return {
      subscriptionId: subscription.id,
      morningRoutineId,
      eveningRoutineId,
    };
  }

  async getAllRoutinesByUser(userId: string) {
    return this.prisma.user_routines.findMany({
      where: {
        subscription: { user_id: userId },
      },
      include: {
        steps: {
          include: { product: true, sub_steps: true },
          orderBy: { step_order: 'asc' },
        },
        subscription: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getLatestRoutineByUser(userId: string) {
    const [morning, evening] = await Promise.all([
      this.prisma.user_routines.findFirst({
        where: {
          subscription: { user_id: userId },
          routine_time: 'MORNING',
        },
        include: {
          steps: {
            include: { product: true, sub_steps: true },
            orderBy: { step_order: 'asc' },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.user_routines.findFirst({
        where: {
          subscription: { user_id: userId },
          routine_time: 'EVENING',
        },
        include: {
          steps: {
            include: { product: true, sub_steps: true },
            orderBy: { step_order: 'asc' },
          },
        },
        orderBy: {
          created_at: 'desc',
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
