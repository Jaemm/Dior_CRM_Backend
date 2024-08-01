import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisDataReplicationService } from './analysisDataReplication.service';
import { CommonModule } from '@/src/common/common.module';
import { Analysis } from '@/src/common/entities/analysisEntities/Analysis.entity';
import { Measurements } from '@/src/common/entities/analysisEntities/Measurements.entity';
import { TypeImages } from '@/src/common/entities/analysisEntities/TypeImages.entity';
import { TypeMeasurements } from '@/src/common/entities/analysisEntities/TypeMeasurements.entity';

@Module({
    imports: [
        // PassportModule.register({ defaultStrategy: 'jwt' }),
        // JwtModule.register({ secret: process.env.JWT_REFRESH_TOKEN_SECRET, signOptions: { expiresIn: '1d' } }),

        TypeOrmModule.forFeature([Analysis, Measurements, TypeImages, TypeMeasurements], 'cndpSkinDB'),

        TypeOrmModule.forFeature([Analysis, Measurements, TypeImages, TypeMeasurements], 'diorCndpSkinDB'),

        CommonModule,
    ],
    providers: [AnalysisDataReplicationService],
    exports: [AnalysisDataReplicationService],
})
export class AnalysisDataReplicationModule {}
