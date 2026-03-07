import { Module } from '@nestjs/common';
import { ApiKeyManagerService } from './api-key-manager.service';

@Module({
  providers: [ApiKeyManagerService],
  exports: [ApiKeyManagerService],
})
export class ApiKeyManagerModule {}
