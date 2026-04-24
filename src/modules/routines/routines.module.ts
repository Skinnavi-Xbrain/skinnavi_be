import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { BedrockModule } from '../../common/bedrock/bedrock.module';

@Module({
  imports: [PrismaModule, BedrockModule],
  controllers: [RoutinesController],
  providers: [RoutinesService],
})
export class RoutinesModule {}
