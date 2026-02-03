import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';
import { SimpleResponse } from '../../common/dtos/index';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoutineDto } from './dto/create-routine.dto';

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

  @Post()
  async create(@Body() dto: CreateRoutineDto) {
    const data = await this.routinesService.createRoutine(dto);
    return new SimpleResponse(data, 'Routine created successfully', 201);
  }

  @Get(':userId')
  async getByUser(@Param('userId') userId: string) {
    const data = await this.routinesService.getRoutineByUser(userId);
    return new SimpleResponse(data, 'Get routine by user', 200);
  }
}
