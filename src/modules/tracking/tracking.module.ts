import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { ApiKeyManagerModule } from 'src/common/aipKeyManager/api-key-manager.module';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';

@Module({
  imports: [PrismaModule, ApiKeyManagerModule, ScheduleModule.forRoot()],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
