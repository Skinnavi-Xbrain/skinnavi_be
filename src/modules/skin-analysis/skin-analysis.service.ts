import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { GoogleGenAI, createUserContent } from '@google/genai';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, skin_metric_enum } from '@prisma/client';
import crypto from 'crypto';
import { AIAnalysisResult, analysisResultSchema } from './skin-analysis.schema';
import { ApiKeyManagerService } from '../../common/aipKeyManager/api-key-manager.service';

const GEMINI_MODEL = 'gemini-2.5-flash';

@Injectable()
export class SkinAnalysisService {
  private readonly logger = new Logger(SkinAnalysisService.name);

  constructor(
    private prisma: PrismaService,
    private apiKeyManager: ApiKeyManagerService,
  ) {}

  async checkAnalysisLimit(userId: string) {
    const now = new Date();

    const todayAnalysis = await this.prisma.skin_analyses.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    if (todayAnalysis) {
      throw new BadRequestException(
        'You have already performed a skin analysis today. Please try again tomorrow.',
      );
    }

    const activeSub = await this.prisma.user_package_subscriptions.findFirst({
      where: {
        user_id: userId,
        is_active: true,
        end_date: { gt: now },
      },
      include: { routine_package: true },
    });

    if (!activeSub) {
      return;
    }

    const totalAnalysesInCurrentSub = await this.prisma.skin_analyses.count({
      where: {
        user_id: userId,
        created_at: {
          gte: activeSub.start_date,
          lte: activeSub.end_date,
        },
      },
    });

    const limit = activeSub.routine_package.total_scan_limit;

    if (totalAnalysesInCurrentSub >= limit) {
      throw new BadRequestException(
        `Your current package (${activeSub.routine_package.package_name}) allows only ${limit} skin analyses in total. Please upgrade or renew your package.`,
      );
    }

    this.logger.debug({
      packageName: activeSub.routine_package.package_name,
      used: totalAnalysesInCurrentSub,
      limit: limit,
    });
  }

  private async generateContentWithRetry(modelName: string, params: any) {
    let attempts = 0;
    const maxAttempts = this.apiKeyManager.totalKeys * 2;

    while (attempts < maxAttempts) {
      const apiKey = this.apiKeyManager.getCurrentKey();

      const ai = new GoogleGenAI({
        apiKey,
      });

      try {
        return await ai.models.generateContent({
          model: modelName,
          ...params,
        });
      } catch (error: any) {
        const status = error?.status;
        const message = error?.message?.toLowerCase() || '';

        if (
          status === 429 ||
          message.includes('429') ||
          message.includes('quota')
        ) {
          this.logger.warn(`API key quota exceeded. Switching to next key...`);

          this.apiKeyManager.getNextKey();
          attempts++;
          continue;
        }

        if (status === 503 || message.includes('high demand')) {
          const delay = Math.min((attempts + 1) * 2000, 10000);

          this.logger.warn(
            `Gemini model overloaded. Retrying in ${delay}ms...`,
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          attempts++;
          continue;
        }

        this.logger.error(`AI Generation error: ${error.message}`);
        throw error;
      }
    }

    throw new BadRequestException(
      'Gemini AI service unavailable or all API keys exhausted.',
    );
  }

  async analyzeImage(imageUrl: string, userId: string) {
    const imageBase64 = await this.fetchImageAsBase64(imageUrl);
    const mimeType = this.inferMimeType(imageUrl);

    const imageHash = crypto
      .createHash('sha256')
      .update(imageBase64)
      .digest('hex');

    const existingAnalysis = await this.prisma.skin_analyses.findFirst({
      where: { image_hash: imageHash },
      include: { metrics: true, skin_type: true },
    });

    const combos = await this.prisma.skincare_combos.findMany({
      where: { is_active: true },
      select: { id: true, combo_name: true, skin_type_id: true },
    });

    if (existingAnalysis) {
      if (existingAnalysis.user_id === userId) {
        throw new BadRequestException(
          'You have already uploaded this image. Please upload a new skin photo.',
        );
      }

      this.logger.log(
        `Image hash match found from another user. Cloning results for user: ${userId}`,
      );

      const clonedAnalysis = await this.prisma.$transaction(async (tx) => {
        const created = await tx.skin_analyses.create({
          data: {
            user_id: userId,
            skin_type_id: existingAnalysis.skin_type_id,
            overall_score: existingAnalysis.overall_score,
            overall_comment: existingAnalysis.overall_comment,
            face_image_url: imageUrl,
            image_hash: imageHash,
          },
        });

        await tx.skin_analysis_metrics.createMany({
          data: existingAnalysis.metrics.map((m) => ({
            skin_analysis_id: created.id,
            metric_type: m.metric_type,
            score: m.score,
          })),
        });

        return created;
      });

      const response = this.mapAnalysisToResponse({
        ...clonedAnalysis,
        metrics: existingAnalysis.metrics,
        skin_type: existingAnalysis.skin_type,
      });

      response.result.recommendedCombos = combos
        .filter((c) => c.skin_type_id === clonedAnalysis.skin_type_id)
        .slice(0, 4)
        .map((c) => c.id);

      return response;
    }

    const comboListText = combos
      .map((c) => `- id: ${c.id}, name: ${c.combo_name}`)
      .join('\n');

    const last = await this.prisma.skin_analyses.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { metrics: true, skin_type: true },
    });

