import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { SimpleResponse } from '../../common/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';

@ApiTags('routines')
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Post()
  async create(@GetUser('id') userId: string, @Body() dto: CreateRoutineDto) {
    const data = await this.routinesService.createRoutine({ ...dto, userId });
    return new SimpleResponse(data, 'Routine created successfully', 201);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Get()
  async getByUser(@GetUser('id') userId: string) {
    const data = await this.routinesService.getLatestRoutineByUser(userId);
    return new SimpleResponse(data, 'Get routine by user', 200);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @Get('steps/:id')
  async getStepDetail(@Param('id') id: string): Promise<SimpleResponse<any>> {
    const data = await this.routinesService.getStepDetail(id);
    return new SimpleResponse(data, 'Get routine step detail', 200);
  }
}
