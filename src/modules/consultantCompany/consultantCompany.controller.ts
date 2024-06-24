import { Body, Controller } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConsultantCompanyService } from './consultantCompany.service';

import { ApiTags } from '@nestjs/swagger';
import { ConsultantDto } from '@/src/modules/consultants/consultants.dto';
// import { AuthService } from 'src/modules/signUpAuth/auth/auth.service';

@ApiTags('consultant_company')
@Controller('consultant_company')
export class ConsultantCompanyController {
    constructor(private readonly consultantCompany: ConsultantCompanyService) {}
    // @UseGuards(LocalAuthGuard)
    // @UseGuards(ThrottlerGuard)
}
