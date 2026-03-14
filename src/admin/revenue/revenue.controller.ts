import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminRevenueService } from './revenue.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminRevenueController {
  constructor(private readonly revenueService: AdminRevenueService) {}

  @Get('stats')
  async getRevenueStats(
    @Query('from') fromRaw?: string,
    @Query('to') toRaw?: string,
    @Query('tz') tzRaw?: string,
  ) {
    return this.revenueService.getRevenueStats({
      from: fromRaw,
      to: toRaw,
      tz: tzRaw,
    });
  }
}
