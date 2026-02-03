import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

const GEMINI_MODEL = 'gemini-2.5-flash';

@Injectable()
export class RoutinesService {
  private ai: GoogleGenAI;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is required');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async createRoutine(params: {
    userId: string;
    skinAnalysisId: string;
    userPackageSubscriptionId: string;
  }) {
    const { userId, skinAnalysisId, userPackageSubscriptionId } = params;

    // 👉 1. Lấy analysis + metrics
    const analysis = await this.prisma.skin_analyses.findFirst({
      where: { id: skinAnalysisId, user_id: userId },
      include: { metrics: true, skin_type: true },
    });

    if (!analysis) {
      throw new NotFoundException('Skin analysis not found');
    }

    // 👉 2. Lấy subscription + combo + products
    const subscription = await this.prisma.user_package_subscriptions.findFirst(
      {
        where: { id: userPackageSubscriptionId, user_id: userId },
        include: {
          selected_combo: {
            include: {
              combo_products: {
                include: { product: true },
              },
            },
          },
        },
      },
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const comboProducts = subscription.selected_combo.combo_products;

    if (!comboProducts.length) {
      throw new BadRequestException('Selected combo has no products');
    }

    // 👉 3. Build AI input
    const metricsText = analysis.metrics
      .map((m) => `${m.metric_type}: ${m.score}`)
      .join(', ');

    const comboProductsText = comboProducts
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

    // 👉 4. Gọi AI
    const res = await this.ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });

    const raw =
      (res as any).text ?? res.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new BadRequestException('AI did not return JSON');
    }

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

    if (!parsed.morning || !parsed.evening) {
      throw new BadRequestException('AI response missing morning/evening');
    }

    const validProductIds = comboProducts.map((cp) => cp.product.id);

    // 👉 5. Save MORNING routine
    const morning = await this.prisma.user_routines.create({
      data: {
        user_package_subscription_id: subscription.id,
        routine_time: 'MORNING',
      },
    });

    for (const step of parsed.morning.steps) {
      if (!validProductIds.includes(step.productId)) {
        throw new BadRequestException(
          `Invalid productId in morning: ${step.productId}`,
        );
      }

      await this.prisma.user_routine_steps.create({
        data: {
          user_routine_id: morning.id,
          step_order: step.step,
          instruction: `${step.title}: ${step.howTo}`,
          product_id: step.productId,
        },
      });
    }

    // 👉 6. Save EVENING routine
    const evening = await this.prisma.user_routines.create({
      data: {
        user_package_subscription_id: subscription.id,
        routine_time: 'EVENING',
      },
    });

    for (const step of parsed.evening.steps) {
      if (!validProductIds.includes(step.productId)) {
        throw new BadRequestException(
          `Invalid productId in evening: ${step.productId}`,
        );
      }

      await this.prisma.user_routine_steps.create({
        data: {
          user_routine_id: evening.id,
          step_order: step.step,
          instruction: `${step.title}: ${step.howTo}`,
          product_id: step.productId,
        },
      });
    }

    return {
      morningId: morning.id,
      eveningId: evening.id,
    };
  }

  /**
   * 👉 Lấy routine của user
   */
  async getRoutineByUser(userId: string) {
    return this.prisma.user_routines.findMany({
      where: {
        subscription: { user_id: userId },
      },
      include: {
        steps: {
          include: { product: true },
          orderBy: { step_order: 'asc' },
        },
      },
    });
  }
}
