import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type GetRevenueStatsArgs = {
  from?: string;
  to?: string;
  tz?: string;
};

type MonthlyRevenueRow = {
  month: string;
  subscription: number;
  ads: number;
  affiliate: number;
  total: number;
};

@Injectable()
export class AdminRevenueService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueStats(args: GetRevenueStatsArgs) {
    const tz = (args.tz ?? 'UTC').trim() || 'UTC';

    const from =
      args.from?.trim() != null && args.from.trim() !== ''
        ? new Date(args.from.trim())
        : undefined;
    const to =
      args.to?.trim() != null && args.to.trim() !== ''
        ? new Date(args.to.trim())
        : undefined;

    if (from && Number.isNaN(from.getTime())) {
      throw new BadRequestException('Invalid "from" (expected ISO date).');
    }
    if (to && Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid "to" (expected ISO date).');
    }
    if (from && to && from > to) {
      throw new BadRequestException('"from" must be <= "to".');
    }

    const rows = await this.prisma.$queryRaw<
      Array<{
        month: string;
        subscription: string | number | null;
      }>
    >`
      WITH bounds AS (
        SELECT
          ${from ?? null}::timestamptz AS from_ts,
          ${to ?? null}::timestamptz AS to_ts,
          ${tz}::text AS tz
      ),
      subscription_monthly AS (
        SELECT
          to_char(date_trunc('month', p.created_at AT TIME ZONE (SELECT tz FROM bounds)), 'YYYY-MM') AS month,
          SUM(p.amount)::numeric AS amount
        FROM payments p, bounds b
        WHERE (b.from_ts IS NULL OR p.created_at >= b.from_ts)
          AND (b.to_ts IS NULL OR p.created_at <= b.to_ts)
        GROUP BY 1
      )
      SELECT
        s.month AS month,
        COALESCE(s.amount, 0)::text AS subscription
      FROM subscription_monthly s
      ORDER BY s.month;
    `;

    const monthly: MonthlyRevenueRow[] = rows.map((r) => {
      const subscription = Number(r.subscription ?? 0);
      const ads = 0;
      const affiliate = 0;
      const total = subscription;
      return { month: r.month, subscription, ads, affiliate, total };
    });

    const totals = monthly.reduce(
      (acc, m) => {
        acc.subscription += m.subscription;
        acc.total += m.total;
        return acc;
      },
      { subscription: 0, ads: 0, affiliate: 0, total: 0 },
    );

    return {
      tz,
      from: from?.toISOString() ?? null,
      to: to?.toISOString() ?? null,
      totals,
      monthly,
      notes: {
        subscription:
          'Computed from payments.amount grouped by payments.created_at.',
        ads: 'Not implemented yet (defaults to 0).',
        affiliate: 'Not implemented yet (defaults to 0).',
      },
    };
  }
}
