import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDailyLogDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  is_completed: boolean;
}
