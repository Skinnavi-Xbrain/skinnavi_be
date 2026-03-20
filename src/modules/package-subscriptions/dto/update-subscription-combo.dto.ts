import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionComboDto {
  @ApiProperty({ example: 'f9619dfd-abee-44b8-ba3f-2fea19bbfd84' })
  @IsUUID()
  @IsNotEmpty()
  comboId: string;
}
