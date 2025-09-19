import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class UtilsService {
    async generateQrCode(url: string) {
        try {
            const qrCodeUrl = await QRCode.toBuffer(url, {
                type: 'png',
                width: 480,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            return qrCodeUrl;
        } catch (error) {
            throw new error();
        }
    }
}
