import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  packageId: string;

  @IsUUID()
  @IsNotEmpty()
  comboId: string;
}
