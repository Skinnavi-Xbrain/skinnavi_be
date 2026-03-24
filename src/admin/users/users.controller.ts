import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  @Get()
  async getUsers(
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const page = Number(pageRaw ?? 1);
    const limit = Number(limitRaw ?? 10);

    return this.usersService.getUsers(page, limit);
  }

  @Get(':id')
  async getUserDetail(@Param('id') id: string) {
    return this.usersService.getUserDetail(id);
  }

  @Post()
  async createUser(@Body() body) {
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
