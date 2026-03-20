import { Module } from '@nestjs/common';
import { PackageSubscriptionsService } from './package-subscriptions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PackageSubscriptionsController } from './package-subscriptions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PackageSubscriptionsController],
  providers: [PackageSubscriptionsService],
  exports: [PackageSubscriptionsService],
})
export class PackageSubscriptionsModule {}
