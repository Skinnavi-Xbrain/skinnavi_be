import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
      message?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const dbCheck = await this.checkDatabase();

    const overallStatus = dbCheck.status === 'ok' ? 'ok' : 'error';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.0.1',
      checks: {
        database: dbCheck,
      },
    };
  }

  private async checkDatabase(): Promise<{
    status: 'ok' | 'error';
    responseTime?: number;
    message?: string;
  }> {
    const start = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        status: 'ok',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      const message =
        error instanceof Error ? error.message : 'Unknown database error';

      this.logger.error(`Database health check failed: ${message}`);

      return {
        status: 'error',
        responseTime,
        message,
      };
    }
  }
}
