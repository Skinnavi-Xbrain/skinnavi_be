import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus } from '@Constant/index';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveSubscriptions() {
    const now = new Date();

    const activeCount = await this.prisma.user_package_subscriptions.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        start_date: { lte: now },
        end_date: { gte: now },
      },
    });

    const byPackage = await this.prisma.user_package_subscriptions.groupBy({
      by: ['routine_package_id'],
      where: {
        status: SubscriptionStatus.ACTIVE,
        start_date: { lte: now },
        end_date: { gte: now },
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
        'Active = status ACTIVE + start_date <= today AND end_date >= today',
    };
  }

  async getPackages() {
    const packages = await this.prisma.routine_packages.findMany({
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: {
        price: 'asc',
      },
    });

    return packages.map((pkg) => ({
      id: pkg.id,
      packageName: pkg.package_name,
      description: pkg.description,
      highlights: pkg.highlights,
      durationDays: pkg.duration_days,
      price: pkg.price,
      totalScanLimit: pkg.total_scan_limit,
      allowTracking: pkg.allow_tracking,
      subscriberCount: pkg._count.subscriptions,
    }));
  }

  async getPackageDetail(id: string) {
    const pkg = await this.prisma.routine_packages.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Subscription package not found');
    }

    return {
      id: pkg.id,
      packageName: pkg.package_name,
      description: pkg.description,
      highlights: pkg.highlights,
      durationDays: pkg.duration_days,
      price: pkg.price,
      totalScanLimit: pkg.total_scan_limit,
      allowTracking: pkg.allow_tracking,
      subscriberCount: pkg._count.subscriptions,
    };
  }

  async createPackage(data: {
    packageName: string;
    description: string;
    highlights: any;
    durationDays: number;
    price: number;
    weeklyScanLimit: number;
    allowTracking: boolean;
  }) {
    if (![7, 30, 90].includes(data.durationDays)) {
      throw new BadRequestException('durationDays must be 7, 30, or 90 days');
    }

    return this.prisma.routine_packages.create({
      data: {
        package_name: data.packageName,
        description: data.description,
        highlights: data.highlights,
        duration_days: data.durationDays,
        price: data.price,
        total_scan_limit: data.weeklyScanLimit,
        allow_tracking: data.allowTracking,
      },
    });
  }

  async updatePackage(
    id: string,
    data: {
      packageName?: string;
      description?: string;
      highlights?: any;
      durationDays?: number;
      price?: number;
      weeklyScanLimit?: number;
      allowTracking?: boolean;
    },
  ) {
    const existing = await this.prisma.routine_packages.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Subscription package not found');
    }

    if (data.durationDays && ![7, 30, 90].includes(data.durationDays)) {
      throw new BadRequestException('durationDays must be 7, 30, or 90 days');
    }

    return this.prisma.routine_packages.update({
      where: { id },
      data: {
        package_name: data.packageName,
        description: data.description,
        highlights: data.highlights,
        duration_days: data.durationDays,
        price: data.price,
        total_scan_limit: data.weeklyScanLimit,
        allow_tracking: data.allowTracking,
      },
    });
  }

  async deletePackage(id: string) {
    const existing = await this.prisma.routine_packages.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Subscription package not found');
    }

    return this.prisma.routine_packages.delete({
      where: { id },
    });
  }

  async getFreeToPaidConversion() {
    const subs = await this.prisma.user_package_subscriptions.findMany({
      where: {
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED],
        },
      },
      include: {
        routine_package: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const userMap = new Map<
      string,
      {
        freeDate?: Date;
        paidDate?: Date;
      }
    >();

    subs.forEach((sub) => {
      const userId = sub.user_id;

      if (!userMap.has(userId)) {
        userMap.set(userId, {});
      }

      const user = userMap.get(userId)!;

      const price = Number(sub.routine_package.price);

      if (price === 0 && !user.freeDate) {
        user.freeDate = sub.created_at;
      }

      if (price > 0 && !user.paidDate) {
        user.paidDate = sub.created_at;
      }
    });

    let convertedUsers = 0;

    userMap.forEach((u) => {
      if (u.freeDate && u.paidDate && u.freeDate < u.paidDate) {
        convertedUsers++;
      }
    });

    const totalUsers = userMap.size;

    return {
      totalUsers,
      convertedUsers,
      conversionRate:
        totalUsers === 0 ? 0 : (convertedUsers / totalUsers) * 100,
    };
  }

  async getMonthlyConversionRate() {
    const subs = await this.prisma.user_package_subscriptions.findMany({
      where: {
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED],
        },
      },
      include: {
        routine_package: {
          select: { price: true },
        },
      },
      orderBy: {
        start_date: 'asc',
      },
    });

    const monthly: Record<
      string,
      {
        totalUsers: Set<string>;
        convertedUsers: Set<string>;
      }
    > = {};

    const userHistory = new Map<string, Date>();

    for (const sub of subs) {
      const userId = sub.user_id;
      const month = sub.start_date.toISOString().slice(0, 7);
      const price = Number(sub.routine_package.price);

      if (!monthly[month]) {
        monthly[month] = {
          totalUsers: new Set(),
          convertedUsers: new Set(),
        };
      }

      monthly[month].totalUsers.add(userId);

      if (price === 0 && !userHistory.has(userId)) {
        userHistory.set(userId, sub.start_date);
      }

      if (
        price > 0 &&
        userHistory.has(userId) &&
        sub.start_date > userHistory.get(userId)!
      ) {
        monthly[month].convertedUsers.add(userId);
      }
    }

    return Object.entries(monthly)
      .map(([month, data]) => {
        const totalUsers = data.totalUsers.size;
        const convertedUsers = data.convertedUsers.size;

        return {
          month,
          totalUsers,
          convertedUsers,
          conversionRate:
            totalUsers === 0
              ? 0
              : Number(((convertedUsers / totalUsers) * 100).toFixed(2)),
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }
  async getSubscriptionStatsByStatus() {
    const result = await this.prisma.user_package_subscriptions.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    return result.map((r) => ({
      status: r.status,
      count: r._count._all,
    }));
  }
}
