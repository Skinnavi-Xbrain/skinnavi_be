import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('check-eligibility')
  @UseGuards(JwtAuthGuard)
  async check(
    @GetUser('id') userId: string,
    @Query('packageId') packageId: string,
  ) {
    return this.paymentsService.checkEligibility(userId, packageId);
  }

  @Post('create-url')
  @UseGuards(JwtAuthGuard)
  async createUrl(
    @GetUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    const ip =
      req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const url = await this.paymentsService.createPaymentUrl(
      userId,
      dto.packageId,
      dto.comboId,
      ip,
    );
    return { url };
  }

  @Get('vnpay-ipn')
  async vnpayIpn(@Query() query: any) {
    return this.paymentsService.handleVnpayIpn(query);
  }
}
