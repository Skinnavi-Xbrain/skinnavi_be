import { Module } from '@nestjs/common';
import { SkinAnalysisController } from './skin-analysis.controller';
import { SkinAnalysisService } from './skin-analysis.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BedrockModule } from '../../common/bedrock/bedrock.module';

@Module({
  imports: [PrismaModule, BedrockModule],
  controllers: [SkinAnalysisController],
  providers: [SkinAnalysisService],
  exports: [SkinAnalysisService],
})
export class SkinAnalysisModule {}
