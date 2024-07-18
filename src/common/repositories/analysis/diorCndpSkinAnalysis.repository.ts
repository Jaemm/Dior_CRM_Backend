import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Analysis } from '../../entities/analysisEntities/Analysis.entity';

@Injectable()
export class DiorCndpSkinAnalysisRepository extends Repository<Analysis> {
    constructor(@Inject('diorCndpSkinDB') dataSource: DataSource) {
        super(Analysis, dataSource.createEntityManager());
    }
}
