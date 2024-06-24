import { BadRequestException, Injectable } from '@nestjs/common';
import { ExpirationCheckDto } from './chowis-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChowisServiceLicenseManagement } from '@/src/common/entities/crmEntities/ChowisServiceLicenseManagement.entity';
import { FindOptionsSelect, Repository } from 'typeorm';
import { CommonService } from '@/src/common/common.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { ConsultantsService } from '../consultants/consultants.service';

@Injectable()
export class ChowisServiceService {
    constructor(
        @InjectRepository(ChowisServiceLicenseManagement)
        private readonly ChowisServiceLicenseManagementRepository: Repository<ChowisServiceLicenseManagement>,

        private readonly commonService: CommonService,
        private consultantsService: ConsultantsService,
    ) {}

    async getOneLicense(conditions: any, selections?: any, includes?: string[]) {
        const license = await this.ChowisServiceLicenseManagementRepository.findOne({
            where: conditions,
            select: selections
                ? (selections as FindOptionsSelect<ChowisServiceLicenseManagement>)
                : ['id', 'consultant_company_id', 'service_id'],
            relations: includes ? includes : [],
        });

        return license;
    }

    async updateLicense(id: number, data: any) {
        const result = await this.ChowisServiceLicenseManagementRepository.update(id, data);
        return result;
    }

    async checkLicenseExpiration(data: ExpirationCheckDto) {
        const { consultant_company_id, service_id } = data;
        const license = await this.getOneLicense(
            { consultant_company_id: Number(consultant_company_id), service_id: Number(service_id) },
            [],
        );

        if (!license) {
            this.commonService.throwNotFoundError();
        }

        if (license.is_paid_subscribtion) {
            const today = new Date();
            const differenceDays = Math.floor(
                (today.getTime() - new Date(license.first_use_date).getTime()) / (1000 * 60 * 60 * 24),
            );

            if (license.license_period < differenceDays) {
                const daysRemaining = this.consultantsService.daysLeftFromExpired(
                    license.license_period,
                    license.first_use_date,
                );
                await this.updateLicense(license.id, {
                    days_remaining: daysRemaining,
                    days_remaining_updated_at: new Date(),
                });

                throw new BadRequestException({
                    result_code: ErrorStatus.PERMISSION_DENIED,
                    error: ResponseMessages.LicenseExpired,
                });
            }
        }

        const daysRemaining = this.consultantsService.daysLeftFromExpired(
            license.license_period,
            license.first_use_date,
        );

        await this.updateLicense(license.id, { days_remaining: daysRemaining, days_remaining_updated_at: new Date() });

        return { daysRemaining };
    }
}
