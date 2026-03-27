import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subscription_status_enum } from '@prisma/client';
import {
  UpdateProfileDto,
  UserProfileResponseDto,
} from './dto/user-profile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skinAnalysis = await this.prisma.skin_analyses.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { skin_type: true },
    });

    const subscription = await this.prisma.user_package_subscriptions.findFirst(
      {
        where: {
          user_id: userId,
          status: subscription_status_enum.ACTIVE,
        },
        include: {
          routine_package: true,
        },
        orderBy: { created_at: 'desc' },
      },
    );

    let scanUsage = {
      totalLimit: 0,
      used: 0,
      remaining: 0,
    };

    if (subscription) {
      const usedScans = await this.prisma.skin_analyses.count({
        where: {
          user_id: userId,
          created_at: {
            gte: subscription.start_date,
            lte: subscription.end_date,
          },
        },
      });

      const limit = subscription.routine_package.total_scan_limit;

      scanUsage = {
        totalLimit: limit,
        used: usedScans,
        remaining: Math.max(0, limit - usedScans),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatar: user.avatar_url,
        created_at: user.created_at,
      },
      skinType: skinAnalysis
        ? {
            id: skinAnalysis.skin_type.id,
            name: skinAnalysis.skin_type.code,
          }
        : 'User has not analyzed the skin yet',
      currentPackage: subscription
        ? {
            id: subscription.routine_package.id,
            name: subscription.routine_package.package_name,
            price: Number(subscription.routine_package.price),
            startDate: subscription.start_date,
            endDate: subscription.end_date,
            scanDetails: scanUsage,
          }
        : 'User has not subscribed to a plan yet',
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        full_name: data.fullName,
        avatar_url: data.avatar,
      },
    });
  }

  async getMySubscriptions(userId: string) {
    const subs = await this.prisma.user_package_subscriptions.findMany({
      where: { user_id: userId },
      include: { routine_package: true },
      orderBy: { created_at: 'desc' },
    });

    return subs.map((s) => ({
      id: s.id,
      status: s.status,
      startDate: s.start_date,
      endDate: s.end_date,
      package: {
        id: s.routine_package.id,
        name: s.routine_package.package_name,
        price: Number(s.routine_package.price),
      },
    }));
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    const sub = await this.prisma.user_package_subscriptions.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.user_id !== userId)
      throw new BadRequestException('Not your subscription');
    if (sub.status !== subscription_status_enum.ACTIVE) {
      throw new BadRequestException('Subscription is not active');
    }

    return this.prisma.user_package_subscriptions.update({
      where: { id: subscriptionId },
      data: { status: subscription_status_enum.CANCELED },
    });
  }
}
