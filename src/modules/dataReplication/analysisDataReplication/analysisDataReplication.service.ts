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

        let _countQuery = this.diorCndpSkinRepository
            .createQueryBuilder('analysis')
            .where("args->>'status' LIKE :status", {
                status: '%true%',
            });
        if (start_date && end_date) {
            _countQuery = _countQuery.andWhere('created_time BETWEEN :start AND :end', {
                start: start_date,
                end: end_date,
            });
        }

        const likeIds = _ids.map((id) => (String(id).startsWith('%') ? String(id) : `%${id}`));

        _countQuery.andWhere(
            "COALESCE(NULLIF(analysis.args->>'consultant_id', '')::NUMERIC, NULLIF(analysis.args->>'id', '')::NUMERIC)::TEXT LIKE ANY (ARRAY[:...ids])",
            { ids: likeIds },
        );
        const [count] = await Promise.all([_countQuery.getCount()]);

        return count;
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

    async getConsultations(startDate?: string, endDate?: string) {
        try {
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

            const [diorConsultations, globalConsultations] = await Promise.all([
                diorQueryPromise.getMany(),
                globalQueryPromise.getMany(),
            ]);

            const combinedConsultations = [...diorConsultations, ...globalConsultations];

            return combinedConsultations;
        } catch (e) {
            throw e;
        }
    }

    async getConsultantIds(startDate?: string, endDate?: string): Promise<any> {
        try {

            const coalesceCondition = `(
            CASE 
                WHEN analysis.args->>'consultant_id' IS NOT NULL AND analysis.args->>'consultant_id' != '' 
                THEN (analysis.args->>'consultant_id')::NUMERIC
                ELSE (analysis.args->>'id')::NUMERIC
            END
        ) AS "consultantId"`;

            const condition = `analysis.args->>'status' = 'true'`;

            const diorQueryBuilder = this.diorCndpSkinRepository
                .createQueryBuilder('analysis')
                .select(coalesceCondition)
                .where(condition);

            const diorResult = await diorQueryBuilder.getRawMany();

            const consultantIds = diorResult.map((item) => ({
                consultantId: Number(item.consultantId),
            }));

            return consultantIds;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

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
    analysisInsertion(data: any, appId: number) {
        const repository = this.DBRediction(appId).globalRepos;

        return repository.save(data);
    }

    insertMeasurement(measurementData: any, appId: number) {
        const repository = this.DBRediction(appId).globalAnalysisRepos;

        return repository.save(measurementData);
    }

    getBatchIdFromObject(obj: any) {
        if ('batchId' in obj) {
            return obj.batchId;
        }

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const property = obj[key];
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


    async getLastAnalysisDate(consultant: any) {
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

        const consultants = Array.from(new Set(consultant.map((item: any) => item.consultantIds)));
        const customerValues = consultant
            .filter((item: any) => item.consultantIds !== null)
            .map((item: any) => item.customerIds);

        const [firstDBResult, secondDBResult] = await Promise.all([
            this.globalcndpSkinRepository.query(firstDBQuery, [consultants, customerValues]),
            this.diorCndpSkinRepository.query(secondDBQuery, [consultants, customerValues]),
        ]);

        const firstDate = firstDBResult[0]?.created_time ? new Date(firstDBResult[0].created_time) : null;
        const secondDate = secondDBResult[0]?.created_time ? new Date(secondDBResult[0].created_time) : null;

        if (!firstDate && !secondDate) return null;
        if (!firstDate) return secondDate.toISOString();
        if (!secondDate) return firstDate.toISOString();
        return firstDate > secondDate ? firstDate.toISOString() : secondDate.toISOString();
    }
}
