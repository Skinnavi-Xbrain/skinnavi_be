import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, createUserContent } from '@google/genai';
import { PrismaService } from '../../prisma/prisma.service';
import { skin_metric_enum } from '@prisma/client';

const GEMINI_MODEL = 'gemini-2.5-flash';

const CONCERN_TO_METRIC: Record<string, skin_metric_enum> = {
  pores: skin_metric_enum.PORES,
  acnes: skin_metric_enum.ACNE,
  darkCircles: skin_metric_enum.DARK_CIRCLES,
  darkSpots: skin_metric_enum.DARK_SPOTS,
};

@Injectable()
export class SkinAnalysisService {
  private ai: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is required');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeImage(
    imageUrl: string,
    userId: string,
  ): Promise<{ analysisId: string; result: any }> {
    const combos = await this.prisma.skincare_combos.findMany({
      where: { is_active: true },
      select: { id: true, combo_name: true },
    });

    if (!combos.length) {
      throw new BadRequestException('No skincare combos in DB.');
    }

    const comboListText = combos
      .map((c) => `- id: ${c.id}, name: ${c.combo_name}`)
      .join('\n');

    const prompt = buildAnalysisPrompt(comboListText);

    const imageBase64 = await this.fetchImageAsBase64(imageUrl);
    const mimeType = inferMimeType(imageUrl);

    const response = await this.ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: createUserContent([
        { inlineData: { mimeType, data: imageBase64 } },
        prompt,
      ]),
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text =
      (response as { text?: string }).text ??
      response.candidates?.[0]?.content?.parts?.[0]?.text ??
      null;

    if (!text || typeof text !== 'string') {
      throw new BadRequestException('AI did not return valid JSON');
    }

    const result = this.parseAnalysisResult(text);

    const skinType = await this.prisma.skin_types.findFirst({
      where: { code: result.skinType },
    });

    if (!skinType) {
      throw new NotFoundException(
        `Skin type "${result.skinType}" not found in DB.`,
      );
    }

    const analysis = await this.prisma.skin_analyses.create({
      data: {
        user_id: userId,
        skin_type_id: skinType.id,
        overall_score: result.skinScore,
        overall_comment: result.overallComment, // ✅ LƯU COMMENT
        face_image_url: imageUrl,
      },
    });

    await this.createMetrics(analysis.id, result.concerns);

    return { analysisId: analysis.id, result };
  }

  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new BadRequestException(`Cannot fetch image: ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    return Buffer.from(buf).toString('base64');
  }

  private parseAnalysisResult(raw: string): any {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new BadRequestException('AI returned invalid JSON');
    }

    if (
      !parsed.skinType ||
      parsed.skinScore === undefined ||
      !parsed.concerns ||
      !parsed.recommendedCombos ||
      !parsed.overallComment
    ) {
      throw new BadRequestException('Missing fields in AI response');
    }

    return parsed;
  }

  private async createMetrics(
    skinAnalysisId: string,
    concerns: Record<string, number>,
  ): Promise<void> {
    const entries = Object.entries(concerns).filter(([key, value]) => {
      return typeof value === 'number' && key in CONCERN_TO_METRIC;
    }) as [string, number][];

    if (!entries.length) return;

    await this.prisma.skin_analysis_metrics.createMany({
      data: entries.map(([key, score]) => ({
        skin_analysis_id: skinAnalysisId,
        metric_type: CONCERN_TO_METRIC[key],
        score: Number(score),
      })),
    });
  }
}

function buildAnalysisPrompt(comboListText: string): string {
  return `
You are an AI dermatology expert.

Return ONLY valid JSON:

{
  "skinType": "OILY|DRY|COMBINATION|SENSITIVE|NORMAL",
  "skinScore": number,
  "concerns": {
    "pores": number,
    "acnes": number,
    "darkCircles": number,
    "darkSpots": number
  },
  "overallComment": string,
  "recommendedCombos": ["uuid1", "uuid2"]
}

Rules:
- overallComment must be a short, friendly summary of the user's skin condition.
- recommendedCombos must be array of skincare_combos UUIDs from the list below.
- Do NOT include routine, steps, or products.
- Do NOT include extra fields.

Available combos:
${comboListText}
`;
}

function inferMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('png')) return 'image/png';
  if (lower.includes('webp')) return 'image/webp';
  return 'image/jpeg';
}
