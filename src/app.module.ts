import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { RoutinesModule } from './modules/routines/routines.module';
import { UploadModule } from './modules/upload/upload.module';
import { SkinAnalysisModule } from './modules/skin-analysis/skin-analysis.module';
import { RoutinePackagesModule } from './modules/routine-packages/routine-packages.module';
import { CombosModule } from './modules/combos/combos.module';
import { PaymentsModule } from './modules/payments/payment.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { AdminModule } from './admin/admin.module';
import { PackageSubscriptionsModule } from './modules/package-subscriptions/package-subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CombosModule,
    UploadModule,
    SkinAnalysisModule,
    RoutinePackagesModule,
    RoutinesModule,
    PaymentsModule,
    TrackingModule,
    PackageSubscriptionsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
