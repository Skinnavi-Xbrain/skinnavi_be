import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'https://avatar.url' })
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class ScanDetailsDto {
  @ApiProperty()
  totalLimit: number;

  @ApiProperty()
  used: number;

  @ApiProperty()
  remaining: number;
}

export class UserProfileResponseDto {
  @ApiProperty()
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatar: string | null;
    created_at: Date;
  };

  @ApiProperty()
  skinType:
    | {
        id: string;
        name: string;
      }
    | string;

  @ApiProperty()
  currentPackage:
    | {
        id: string;
        name: string;
        price: number;
        startDate: Date;
        endDate: Date;
        scanDetails: ScanDetailsDto;
      }
    | string;
}
