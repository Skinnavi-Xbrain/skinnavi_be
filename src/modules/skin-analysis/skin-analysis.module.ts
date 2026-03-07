import { Module } from '@nestjs/common';
import { SkinAnalysisController } from './skin-analysis.controller';
import { SkinAnalysisService } from './skin-analysis.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ApiKeyManagerService } from 'src/common/aipKeyManager/api-key-manager.service';

@Module({
  imports: [PrismaModule],
  controllers: [SkinAnalysisController],
  providers: [SkinAnalysisService, ApiKeyManagerService],
  exports: [SkinAnalysisService],
})
export class SkinAnalysisModule {}
