import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Analysis } from '../../entities/analysisEntities/Analysis.entity';

@Injectable()
export class AnalysisRepository extends Repository<Analysis> {
    constructor(@Inject('cndpSkinDB') dataSource: DataSource) {
        super(Analysis, dataSource.createEntityManager());
    }
}
