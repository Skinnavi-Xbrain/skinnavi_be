import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    const cloudName =
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') ??
      this.configService.get<string>('CLOUD_NAME');
    const apiKey =
      this.configService.get<string>('CLOUDINARY_API_KEY') ??
      this.configService.get<string>('CLOUD_KEY');
    const apiSecret =
      this.configService.get<string>('CLOUDINARY_API_SECRET') ??
      this.configService.get<string>('CLOUD_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Missing Cloudinary config. Add to .env: CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET (or CLOUDINARY_* variants)',
      );
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  /**
   * Upload image buffer to Cloudinary. Returns the secure URL and public_id.
   */
  async uploadImage(
    buffer: Buffer,
    options?: { folder?: string; publicId?: string },
  ): Promise<{ url: string; secureUrl: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options?.folder ?? 'skinnavi/faces',
          resource_type: 'image',
          ...(options?.publicId && { public_id: options.publicId }),
        },
        (err: Error | undefined, result: UploadApiResponse | undefined) => {
          if (err) {
            reject(
              new BadRequestException(
                `Cloudinary upload failed: ${err.message}`,
              ),
            );
            return;
          }
          if (!result?.secure_url) {
            reject(new BadRequestException('Cloudinary returned no URL'));
            return;
          }
          resolve({
            url: result.secure_url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      uploadStream.end(buffer);
    });
  }
}
