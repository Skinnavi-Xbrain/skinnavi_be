import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { PackageSubscriptionsService } from './package-subscriptions.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('package-subscriptions')
export class PackageSubscriptionsController {
  constructor(
    private readonly packageSubscriptionsService: PackageSubscriptionsService,
  ) {}

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  async validateSubscription(@GetUser('id') userId: string) {
    return this.packageSubscriptionsService.validateSubscription(userId);
  }
}
