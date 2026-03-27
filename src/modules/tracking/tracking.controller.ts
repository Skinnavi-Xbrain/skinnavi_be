import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';
import { TrackingQueryDto } from './dto/tracking-query.dto';
import { CompareAnalysesDto } from './dto/compare-analyses.dto';
import { SimpleResponse } from '../../common/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { TrackingService } from './tracking.service';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('daily-logs')
  async createDailyLogs(
    @GetUser('id') userId: string,
  ): Promise<SimpleResponse<any>> {
    await this.trackingService.validateTrackingAccess(userId);
    const data = await this.trackingService.createDailyLogs();
    return new SimpleResponse(data, 'Daily logs created successfully', 201);
  }

  @Post('daily-logs/check-all')
  async createAndCheckDailyLogs(
    @GetUser('id') userId: string,
  ): Promise<SimpleResponse<any>> {
    await this.trackingService.validateTrackingAccess(userId);
    const data = await this.trackingService.createAndCheckDailyLogs();
    return new SimpleResponse(
      data,
      'Daily logs checked and created successfully',
      201,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Patch('daily-logs/:id')
  async updateDailyLog(
    @Param('id') id: string,
    @Body() dto: UpdateDailyLogDto,
    @GetUser('id') userId: string,
  ): Promise<SimpleResponse<any>> {
    await this.trackingService.validateTrackingAccess(userId);
    const data = await this.trackingService.updateDailyLog(
      id,
      dto.is_completed,
    );
    return new SimpleResponse(data, 'Daily log updated successfully', 200);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Get('overview')
  async getTrackingOverview(
    @GetUser('id') userId: string,
    @Query() query: TrackingQueryDto,
  ): Promise<SimpleResponse<any>> {
    await this.trackingService.validateTrackingAccess(userId);
    const data = await this.trackingService.getTrackingOverview(
      userId,
      query.startDate,
      query.endDate,
    );
    return new SimpleResponse(data, 'Get tracking overview', 200);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Get('daily-logs')
  async getDailyLogs(
    @GetUser('id') userId: string,
    @Query() query: TrackingQueryDto,
  ): Promise<SimpleResponse<any>> {
    const data = await this.trackingService.getDailyLogs(
      userId,
      query.startDate,
      query.endDate,
    );
    return new SimpleResponse(data, 'Get daily logs', 200);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Get('latest/daily-logs')
  async getLatestDailyLogs(
    @GetUser('id') userId: string,
  ): Promise<SimpleResponse<any>> {
    const data = await this.trackingService.getTodayDailyLogs(userId);
    return new SimpleResponse(data, 'Get today subscription daily logs', 200);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Get('skin-analyses')
  async getUserSkinAnalyses(
    @GetUser('id') userId: string,
    @Query() query: TrackingQueryDto,
  ): Promise<SimpleResponse<any>> {
    const days = query.days ?? 7;
    await this.trackingService.validateTrackingAccess(userId);
    const data = await this.trackingService.getUserSkinAnalyses(userId, days);
    return new SimpleResponse(data, 'Get user skin analyses', 200);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Post('compare')
  async compareAnalyses(
    @GetUser('id') userId: string,
    @Body() dto: CompareAnalysesDto,
  ): Promise<SimpleResponse<any>> {
    await this.trackingService.validateTrackingAccess(userId);
    const data = await this.trackingService.compareAnalyses(
      userId,
      dto.analysisId1,
      dto.analysisId2,
    );
    return new SimpleResponse(data, 'Compare analyses', 200);
  }
}
