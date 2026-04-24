import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({
    enum: ['user', 'assistant'],
    description: 'Role of the message sender',
  })
  @IsString()
  @IsIn(['user', 'assistant'])
  role: string;

  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ description: 'The user message to send' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Conversation history for context',
    type: [ChatMessageDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}

export class ChatResponseDto {
  @ApiProperty({ description: 'The AI assistant reply' })
  reply: string;
}
