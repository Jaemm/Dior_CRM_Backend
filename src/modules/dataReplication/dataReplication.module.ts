import { Module } from '@nestjs/common';
import { CrmDataReplicationModule } from './consultantDataReplication/consultantDataReplication.module';
import { AnalysisDataReplicationModule } from './analysisDataReplication/analysisDataReplication.module';
import { CustomerDataReplicationModule } from './customerDataReplication/customerDataReplication.module';

@Module({
    imports: [CrmDataReplicationModule, CustomerDataReplicationModule, AnalysisDataReplicationModule],
    providers: [],
    exports: [],
})
export class DataReplicationModule {}
