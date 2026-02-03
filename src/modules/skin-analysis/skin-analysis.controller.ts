import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkinAnalysisService } from './skin-analysis.service';
import { AnalyzeSkinDto } from './dto';
import { SimpleResponse } from '../../common/dtos/index';

@ApiTags('skin-analysis')
@Controller('skin-analysis')
export class SkinAnalysisController {
  constructor(private readonly skinAnalysisService: SkinAnalysisService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze face image with AI and save result' })
  @ApiResponse({
    status: 200,
    description: 'Analysis result with routine and note',
  })
  @ApiResponse({ status: 400, description: 'Invalid image URL or AI error' })
  async analyze(
    @Body() dto: AnalyzeSkinDto,
  ): Promise<SimpleResponse<{ analysisId: string; result: unknown }>> {
    const { analysisId, result } = await this.skinAnalysisService.analyzeImage(
      dto.imageUrl,
      dto.userId,
    );
    return new SimpleResponse(
      { analysisId, result },
      'Analysis completed successfully.',
      200,
    );
  }
}
