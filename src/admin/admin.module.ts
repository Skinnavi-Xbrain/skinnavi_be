import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';
import { AdminUsersController } from './users/users.controller';
import { AdminRevenueController } from './revenue/revenue.controller';
import { AdminSubscriptionsController } from './subscriptions/subscriptions.controller';
import { AdminUsersService } from './users/users.service';
import { AdminRevenueService } from './revenue/revenue.service';
import { AdminSubscriptionsService } from './subscriptions/subscriptions.service';
import { ProductsController } from './products/product.controller';
import { ProductsService } from './products/product.service';
import { CombosController } from './combos/combo.controller';
import { CombosService } from './combos/combo.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AdminUsersController,
    AdminRevenueController,
    AdminSubscriptionsController,
    ProductsController,
    CombosController,
  ],
  providers: [
    AdminUsersService,
    AdminRevenueService,
    AdminSubscriptionsService,
    ProductsService,
    CombosService,
  ],
})
export class AdminModule {}
