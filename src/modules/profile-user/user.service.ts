import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // lấy skin analysis mới nhất
    const skinAnalysis = await this.prisma.skin_analyses.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        skin_type: true,
      },
    });

    // lấy subscription active
    const subscription = await this.prisma.user_package_subscriptions.findFirst(
      {
        where: {
          user_id: userId,
          status: 'ACTIVE',
        },
        include: {
          routine_package: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatar: user.avatar_url,
      },

      skinType: skinAnalysis
        ? {
            id: skinAnalysis.skin_type.id,
            name: skinAnalysis.skin_type.code,
          }
        : 'User hasn’t analyzed the skin yet',

      currentPackage: subscription
        ? {
            id: subscription.routine_package.id,
            name: subscription.routine_package.package_name,
            price: subscription.routine_package.price,
            startDate: subscription.start_date,
            endDate: subscription.end_date,
          }
        : 'User hasn’t subscribed to a plan yet',
    };
  }

  async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      avatar?: string;
    },
  ) {
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
      where: {
        user_id: userId,
      },
      include: {
        routine_package: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!subs.length) {
      return {
        message: 'User hasn’t subscribed to a plan yet',
      };
    }

    return subs.map((s) => ({
      id: s.id,
      status: s.status,
      startDate: s.start_date,
      endDate: s.end_date,
      package: {
        id: s.routine_package.id,
        name: s.routine_package.package_name,
        price: s.routine_package.price,
      },
    }));
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    const sub = await this.prisma.user_package_subscriptions.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) {
      throw new NotFoundException('Subscription not found');
    }

    if (sub.user_id !== userId) {
      throw new BadRequestException('Not your subscription');
    }

    if (sub.status !== 'ACTIVE') {
      throw new BadRequestException('Subscription is not active');
    }

    return this.prisma.user_package_subscriptions.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELED',
      },
    });
  }
}
