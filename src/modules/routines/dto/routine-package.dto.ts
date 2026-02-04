import { ApiProperty } from '@nestjs/swagger';

export class RoutinePackageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  duration: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;
}
