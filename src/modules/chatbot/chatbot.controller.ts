import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a message to SkinNavi AI Assistant',
    description:
      'Send a user message with optional conversation history. ' +
      'The AI responds about skincare, SkinNavi features, and skin analysis.',
  })
  @ApiResponse({ status: 200, description: 'AI reply', type: ChatResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatbotService.chat(dto);
  }
}
