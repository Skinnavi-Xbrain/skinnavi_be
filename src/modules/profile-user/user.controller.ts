import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { SimpleResponse } from '../../common/dtos/index';
import {
  UpdateProfileDto,
  UserProfileResponseDto,
} from './dto/user-profile.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user-profile')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile with subscription & scan status',
  })
  async getProfile(@GetUser('id') userId: string) {
    const data = await this.service.getProfile(userId);
    return new SimpleResponse<UserProfileResponseDto>(
      data,
      'Get profile successfully',
    );
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile information' })
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() body: UpdateProfileDto,
  ) {
    const data = await this.service.updateProfile(userId, body);
    return new SimpleResponse(data, 'Profile updated successfully');
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get list of all user subscriptions' })
  async getSubscriptions(@GetUser('id') userId: string) {
    const data = await this.service.getMySubscriptions(userId);
    const message =
      data.length > 0
        ? 'Get subscriptions successfully'
        : 'User has not subscribed to a plan yet';
    return new SimpleResponse(data, message);
  }

  @Patch('subscription/:id/cancel')
  @ApiOperation({ summary: 'Cancel an active subscription' })
  async cancel(@GetUser('id') userId: string, @Param('id') id: string) {
    const data = await this.service.cancelSubscription(userId, id);
    return new SimpleResponse(data, 'Subscription cancelled successfully');
  }
}
