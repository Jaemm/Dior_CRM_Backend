import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, Repository } from 'typeorm';
import { Applications } from '@/src/common/entities/crmEntities/Applications.entity';
import { ApplicationsVersionCheckDto } from './applications.dto';
import { CommonService } from '@/src/common/common.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';

@Injectable()
export class ApplicationsService {
    constructor(
        @InjectRepository(Applications)
        private readonly ApplicationsRepository: Repository<Applications>,

        private readonly commonService: CommonService,
    ) {}

    async findOneApplication(id: number) {
        const application = await this.ApplicationsRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!application) {
            this.commonService.throwNotFoundError();
        }
        return application;
    }

    async findApplications(conditions?: any, selections?: string[], includes?: string[]) {
        const application = await this.ApplicationsRepository.find({
            where: conditions,
            select: selections ? (selections as FindOptionsSelect<Applications>) : [],
            relations: includes,
        });
        if (!application) {
            this.commonService.throwNotFoundError();
        }
        return application;
    }

    async applicationVersionCheck(appData: ApplicationsVersionCheckDto) {
        console.log();
        const { app_id, operating_system } = appData;

        const applications = await this.findApplications(
            {
                id: app_id,
            },
            ['id', 'old_ios_version', 'old_android_version', 'ios_version', 'android_version'],
        );

        const application = applications[0];

        if (!application) {
            this.commonService.throwNotFoundError();
        }

        if (operating_system === 'ios') {
            if (application.ios_version === null || application.ios_version === '') {
                throw new BadRequestException({
                    result_code: ErrorStatus.BAD_REQUEST,
                    error: ResponseMessages.VersionNotUpdated,
                });
            }

            //     if (application.ios_version <= application.old_ios_version) {
            //         throw new BadRequestException({
            //             result_code: ErrorStatus.BAD_REQUEST,
            //             error: ResponseMessages.VersionNotUpdated,
            //         });
            //     }
            // }

            // if (operating_system === 'aos') {
            //     if (application.android_version === null || application.old_android_version === '') {
            //         throw new BadRequestException({
            //             result_code: ErrorStatus.BAD_REQUEST,
            //             error: ResponseMessages.VersionNotUpdated,
            //         });
            //     }

            //     if (application.android_version <= application.old_android_version) {
            //         throw new BadRequestException({
            //             result_code: ErrorStatus.BAD_REQUEST,
            //             error: ResponseMessages.VersionNotUpdated,
            //         });
            //     }
        }

        return {
            message: 'Success!',
            app_id,
            app_version: operating_system === 'aos' ? application.android_version : application.ios_version,
            operating_system,
            // old_ios_version: application.old_ios_version,
            // old_android_version: application.old_android_version,
        };
    }
}
