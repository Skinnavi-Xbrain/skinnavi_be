import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
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
  @Get()
  async getPackages() {
    return this.subscriptionsService.getPackages();
  }
  @Get('stats/conversion-rate')
  async getFreeToPaidConversion() {
    return this.subscriptionsService.getFreeToPaidConversion();
  }

  @Get('stats/conversion-rate/monthly')
  async getMonthlyConversionRate() {
    return this.subscriptionsService.getMonthlyConversionRate();
  }
  @Get('stats/status')
  async getSubscriptionStatsByStatus() {
    return this.subscriptionsService.getSubscriptionStatsByStatus();
  }

  @Get(':id')
  async getPackageDetail(@Param('id') id: string) {
    return this.subscriptionsService.getPackageDetail(id);
  }

  @Post()
  async createPackage(@Body() body: any) {
    return this.subscriptionsService.createPackage(body);
  }

  @Patch(':id')
  async updatePackage(@Param('id') id: string, @Body() body: any) {
    return this.subscriptionsService.updatePackage(id, body);
  }

  @Delete(':id')
  async deletePackage(@Param('id') id: string) {
    return this.subscriptionsService.deletePackage(id);
  }
}
