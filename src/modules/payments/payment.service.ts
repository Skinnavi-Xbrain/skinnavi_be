import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { format } from 'date-fns';
import { payment_status_enum } from '@prisma/client';
import { EligibilityResponse } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async checkEligibility(
    userId: string,
    packageId: string,
  ): Promise<EligibilityResponse> {
    const now = new Date();

    const targetPackage = await this.prisma.routine_packages.findUnique({
      where: { id: packageId },
    });

    if (!targetPackage) {
      throw new NotFoundException('Package not found');
    }

    const currentActiveSub =
      await this.prisma.user_package_subscriptions.findFirst({
        where: {
          user_id: userId,
          status: 'ACTIVE',
          end_date: { gt: now },
        },
        include: {
          routine_package: true,
        },
      });

    if (currentActiveSub && currentActiveSub.routine_package_id === packageId) {
      const existingRoutinesCount = await this.prisma.user_routines.count({
        where: { user_package_subscription_id: currentActiveSub.id },
      });
      const createdRoutinePairs = existingRoutinesCount / 2;

      if (
        createdRoutinePairs < currentActiveSub.routine_package.total_scan_limit
      ) {
        return {
          requiresPayment: false,
          isFreeTrial: false,
          hasActivePackage: true,
          currentPackage: {
            name: currentActiveSub.routine_package.package_name,
            endDate: currentActiveSub.end_date,
          },
        };
      }
    }

    const hasEverHadActiveSubscription =
      await this.prisma.user_package_subscriptions.findFirst({
        where: { user_id: userId, status: 'ACTIVE' },
      });

    const isEligibleForFreeTrial =
      targetPackage.duration_days <= 7 && !hasEverHadActiveSubscription;

    if (!currentActiveSub) {
      return {
        requiresPayment: isEligibleForFreeTrial
          ? false
          : targetPackage.price.gt(0),
        isFreeTrial: isEligibleForFreeTrial,
        hasActivePackage: false,
        currentPackage: null,
      };
    }

    return {
      requiresPayment: targetPackage.price.gt(0),
      isFreeTrial: false,
      hasActivePackage: true,
      currentPackage: {
        name: currentActiveSub.routine_package.package_name,
        endDate: currentActiveSub.end_date,
      },
    };
  }

  async createPaymentUrl(
    userId: string,
    packageId: string,
    comboId: string,
    ip: string,
  ): Promise<string> {
    const pkg = await this.prisma.routine_packages.findUnique({
      where: { id: packageId },
    });

    if (!pkg) throw new NotFoundException('Package not found');

    const subscription = await this.prisma.user_package_subscriptions.create({
      data: {
        user_id: userId,
        routine_package_id: packageId,
        selected_combo_id: comboId,
        start_date: new Date(),
        end_date: new Date(),
        status: 'CANCELED',
      },
    });

    const payment = await this.prisma.payments.create({
      data: {
        user_id: userId,
        subscription_id: subscription.id,
        amount: pkg.price,
        status: payment_status_enum.PENDING,
      },
    });

    return this.generateVnpayUrl(payment.id, pkg.price, ip);
  }

  async createFreeTrial(userId: string, packageId: string, comboId: string) {
    const pkg = await this.prisma.routine_packages.findUnique({
      where: { id: packageId },
    });

    if (!pkg) throw new NotFoundException('Package not found');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + pkg.duration_days);

    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.user_package_subscriptions.create({
        data: {
          user_id: userId,
          routine_package_id: packageId,
          selected_combo_id: comboId,
          start_date: startDate,
          end_date: endDate,
          status: 'ACTIVE',
        },
      });

      await tx.payments.create({
        data: {
          user_id: userId,
          subscription_id: subscription.id,
          amount: 0,
          vnp_OrderInfo: `Free Trial: ${pkg.package_name}`,
          status: payment_status_enum.SUCCESS,
        },
      });

      return subscription;
    });
  }

  async handleVnpayIpn(query: any) {
    const secretKey = this.configService.get<string>('VNP_HASH_SECRET')?.trim();
    if (!secretKey)
      return { RspCode: '97', Message: 'VNPAY configuration is missing' };

    const secureHash = query['vnp_SecureHash'];
    const data = { ...query };
    delete data['vnp_SecureHash'];
    delete data['vnp_SecureHashType'];

    const sortedParams = this.sortObject(data);
    const signData = this.buildQueryString(sortedParams);
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      this.logger.error('Invalid VNPAY signature');
      return { RspCode: '97', Message: 'Invalid VNPAY signature' };
    }

    const orderId = query['vnp_TxnRef'];
    const responseCode = query['vnp_ResponseCode'];
    const vnpAmount = query['vnp_Amount'];

    const payment = await this.prisma.payments.findUnique({
      where: { id: orderId },
      include: { subscription: { include: { routine_package: true } } },
    });

    if (!payment) return { RspCode: '01', Message: 'Order not found' };

    const expectedAmount = Math.floor(Number(payment.amount) * 100).toString();
    if (expectedAmount !== vnpAmount.toString())
      return { RspCode: '04', Message: 'Amount mismatch' };

    if (payment.status !== payment_status_enum.PENDING)
      return { RspCode: '02', Message: 'Order already processed' };

    if (responseCode === '00') {
      await this.prisma.$transaction(async (tx) => {
        await tx.payments.update({
          where: { id: orderId },
          data: { status: payment_status_enum.SUCCESS },
        });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(
          startDate.getDate() +
            payment.subscription.routine_package.duration_days,
        );

        await tx.user_package_subscriptions.updateMany({
          where: {
            user_id: payment.user_id,
            status: 'ACTIVE',
          },
          data: {
            status: 'CANCELED',
          },
        });

        await tx.user_package_subscriptions.update({
          where: { id: payment.subscription_id },
          data: {
            start_date: startDate,
            end_date: endDate,
            status: 'ACTIVE',
          },
        });
      });
      return { RspCode: '00', Message: 'Success' };
    } else {
      await this.prisma.payments.update({
        where: { id: orderId },
        data: { status: payment_status_enum.FAILED },
      });
      return { RspCode: '00', Message: 'Success' };
    }
  }

  private async generateVnpayUrl(
    paymentId: string,
    price: any,
    ip: string,
  ): Promise<string> {
    const tmnCode = this.configService.get<string>('VNP_TMN_CODE');
    const secretKey = this.configService.get<string>('VNP_HASH_SECRET')?.trim();
    const vnpUrl = this.configService.get<string>('VNP_URL');
    const returnUrl = this.configService.get<string>('VNP_RETURN_URL');

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      throw new Error('VNPAY configuration is missing');
    }

    const date = new Date();
    const createDate = format(date, 'yyyyMMddHHmmss');
    const amount = Math.floor(Number(price) * 100).toString();

    let clientIp = ip;
    if (clientIp.includes('::ffff:')) {
      clientIp = clientIp.split(':').pop() || '127.0.0.1';
    } else if (clientIp === '::1') {
      clientIp = '127.0.0.1';
    }

    const vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'en',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: paymentId,
      vnp_OrderInfo: `Pay for order ${paymentId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: clientIp,
      vnp_CreateDate: createDate,
    };

    const sortedParams = this.sortObject(vnp_Params);
    const signData = this.buildQueryString(sortedParams);
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
  }

  private sortObject(obj: any) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      if (obj[key] !== '' && obj[key] !== undefined && obj[key] !== null) {
        sorted[key] = obj[key].toString();
      }
    });
    return sorted;
  }

  private buildQueryString(params: any): string {
    return Object.keys(params)
      .map((key) => {
        const val = params[key];
        const encodedVal = encodeURIComponent(val).replace(/%20/g, '+');
        return `${encodeURIComponent(key)}=${encodedVal}`;
      })
      .join('&');
  }
}
