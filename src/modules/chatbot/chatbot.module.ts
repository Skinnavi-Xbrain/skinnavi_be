import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { RagService } from './rag.service';
import { BedrockModule } from '../../common/bedrock/bedrock.module';

@Module({
  imports: [BedrockModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, RagService],
})
export class ChatbotModule {}
