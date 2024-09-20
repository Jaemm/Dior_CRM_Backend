import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class UtilsService {
    async generateQrCode(url: string) {
        try {
            // const qrCodeUrl = await QRCode.toBuffer(url, { type: 'png' });
            const qrCodeUrl = await QRCode.toDataURL(url);

            return qrCodeUrl;
        } catch (error) {
            throw new error();
        }
    }
}
