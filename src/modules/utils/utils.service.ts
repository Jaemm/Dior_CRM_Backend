import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class UtilsService {
    async generateQrCode(url: string): Promise<Buffer> {
        try {
            const qrCodeUrl = await QRCode.toBuffer(url, { type: 'png' });

            return qrCodeUrl;
        } catch (error) {
            throw new error();
        }
    }
}
