import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AnalyzeSkinDto {
  @ApiProperty({
    description: 'URL of the face image (e.g. from upload endpoint)',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;
}
