import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';
import { ApiKeyManagerService } from 'src/common/aipKeyManager/api-key-manager.service';

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
          selected_combo_id: comboId,
          status: 'ACTIVE',
          end_date: { gt: new Date() },
        },
        include: {
          routine_package: true,
        },
        orderBy: { created_at: 'desc' },
      },
    );

    if (!subscription) {
      throw new BadRequestException(
        'No active subscription found. Please subscribe to the package first.',
      );
    }

    const totalAnalysesInSub = await this.prisma.skin_analyses.count({
      where: {
        user_id: userId,
        created_at: {
          gte: subscription.start_date,
          lte: subscription.end_date,
        },
      },
    });

    const existingRoutinesCount = await this.prisma.user_routines.count({
      where: {
        user_package_subscription_id: subscription.id,
      },
    });

    const createdRoutinePairs = existingRoutinesCount / 2;

    if (createdRoutinePairs >= totalAnalysesInSub) {
      throw new BadRequestException(
        `You have created enough routines (${totalAnalysesInSub}) corresponding to the number of skin analyses available. Please perform a new skin analysis to update your routine.`,
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
          const template =
            await this.prisma.product_usage_instructions.findUnique({
              where: { usage_role: productInfo.usage_role },
              include: {
                sub_steps: { orderBy: { step_order: 'asc' } },
              },
            });

          if (template?.sub_steps?.length) {
            await this.prisma.user_routine_sub_steps.createMany({
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

  async getUserSkinAnalyses(userId: string, days: number = 7) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const skinAnalyses = await this.prisma.skin_analyses.findMany({
      where: {
        user_id: userId,
        created_at: { gte: start },
      },
      include: {
        skin_type: true,
        metrics: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (skinAnalyses.length < 2) {
      return {
        user_id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        skin_analyses: [],
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        message: `At least 2 analyses are required between ${
          start.toISOString().split('T')[0]
        } and ${end.toISOString().split('T')[0]}`,
      };
    }

    const analyzesWithTrend: any[] = [];
    for (let i = 0; i < skinAnalyses.length; i++) {
      const current = skinAnalyses[i];
      const previous = skinAnalyses[i + 1];

      let scoreTrend: number | null = null;
      if (current.overall_score && previous?.overall_score) {
        scoreTrend =
          Number(current.overall_score) - Number(previous.overall_score);
      }

      analyzesWithTrend.push({
        id: current.id,
        skin_type_code: current.skin_type.code,
        overall_score: current.overall_score
          ? Number(current.overall_score)
          : null,
        overall_comment: current.overall_comment,
        created_at: current.created_at.toISOString(),
        face_image_url: current.face_image_url,
        overall_score_trend: scoreTrend,
        metrics: current.metrics.map((m) => ({
          metric_type: m.metric_type,
          score: m.score ? Number(m.score) : null,
        })),
      });
    }

    return {
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      skin_analyses: analyzesWithTrend,
    };
  }
}
