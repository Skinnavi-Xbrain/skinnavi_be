import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';
import { SimpleResponse } from '../../common/dtos/index';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('routines')
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('packages')
  @ApiOperation({ summary: 'Get 3 routine packages for FE display' })
  async getPackages() {
    const result = await this.routinesService.getRoutinePackages();
    return new SimpleResponse(
      result,
      'Fetched routine packages successfully',
      200,
    );
  }
}
