import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidateSubscriptionResponse } from './dto/package-subscriptions.dto';

@Injectable()
export class PackageSubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async validateSubscription(
    userId: string,
  ): Promise<ValidateSubscriptionResponse> {
    const now = new Date();

    const latestSub = await this.prisma.user_package_subscriptions.findFirst({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        routine_package: true,
      },
    });

    if (!latestSub) {
      return {
        isValid: false,
        message:
          'You have not subscribed to any package yet. Please choose a routine package to continue.',
        data: null,
      };
    }

    if (latestSub.end_date <= now) {
      return {
        isValid: false,
        message:
          'Your subscription has expired. Please renew or subscribe to a new package.',
        data: {
          subscriptionId: latestSub.id,
          packageName: latestSub.routine_package.package_name,
          endDate: latestSub.end_date,
        },
      };
    }

    return {
      isValid: true,
      message: 'Subscription is valid.',
      data: {
        subscriptionId: latestSub.id,
        packageName: latestSub.routine_package.package_name,
        endDate: latestSub.end_date,
      },
    };
  }
}
