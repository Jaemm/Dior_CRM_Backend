import {
    Controller,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { ConsultantBranchesService } from './consultantBranches.service';

@ApiTags('consultantBranches')
@Controller('consultantBranches')
export class ConsultantBranchesController {
    constructor(private readonly consultantBranchesService: ConsultantBranchesService) { }
}
