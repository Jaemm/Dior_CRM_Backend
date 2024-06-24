import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DeviceService } from './devices.service';

import { ApiTags } from '@nestjs/swagger';
import { ConsultantDto } from '@/src/modules/consultants/consultants.dto';
import { LicenseDto } from '@/src/modules/devices/device.dto';
// import { AuthService } from 'src/modules/signUpAuth/auth/auth.service';

@ApiTags('Device')
@Controller('device')
export class DeviceController {
    constructor(private readonly devices: DeviceService) {}

    @Post('license')
    async licence(@Req() req: Request, @Res() res: Response, @Body() body: LicenseDto): Promise<any> {
        const response: any = {
            status: 200,
            message: 'Success',
            data: {},
        };
        const user: any = req['user'];
        const { consultant_id, app_id } = user;

        const { optic_number } = body;

        try {
            const checkingDevice = await this.devices.checkLicense(consultant_id, app_id, optic_number);

            if (checkingDevice?.license_remaining_days < 1) {
                response.status = 403;
                response.message = 'Device Already Expired Please Contact Your To Renew Your Device or Contact Chowis';
            } else if (!checkingDevice?.license_remaining_days) {
                response.status = 403;
                response.message = 'Device Is not connected to current consultant';
            } else {
                response.message = 'Sucess';
                response.data = checkingDevice;
            }

            return res.status(200).send(response);
        } catch (error) {
            response.status = error.response['statusCode'];
            response.message = error.response['message'];
            // response.error = error.response['error'];

            return res.status(response.status).send(error);
        }
    }
}
