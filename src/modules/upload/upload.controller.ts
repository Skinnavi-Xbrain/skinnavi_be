import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { SimpleResponse } from '../../common/dtos/index';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile()
    file: { buffer: Buffer; size: number; mimetype: string } | undefined,
  ): Promise<SimpleResponse<{ url: string; publicId: string }>> {
    if (!file?.buffer) {
      throw new BadRequestException(
        'No file provided. Use field name "image".',
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      );
    }
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid type. Allowed: ${ALLOWED_MIMES.join(', ')}`,
      );
    }
    const result = await this.uploadService.uploadImage(file.buffer);
    return new SimpleResponse(
      { url: result.secureUrl, publicId: result.publicId },
      'Image uploaded successfully.',
      201,
    );
  }
}
