import { Module } from '@nestjs/common';
import { PackageSubscriptionsService } from './package-subscriptions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PackageSubscriptionsController } from './package-subscriptions.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [PackageSubscriptionsController],
  providers: [PackageSubscriptionsService],
  exports: [PackageSubscriptionsService],
})
export class PackageSubscriptionsModule {}
