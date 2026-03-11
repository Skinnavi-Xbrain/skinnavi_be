import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { format } from 'date-fns';
import { payment_status_enum } from '@prisma/client';
import {
  EligibilityResponse,
  CreatePaymentResponse,
} from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * API 1: Kiểm tra xem user có cần thanh toán hay không
   * Kết hợp kiểm tra end_date và trường is_active
   */
  async checkEligibility(
    userId: string,
    packageId: string,
  ): Promise<EligibilityResponse> {
    // 1. Kiểm tra gói đang hoạt động (phải còn hạn VÀ is_active = true)
    const activeSub = await this.prisma.user_package_subscriptions.findFirst({
      where: {
        user_id: userId,
        is_active: true,
        end_date: { gt: new Date() },
      },
      include: { routine_package: true },
      orderBy: { end_date: 'desc' },
    });

    // 2. Kiểm tra thông tin gói mục tiêu
    const targetPkg = await this.prisma.routine_packages.findUnique({
      where: { id: packageId },
    });
    if (!targetPkg) throw new NotFoundException('Package not found');

    // 3. Kiểm tra user mới hoàn toàn (chưa từng có bất kỳ subscription nào)
    const hasEverSubscribed =
      await this.prisma.user_package_subscriptions.findFirst({
        where: { user_id: userId },
      });

    // Logic Free Trial: User chưa từng subscribe + Chọn gói <= 7 ngày
    const isEligibleForFreeTrial =
      !hasEverSubscribed && targetPkg.duration_days <= 7;

    return {
      requiresPayment: !isEligibleForFreeTrial && Number(targetPkg.price) > 0,
      isFreeTrial: isEligibleForFreeTrial,
      hasActivePackage: !!activeSub,
      currentPackage: activeSub
        ? {
            name: activeSub.routine_package.package_name,
            endDate: activeSub.end_date,
          }
        : null,
    };
  }

  /**
   * API 3: Tạo link thanh toán hoặc xử lý gói Free Trial
   */
  async createPaymentUrl(
    userId: string,
    packageId: string,
    comboId: string,
    ip: string,
    forceCreate: boolean = false,
  ): Promise<CreatePaymentResponse | string> {
    // 1. Kiểm tra logic ghi đè gói đang active
    const eligibility = await this.checkEligibility(userId, packageId);

    // if (eligibility.hasActivePackage && !forceCreate) {
    //   return {
    //     hasActivePackage: true,
    //     currentPackage: eligibility.currentPackage,
    //     message:
    //       'You currently have an active package. Do you want to replace it with the new one?',
    //   };
    // }

    // 2. Kiểm tra thông tin gói cước mới
    const pkg = await this.prisma.routine_packages.findUnique({
      where: { id: packageId },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    // 3. Xử lý logic thay đổi gói: Nếu xác nhận tạo mới (forceCreate), tắt các gói cũ
    if (forceCreate) {
      await this.prisma.user_package_subscriptions.updateMany({
        where: {
          user_id: userId,
          is_active: true,
        },
        data: {
          is_active: false,
        },
      });
      this.logger.log(
        `Deactivated old packages for user ${userId} due to forceCreate`,
      );
    }

    // 4. Xử lý gói FREE TRIAL
    if (eligibility.isFreeTrial) {
      return {
        isFreeTrial: true,
        message:
          'Congratulations! You are eligible for a free trial. Your routine will be created immediately.',
      };
    }

    // 5. Tạo Subscription và Payment (Mặc định is_active vẫn là true theo DB schema của bạn)
    const subscription = await this.prisma.user_package_subscriptions.create({
      data: {
        user_id: userId,
        routine_package_id: packageId,
        selected_combo_id: comboId,
        start_date: new Date(),
        end_date: new Date(), // Sẽ cập nhật khi IPN thành công
        is_active: true,
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

  /**
   * Xử lý IPN từ VNPAY
   */
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

        await tx.user_package_subscriptions.update({
          where: { id: payment.subscription_id },
          data: {
            start_date: startDate,
            end_date: endDate,
            is_active: true,
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

  // --- Helper Methods ---

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
      vnp_Locale: 'vn',
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
