import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SkinAnalysisService } from './skin-analysis.service';
import { AnalyzeSkinDto } from './dto';
import { SimpleResponse } from '../../common/dtos/index';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';

@ApiTags('skin-analysis')
@Controller('skin-analysis')
export class SkinAnalysisController {
  constructor(private readonly skinAnalysisService: SkinAnalysisService) {}

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyze face image with AI and save result' })
  @ApiResponse({
    status: 200,
    description: 'Analysis result with routine and note',
  })
  @ApiResponse({ status: 400, description: 'Invalid image URL or AI error' })
  async analyze(
    @Body() dto: AnalyzeSkinDto,
    @GetUser('id') userId: string,
  ): Promise<SimpleResponse<{ analysisId: string | null; result: unknown }>> {
    await this.skinAnalysisService.checkAnalysisLimit(userId);

    const { analysisId, result } = await this.skinAnalysisService.analyzeImage(
      dto.imageUrl,
      userId,
    );

    return new SimpleResponse<{ analysisId: string | null; result: unknown }>(
      { analysisId, result },
      'Analysis completed successfully.',
      200,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('result')
  async getLatestSkinAnalysis(
    @GetUser('id') userId: string,
  ): Promise<SimpleResponse<any>> {
    const data = await this.skinAnalysisService.getUserSkinAnalyses(userId);
    return new SimpleResponse(
      data,
      'Get latest skin analysis successfully',
      200,
    );
  }
}
