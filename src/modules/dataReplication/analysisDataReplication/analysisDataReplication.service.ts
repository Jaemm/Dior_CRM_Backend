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

    async statististic(_ids: any[], start_date: string, end_date: string) {
        const globalDateRange = {
            start: '2020-01-01 00:00:00',
            end: '2024-09-26 23:59:59',
        };
        const diorDateStart = '2024-09-27 00:00:00';

        // Count analyses where status is true
        let _countQuery = this.diorCndpSkinRepository
            .createQueryBuilder('analysis')
            .where("args->>'status' LIKE :status", {
                status: '%true%',
            });
        //  .andWhere('analysis.created_time > :start', { start: diorDateStart });

        let _countQueryGlobal = this.globalcndpSkinRepository
            .createQueryBuilder('analysis')
            .where("args->>'status' LIKE :status", {
                status: '%true%',
            })
            .andWhere('analysis.created_time BETWEEN :start AND :end', globalDateRange);
        // Apply date range filter if start_date and end_date are provided
        if (start_date && end_date) {
            _countQuery = _countQuery.andWhere('created_time BETWEEN :start AND :end', {
                start: start_date,
                end: end_date,
            });

            _countQueryGlobal = _countQueryGlobal.andWhere('created_time BETWEEN :start AND :end', {
                start: start_date,
                end: end_date,
            });
        }

        // Prepare the IDs for the SQL query
        const likeIds = _ids.map((id) => (String(id).startsWith('%') ? String(id) : `%${id}`));

        _countQuery.andWhere(
            "COALESCE(NULLIF(analysis.args->>'consultant_id', '')::NUMERIC, NULLIF(analysis.args->>'id', '')::NUMERIC)::TEXT LIKE ANY (ARRAY[:...ids])",
            { ids: likeIds },
        );

        _countQueryGlobal.andWhere(
            "COALESCE(NULLIF(analysis.args->>'consultant_id', '')::NUMERIC, NULLIF(analysis.args->>'id', '')::NUMERIC)::TEXT LIKE ANY (ARRAY[:...ids])",
            { ids: likeIds },
        );
        // // Execute queries in parallel
        const [count, count_] = await Promise.all([_countQuery.getCount(), _countQueryGlobal.getCount()]);

        return count + count_;
    }

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

    async getStatisticsConsultantions(startDate?: string, endDate?: string) {
        try {
            const consultationQuery = await this.diorCndpSkinRepository.createQueryBuilder('analysis');

            if (startDate && endDate) {
                consultationQuery.andWhere(`analysis.created_time BETWEEN '${startDate}' AND '${endDate}'`);
            }

            const consultations = await consultationQuery.getMany();

            return consultations;
        } catch (e) {
            throw e;
        }
    }

    //     To combine the results from both `diorCndpSkinRepository` and `globalcndpSkinRepository` based on the date criteria, you can modify your function like this:

    // ```typescript
    async getConsultations(startDate?: string, endDate?: string) {
        try {
            // const startDateTime = startDate ? `${startDate} 00:00:00` : undefined;
            // const endDateTime = endDate ? `${endDate} 23:59:59` : undefined;

            // Create query promises
            const diorQueryPromise = this.diorCndpSkinRepository
                .createQueryBuilder('analysis')
                .where("analysis.args->>'status' LIKE '%true'");

            if (startDate && endDate) {
                diorQueryPromise.andWhere(
                    `analysis.created_time BETWEEN ${startDate} 00:00:00 AND ${endDate} 23:59:59`,
                );
            }

            const globalQueryPromise = this.globalcndpSkinRepository
                .createQueryBuilder('analysis')
                .where("analysis.args->>'status' LIKE '%true'");

            if (startDate && endDate) {
                globalQueryPromise.andWhere(
                    `analysis.created_time BETWEEN ${startDate} 00:00:00 AND ${endDate} 23:59:59`,
                );
            }

            // Await both promises in parallel
            const [diorConsultations, globalConsultations] = await Promise.all([
                diorQueryPromise.getMany(), // or getRawMany() if raw results are needed
                globalQueryPromise.getMany(),
            ]);

            // Combine results
            const combinedConsultations = [...diorConsultations, ...globalConsultations];

            return combinedConsultations;
        } catch (e) {
            throw e;
        }
    }

    // async getConsultantions(startDate?: string, endDate?: string) {
    //     try {
    //         // combine two DB results for this API in a way date
    //         // diorCndpSkinRepository analysis.created_time BETWEEN '2020-01-01' AND 'Today'
    //         // globalcndpSkinRepository  analysis.created_time > '2024-02-'

    //         const consultationQuery = await this.diorCndpSkinRepository
    //             .createQueryBuilder('analysis')
    //             .where("analysis.args->>'status' LIKE '%true'");

    //         if (startDate && endDate) {
    //             consultationQuery.andWhere(
    //                 `analysis.created_time BETWEEN ${startDate} 00:00:00 AND ${endDate} 23:59:59`,
    //             );
    //         }

    //         const consultations = await consultationQuery.getMany();

    //         return consultations;
    //     } catch (e) {
    //         throw e;
    //     }
    // }

    // Update this this query to combine result from different DB globalcndpSkinRepository from 2020-01-01' AND '2024-09-26' and diorCndpSkinRepository >  '2024-09-26'
    // async getConsultantIds(startDate?: string, endDate?: string): Promise<any> {
    //     try {
    //         //
    //         const consultantQuery = await this.diorCndpSkinRepository
    //             .createQueryBuilder('analysis')
    //             .select("analysis.args-> 'consultant_id' ", 'consultantId')
    //             .where("analysis.args->>'status' LIKE '%true'");

    //         if (startDate && endDate) {
    //             consultantQuery.andWhere(`analysis.created_time BETWEEN ${startDate} 00:00:00 AND ${endDate} 23:59:59`);
    //         }

    //         const consultants = await consultantQuery.getRawMany();

    //         console.log(consultants);
    //         return consultants;
    //     } catch (e) {
    //         throw e;
    //     }
    // }

    async getConsultantIds(startDate?: string, endDate?: string): Promise<any> {
        try {
            // Define COALESCE condition
            const coalesceCondition = `
            COALESCE(
                NULLIF(analysis.args->>'consultant_id', '')::NUMERIC,
                NULLIF(analysis.args->>'id', '')::NUMERIC
            ) AS "consultantId"
        `;

            // Define the CASE condition
            const condition = `analysis.args->>'status' LIKE :status`;

            // Define date ranges
            const globalDateRange = {
                start: '2020-01-01 00:00:00',
                end: '2024-09-26 23:59:59',
            };
            const diorDateStart = '2024-09-27 00:00:00';

            // Global Consultant Query
            const globalQueryBuilder = this.globalcndpSkinRepository
                .createQueryBuilder('analysis')
                .select(coalesceCondition)
                .where(condition, { status: '%true%' })
                .andWhere('analysis.created_time BETWEEN :start AND :end', globalDateRange);

            // Dior Consultant Query
            const diorQueryBuilder = this.diorCndpSkinRepository
                .createQueryBuilder('analysis')
                .select(coalesceCondition)
                .where(condition, { status: '%true%' })
                .andWhere('analysis.created_time > :start', { start: diorDateStart });

            // Execute queries in parallel
            const [globalResult, diorResult] = await Promise.all([
                globalQueryBuilder.getRawMany(),
                diorQueryBuilder.getRawMany(),
            ]);

            // globalResult.push(...diorResult);
            const cosnsultant = globalResult.map((item) => ({
                consultantId: Number(item.consultantId),
            }));

            // console.log(cosnsultant);
            // Combine results
            return cosnsultant;
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

            const countQueryGlobal = this.globalcndpSkinRepository
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

            return (await countQuery.getCount()) + (await countQueryGlobal.getCount());
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

    // New queries

    async getLastAnalysisDate(consultant: any) {
        // Define the query conditions based on customer_id and consultant_id
        const coalesceCondition = `COALESCE(
            NULLIF(analysis.args->>'consultant_id', '')::NUMERIC, 
            NULLIF(analysis.args->>'id', '')::NUMERIC
        )`;
        const condition = `
            CASE
                WHEN analysis.customer_id != 0 THEN analysis.customer_id = ANY($2)
                ELSE ${coalesceCondition} = ANY($1)
            END
        `;

        // Define raw queries for both databases
        const firstDBQuery = `
            SELECT analysis.created_time
            FROM analysis
            WHERE ${condition}
            AND analysis.created_time BETWEEN '2020-01-01' AND '2024-09-26'
            ORDER BY analysis.created_time DESC
            LIMIT 1
        `;

        const secondDBQuery = `
            SELECT analysis.created_time
            FROM analysis
            WHERE ${condition}
            AND analysis.created_time > '2024-09-27'
            ORDER BY analysis.created_time DESC
            LIMIT 1
        `;

        // Extract unique consultantIds and customerIds
        const consultants = Array.from(new Set(consultant.map((item: any) => item.consultantIds)));
        const customerValues = consultant
            .filter((item: any) => item.consultantIds !== null)
            .map((item: any) => item.customerIds);

        // Run both queries in parallel with the consultants and customerIds as parameters
        const [firstDBResult, secondDBResult] = await Promise.all([
            this.globalcndpSkinRepository.query(firstDBQuery, [consultants, customerValues]),
            this.diorCndpSkinRepository.query(secondDBQuery, [consultants, customerValues]),
        ]);

        // Extract the created_time from both results and convert to Date
        const firstDate = firstDBResult[0]?.created_time ? new Date(firstDBResult[0].created_time) : null;
        const secondDate = secondDBResult[0]?.created_time ? new Date(secondDBResult[0].created_time) : null;

        // Return the latest created_time or null if both are missing
        if (!firstDate && !secondDate) return null;
        if (!firstDate) return secondDate.toISOString();
        if (!secondDate) return firstDate.toISOString();
        return firstDate > secondDate ? firstDate.toISOString() : secondDate.toISOString();
    }
}
