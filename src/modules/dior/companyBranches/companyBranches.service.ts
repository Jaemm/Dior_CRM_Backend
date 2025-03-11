import { Request } from 'express';
import * as argon2 from 'argon2';
import * as csv from 'csv';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

import { In } from 'typeorm';

import {
    ConsultantBranchesRepository,
    ConsultantsRepository,
    PresignRepository,
    ProductsRepository,
} from '@/src/common/repositories/crm';
import { ConsultantBranchesForDiorT } from '@/src/common/types/entities';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
    CreateBranchesDto,
    ExportBranchesDto,
    ImportBranchesDto,
    PresignedUploadForBranchDto,
    SearchBranchesDto,
    UpdateBranchesDto,
} from './companyBranches.dto';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { CommonService } from '@/src/common/common.service';
import { ConsultantBranches } from '@/src/common/entities/crmEntities';
import { AwsS3Service } from '@/src/common/awsS3/awsS3.service';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { AnalysisDataReplicationService } from '../../dataReplication/analysisDataReplication/analysisDataReplication.service';
import * as moment from 'moment';

@Injectable()
export class DiorCompanyBranchesService {
    private readonly saltRounds = 10;
    constructor(
        private commonService: CommonService,
        private configService: ConfigService,
        private awsS3Service: AwsS3Service,
        private analysis: AnalysisDataReplicationService,
        //repos
        private readonly consultantRepository: ConsultantsRepository,
        private readonly consultantBranchesRepository: ConsultantBranchesRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly presignRepository: PresignRepository,
    ) {}

    async getCustomerRecentCustomer(branchId: number | string) {
        const numberId = Number(branchId);

        const consultants = await this.consultantBranchesRepository
            .createQueryBuilder('consultant_branches')
            .leftJoin('consultant_branches.consultants', 'consultants')
            .leftJoin('consultants.customers', 'customers')
            .where('consultant_branches.id = :branchId', { branchId: numberId })
            .select(['consultants.id AS c_id', 'customers.id AS customerId'])
            .getRawMany();

        const consultantIds = consultants.map((row) => ({
            consultantIds: row.c_id,
            customerIds: row.customerid,
        }));

        return this.analysis.getLastAnalysisDate(consultantIds);
    }

    public async createCondultantForPos(newUser: any) {
        const consultantData: any = newUser;
        consultantData['email_confirmed'] = true;

        const bm = await this.consultantRepository.findByEmail(newUser.email);
        if (bm) {
            await this.updateCondultantForPos(newUser);
        }

        console.log('newUser ====>', newUser);
        const consultant = await this.consultantRepository.createConsultantForPOS({
            name: newUser.name,
            consultant_company_id: 213,
            password_digest: await bcrypt.hash(newUser.password, 10),
            email: newUser.email,
            unconfirmed_email: newUser.email,
            app_id: 88,
            email_confirmed: true,
            rememberCreatedAt: new Date(),
            code: newUser.code,
            consultant_branch_id: newUser?.consultant_branch_id ?? String(newUser.id),
            country: newUser.country,
            updated_at: new Date(),
            created_at: new Date(),
        });

        return consultant;
    }

    public async deleteCondultantForPos(newUser: any) {
        const bm = await this.consultantRepository.findByEmail(newUser.email);

        await this.consultantRepository.deleteConsultant(newUser.email);

        return;
    }

    public async updateCondultantForPos(newUser: any) {
        const bm = await this.consultantRepository.findByEmail(newUser.email);

        delete newUser.consultantCompanyId;
        delete newUser.createdAt;
        delete newUser.updatedAt;

        delete newUser.countryId;

        console.log('newUser ====>', newUser);

        newUser.email = newUser?.email ? newUser.email : bm.email;
        newUser.name = newUser?.name ? newUser.name : bm.name;
        newUser.code = newUser?.code ? newUser.code : bm.code;
        newUser.country = newUser?.country ? newUser.country : bm.country;
        newUser.password_digest = await bcrypt.hash(newUser.password, 10);
        newUser.updated_at = new Date();
        newUser.consultant_branch_id = newUser.id;

        delete newUser.password;
        delete newUser.id;
        const updatedBM = await this.consultantRepository.updateConsultant(bm.id, newUser);

        return updatedBM;
    }

