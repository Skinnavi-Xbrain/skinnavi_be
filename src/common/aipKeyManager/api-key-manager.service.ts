import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyManagerService {
  private keys: string[];
  private currentIndex = 0;
  private readonly logger = new Logger(ApiKeyManagerService.name);

  constructor(private configService: ConfigService) {
    const keysString = this.configService.get<string>('GEMINI_API_KEYS');

    if (!keysString) {
      throw new Error('GEMINI_API_KEYS is missing in environment');
    }

    this.keys = keysString
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (this.keys.length === 0) {
      throw new Error('No valid Gemini API keys found');
    }

    this.logger.log(`Loaded ${this.keys.length} Gemini API keys`);
  }

  getCurrentKey(): string {
    return this.keys[this.currentIndex];
  }

  getNextKey(): string {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    this.logger.warn(`Switching to API key index ${this.currentIndex}`);
    return this.getCurrentKey();
  }

  get totalKeys(): number {
    return this.keys.length;
  }
}
