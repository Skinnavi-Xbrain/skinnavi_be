import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
}
