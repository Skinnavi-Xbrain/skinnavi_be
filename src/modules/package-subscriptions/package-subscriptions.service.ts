import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidateSubscriptionResponse } from './dto/package-subscriptions.dto';
import { Order } from '@Constant/index';
import { subscription_status_enum } from '@prisma/client';

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
        created_at: Order.DESC,
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

  async updateSubscriptionCombo(userId: string, comboId: string) {
    const combo = await this.prisma.skincare_combos.findUnique({
      where: { id: comboId, is_active: true },
    });

    if (!combo) {
      throw new NotFoundException('Skincare combo not found or inactive.');
    }

    const activeSub = await this.prisma.user_package_subscriptions.findFirst({
      where: {
        user_id: userId,
        status: subscription_status_enum.ACTIVE,
        end_date: { gt: new Date() },
      },
      orderBy: { created_at: Order.DESC },
    });

    if (!activeSub) {
      throw new BadRequestException('No active subscription found to update.');
    }

    return this.prisma.user_package_subscriptions.update({
      where: { id: activeSub.id },
      data: {
        selected_combo_id: comboId,
      },
      include: {
        selected_combo: true,
      },
    });
  }
}
