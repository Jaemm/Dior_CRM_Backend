import {
    Controller,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { LicenceService } from './licence.service';

@ApiTags('licence')
@Controller('licence')
export class LicenceController {
    constructor(private readonly licenceService: LicenceService) { }
}
