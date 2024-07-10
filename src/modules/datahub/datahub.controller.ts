import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DataHubService } from './datahub.service';

@ApiTags('Data Hub')
@Controller('datahub')
export class DataHubController {
    constructor(private dataHubService: DataHubService) {}
}
