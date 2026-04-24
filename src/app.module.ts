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
import { UserModule } from './modules/profile-user/user.module';
import { HealthModule } from './modules/health/health.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
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
    UserModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
