import { Injectable, Logger } from '@nestjs/common';
import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from '@aws-sdk/client-bedrock-agent-runtime';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private client = new BedrockAgentRuntimeClient({
    region: process.env.AWS_BEDROCK_REGION || 'us-west-2',
  });

  async ask(
    question: string,
    sessionId?: string,
  ): Promise<{ text: string; sessionId?: string }> {
    this.logger.log(
      `Calling RAG Knowledge Base with question: "${question.substring(0, 50)}..."`,
    );

    const command = new RetrieveAndGenerateCommand({
      sessionId: sessionId,
      input: {
        text: question,
      },
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId: 'B05QNGS2BU', // ID được cấp từ user
          modelArn:
            'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-haiku-4-5-20250415-v1:0',
        },
      },
    });

    try {
      const response = await this.client.send(command);
      return {
        text: response.output?.text || '',
        sessionId: response.sessionId,
      };
    } catch (error: any) {
      this.logger.error(
        `Error calling Bedrock RAG: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
