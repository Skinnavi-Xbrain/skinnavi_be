import { Injectable, Logger } from '@nestjs/common';
import { RagService } from './rag.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(private readonly ragService: RagService) {}

  /**
   * Xử lý tin nhắn chatbot sử dụng AWS Bedrock Knowledge Base RAG.
   */
  async chat(dto: ChatRequestDto): Promise<ChatResponseDto> {
    this.logger.log(`Chatbot request: "${dto.message.substring(0, 50)}..."`);

    // Gọi RAG API từ Bedrock Agent Runtime
    const result = await this.ragService.ask(dto.message, dto.sessionId);

    return {
      reply: result.text,
      sessionId: result.sessionId,
    };
  }
}
