import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

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

    const res = await this.ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });

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

    if (!parsed.morning || !parsed.evening) {
      throw new BadRequestException('AI response missing morning/evening');
    }

    const validProductIds = combo.combo_products.map((cp) => cp.product.id);

    const morning = await this.prisma.user_routines.create({
      data: {
        user_package_subscription_id: subscription.id,
        routine_time: 'MORNING',
      },
    });

    for (const step of parsed.morning.steps) {
      if (!validProductIds.includes(step.productId)) {
        throw new BadRequestException(`Invalid productId: ${step.productId}`);
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

    const evening = await this.prisma.user_routines.create({
      data: {
        user_package_subscription_id: subscription.id,
        routine_time: 'EVENING',
      },
    });

    for (const step of parsed.evening.steps) {
      if (!validProductIds.includes(step.productId)) {
        throw new BadRequestException(`Invalid productId: ${step.productId}`);
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
      subscriptionId: subscription.id,
      morningRoutineId: morning.id,
      eveningRoutineId: evening.id,
    };
  }

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

  async getRoutinePackages() {
    return this.prisma.routine_packages.findMany();
  }
}
