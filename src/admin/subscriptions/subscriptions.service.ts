import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { payment_status_enum, subscription_status_enum } from '@prisma/client';
import { Order } from '@Constant/index';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveSubscriptions() {
    const now = new Date();

    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    const activeCount = await this.prisma.user_package_subscriptions.count({
      where: {
        status: subscription_status_enum.ACTIVE,
        start_date: { lte: now },
        end_date: { gte: now },
      },
    });

    const lastMonthActiveCount =
      await this.prisma.user_package_subscriptions.count({
        where: {
          start_date: { lte: lastMonth },
          end_date: { gte: lastMonth },
          status: subscription_status_enum.ACTIVE,
        },
      });

    let growthRate = 0;
    if (lastMonthActiveCount > 0) {
      growthRate =
        ((activeCount - lastMonthActiveCount) / lastMonthActiveCount) * 100;
    } else {
      growthRate = activeCount > 0 ? 100 : 0;
    }

    const byPackage = await this.prisma.user_package_subscriptions.groupBy({
      by: ['routine_package_id'],
      where: {
        status: subscription_status_enum.ACTIVE,
        start_date: { lte: now },
        end_date: { gte: now },
      },
      _count: { _all: true },
    });

    return {
      activeSubscriptions: activeCount,
      growthRate: Number(growthRate.toFixed(2)),
      byPackage: byPackage.map((r) => ({
        routinePackageId: r.routine_package_id,
        activeSubscriptions: r._count._all,
      })),
      activeDefinition:
        'Active = status ACTIVE + start_date <= reference_date AND end_date >= reference_date',
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
        price: Order.ASC,
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
          in: [
            subscription_status_enum.ACTIVE,
            subscription_status_enum.EXPIRED,
            subscription_status_enum.CANCELED,
          ],
        },
      },
      include: {
        routine_package: true,
        payments: {
          where: {
            status: payment_status_enum.SUCCESS,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const userStats = new Map<
      string,
      { hasFree: boolean; converted: boolean; firstFreeDate?: Date }
    >();

    for (const sub of subs) {
      const userId = sub.user_id;
      const packagePrice = Number(sub.routine_package.price);
      const totalPaid = sub.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      const isFreeRecord = packagePrice === 0 || totalPaid === 0;

      if (!userStats.has(userId)) {
        userStats.set(userId, { hasFree: false, converted: false });
      }

      const stats = userStats.get(userId)!;

      if (isFreeRecord) {
        if (!stats.hasFree) {
          stats.hasFree = true;
          stats.firstFreeDate = sub.created_at;
        }
      } else {
        if (stats.hasFree && !stats.converted) {
          stats.converted = true;
        }
      }
    }

    let totalUsers = 0;
    let convertedUsers = 0;

    userStats.forEach((stats) => {
      if (stats.hasFree) {
        totalUsers++;
        if (stats.converted) {
          convertedUsers++;
        }
      }
    });

    const conversionRate =
      totalUsers === 0 ? 0 : (convertedUsers / totalUsers) * 100;

    return {
      totalUsers,
      convertedUsers,
      conversionRate,
    };
  }

  async getMonthlyConversionRate() {
    const subs = await this.prisma.user_package_subscriptions.findMany({
      where: {
        status: {
          in: [
            subscription_status_enum.ACTIVE,
            subscription_status_enum.EXPIRED,
            subscription_status_enum.CANCELED,
          ],
        },
      },
      include: {
        routine_package: {
          select: { price: true },
        },
        payments: {
          where: {
            status: payment_status_enum.SUCCESS,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const monthly: Record<
      string,
      {
        totalUsers: Set<string>;
        convertedUsers: Set<string>;
      }
    > = {};

    const userStats = new Map<
      string,
      { hasFree: boolean; converted: boolean }
    >();

    for (const sub of subs) {
      const userId = sub.user_id;
      const month = sub.created_at.toISOString().slice(0, 7);

      const packagePrice = Number(sub.routine_package.price);
      const totalPaid = sub.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      const isFreeRecord = packagePrice === 0 || totalPaid === 0;

      if (!monthly[month]) {
        monthly[month] = {
          totalUsers: new Set(),
          convertedUsers: new Set(),
        };
      }

      if (!userStats.has(userId)) {
        userStats.set(userId, { hasFree: false, converted: false });
      }

      const stats = userStats.get(userId)!;

      if (isFreeRecord) {
        if (!stats.hasFree) {
          stats.hasFree = true;
          monthly[month].totalUsers.add(userId);
        }
      } else {
        if (stats.hasFree && !stats.converted) {
          stats.converted = true;
          monthly[month].convertedUsers.add(userId);
        }
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
