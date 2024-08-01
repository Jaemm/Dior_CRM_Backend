import { Module } from '@nestjs/common';

import { AnalysisDataReplicationModule } from './analysisDataReplication/analysisDataReplication.module';

@Module({
    imports: [AnalysisDataReplicationModule],
    providers: [],
    exports: [],
})
export class DataReplicationModule {}