    async createBranch(req: Request, body: CreateBranchesDto) {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const { email, name, code, password, country } = body;

            if (!diorCompanyId) {
                throw new NotFoundException();
            }

            const newBranch = this.consultantBranchesRepository.create({
                consultantCompanyId: String(diorCompanyId),
                email,
                name,
                password,
                country,
                code,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const savedBranch = await this.consultantBranchesRepository.save(newBranch);

            const reformatBranch: ConsultantBranchesForDiorT = {
                id: Number(savedBranch.id),
                name: savedBranch.name,
                code: savedBranch.code,
                email: savedBranch.email,
                created_at: savedBranch.createdAt,
                country: savedBranch.country,
                password: savedBranch.password,
                total_devices: 0,
                last_consultation_date: null,
            };

            // cons
            body.consultant_branch_id = reformatBranch.id;
            if (reformatBranch) {
                this.createCondultantForPos(body);
            }

            return reformatBranch;
        } catch (e) {
            throw e;
        }
    }
    async formatBranchData(
        branch: ConsultantBranches,
        productsRepository: ProductsRepository,
    ): Promise<ConsultantBranchesForDiorT> {
        const [totalDevices, latestCustomer] = await Promise.all([
            productsRepository.getNewOpticNumbersCountByBranch(branch.id),
            this.getCustomerRecentCustomer(branch.id),
        ]);

        const consultantionDate = latestCustomer
            ? moment(latestCustomer).format('YYYY-MM-DD HH:mm:ss')
            : moment(branch.createdAt).format('YYYY-MM-DD HH:mm:ss');

        return {
            id: Number(branch.id),
            name: branch.name,
            code: branch.code,
            email: branch.email,
            created_at: branch.createdAt,
            country: branch.country,
            password: branch.password,
            total_devices: totalDevices,
            last_consultation_date: consultantionDate,
        };
    }

    async searchBranches(req: Request, query: SearchBranchesDto, locale = 'en') {
        try {
            const { filter_by: filterBy, search, country, page, per, is_bc } = query;

            const userId = (<{ id: string }>req.user).id;
            // const userId = 8131;
            const currentConsultant = await this.consultantRepository.findOneBy({ id: Number(userId) });

            if (!currentConsultant) {
                throw new NotFoundException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const consultantsPositionId = currentConsultant.consultant_position_id;

            const branchQuery = this.consultantBranchesRepository.createQueryBuilder('branch');

            if (consultantsPositionId === 5) {
                branchQuery.andWhere('branch.consultant_company_id = :companyId', {
                    companyId: currentConsultant.consultant_company_id,
                });
            } else if ([4, 6].includes(consultantsPositionId)) {
                if (currentConsultant.countries.length < 1) {
                    throw new BadRequestException({
                        result_code: ErrorStatus.BAD_REQUEST,
                        error: `Cannot found your countires data. Please contact Admin`,
                    });
                }

                branchQuery.andWhere('LOWER(branch.country) IN (:...countries)', {
                    countries: currentConsultant?.countries.map((c) => c.toLowerCase()) || [0],
                });
            } else {
                if (!currentConsultant.consultant_branch || !currentConsultant.consultant_branch.country) {
                    throw new BadRequestException({
                        result_code: ErrorStatus.BAD_REQUEST,
                        error: `Cannot found your coutry data. Please contact Admin`,
                    });
                }
                branchQuery.andWhere('LOWER(branch.country) = :country', {
                    country: currentConsultant.consultant_branch?.country.toLowerCase(),
                });
            }

            if (filterBy) {
                branchQuery.andWhere('LOWER(branch.country) = :filterBy', { filterBy: filterBy.toLowerCase() });
            }

            if (country) {
                branchQuery.andWhere('LOWER(branch.country) = :country', { country: country.toLowerCase() });
            }

            if (search) {
                const searchLower = `%${search.toLowerCase()}%`;
                branchQuery.andWhere(
                    '(branch.country ILIKE :search OR branch.code ILIKE :search OR branch.name ILIKE :search OR branch.email ILIKE :search)',
                    { search: searchLower },
                );
            }

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 25);

            const [branches, total] = await branchQuery
                .skip((searchPage - 1) * searchPer)
                .take(searchPer)
                .getManyAndCount();

            console.log(branches);

            const reformatBranches: Promise<ConsultantBranchesForDiorT>[] = is_bc
                ? []
                : branches.map((branch) => this.formatBranchData(branch, this.productsRepository));

            return {
                total_size: total,
                current_page_size: branches.length,
                current_page: searchPage,
                total_pages: Math.ceil(total / searchPer),
                data: is_bc ? branches : await Promise.all(reformatBranches),
            };
        } catch (e) {
            throw e;
        }
    }

    async updateBranch(branchId: string, body: UpdateBranchesDto, locale = 'en') {
        try {
            const { email, name, code, password, country } = body;

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const branch = await this.consultantBranchesRepository.findOne({
                where: {
                    id: branchId,
                    consultantCompanyId: String(diorCompanyId),
                },
            });

            if (!branch) {
                console.error(`Branch with ID ${branchId} not found.`);
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            // 업데이트할 값 설정 (새 값이 없으면 기존 값 유지)
            branch.email = email || branch.email;
            branch.name = name || branch.name;
            branch.code = code || branch.code;
            branch.country = country || branch.country;
            branch.password = password || branch.password;
            branch.updatedAt = new Date();

            // 브랜치 저장 (컨설턴트 여부와 상관없이 실행)
            const savedBranch = await this.consultantBranchesRepository.save(branch);
            console.log(`Branch ${savedBranch.id} updated successfully.`);

            // 컨설턴트 정보 확인 (있으면 업데이트, 없으면 건너뜀)
            const existingConsultant = await this.consultantRepository.findByEmail(savedBranch.email.toLowerCase());

            if (existingConsultant) {
                console.log(`Consultant ${existingConsultant.id} found. Updating consultant data...`);
                await this.updateCondultantForPos(savedBranch);
            } else {
                console.warn(`Consultant with email ${savedBranch.email} not found. Skipping POS update.`);
            }

            // 응답 데이터 재구성 (컨설턴트 없이도 브랜치 정보 반환)
            const reformatBranch: ConsultantBranchesForDiorT = {
                id: Number(savedBranch.id),
                name: savedBranch.name,
                code: savedBranch.code,
                email: savedBranch.email,
                created_at: savedBranch.createdAt,
                country: savedBranch.country,
                password: savedBranch.password,
                total_devices: 0,
                last_consultation_date: null,
            };

            return reformatBranch;
        } catch (e) {
            console.error('Exception in updateBranch:', e);
            throw e;
        }
    }

    async deleteBranch(branchId: string, locale = 'en') {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const branch = await this.consultantBranchesRepository.findOne({
                where: {
                    id: branchId,
                    consultantCompanyId: String(diorCompanyId),
                },
            });

            if (!branch) {
                throw new NotFoundException({
                    resule_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            await this.consultantBranchesRepository.remove(branch);

            return {
                message: 'Successfully deleted record',
            };
        } catch (e) {
            throw e;
        }
    }

    async deleteMultipleBranches(branchIds: string) {
        try {
            const splitIds = branchIds.split(',').map((id) => String(id));

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const branches = await this.consultantBranchesRepository.find({
                where: {
                    consultantCompanyId: String(diorCompanyId),
                    id: In(splitIds),
                },
            });

            await this.consultantBranchesRepository.remove(branches);

            return {
                message: 'Successfully deleted multiple record',
            };
        } catch (e) {
            throw e;
        }
    }

    async exportBranches(req: Request, query: ExportBranchesDto, locale: string = 'en') {
        try {
            const { filter_by, search } = query;
            const userId = (<{ id: string }>req.user).id;
            const currentConsultant = await this.consultantRepository.getConsultantById(userId, ['consultant_branch']);

            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            if (!currentConsultant) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: this.commonService.createLocaleErrorMessage(locale, 'unauthorized'),
                });
            }

            const branchQuery = await this.consultantBranchesRepository
                .createQueryBuilder('branches')
                .where('branches.consultantCompanyId = :companyId', {
                    companyId: diorCompanyId,
                });

            if (![5, 6].includes(currentConsultant.consultant_position_id)) {
                branchQuery.andWhere('LOWER (branches.country) = :country', {
                    country: currentConsultant?.consultant_branch?.country?.toLocaleLowerCase(),
                });
            }

            if (filter_by) {
                branchQuery.andWhere('LOWER (branches.country) = :filterBy', {
                    filterBy: filter_by.toLocaleLowerCase(),
                });
            }

            if (search) {
                branchQuery.andWhere(
                    '(branches.country LIKE :search OR branches.code LIKE :search OR branches.name LIKE :search OR branches.email LIKE :search)',
                    {
                        search: `%${search}%`,
                    },
                );
            }

            const branches = await branchQuery.getMany();

            return await this.writeCSVFileForExportByBranches(branches);
        } catch (e) {
            throw e;
        }
    }

    async importBranches(req: Request, body: ImportBranchesDto) {
        try {
            const diorCompanyId = await this.consultantRepository.getDiorConsultantCompanyId();

            const fileUrl = body.file_url;

            const splitToken = req.headers.authorization.split(' ');
            const accssToken = splitToken[1];

            const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, accssToken);

            const header = worksheet.getRow(1);

            const rowCount = worksheet.rowCount + 1;

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const emailText = (<{ text: string }>row.getCell(4).value).text;

                const email = emailText ? emailText : (row.getCell(4).value as string);

                const newBranch = await this.consultantBranchesRepository.create({
                    country: row.getCell(1).value as string,
                    code: row.getCell(2).value as string,
                    name: row.getCell(3).value as string,
                    email: email,
                    password: row.getCell(5).value as string,
                    consultantCompanyId: String(diorCompanyId),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                const registredPos = await this.consultantBranchesRepository.save(newBranch);
                if (registredPos) {
                    this.createCondultantForPos(registredPos);
                }
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    async presignUploadImportFileForBranch(req: Request, file: Express.Multer.File) {
        try {
            const userId = (<{ id: string }>req.user).id;
            const { originalname: fileName, mimetype, buffer } = file;

            // const result = await this.awsS3Service.getPresignUploadForDiorBranches(fileName);

            const prefix = `uploads/images/dior/import_company_branches`;

            const limit = 8 * 1024 * 1024;

            const hash = uuid();

            const fileExtension = path.extname(fileName);

            const keyForS3 = `${hash}${fileExtension}`;

            await this.awsS3Service.uploadFileToS3(buffer, keyForS3, prefix);

            const baseUrl = this.configService.get('URL') || 'http://localhost:3100';

            console.log('baseUrl', baseUrl);
            const downloadUrl = `${baseUrl}/api/dior/company_branches/files/${hash}`;

            await this.presignRepository.saveNewPresignEntity({
                hash: hash,
                fileName: fileName,
                fileExtension: fileExtension,
                downloadUrl: downloadUrl,
                mimeType: mimetype,
                prefix: prefix,
                consultantId: Number(userId),
            });

            return {
                url: downloadUrl,
            };
        } catch (e) {
            throw e;
        }
    }

    async getBranchesFileFromS3(hash: string) {
        try {
            const existFile = await this.presignRepository.findOne({
                where: {
                    key: hash,
                },
            });

            if (!existFile) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                });
            }

            const s3Key = `${existFile.prefix}/${hash}${existFile.fileExtension}`;

            const s3File = await this.awsS3Service.getImageCloudS3(s3Key);

            return {
                binary: s3File.Body,
                mimeType: existFile.mimeType,
                fileName: existFile.fileName,
            };
        } catch (e) {
            throw e;
        }
    }

    /** Utils */
    writeCSVFileForExportByBranches(branches: ConsultantBranches[]) {
        const header = ['POS Country', 'POS Code', 'POS Name', 'Email'];

        const records = branches.map((u) => [u.country, u.code, u.name, u.email]);

        return new Promise((resolve, reject) => {
            csv.stringify([header, ...records], (err, output) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(output);
            });
        });
    }
}
