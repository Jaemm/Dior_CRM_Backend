import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Analysis } from '@/src/common/entities/analysisEntities/Analysis.entity';
import { Measurements } from '@/src/common/entities/analysisEntities/Measurements.entity';

@Injectable()
export class AnalysisDataReplicationService {
    constructor(
        // Global
        // Analysis
        @InjectRepository(Analysis, 'cndpSkinDB')
        private readonly globalcndpSkinRepository: Repository<Analysis>,
        @InjectRepository(Measurements, 'cndpSkinDB')
        private readonly globalCndpAnalysisRepository: Repository<Measurements>,

        @InjectRepository(Analysis, 'diorCndpSkinDB')
        private readonly diorCndpSkinRepository: Repository<Analysis>,

        // Hair
        @InjectRepository(Analysis, 'cndpHairDB')
        private readonly globalCndpHairRepository: Repository<Analysis>,
        @InjectRepository(Measurements, 'cndpHairDB')
        private readonly globalCndpHairAnalysisRepository: Repository<Measurements>,

        // SKIN
        @InjectRepository(Analysis, 'ohioCndpSkinDB')
        private readonly ohioCndpRepository: Repository<Analysis>,
        @InjectRepository(Measurements, 'ohioCndpSkinDB')
        private readonly ohioCndpSkinAnalysisRepository: Repository<Measurements>,

        // Hair
        @InjectRepository(Analysis, 'ohioCndpHairDB')
        private readonly ohioCndpHairRepository: Repository<Analysis>,
        @InjectRepository(Measurements, 'ohioCndpHairDB')
        private readonly ohioCndpHairAnalysisRepository: Repository<Measurements>, // ohioCndpHairDB
    ) {}

    async getDiorAnalysisByCustomerIds(customerIds: string[]) {
        const rows = await this.diorCndpSkinRepository.find({
            where: {
                customerId: In(customerIds),
            },
        });

        return rows;
    }

    async getBatchId(customerId: string, appId: number) {
        const repository = this.DBRediction(appId).ohioRepos;
        const analyisData = repository.find({
            where: {
                customerId,
            },
            select: {
                customerId: false,
                args: {},
                createdTime: true,
                batchId: true,
            },
        });

        return analyisData;
    }

    async getMeasuremt(batchId: number, appId: number): Promise<Measurements[]> {
        const repository = this.DBRediction(appId).ohioAnalysisRepos;
        const result = await repository.find({
            where: {
                batchId,
            },

            relations: ['typeImage', 'typeMeasurement'],
        });
        return result;
    }

    analysisInsertion(data: any, appId: number) {
        const repository = this.DBRediction(appId).globalRepos;

        return repository.save(data);
    }

    insertMeasurement(measurementData: any, appId: number) {
        const repository = this.DBRediction(appId).globalAnalysisRepos;

        return repository.save(measurementData);
    }

    async AnalysisReplication(customerIdMapping: any, appId: number) {
        const importCustomerIds = Object.keys(customerIdMapping);
        for (const importCustomerId of importCustomerIds) {
            const oldBatches = await this.getBatchId(importCustomerId, appId);

            const newCustomerIds = {
                customerId: Number(customerIdMapping[importCustomerId]),
            };

            const newAnalysisBatches = await this.analysisInsertion(newCustomerIds, appId);

            // create new measurement
            for (var i = 0; i < oldBatches.length; i++) {
                const getOldMeasuremt = await this.getMeasuremt(Number(oldBatches[i].batchId), appId);
                const newBatchIdsInMeasurment = getOldMeasuremt.map((customer) => ({
                    ...customer,
                    batchId: this.getBatchIdFromObject(newAnalysisBatches),
                    id: undefined,
                }));
                this.insertMeasurement(newBatchIdsInMeasurment, appId);
            }
        }
        return;
    }

    getBatchIdFromObject(obj: any) {
        // Check if the direct property 'batchId' exists in the object
        if ('batchId' in obj) {
            return obj.batchId;
        }

        // Iterate over the properties of the object
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const property = obj[key];
                // Check if the property is an instance of Analysis
                if (property instanceof Analysis) {
                    return property.batchId;
                }
            }
        }
        return null;
    }

    DBRediction(appId: number) {
        let globalAnalysisRepos;
        let globalRepos;
        let ohioAnalysisRepos;
        let ohioRepos;

        if (appId === 44) {
            globalAnalysisRepos = this.globalCndpAnalysisRepository;
            globalRepos = this.globalcndpSkinRepository;
            ohioAnalysisRepos = this.ohioCndpSkinAnalysisRepository;
            ohioRepos = this.ohioCndpRepository;
        }
        if (appId === 53) {
            globalAnalysisRepos = this.globalCndpHairAnalysisRepository;
            globalRepos = this.globalCndpHairRepository;
            ohioAnalysisRepos = this.ohioCndpHairAnalysisRepository;
            ohioRepos = this.ohioCndpHairRepository;
        }

        return {
            globalAnalysisRepos,
            globalRepos,
            ohioAnalysisRepos,
            ohioRepos,
        };
    }
}
