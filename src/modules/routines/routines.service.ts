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

    // predefined step instructions for common product roles
    const STATIC_ROUTINE_INSTRUCTIONS: Record<
      string,
      {
        title: string;
        subSteps: { title: string; howTo: string; imageUrl: string }[];
      }
    > = {
      // keys are lowercase role names for easier matching
      'makeup remover': {
        title: 'Makeup Remover',
        subSteps: [
          {
            title: 'Apply makeup remover to cotton',
            howTo:
              'Pour enough makeup remover onto a cotton pad to fully moisten it.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712179/Apply-makeup_jwpsws.png',
          },
          {
            title: 'Gently wipe the eye & lip area',
            howTo:
              'Hold the cotton pad on the makeup area for 5–10 seconds to dissolve the makeup, then gently wipe from the inner corner outward.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712533/Genly-wipe-the-eyes_laphxe.png',
          },
          {
            title: 'Clean the entire face',
            howTo:
              'Use a new cotton pad and gently wipe across your face until the pad comes away clean.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712179/Clean-the-face_kmtigf.png',
          },
        ],
      },
      cleanser: {
        title: 'Cleanser',
        subSteps: [
          {
            title: 'Wet your face with water',
            howTo:
              'Use cool or lukewarm water (avoid hot water) to fully wet your face before applying cleanser.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712177/Wet-the-face_gzw3i8.png',
          },
          {
            title: 'Wash your face with cleanser',
            howTo:
              'Take a small amount of cleanser and lather it in your hands. Gently massage onto your face in upward circular motions for 30–60 seconds.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712177/Wash-the-face-with-cleanser_wrskj6.png',
          },
          {
            title: 'Rinse your face with water again',
            howTo:
              'Rinse with cool or lukewarm water until no foam or residue remains.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712180/Rinse-the-face_v4ig1s.png',
          },
          {
            title: 'Dry your face',
            howTo:
              'Use a soft, clean towel to gently pat your skin dry. Avoid rubbing to protect your skin barrier.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712178/Dry-the-face_orroyo.png',
          },
        ],
      },
      toner: {
        title: 'Toner',
        subSteps: [
          {
            title: 'Dispense an appropriate amount of toner',
            howTo: 'Pour 3–5 drops into your palm or apply onto a cotton pad.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712181/Dispense_ar63n2.png',
          },
          {
            title: 'Apply toner evenly',
            howTo: 'Gently pat or swipe from the center of your face outward.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712180/Apply-toner_xbca29.png',
          },
          {
            title: 'Wait for skin to absorb',
            howTo:
              'Wait a few seconds for the toner to fully absorb before moving to the next step.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712177/Wait-for-skin-to-absorb_pufoft.png',
          },
        ],
      },
      moisturizer: {
        title: 'Moisturizer',
        subSteps: [
          {
            title: 'Take an Moisturizer amount enough',
            howTo: 'Use a pea-sized amount (more if your skin is dry).',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712180/Take-an-moisturizer_ey3rib.png',
          },
          {
            title: 'Dot moisturizer evenly on face',
            howTo:
              'Dot the cream on forehead, both cheeks, nose and chin to distribute evenly.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712176/Dot-moisturizer_tyo41r.png',
          },
          {
            title: 'Apply a gentle moisturizer',
            howTo:
              'Spread the cream in motions from the inside outward and upward.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712179/Apply-moisturizer_w7iyyb.png',
          },
          {
            title: 'Apply to lock moisture',
            howTo:
              'Press both palms onto your face for 5–10 seconds to help the cream absorb better.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712179/Apply-to-lock-moisture_pcrc1a.png',
          },
        ],
      },
      serum: {
        title: 'Serum',
        subSteps: [
          {
            title: 'Take an appropriate amount of serum',
            howTo: 'Drop 2–3 drops of serum onto your palm.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712177/Take-serum_trxc1x.png',
          },
          {
            title: 'Apply serum onto clean skin',
            howTo:
              'Gently dot onto forehead, cheeks and chin while the skin is still slightly damp.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712177/Apply-serum_omcwbv.png',
          },
          {
            title: 'Gently pat for absorption',
            howTo:
              'Use fingertips to gently pat all over the face to help the essence penetrate deeply. Wait about 30–60 seconds before applying moisturizer.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712179/Gently-pat_hikapl.png',
          },
        ],
      },
      sunscreen: {
        title: 'Sunscreen',
        subSteps: [
          {
            title: 'Take a sufficient amount of sunscreen',
            howTo:
              'Use about a two-finger length for the entire face and neck.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772713057/Take-sunscreen_zbormk.png',
          },
          {
            title: 'Distribute sunscreen evenly on the skin',
            howTo: 'Dot onto forehead, both cheeks, nose, chin and neck.',
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712180/Distribute-sunscreen_nsdrsr.png',
          },
          {
            title: 'Blend thoroughly and cover evenly with sunscreen',
            howTo:
              "Apply gently, ensuring you don't miss the corners of the nose or hairline.",
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772713149/Blend_jvaeoj.png',
          },
          {
            title: 'Reapply sunscreen to maintain effectiveness',
            howTo: "Reapply every 2–3 hours if you're outdoors.",
            imageUrl:
              'https://res.cloudinary.com/dmw3x9yre/image/upload/v1772712179/Reapply-sunscreen_qxdnei.png',
          },
        ],
      },
    };

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

    // determine list of valid product IDs early for reuse
    const validProductIds = combo.combo_products.map((cp) => cp.product.id);

    // try to build a static routine if any product has a predefined role
    let parsed: any;
    const staticStepsPresent = combo.combo_products.some((cp) => {
      const key = cp.product.usage_role?.toLowerCase();
      return key ? !!STATIC_ROUTINE_INSTRUCTIONS[key] : false;
    });
    if (staticStepsPresent) {
      const steps: any[] = [];
      for (const cp of combo.combo_products) {
        const key = cp.product.usage_role?.toLowerCase() ?? '';
        const instruction = STATIC_ROUTINE_INSTRUCTIONS[key];
        if (instruction) {
          steps.push({
            step: steps.length + 1,
            title: instruction.title,
            howTo: instruction.title,
            productId: cp.product.id,
            subSteps: instruction.subSteps,
          });
        }
      }
      parsed = { morning: { steps }, evening: { steps } };
    }

    const prompt = `
    You are an AI skincare routine expert.
    All text in your response (titles, instructions and sub-step details) must be written in clear English.
    Based on this data, generate a DAILY skincare routine.
  
    Skin type: ${analysis.skin_type.code}
    Metrics: ${metricsText}
  
    Selected combo products:
    ${comboProductsText}
  
    Return ONLY valid JSON:
  
    {
      "morning": {
        "steps": [
          {
            "step": number,
            "title": string,
            "howTo": string,
            "productId": "uuid",
            "subSteps": [
              { "title": string, "howTo": string, "imageUrl": "url" }
            ]
          }
        ]
      },
      "evening": {
        "steps": [
          {
            "step": number,
            "title": string,
            "howTo": string,
            "productId": "uuid",
            "subSteps": [
              { "title": string, "howTo": string, "imageUrl": "url" }
            ]
          }
        ]
      }
    }
  
    Rules:
    - Use ONLY productId from the list above.
    - step must be number.
    - include a "subSteps" array for every step (may be empty). when non-empty include title, howTo, and a single imageUrl per subStep.
    - No markdown, no explanation.
    - Do not output any Vietnamese or other languages.
    `;

    if (!parsed) {
      const res = await this.ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0,
          topP: 0.1,
          topK: 1,
        },
      });

      const raw =
        (res as any).text ?? res.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!raw) throw new BadRequestException('AI did not return JSON');

      const cleaned = raw
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      // define expected structure from AI
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new BadRequestException('AI returned invalid JSON');
      }

      // handle alternate casing that the model might return (snake_case or plural forms)
      const normalize = (part: any) => {
        if (!part || !Array.isArray(part.steps)) return;
        for (const step of part.steps) {
          // sub_steps -> subSteps
          if (Array.isArray(step.sub_steps) && !step.subSteps) {
            step.subSteps = step.sub_steps;
          }
          // single image fields: image_url or imageUrl or image_urls
          if (Array.isArray(step.subSteps)) {
            for (const sub of step.subSteps) {
              if (typeof sub.image_url === 'string' && !sub.imageUrl) {
                sub.imageUrl = sub.image_url;
              }
              if (typeof sub.imageUrls === 'string' && !sub.imageUrl) {
                sub.imageUrl = sub.imageUrls as unknown as string;
              }
              if (Array.isArray(sub.image_urls) && !sub.imageUrl) {
                // if model returns array (older prompt), take first image
                sub.imageUrl = sub.image_urls[0];
              }
            }
          }
        }
      };

      normalize(parsed.morning as any);
      normalize(parsed.evening as any);
    }

    if (!parsed.morning || !parsed.evening) {
      throw new BadRequestException('AI response missing morning/evening');
    }

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

      const createdStep = await this.prisma.user_routine_steps.create({
        data: {
          user_routine_id: morning.id,
          step_order: step.step,
          instruction: `${step.title}: ${step.howTo}`,
          product_id: step.productId,
        },
      });

      if (Array.isArray(step.subSteps)) {
        for (const sub of step.subSteps) {
          if (!sub.imageUrl || typeof sub.imageUrl !== 'string') {
            throw new BadRequestException(
              `subStep must include a single imageUrl: ${JSON.stringify(sub)}`,
            );
          }
          await this.prisma.user_routine_sub_steps.create({
            data: {
              user_routine_step_id: createdStep.id,
              title: sub.title,
              how_to: sub.howTo,
              image_url: sub.imageUrl,
            },
          });
        }
      }
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

      const createdStep = await this.prisma.user_routine_steps.create({
        data: {
          user_routine_id: evening.id,
          step_order: step.step,
          instruction: `${step.title}: ${step.howTo}`,
          product_id: step.productId,
        },
      });

      if (Array.isArray(step.subSteps)) {
        for (const sub of step.subSteps) {
          if (!sub.imageUrl || typeof sub.imageUrl !== 'string') {
            throw new BadRequestException(
              `subStep must include a single imageUrl: ${JSON.stringify(sub)}`,
            );
          }
          await this.prisma.user_routine_sub_steps.create({
            data: {
              user_routine_step_id: createdStep.id,
              title: sub.title,
              how_to: sub.howTo,
              image_url: sub.imageUrl,
            },
          });
        }
      }
    }

    return {
      subscriptionId: subscription.id,
      morningRoutineId: morning.id,
      eveningRoutineId: evening.id,
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
