import { IsUUID, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  packageId: string;

  @IsUUID()
  @IsNotEmpty()
  comboId: string;

  @IsOptional()
  @IsBoolean()
  forceCreate?: boolean;
}
