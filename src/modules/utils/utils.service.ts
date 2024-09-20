import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class UtilsService {
    async generateQrCode(url: string): Promise<string> {
        try {
            const qrCodeUrl = await QRCode.toDataURL(url);

            return qrCodeUrl;
        } catch (error) {
            throw new error();
        }
    }
}
