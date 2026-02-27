import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, createUserContent } from '@google/genai';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, skin_metric_enum } from '@prisma/client';
import crypto from 'crypto';
import { AIAnalysisResult, analysisResultSchema } from './skin-analysis.schema';

const GEMINI_MODEL = 'gemini-2.5-flash';

@Injectable()
export class SkinAnalysisService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(SkinAnalysisService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is required');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeImage(imageUrl: string, userId: string) {
    const imageBase64 = await this.fetchImageAsBase64(imageUrl);
    const mimeType = inferMimeType(imageUrl);

    const imageHash = crypto
      .createHash('sha256')
      .update(imageBase64)
      .digest('hex');

    const cached = await this.prisma.skin_analyses.findFirst({
      where: { image_hash: imageHash },
      include: { metrics: true, skin_type: true },
    });

    if (cached) return this.mapAnalysisToResponse(cached);

    const combos = await this.prisma.skincare_combos.findMany({
      where: { is_active: true },
      select: { id: true, combo_name: true, skin_type_id: true },
    });

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

    const aiRes = await this.ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: createUserContent([
        { inlineData: { mimeType, data: imageBase64 } },
        prompt,
      ]),
      config: {
        responseMimeType: 'application/json',
        temperature: 0,
        topP: 0.1,
        topK: 1,
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
      .slice(0, 3)
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
        recommendedCombos: [],
        isValidImage: true,
      },
    };
  }

  private async fetchImageAsBase64(imageUrl: string) {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new BadRequestException(`Cannot fetch image: ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    return Buffer.from(buf).toString('base64');
  }

  private parseAIResponse(text: string): AIAnalysisResult {
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    const json = JSON.parse(cleaned);
    const parsed = analysisResultSchema.safeParse(json);

    if (!parsed.success) {
      throw new BadRequestException('AI response validation failed');
    }

    return parsed.data;
  }
}

export function buildAnalysisPrompt(
  comboListText: string,
  imageUrl: string,
  previousAnalysis: string,
): string {
  return `
You are a professional AI skin analysis system.

IMAGE URL: ${imageUrl}

====================
TEMPORAL CONSISTENCY
====================

${previousAnalysis}

Rules:

- Previous analysis is for consistency only
- The new image is the primary source of truth
- DO NOT drastically change scores without clear visible reason
- Score difference should normally NOT exceed 15 points
- DO NOT randomly change skinType

====================
IMAGE VALIDATION
====================

Reject if:
- Face < 60%
- Blurry
- Too dark / overexposed
- Multiple faces
- Obstructed

If invalid → return:

{
  "isValidImage": false,
  "imageUrl": "${imageUrl}",
  "message": "reason",
  "guidelines": []
}

====================
SKIN ANALYSIS
====================

If valid → return:

{
  "isValidImage": true,
  "imageUrl": "${imageUrl}",
  "skinType": "NORMAL | DRY | COMBINATION | SENSITIVE | OILY",
  "overallScore": number,
  "metrics": {
    "PORES": number,
    "ACNE": number,
    "DARK_CIRCLES": number,
    "DARK_SPOTS": number
  },
  "overallComment": string,
  "recommendedCombos": ["uuid","uuid","uuid","uuid"]
}

====================
COMBO RULES (MANDATORY):
====================

- recommendedCombos MUST NOT be empty
- recommendedCombos MUST contain AT LEAST 4 UUIDs
- Use ONLY UUIDs from AVAILABLE COMBOS
- Select by:
  1. lowest metric
  2. skinType
- If all metrics >= 80 → return maintenance combo
- If no exact match → return closest by skinType

====================
AVAILABLE COMBOS
====================
${comboListText}

Return JSON only.
`;
}

function inferMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('png')) return 'image/png';
  if (lower.includes('webp')) return 'image/webp';
  return 'image/jpeg';
}
