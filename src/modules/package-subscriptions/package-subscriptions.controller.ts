import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { PackageSubscriptionsService } from './package-subscriptions.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateSubscriptionComboDto } from './dto/update-subscription-combo.dto';
import { SimpleResponse } from '../../common/dtos';

@ApiTags('package-subscriptions')
@Controller('package-subscriptions')
export class PackageSubscriptionsController {
  constructor(
    private readonly packageSubscriptionsService: PackageSubscriptionsService,
  ) {}

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  async validateSubscription(@GetUser('id') userId: string) {
    return this.packageSubscriptionsService.validateSubscription(userId);
  }

  @Patch('update-combo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('')
  @ApiOperation({
    summary: 'Update selected combo for current active subscription',
  })
  async updateCombo(
    @GetUser('id') userId: string,
    @Body() dto: UpdateSubscriptionComboDto,
  ) {
    const data = await this.packageSubscriptionsService.updateSubscriptionCombo(
      userId,
      dto.comboId,
    );
    return new SimpleResponse(data, 'Subscription combo updated successfully.');
  }
}
