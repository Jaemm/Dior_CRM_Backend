import {
    Controller,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { ConsultantShopsService } from './consultantShops.service';

@ApiTags('consultant-shops')
@Controller('consultant-shops')
export class ConsultantShopsController {
    constructor(private readonly consultantShops: ConsultantShopsService) { }
}