    const previousAnalysisText = this.buildPreviousAnalysisText(last);
    const prompt = buildAnalysisPrompt(
      comboListText,
      imageUrl,
      previousAnalysisText,
    );

    const aiRes = await this.generateContentWithRetry(GEMINI_MODEL, {
      contents: createUserContent([
        { inlineData: { mimeType, data: imageBase64 } },
        prompt,
      ]),
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        topP: 0.3,
        topK: 20,
      },
    });

    const text = aiRes.text ?? aiRes.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new BadRequestException('AI returned empty');

    const result = this.parseAIResponse(text);
    result.imageUrl = imageUrl;

    if (!result.isValidImage) {
      return { analysisId: null, result };
    }

    const skinType = await this.prisma.skin_types.findFirst({
      where: { code: result.skinType },
    });

    if (!skinType) throw new NotFoundException('Skin type not found');

    const recommendedCombos = combos
      .filter((c) => c.skin_type_id === skinType.id)
      .slice(0, 4)
      .map((c) => c.id);

    const analysis = await this.prisma.$transaction(async (tx) => {
      const created = await tx.skin_analyses.create({
        data: {
          user_id: userId,
          skin_type_id: skinType.id,
          overall_score: new Prisma.Decimal(result.overallScore),
          overall_comment: result.overallComment,
          face_image_url: imageUrl,
          image_hash: imageHash,
        },
      });

      await tx.skin_analysis_metrics.createMany({
        data: Object.entries(result.metrics).map(([type, score]) => ({
          skin_analysis_id: created.id,
          metric_type: type as skin_metric_enum,
          score: new Prisma.Decimal(Number(score)),
        })),
      });

      return created;
    });

    return {
      analysisId: analysis.id,
      result: {
        ...result,
        recommendedCombos,
      },
    };
  }

  private inferMimeType(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('png')) return 'image/png';
    if (lower.includes('webp')) return 'image/webp';
    return 'image/jpeg';
  }

  private async fetchImageAsBase64(imageUrl: string) {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new BadRequestException(`Cannot fetch image: ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    return Buffer.from(buf).toString('base64');
  }

  private buildPreviousAnalysisText(last: any) {
    if (!last) return 'NO_PREVIOUS_ANALYSIS';

    const metrics = Object.fromEntries(
      last.metrics.map((m) => [m.metric_type, Number(m.score)]),
    );

    return `
PREVIOUS ANALYSIS:

skinType: ${last.skin_type.code}
overallScore: ${Number(last.overall_score)}

metrics:
${Object.entries(metrics)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}
`;
  }

  private mapAnalysisToResponse(analysis: any) {
    const metrics = Object.fromEntries(
      analysis.metrics.map((m) => [m.metric_type, Number(m.score)]),
    );

    return {
      analysisId: analysis.id,
      result: {
        skinType: analysis.skin_type.code,
        overallScore: Number(analysis.overall_score),
        metrics,
        overallComment: analysis.overall_comment,
        recommendedCombos: [] as string[],
        isValidImage: true,
      },
    };
  }

  private parseAIResponse(text: string): AIAnalysisResult {
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    this.logger.debug('AI RAW RESPONSE: ' + cleaned);

    const json = JSON.parse(cleaned);

    const parsed = analysisResultSchema.safeParse(json);

    if (!parsed.success) {
      this.logger.error(
        'AI VALIDATION ERROR: ' +
          JSON.stringify(parsed.error.format(), null, 2),
      );

      throw new BadRequestException('AI response validation failed');
    }

    return parsed.data;
  }

  async getLatestSkinAnalysis(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skinAnalysis = await this.prisma.skin_analyses.findFirst({
      where: {
        user_id: userId,
      },
      include: {
        skin_type: true,
        metrics: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!skinAnalysis) {
      return null;
    }

    const recommendedCombos = await this.prisma.skincare_combos.findMany({
      where: {
        skin_type_id: skinAnalysis.skin_type_id,
        is_active: true,
      },
      select: { id: true },
      take: 4,
    });

    const metricsObject = skinAnalysis.metrics.reduce(
      (acc, m) => {
        acc[m.metric_type] = m.score ? Number(m.score) : null;
        return acc;
      },
      {} as Record<string, number | null>,
    );

    return {
      analysisId: skinAnalysis.id,
      result: {
        isValidImage: true,
        imageUrl: skinAnalysis.face_image_url,
        skinType: skinAnalysis.skin_type.code,
        overallScore: skinAnalysis.overall_score
          ? Number(skinAnalysis.overall_score)
          : null,
        metrics: metricsObject,
        overallComment: skinAnalysis.overall_comment,
        recommendedCombos: recommendedCombos.map((c) => c.id),
      },
    };
  }
}

export function buildAnalysisPrompt(
  comboListText: string,
  imageUrl: string,
  previousAnalysis: string,
): string {
  return `
You are a PROFESSIONAL AI SKIN ANALYSIS ENGINE.

Your reasoning pipeline MUST follow this exact order:
1. IMAGE VALIDATION
2. METRIC SCORING
3. TEMPORAL CONSISTENCY CHECK
4. OVERALL SCORE CALCULATION
5. SKIN TYPE DERIVATION (FROM METRICS ONLY)
6. COMBO SELECTION

IMAGE URL: ${imageUrl}

====================
TEMPORAL CONSISTENCY
====================

${previousAnalysis}

Rules:

- Previous analysis is for consistency only
- The new image is the PRIMARY source of truth
- Score difference per metric SHOULD NOT exceed 15 points
- If visual condition is clearly improved/worsened → you MAY exceed 15
- DO NOT randomly change skinType
- If no clear visual change → keep scores close to previous

====================
PHASE 1 — IMAGE VALIDATION
====================

Check if the image is suitable for facial skin analysis.

The image MUST satisfy ALL conditions below:

1. Face is clearly visible and centered
2. Face occupies at least 60% of the image
3. Image is sharp and not blurry
4. Lighting is sufficient and even
5. No harsh shadows on the face
6. Only ONE face in the image
7. No glasses, mask, or accessories covering skin
8. Skin areas (forehead, cheeks, nose, chin) are visible
9. Expression is neutral (no exaggerated smile or distortion)
10. The image shows a real human face

Reject the image if ANY condition fails.

If invalid → return ONLY:

{
  "isValidImage": false,
  "imageUrl": "${imageUrl}",
  "message": "Short reason why the image cannot be analyzed",
  "guidelines": [
    "Ensure your face is centered and clearly visible in the frame.",
    "Make sure your face occupies most of the photo.",
    "Use good natural lighting and avoid strong shadows.",
    "Remove glasses, masks, or any accessories.",
    "Keep a neutral facial expression.",
    "Avoid blurry or low-resolution photos."
  ]
}

====================
PHASE 2 — METRIC SCORING
====================

All scores MUST be INTEGER from 0 → 100.

100 = perfect skin, no issue  
85-99 = very good  
70-84 = healthy real-life skin  
50-69 = mild issue  
30-49 = moderate  
0-29 = severe  

If unsure → return a SAFE value between 65-75.

Each metric STARTS from 100 and is REDUCED by visible severity.

PORES  
ACNE  
DARK_CIRCLES  
DARK_SPOTS  

CLAMP all values to 0-100.
NO decimal numbers.

====================
TEMPORAL SMOOTHING
====================

If previous score exists:

newScore = previousScore ± max 15

UNLESS there is CLEAR visible improvement or worsening.

====================
OVERALL SCORE (STRICT FORMULA)
====================

overallScore = INTEGER AVERAGE of:

PORES + ACNE + DARK_CIRCLES + DARK_SPOTS

DO NOT estimate.
DO NOT guess.

====================
SKIN TYPE DERIVATION (FROM METRICS ONLY)
====================

OILY → PORES < 60 AND ACNE < 70  
DRY → PORES > 70 AND DARK_SPOTS ≥ 70 AND ACNE ≥ 70  
SENSITIVE → visible redness / irritation dominates  
COMBINATION → PORES significantly different across T-zone vs cheeks  
NORMAL → ALL metrics ≥ 70  

NEVER randomly choose skinType.

====================
COMBO SELECTION (MANDATORY)
====================

- recommendedCombos MUST contain EXACTLY 4 UUIDs
- MUST NOT be empty
- Use ONLY UUIDs from AVAILABLE COMBOS

Selection priority:

1. Lowest metric (main skin concern)
2. skinType match
3. Maintenance combo if ALL metrics ≥ 80

If no perfect match → choose closest by skinType.

====================
AVAILABLE COMBOS
====================

${comboListText}

====================
FINAL OUTPUT
====================

If valid → return ONLY:

{
  "isValidImage": true,
  "imageUrl": "${imageUrl}",
  "skinType": "...",
  "overallScore": number,
  "metrics": {
    "PORES": number,
    "ACNE": number,
    "DARK_CIRCLES": number,
    "DARK_SPOTS": number
  },
  "overallComment": "based on the LOWEST metric",
  "recommendedCombos": ["uuid","uuid","uuid","uuid"]
}

====================
STRICT RULES
====================

- JSON ONLY
- INTEGER numbers ONLY
- NO null
- NO extra text
`;
}
