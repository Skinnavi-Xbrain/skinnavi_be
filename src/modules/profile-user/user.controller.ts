import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.service.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.service.updateProfile(req.user.id, body);
  }

  @Get('subscriptions')
  getSubscriptions(@Req() req: any) {
    return this.service.getMySubscriptions(req.user.id);
  }

  @Patch('subscriptions/:id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.service.cancelSubscription(req.user.id, id);
  }
}
