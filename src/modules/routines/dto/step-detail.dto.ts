import { ApiProperty } from '@nestjs/swagger';

export class SubStepDto {
  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  how_to?: string;

  @ApiProperty({ required: false })
  image_url?: string;
}

export class RoutineStepDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  step_order: number;

  @ApiProperty({ required: false })
  instruction?: string;

  @ApiProperty({ required: false })
  product_id?: string;

  @ApiProperty({ type: [SubStepDto] })
  sub_steps: SubStepDto[];
}
