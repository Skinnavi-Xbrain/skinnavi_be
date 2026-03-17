import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrackingService implements OnModuleInit {
  private readonly logger = new Logger(TrackingService.name);

  constructor(private prisma: PrismaService) {}

  async validateTrackingAccess(userId: string) {
    const activeSub = await this.prisma.user_package_subscriptions.findFirst({
      where: {
        user_id: userId,
        is_active: true,
        end_date: { gt: new Date() },
      },
      include: { routine_package: true },
    });

    if (!activeSub) {
      throw new BadRequestException(
        'You do not have an active subscription. Please subscribe to a routine package to access tracking features.',
      );
    }

    if (activeSub.routine_package.duration_days <= 7) {
      throw new ForbiddenException(
        'Your current subscription does not allow access to tracking features. Please upgrade to a longer routine package to use tracking.',
      );
    }

    return activeSub;
  }

  async onModuleInit() {
    try {
      this.logger.log('Checking and creating daily logs for today...');
      await this.createDailyLogsForToday();
      this.logger.log('Daily logs check completed');
    } catch (error) {
      this.logger.error('Failed to create daily logs on startup:', error);
    }
  }

  private toDateOnly(date: Date) {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
  }

  async createAndCheckDailyLogs(): Promise<{
    created: number;
    checked: number;
    logs: any[];
  }> {
    const now = new Date();
    const today = this.toDateOnly(now);

    const todayEnd = new Date(today);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const activeRoutines = await this.prisma.user_routines.findMany({
      where: {
        subscription: {
          start_date: { lte: todayEnd },
          end_date: { gte: today },
        },
      },
      include: {
        subscription: true,
      },
    });

    let totalCreated = 0;
    let totalChecked = 0;
    const allLogs: any[] = [];

    for (const routine of activeRoutines) {
      try {
        const routineStartDate = this.toDateOnly(new Date(routine.created_at));

        const subscriptionEndDate = new Date(
          this.toDateOnly(new Date(routine.subscription.end_date)),
        );
        subscriptionEndDate.setUTCHours(23, 59, 59, 999);

        const subStart = this.toDateOnly(
          new Date(routine.subscription.start_date),
        );

        const startDate =
          routineStartDate > subStart ? routineStartDate : subStart;

        const endDate =
          today < subscriptionEndDate ? today : subscriptionEndDate;

        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const logDate = this.toDateOnly(currentDate);

          const existingLog = await this.prisma.routine_daily_logs.findFirst({
            where: {
              user_routine_id: routine.id,
              log_date: {
                equals: logDate,
              },
            },
          });

          totalChecked++;

          if (!existingLog) {
            const newLog = await this.prisma.routine_daily_logs.create({
              data: {
                user_routine_id: routine.id,
                log_date: logDate,
                is_completed: false,
              },
            });
            allLogs.push(newLog);
            totalCreated++;
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        this.logger.error(
          `Failed to create logs for routine ${routine.id}:`,
          error,
        );
      }
    }

    this.logger.log(
      `Checked ${totalChecked} logs, created ${totalCreated} new logs`,
    );

    return { created: totalCreated, checked: totalChecked, logs: allLogs };
  }

  private async createDailyLogsForToday() {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const activeRoutines = await this.prisma.user_routines.findMany({
      where: {
        subscription: {
          start_date: { lte: todayEnd },
          end_date: { gte: today },
        },
      },
    });

    const results: any[] = [];
    for (const routine of activeRoutines) {
      try {
        const existingLog = await this.prisma.routine_daily_logs.findFirst({
          where: {
            user_routine_id: routine.id,
            log_date: today,
          },
        });

        if (!existingLog) {
          const newLog = await this.prisma.routine_daily_logs.create({
            data: {
              user_routine_id: routine.id,
              log_date: today,
              is_completed: false,
            },
          });
          results.push(newLog);
        }
      } catch (error) {
        this.logger.error(
          `Failed to create today's log for routine ${routine.id}:`,
          error,
        );
      }
    }

    if (results.length > 0) {
      this.logger.log(`Created ${results.length} daily logs for today`);
    }
    return { created: results.length, logs: results };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createDailyLogs() {
    const now = new Date();
    const today = this.toDateOnly(now);

    const todayEnd = new Date(today);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const activeRoutines = await this.prisma.user_routines.findMany({
      where: {
        subscription: {
          start_date: { lte: todayEnd },
          end_date: { gte: today },
        },
      },
      include: {
        subscription: true,
      },
    });

    const results: any[] = [];

    for (const routine of activeRoutines) {
      try {
        const routineStartDate = this.toDateOnly(new Date(routine.created_at));

        const subscriptionEndDate = new Date(
          this.toDateOnly(new Date(routine.subscription.end_date)),
        );
        subscriptionEndDate.setUTCHours(23, 59, 59, 999);

        const subStart = this.toDateOnly(
          new Date(routine.subscription.start_date),
        );

        const startDate =
          routineStartDate > subStart ? routineStartDate : subStart;

        const endDate =
          today < subscriptionEndDate ? today : subscriptionEndDate;

        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const logDate = this.toDateOnly(currentDate);

          const existingLog = await this.prisma.routine_daily_logs.findFirst({
            where: {
              user_routine_id: routine.id,
              log_date: {
                equals: logDate,
              },
            },
          });

          if (!existingLog) {
            const newLog = await this.prisma.routine_daily_logs.create({
              data: {
                user_routine_id: routine.id,
                log_date: logDate,
                is_completed: false,
              },
            });
            results.push(newLog);
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        this.logger.error(
          `Failed to create logs for routine ${routine.id}:`,
          error,
        );
      }
    }

    return { created: results.length, logs: results };
  }

  async updateDailyLog(logId: string, is_completed: boolean) {
    const log = await this.prisma.routine_daily_logs.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundException('Daily log not found');
    }

    return this.prisma.routine_daily_logs.update({
      where: { id: logId },
      data: { is_completed },
    });
  }

  async getTrackingOverview(
    userId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Parse dates with fallback to full range if not provided
    let start: Date | null = null;
    let end: Date | null = null;

    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    // Get all skin analyses with metrics (for trend analysis)
    const skinAnalyses = await this.prisma.skin_analyses.findMany({
      where: { user_id: userId },
      include: {
        skin_type: true,
        metrics: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Build skin analyses with trend calculation
    const analyzesWithTrend: any[] = [];
    for (let i = 0; i < skinAnalyses.length; i++) {
      const current = skinAnalyses[i];
      const previous = skinAnalyses[i + 1];

      let scoreTrend: number | null = null;
      if (current.overall_score && previous?.overall_score) {
        scoreTrend =
          Number(current.overall_score) - Number(previous.overall_score);
      }

      analyzesWithTrend.push({
        id: current.id,
        skin_type_code: current.skin_type.code,
        overall_score: current.overall_score
          ? Number(current.overall_score)
          : null,
        overall_comment: current.overall_comment,
        created_at: current.created_at.toISOString(),
        face_image_url: current.face_image_url,
        overall_score_trend: scoreTrend,
        metrics: current.metrics.map((m) => ({
          metric_type: m.metric_type,
          score: m.score ? Number(m.score) : null,
        })),
      });
    }

    // Get all routines with daily logs (filter logs by date range)
    const subscriptions = await this.prisma.user_package_subscriptions.findMany(
      {
        where: { user_id: userId },
        include: {
          routines: {
            include: {
              daily_logs: {
                where:
                  start && end ? { log_date: { gte: start, lte: end } } : {},
                orderBy: { log_date: 'asc' },
              },
            },
            orderBy: { routine_time: 'asc' },
          },
        },
      },
    );

    // Build routines array (separated from skin analyses)
    const routines: any[] = [];

    for (const subscription of subscriptions) {
      for (const routine of subscription.routines) {
        const completedCount = routine.daily_logs.filter(
          (log) => log.is_completed,
        ).length;

        routines.push({
          routine_id: routine.id,
          routine_time: routine.routine_time,
          routine_created_at: routine.created_at.toISOString(),
          subscription_id: subscription.id,
          subscription_start_date: subscription.start_date
            .toISOString()
            .split('T')[0],
          subscription_end_date: subscription.end_date
            .toISOString()
            .split('T')[0],
          daily_logs: routine.daily_logs.map((log) => ({
            id: log.id,
            user_routine_id: log.user_routine_id,
            log_date: log.log_date.toISOString().split('T')[0],
            is_completed: log.is_completed,
          })),
          completed_count: completedCount,
          total_count: routine.daily_logs.length,
        });
      }
    }

    return {
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url,
      skin_analyses: analyzesWithTrend,
      routines,
    };
  }

  async getDailyLogs(userId: string, startDate?: string, endDate?: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let start: Date | null = null;
    let end: Date | null = null;

    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const subscriptions = await this.prisma.user_package_subscriptions.findMany(
      {
        where: { user_id: userId },
        include: {
          routines: {
            include: {
              daily_logs: {
                where:
                  start && end ? { log_date: { gte: start, lte: end } } : {},
                orderBy: { log_date: 'asc' },
              },
            },
            orderBy: { routine_time: 'asc' },
          },
        },
      },
    );

    const routines: any[] = [];
    for (const subscription of subscriptions) {
      for (const routine of subscription.routines) {
        const completedCount = routine.daily_logs.filter(
          (log) => log.is_completed,
        ).length;

        routines.push({
          routine_id: routine.id,
          routine_time: routine.routine_time,
          routine_created_at: routine.created_at.toISOString(),
          subscription_id: subscription.id,
          subscription_start_date: subscription.start_date
            .toISOString()
            .split('T')[0],
          subscription_end_date: subscription.end_date
            .toISOString()
            .split('T')[0],
          daily_logs: routine.daily_logs.map((log) => ({
            id: log.id,
            user_routine_id: log.user_routine_id,
            log_date: log.log_date.toISOString().split('T')[0],
            is_completed: log.is_completed,
          })),
          completed_count: completedCount,
          total_count: routine.daily_logs.length,
        });
      }
    }

    return {
      user_id: user.id,
      routines,
    };
  }

  async getUserSkinAnalyses(userId: string, days: number = 7) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const skinAnalyses = await this.prisma.skin_analyses.findMany({
      where: {
        user_id: userId,
        created_at: { gte: start },
      },
      include: {
        skin_type: true,
        metrics: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (skinAnalyses.length < 2) {
      return {
        user_id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        skin_analyses: [],
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        message: `At least 2 analyses are required between ${
          start.toISOString().split('T')[0]
        } and ${end.toISOString().split('T')[0]}`,
      };
    }

    const analyzesWithTrend: any[] = [];
    for (let i = 0; i < skinAnalyses.length; i++) {
      const current = skinAnalyses[i];
      const previous = skinAnalyses[i + 1];

      let scoreTrend: number | null = null;
      if (current.overall_score && previous?.overall_score) {
        scoreTrend =
          Number(current.overall_score) - Number(previous.overall_score);
      }

      analyzesWithTrend.push({
        id: current.id,
        skin_type_code: current.skin_type.code,
        overall_score: current.overall_score
          ? Number(current.overall_score)
          : null,
        overall_comment: current.overall_comment,
        created_at: current.created_at.toISOString(),
        face_image_url: current.face_image_url,
        overall_score_trend: scoreTrend,
        metrics: current.metrics.map((m) => ({
          metric_type: m.metric_type,
          score: m.score ? Number(m.score) : null,
        })),
      });
    }

    return {
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      skin_analyses: analyzesWithTrend,
    };
  }

  async compareAnalyses(
    userId: string,
    analysisId1: string,
    analysisId2: string,
  ) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [analysis1, analysis2] = await Promise.all([
      this.prisma.skin_analyses.findFirst({
        where: { id: analysisId1, user_id: userId },
        include: { skin_type: true, metrics: true },
      }),
      this.prisma.skin_analyses.findFirst({
        where: { id: analysisId2, user_id: userId },
        include: { skin_type: true, metrics: true },
      }),
    ]);

    if (!analysis1) throw new NotFoundException('Analysis 1 not found');
    if (!analysis2) throw new NotFoundException('Analysis 2 not found');

    const metricsMap = new Map<
      string,
      { score1: number | null; score2: number | null }
    >();

    analysis1.metrics.forEach((m) => {
      metricsMap.set(m.metric_type, {
        score1: m.score ? Number(m.score) : null,
        score2: null,
      });
    });

    analysis2.metrics.forEach((m) => {
      const existing = metricsMap.get(m.metric_type);
      if (existing) {
        existing.score2 = m.score ? Number(m.score) : null;
      } else {
        metricsMap.set(m.metric_type, {
          score1: null,
          score2: m.score ? Number(m.score) : null,
        });
      }
    });

    const metricsComparison = Array.from(metricsMap.entries()).map(
      ([type, scores]) => ({
        metric_type: type,
        score1: scores.score1,
        score2: scores.score2,
        difference:
          scores.score1 !== null && scores.score2 !== null
            ? scores.score2 - scores.score1
            : null,
      }),
    );

    let overallScoreDiff: number | null = null;
    if (analysis1.overall_score && analysis2.overall_score) {
      overallScoreDiff =
        Number(analysis2.overall_score) - Number(analysis1.overall_score);
    }

    return {
      analysis1_id: analysis1.id,
      analysis1_date: analysis1.created_at.toISOString(),
      analysis1_score: analysis1.overall_score
        ? Number(analysis1.overall_score)
        : null,
      analysis2_id: analysis2.id,
      analysis2_date: analysis2.created_at.toISOString(),
      analysis2_score: analysis2.overall_score
        ? Number(analysis2.overall_score)
        : null,
      overall_score_difference: overallScoreDiff,
      skin_type: analysis1.skin_type.code,
      metrics_comparison: metricsComparison,
    };
  }
}
