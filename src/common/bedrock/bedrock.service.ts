import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

/**
 * AWS Bedrock service — replaces the old Gemini ApiKeyManagerService.
 *
 * Key design decisions:
 * - Uses IAM role auth (credential chain) → no API keys needed in ECS.
 * - Single client instance reused across requests (connection pooling).
 * - Retry with exponential backoff for throttling (429) errors.
 * - Claude Haiku 4.5 chosen for best latency-to-cost ratio.
 */
@Injectable()
export class BedrockService {
  private readonly client: BedrockRuntimeClient;
  private readonly logger = new Logger(BedrockService.name);

  /** Model ID for Claude Haiku 4.5 on Bedrock */
  readonly modelId: string;

  /** Max retry attempts for throttled requests */
  private readonly maxRetries = 3;

  constructor(private configService: ConfigService) {
    const region =
      this.configService.get<string>('AWS_BEDROCK_REGION') || 'us-west-2';

    // Model can be overridden via env for easy switching between Haiku/Sonnet
    this.modelId =
      this.configService.get<string>('AWS_BEDROCK_MODEL_ID') ||
      'anthropic.claude-haiku-4-5-20250415-v1:0';

    /**
     * BedrockRuntimeClient automatically picks up credentials from:
     * 1. ECS Task Role (via container credential provider)
     * 2. EC2 Instance Profile
     * 3. AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars (local dev)
     * 4. ~/.aws/credentials profile
     *
     * → NO hardcoded credentials needed.
     */
    this.client = new BedrockRuntimeClient({
      region,
      // Lower socket timeout for faster failure detection
      requestHandler: {
        requestTimeout: 30_000, // 30s max per request
      },
    });

    this.logger.log(
      `Bedrock client initialized — region: ${region}, model: ${this.modelId}`,
    );
  }

  /**
   * Send a prompt (with optional base64 image) to Claude via Bedrock.
   * Returns the raw text response from Claude.
   *
   * @param prompt  - The text prompt to send
   * @param image   - Optional { base64: string, mimeType: string } for vision
   */
  async invokeModel(
    prompt: string,
    image?: { base64: string; mimeType: string },
  ): Promise<string> {
    // Build the Claude Messages API content blocks
    const contentBlocks: any[] = [];

    // If an image is provided, add it as the first content block (vision)
    if (image) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.mimeType,
          data: image.base64,
        },
      });
    }

    // Add the text prompt
    contentBlocks.push({
      type: 'text',
      text: prompt,
    });

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      // Low temperature for deterministic, consistent skin analysis
      temperature: 0.1,
      top_p: 0.3,
      top_k: 20,
      messages: [
        {
          role: 'user',
          content: contentBlocks,
        },
      ],
    };

    return this.invokeWithRetry(requestBody);
  }

  /**
   * Invoke Bedrock with exponential backoff retry for throttling errors.
   * This handles the common 429 (ThrottlingException) from Bedrock.
   */
  private async invokeWithRetry(requestBody: any): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const command = new InvokeModelCommand({
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify(requestBody),
        });

        const response = await this.client.send(command);

        // Parse the response body from Uint8Array → string → JSON
        const responseText = new TextDecoder().decode(response.body);
        const responseJson = JSON.parse(responseText);

        // Claude's response structure: { content: [{ type: "text", text: "..." }] }
        const text = responseJson.content?.[0]?.text;

        if (!text) {
          this.logger.error('Bedrock returned empty response: ' + responseText);
          throw new BadRequestException(
            'AI returned an empty response. Please try again.',
          );
        }

        return text;
      } catch (error: any) {
        lastError = error;
        const errorName = error?.name || '';
        const statusCode = error?.$metadata?.httpStatusCode;

        // Retry on throttling (429) or service unavailable (503)
        if (
          errorName === 'ThrottlingException' ||
          errorName === 'ServiceUnavailableException' ||
          statusCode === 429 ||
          statusCode === 503
        ) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.warn(
            `Bedrock throttled (attempt ${attempt + 1}/${this.maxRetries}). ` +
              `Retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Non-retryable errors — throw immediately
        this.logger.error(
          `Bedrock invocation failed: ${error.message}`,
          error.stack,
        );
        throw new BadRequestException(
          'AI analysis service is temporarily unavailable. Please try again later.',
        );
      }
    }

    // All retries exhausted
    this.logger.error(
      `All ${this.maxRetries} Bedrock retries exhausted. Last error: ${lastError?.message}`,
    );
    throw new BadRequestException(
      'AI service is currently overloaded. Please try again in a few minutes.',
    );
  }
}
