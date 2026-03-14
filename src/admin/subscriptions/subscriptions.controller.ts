import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminSubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSubscriptionsController {
  constructor(
    private readonly subscriptionsService: AdminSubscriptionsService,
  ) {}

  @Get('active')
  async getActiveSubscriptions() {
    return this.subscriptionsService.getActiveSubscriptions();
  }
}
