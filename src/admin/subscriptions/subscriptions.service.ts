import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveSubscriptions() {
    const activeCount = await this.prisma.user_package_subscriptions.count({
      where: {
        start_date: { lte: new Date() },
        end_date: { gte: new Date() },
      },
    });

    const byPackage = await this.prisma.user_package_subscriptions.groupBy({
      by: ['routine_package_id'],
      where: {
        start_date: { lte: new Date() },
        end_date: { gte: new Date() },
      },
      _count: { _all: true },
    });

    return {
      activeSubscriptions: activeCount,
      byPackage: byPackage.map((r) => ({
        routinePackageId: r.routine_package_id,
        activeSubscriptions: r._count._all,
      })),
      activeDefinition:
        'Active = start_date <= today AND end_date >= today (inclusive).',
    };
  }
}
