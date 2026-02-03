import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { SimpleResponse } from '../../common/dtos';

@ApiTags('routines')
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

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
