import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';
import { AdminUsersController } from './users/users.controller';
import { AdminRevenueController } from './revenue/revenue.controller';
import { AdminSubscriptionsController } from './subscriptions/subscriptions.controller';
import { AdminUsersService } from './users/users.service';
import { AdminRevenueService } from './revenue/revenue.service';
import { AdminSubscriptionsService } from './subscriptions/subscriptions.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AdminUsersController,
    AdminRevenueController,
    AdminSubscriptionsController,
  ],
  providers: [
    AdminUsersService,
    AdminRevenueService,
    AdminSubscriptionsService,
  ],
})
export class AdminModule {}
