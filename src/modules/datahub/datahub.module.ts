import { Module } from '@nestjs/common';
import { DataHubService } from './datahub.service';

@Module({
    controllers: [],
    providers: [DataHubService],
})
export class DataHubModule {}
