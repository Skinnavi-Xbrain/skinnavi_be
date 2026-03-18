import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import bcrypt from 'bcrypt';

type GetUserStatsArgs = {
  activeDays: number;
  includeSubscriptionActive: boolean;
};

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(args: GetUserStatsArgs) {
    const totalUsers = await this.prisma.users.count();

    const activeDays = Math.floor(args.activeDays);
    const activeFrom = new Date(Date.now() - activeDays * 24 * 60 * 60 * 1000);

    const rows = await this.prisma.$queryRaw<Array<{ active_users: bigint }>>`
      WITH active_union AS (
        SELECT DISTINCT sa.user_id AS user_id
        FROM skin_analyses sa
        WHERE sa.created_at >= ${activeFrom}

        UNION

        SELECT DISTINCT ups.user_id AS user_id
        FROM user_package_subscriptions ups
        WHERE ${args.includeSubscriptionActive}::boolean = true
          AND ups.start_date <= CURRENT_DATE
          AND ups.end_date >= CURRENT_DATE

        UNION

        SELECT DISTINCT sa2.user_id AS user_id
        FROM skin_analyses sa2
        WHERE ${args.includeSubscriptionActive}::boolean = false
          AND sa2.created_at >= ${activeFrom}
      )
      SELECT COUNT(*)::bigint AS active_users FROM active_union;
    `;

    const activeUsers = Number(rows?.[0]?.active_users ?? 0n);

    return {
      totalUsers,
      activeUsers,
      activeDays,
      activeDefinition:
        'Active = users with a skin analysis within activeDays OR (optionally) an active subscription today.',
    };
  }

  async getUserGrowth() {
    const rows = await this.prisma.$queryRaw<
      Array<{ month: Date; new_users: bigint }>
    >`
      SELECT 
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*)::bigint AS new_users
      FROM users
      GROUP BY month
      ORDER BY month ASC
    `;

    return rows.map((row) => ({
      month: row.month,
      newUsers: Number(row.new_users),
    }));
  }

  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          avatar_url: true,
          role: true,
          created_at: true,
          user_package_subscriptions: {
            where: {
              is_active: true,
            },
            take: 1,
            select: {
              start_date: true,
              end_date: true,
              routine_package: {
                select: {
                  package_name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.users.count(),
    ]);

    const formatted = users.map((user) => {
      const subscription = user.user_package_subscriptions[0];

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        createdAt: user.created_at,
        subscription: subscription
          ? {
              packageName: subscription.routine_package.package_name,
              startDate: subscription.start_date,
              endDate: subscription.end_date,
            }
          : null,
      };
    });

    return {
      items: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        user_package_subscriptions: {
          include: {
            routine_package: {
              select: {
                package_name: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        skin_analyses: {
          select: {
            id: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 5,
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalAnalyses = await this.prisma.skin_analyses.count({
      where: { user_id: userId },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      role: user.role,
      createdAt: user.created_at,

      subscriptions: user.user_package_subscriptions.map((s) => ({
        packageName: s.routine_package.package_name,
        startDate: s.start_date,
        endDate: s.end_date,
        isActive: s.is_active,
      })),

      activity: {
        totalAnalyses,
        recentAnalyses: user.skin_analyses,
      },

      payments: user.payments,
    };
  }

  async createUser(data: {
    email: string;
    password: string;
    fullName?: string;
    role?: 'USER' | 'ADMIN';
  }) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    if (data.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.users.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password_hash: hashedPassword,
        full_name: data.fullName,
        role: data.role ?? 'USER',
      },
    });
  }

  async updateUser(
    userId: string,
    data: {
      fullName?: string;
      avatarUrl?: string;
      role?: 'USER' | 'ADMIN';
    },
  ) {
    return this.prisma.users.update({
      where: { id: userId },
      data: {
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        role: data.role,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const analyses = await tx.skin_analyses.findMany({
        where: { user_id: userId },
        select: { id: true },
      });

      const analysisIds = analyses.map((a) => a.id);

      if (analysisIds.length > 0) {
        await tx.skin_analysis_metrics.deleteMany({
          where: { skin_analysis_id: { in: analysisIds } },
        });

        await tx.skin_analyses.deleteMany({
          where: { id: { in: analysisIds } },
        });
      }

      const subs = await tx.user_package_subscriptions.findMany({
        where: { user_id: userId },
        select: { id: true },
      });

      const subIds = subs.map((s) => s.id);

      if (subIds.length > 0) {
        const routines = await tx.user_routines.findMany({
          where: { user_package_subscription_id: { in: subIds } },
          select: { id: true },
        });

        const routineIds = routines.map((r) => r.id);

        if (routineIds.length > 0) {
          await tx.routine_daily_logs.deleteMany({
            where: { user_routine_id: { in: routineIds } },
          });

          const steps = await tx.user_routine_steps.findMany({
            where: { user_routine_id: { in: routineIds } },
            select: { id: true },
          });

          const stepIds = steps.map((s) => s.id);

          if (stepIds.length > 0) {
            await tx.user_routine_sub_steps.deleteMany({
              where: { user_routine_step_id: { in: stepIds } },
            });

            await tx.user_routine_steps.deleteMany({
              where: { id: { in: stepIds } },
            });
          }

          await tx.user_routines.deleteMany({
            where: { id: { in: routineIds } },
          });
        }

        await tx.payments.deleteMany({
          where: { subscription_id: { in: subIds } },
        });

        await tx.user_package_subscriptions.deleteMany({
          where: { id: { in: subIds } },
        });
      }

      await tx.affiliate_click_logs.deleteMany({
        where: { user_id: userId },
      });

      await tx.payments.deleteMany({
        where: { user_id: userId },
      });

      await tx.users.delete({
        where: { id: userId },
      });
    });

    return {
      message: 'User deleted successfully',
    };
  }
}
