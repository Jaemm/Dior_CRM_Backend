import * as moment from 'moment';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Analysis } from '@/src/common/entities/analysisEntities/Analysis.entity';
import { Measurements } from '@/src/common/entities/analysisEntities/Measurements.entity';
import { Consultants, Customers } from '@/src/common/entities/crmEntities';
import { count } from 'console';

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
    ) {}

    async getDiorAnalysisByCustomerIds(customerIds: string[]) {
        const rows = await this.diorCndpSkinRepository.find({
            where: {
                customerId: In(customerIds),
            },
        });

        return rows;
    }

    async getConsultationsInfoForDior(customerIds: number[]) {
        const [diorCustomers, totalCount] = await this.diorCndpSkinRepository.findAndCount({
            where: {
                customerId: In(customerIds),
            },
            order: {
                createdTime: 'DESC',
            },
        });

        let lastConsultationTime = null;

        if (diorCustomers && diorCustomers.length > 0) {
            lastConsultationTime = diorCustomers[0].createdTime;
            lastConsultationTime = lastConsultationTime ? lastConsultationTime.toISOString() : null;
        }
        return {
            count: totalCount,
            lastConsultationTime: lastConsultationTime,
        };
    }

    async getConsultationByConsultant(consultants: Consultants[], startDate?: string, endDate?: string) {
        try {
            const consultantIds = consultants.map((s) =>
                s.id.toString().startsWith('%') ? s.id.toString() : `%${s.id.toString()}`,
            );

            const consultationQuery = await this.diorCndpSkinRepository
                .createQueryBuilder('analysis')
                .where("analysis.args->>'status' LIKE :status", { status: '%true%' })
                .andWhere(
                    new Brackets((qb) => {
                        consultantIds.forEach((id, index) => {
                            qb.orWhere(`analysis.args->>'consultant_id' LIKE :id${index}`, { [`id${index}`]: id });
                        });
                    }),
                );

            if (startDate && endDate) {
                consultationQuery.andWhere(
                    `analysis.created_time BETWEEN ${startDate} 00:00:00 AND ${endDate} 23:59:59`,
                );
            }

            const consultations = await consultationQuery.getMany();

            return consultations;
        } catch (e) {
            throw e;
        }
    }

    async getConsultantions(startDate?: string, endDate?: string) {
        try {
            const consultationQuery = await this.diorCndpSkinRepository
                .createQueryBuilder('analysis')
                .where("analysis.args->>'status' LIKE '%true'");

            if (startDate && endDate) {
                consultationQuery.andWhere(
                    `analysis.created_time BETWEEN ${startDate} 00:00:00 AND ${endDate} 23:59:59`,
                );
            }

            const consultations = await consultationQuery.getMany();

            return consultations;
        } catch (e) {
            throw e;
        }
    }

    async getConsultantIds(startDate?: string, endDate?: string): Promise<any> {
        try {
            const consultantQuery = await this.diorCndpSkinRepository
                .createQueryBuilder('analysis')
                .select("analysis.args-> 'consultant_id' ", 'consultantId')
                .where("analysis.args->>'status' LIKE '%true'");

            if (startDate && endDate) {
                consultantQuery.andWhere(`analysis.created_time BETWEEN ${startDate} 00:00:00 AND ${endDate} 23:59:59`);
            }

            const consultants = await consultantQuery.getRawMany();

            return consultants;
        } catch (e) {
            throw e;
        }
    }

    ///////

    async getConsultantCountsForStatDetails(consultantIds?: string[], startDate?: string, endDate?: string) {
        try {
            const countQuery = this.diorCndpSkinRepository
                .createQueryBuilder('analysis')
                .select('COUNT(batch_id)', 'cnt')
                .where("(analysis.args->>'status' LIKE '%true')");

            if (startDate && endDate) {
                countQuery.andWhere(`(analysis.create_time BETWEEN ${startDate} 00:00:00 AND ${endDate} 23:59:59)`);
            }

            if (consultantIds && consultantIds.length > 0) {
                for (let i = 0; i < consultantIds.length; i++) {
                    const consultantId = consultantIds[i];
                    countQuery.andWhere(`(analysis.args->>'consultant_id' LIKE '${consultantId}')`);
                }
            }

            return await countQuery.getCount();
        } catch (e) {
            throw e;
        }
    }

    async getConsultationCountByCustomerId(customers: Customers[]) {
        try {
            const consultationCount = await this.diorCndpSkinRepository.count({
                where: {
                    customerId: In(customers.map((c) => c.id)),
                },
            });

            return consultationCount;
        } catch (e) {
            throw e;
        }
    }

    async getConsultantForInfographStatDetails(startDate?: string, endDate?: string) {
        let consultationQuery = `SELECT DATE(analysis.createdAt) AS day, args->>'consultant_id' AS consultant_id 
                               FROM analysis 
                               WHERE (args->>'status' like '%true')`;

        if (startDate && endDate) {
            consultationQuery += ` AND analysis.createdAt BETWEEN '${startDate}' AND '${endDate}'`;
        } else {
            consultationQuery += ` AND analysis.createdAt BETWEEN '${moment()
                .subtract(6, 'months')
                .format('YYYY-MM-DD')}' AND '${moment().format('YYYY-MM-DD')}'`;
        }

        consultationQuery += ` GROUP BY day, consultant_id 
                             ORDER BY day`;

        return await this.diorCndpSkinRepository.query(consultationQuery);
    }

    async getConsultationForStatDetailsCountryWise(consultantIds: Consultants[], startDate: string, endDate: string) {
        const consultantIdArray = consultantIds.map((row) =>
            row.id.toString().startsWith('%') ? row.id.toString() : '%' + row.id.toString(),
        );

        let consultationConditions = `args->>'status' LIKE '%true' AND (args->>'consultant_id') LIKE ANY (array[${consultantIdArray
            .map((id) => `'${id}'`)
            .join(',')}])`;

        if (startDate && endDate) {
            consultationConditions += ` AND created_at BETWEEN '${startDate}' AND '${endDate}'`;
        }

        return await this.diorCndpSkinRepository
            .createQueryBuilder('analysis')
            .select(["args->>'consultant_id' AS consultant_id", 'COUNT(*) AS total_count'])
            .where(consultationConditions)
            .groupBy("args->>'consultant_id'")
            .getRawMany();
    }

    // async getBatchId(customerId: string, appId: number) {
    //     const repository = this.DBRediction(appId).ohioRepos;
    //     const analyisData = repository.find({
    //         where: {
    //             customerId,
    //         },
    //         select: {
    //             customerId: false,
    //             args: {},
    //             createdTime: true,
    //             batchId: true,
    //         },
    //     });

    //     return analyisData;
    // }

    // async getMeasuremt(batchId: number, appId: number): Promise<Measurements[]> {
    //     const repository = this.DBRediction(appId).ohioAnalysisRepos;
    //     const result = await repository.find({
    //         where: {
    //             batchId,
    //         },

    //         relations: ['typeImage', 'typeMeasurement'],
    //     });
    //     return result;
    // }

    analysisInsertion(data: any, appId: number) {
        const repository = this.DBRediction(appId).globalRepos;

        return repository.save(data);
    }

    insertMeasurement(measurementData: any, appId: number) {
        const repository = this.DBRediction(appId).globalAnalysisRepos;

        return repository.save(measurementData);
    }

    // async AnalysisReplication(customerIdMapping: any, appId: number) {
    //     const importCustomerIds = Object.keys(customerIdMapping);
    //     for (const importCustomerId of importCustomerIds) {
    //         const oldBatches = await this.getBatchId(importCustomerId, appId);

    //         const newCustomerIds = {
    //             customerId: Number(customerIdMapping[importCustomerId]),
    //         };

    //         const newAnalysisBatches = await this.analysisInsertion(newCustomerIds, appId);

    //         // create new measurement
    //         for (var i = 0; i < oldBatches.length; i++) {
    //             const getOldMeasuremt = await this.getMeasuremt(Number(oldBatches[i].batchId), appId);
    //             const newBatchIdsInMeasurment = getOldMeasuremt.map((customer) => ({
    //                 ...customer,
    //                 batchId: this.getBatchIdFromObject(newAnalysisBatches),
    //                 id: undefined,
    //             }));
    //             this.insertMeasurement(newBatchIdsInMeasurment, appId);
    //         }
    //     }
    //     return;
    // }

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

        if (appId === 88) {
            globalAnalysisRepos = this.globalCndpAnalysisRepository;
            globalRepos = this.globalcndpSkinRepository;
        }

        return {
            globalAnalysisRepos,
            globalRepos,
            ohioAnalysisRepos,
            ohioRepos,
        };
    }
}
