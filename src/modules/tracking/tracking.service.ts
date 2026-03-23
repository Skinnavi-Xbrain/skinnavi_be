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
import { Order } from '@Constant/index';

@Injectable()
export class TrackingService implements OnModuleInit {
  private readonly logger = new Logger(TrackingService.name);

  constructor(private prisma: PrismaService) {}

  async validateTrackingAccess(userId: string) {
    const activeSub = await this.prisma.user_package_subscriptions.findFirst({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: Order.DESC,
      },
      include: {
        routine_package: true,
      },
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

  private toDateOnly(date: Date): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
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

          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
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
    today.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const activeRoutines = await this.prisma.user_routines.findMany({
      where: {
        subscription: {
          start_date: { lte: todayEnd },
          end_date: { gte: today },
          status: { in: ['ACTIVE', 'CANCELED'] },
        },
      },
      select: { id: true },
    });

    if (activeRoutines.length === 0) {
      return { created: 0, message: 'No active routines found for today' };
    }

    const existingLogs = await this.prisma.routine_daily_logs.findMany({
      where: {
        log_date: today,
        user_routine_id: { in: activeRoutines.map((r) => r.id) },
      },
      select: { user_routine_id: true },
    });

    const existingRoutineIds = new Set(
      existingLogs.map((l) => l.user_routine_id),
    );

    const routinesToCreate = activeRoutines
      .filter((r) => !existingRoutineIds.has(r.id))
      .map((r) => ({
        user_routine_id: r.id,
        log_date: today,
        is_completed: false,
      }));

    if (routinesToCreate.length === 0) {
      return { created: 0, message: 'All logs already exist' };
    }

    const result = await this.prisma.routine_daily_logs.createMany({
      data: routinesToCreate,
      skipDuplicates: true,
    });

    this.logger.log(
      `[CRON] Created ${result.count} daily logs for ${today.toISOString().split('T')[0]}`,
    );
    return { created: result.count };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createDailyLogs() {
    const now = new Date();
    const today = this.toDateOnly(now);

    const todayEnd = new Date(today);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const latestSubscriptions =
      await this.prisma.user_package_subscriptions.findMany({
        where: {
          status: 'ACTIVE',
          routine_package: {
            duration_days: {
              in: [30, 90],
            },
          },
          start_date: { lte: todayEnd },
          end_date: { gte: today },
        },
        orderBy: {
          created_at: 'desc',
        },
        include: {
          routine_package: true,
          routines: true,
        },
        distinct: ['user_id'],
      });

    const results: any[] = [];

    for (const subscription of latestSubscriptions) {
      for (const routine of subscription.routines) {
        try {
          const routineStartDate = this.toDateOnly(
            new Date(routine.created_at),
          );

          const subscriptionEndDate = new Date(
            this.toDateOnly(new Date(subscription.end_date)),
          );
          subscriptionEndDate.setUTCHours(23, 59, 59, 999);

          const subStart = this.toDateOnly(new Date(subscription.start_date));

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

            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          }
        } catch (error) {
          this.logger.error(
            `Failed to create logs for routine ${routine.id}:`,
            error,
          );
        }
      }
    }

    return { created: results.length, logs: results };
  }

  async updateDailyLog(logId: string, is_completed: boolean) {
    const log = await this.prisma.routine_daily_logs.findUnique({
      where: { id: logId },
      include: { user_routine: true },
    });

    if (!log) throw new NotFoundException('Daily log not found');

    const now = new Date();

    if (is_completed) {
      const routineTime = log.user_routine.routine_time;

      const logDate = new Date(log.log_date);
      const logYear = logDate.getUTCFullYear();
      const logMonth = logDate.getUTCMonth();
      const logDay = logDate.getUTCDate();

      const isSameDay =
        now.getUTCFullYear() === logYear &&
        now.getUTCMonth() === logMonth &&
        now.getUTCDate() === logDay;

      if (!isSameDay) {
        throw new BadRequestException(
          `This log is for ${logYear}-${logMonth + 1}-${logDay}. You can only check-in for today.`,
        );
      }

      const morningEnd = new Date(now);
      morningEnd.setUTCHours(12, 0, 0, 0);

      const eveningStart = new Date(now);
      eveningStart.setUTCHours(12, 0, 0, 0);

      if (routineTime === 'MORNING') {
        if (now >= morningEnd) {
          throw new BadRequestException(
            'Morning routine expired (Deadline: 12:00 PM)',
          );
        }
      } else if (routineTime === 'EVENING') {
        if (now < eveningStart) {
          throw new BadRequestException(
            'Evening routine has not started yet (Starts at 12:00 PM)',
          );
        }
      }
    }

    return this.prisma.routine_daily_logs.update({
      where: { id: logId },
      data: {
        is_completed,
        completed_at: is_completed ? now : null,
      },
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

    if (!user) throw new NotFoundException('User not found');

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    }

    const skinAnalyses = await this.prisma.skin_analyses.findMany({
      where: {
        user_id: userId,
        ...(start && end ? { created_at: { gte: start, lte: end } } : {}),
      },
      include: { skin_type: true, metrics: true },
      orderBy: { created_at: Order.DESC },
    });

    const analyzesWithTrend = skinAnalyses.map((current, i) => {
      const previous = skinAnalyses[i + 1];
      let scoreTrend: number | null = null;
      if (current.overall_score && previous?.overall_score) {
        scoreTrend =
          Number(current.overall_score) - Number(previous.overall_score);
      }
      return {
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
      };
    });

    const subscriptions = await this.prisma.user_package_subscriptions.findMany(
      {
        where: { user_id: userId },
        include: {
          routines: {
            include: {
              daily_logs: {
                where:
                  start && end ? { log_date: { gte: start, lte: end } } : {},
                orderBy: { log_date: Order.ASC },
              },
            },
            orderBy: { routine_time: Order.ASC },
          },
        },
      },
    );

    const routinesOverview = subscriptions.flatMap((sub) =>
      sub.routines.map((routine) => {
        const daily_logs = routine.daily_logs.map((log) => ({
          id: log.id,
          log_date: log.log_date.toISOString(),
          is_completed: log.is_completed,
        }));

        return {
          routine_id: routine.id,
          routine_time: routine.routine_time,
          subscription_id: sub.id,
          subscription_dates: {
            start: sub.start_date.toISOString().split('T')[0],
            end: sub.end_date.toISOString().split('T')[0],
          },
          daily_logs,
          completed_count: daily_logs.filter((l) => l.is_completed).length,
          total_count: daily_logs.length,
        };
      }),
    );

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
      filter: {
        start_date: start?.toISOString().split('T')[0] || null,
        end_date: end?.toISOString().split('T')[0] || null,
      },
      skin_analyses: analyzesWithTrend,
      routines: routinesOverview,
    };
  }

  async getDailyLogs(userId: string, startDate?: string, endDate?: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
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

    const routines = subscriptions.flatMap((subscription) =>
      subscription.routines.map((routine) => {
        const logs = routine.daily_logs.map((log) => ({
          id: log.id,
          user_routine_id: log.user_routine_id,
          log_date: log.log_date.toISOString(),
          is_completed: log.is_completed,
          completed_at: log.completed_at
            ? log.completed_at.toISOString()
            : null,
        }));

        return {
          routine_id: routine.id,
          routine_time: routine.routine_time,
          routine_created_at: routine.created_at.toISOString(),
          subscription_id: subscription.id,
          subscription_period: {
            start: subscription.start_date.toISOString().split('T')[0],
            end: subscription.end_date.toISOString().split('T')[0],
          },
          daily_logs: logs,
          completed_count: logs.filter((l) => l.is_completed).length,
          total_count: logs.length,
        };
      }),
    );

    return {
      user_id: user.id,
      routines,
    };
  }

  async getTodayDailyLogs(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = this.toDateOnly(new Date());

    const latestSubscription =
      await this.prisma.user_package_subscriptions.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: Order.DESC },
        include: {
          routine_package: true,
          routines: {
            include: {
              daily_logs: {
                where: {
                  log_date: {
                    equals: today,
                  },
                },
              },
            },
            orderBy: { created_at: Order.DESC },
          },
        },
      });

    if (!latestSubscription || latestSubscription.routines.length === 0) {
      return {
        user_id: user.id,
        type: 'NO_SUBSCRIPTION',
        routines: [],
      };
    }

    const duration = latestSubscription.routine_package?.duration_days;
    if (duration === 7) {
      return {
        user_id: user.id,
        type: 'WEEKLY_NO_LOG',
        routines: [],
      };
    }

    const latestRoutineCreatedAt = latestSubscription.routines[0].created_at;
    const latestRoutines = latestSubscription.routines.filter((r) => {
      const diffInSeconds =
        Math.abs(r.created_at.getTime() - latestRoutineCreatedAt.getTime()) /
        1000;
      return diffInSeconds < 5;
    });

    const routinesResult: any[] = [];

    for (const routine of latestRoutines) {
      const todayLog = routine.daily_logs[0];

      if (todayLog) {
        routinesResult.push({
          routine_id: routine.id,
          routine_time: routine.routine_time,
          routine_created_at: routine.created_at.toISOString(),
          daily_log: {
            id: todayLog.id,
            user_routine_id: todayLog.user_routine_id,
            log_date: todayLog.log_date.toISOString(),
            is_completed: todayLog.is_completed,
          },
          is_completed: todayLog.is_completed,
        });
      }
    }

    if (routinesResult.length === 0) {
      return {
        user_id: user.id,
        type: 'NO_LOG_TODAY',
        routines: [],
      };
    }

    // Sắp xếp lại theo MORNING/EVENING để hiển thị đúng thứ tự cho user
    routinesResult.sort((a, b) => a.routine_time.localeCompare(b.routine_time));

    return {
      user_id: user.id,
      type: 'HAS_LOG',
      routines: routinesResult,
    };
  }

  async getUserSkinAnalyses(userId: string, days: number = 7) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);

    const skinAnalyses = await this.prisma.skin_analyses.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: start,
          lte: end,
        },
      },
      include: {
        skin_type: true,
        metrics: true,
      },
      orderBy: { created_at: Order.DESC },
    });

    const baseResponse = {
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };

    if (skinAnalyses.length < 2) {
      return {
        ...baseResponse,
        skin_analyses: [],
        message: `At least 2 analyses are required to show trends (Found: ${skinAnalyses.length})`,
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
