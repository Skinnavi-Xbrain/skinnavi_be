import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './users.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get('stats')
  async getUserStats(
    @Query('activeDays') activeDaysRaw?: string,
    @Query('includeSubscriptionActive') includeSubscriptionActiveRaw?: string,
  ) {
    const activeDays = Number(activeDaysRaw ?? 30);
    const includeSubscriptionActive =
      (includeSubscriptionActiveRaw ?? 'true').toLowerCase() === 'true';

    return this.usersService.getUserStats({
      activeDays:
        Number.isFinite(activeDays) && activeDays > 0 ? activeDays : 30,
      includeSubscriptionActive,
    });
  }
  @Get('growth')
  async getUserGrowth() {
    return this.usersService.getUserGrowth();
  }
}
