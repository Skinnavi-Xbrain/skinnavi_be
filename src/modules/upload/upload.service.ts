import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  /**
   * Upload image buffer to Cloudinary. Returns the secure URL and public_id.
   */
  async uploadImage(
    buffer: Buffer,
    fileInfo: { name: string; mimetype: string },
  ): Promise<{ url: string; publicId: string }> {
    const scriptUrl = this.configService.get<string>('GOOGLE_APPS_SCRIPT_URL');

    if (!scriptUrl) {
      throw new Error('Missing GOOGLE_APPS_SCRIPT_URL in .env');
    }

    const postData = {
      name: fileInfo.name || `upload_${Date.now()}`,
      type: fileInfo.mimetype,
      data: buffer.toString('base64'),
    };

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (result.status !== 'success') {
        throw new BadRequestException('Google Script upload failed');
      }

      return {
        url: `${result.link}=s1000`,
        publicId: result.id,
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }
}
