import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelectByString, Repository } from 'typeorm';
import { ConsultantCompanies } from '@/src/common/entities/crmEntities/ConsultantCompanies.entity';
import { ActiveStorageAttachments } from '@/src/common/entities/crmEntities/ActiveStorageAttachments.entity';

@Injectable()
export class ConsultantCompanyService {
    constructor(
        @InjectRepository(ConsultantCompanies)
        private readonly companyRepository: Repository<ConsultantCompanies>,
        @InjectRepository(ActiveStorageAttachments)
        private readonly activeStorage: Repository<ActiveStorageAttachments>,
    ) {}

    async getCompaniesFiles(recordId: string) {
        const imageCustomization = await this.activeStorage.find({
            where: { recordId },
            select: {
                blob: {
                    metadata: true,
                    activeStorageAttachments: true,
                    checksum: true,
                    contentType: true,
                    key: true,
                    filename: true,
                },
                name: true,
                recordType: true,
            },
            relations: ['blob'],
        });
        return imageCustomization;
    }

    async getOneCompany(id: number): Promise<ConsultantCompanies | undefined> {
        const consultant: any = await this.companyRepository.findOne({
            where: { id },
            relations: ['applications'],
        });

        // if (consultant.consultantCustomzations && consultant.consultantCustomzations?.length > 0) {
        //     consultant.primary_color_code = consultant.consultantCustomzations[0]?.primary_color_code;
        //     consultant.secondary_color_code = consultant.consultantCustomzations[0]?.secondary_color_code;
        //     consultant.font = consultant.consultantCustomzations[0]?.fon;
        //     consultant.program_color_code = consultant.consultantCustomzations[0]?.program_color_code;
        //     consultant.top_color_code = consultant.consultantCustomzations[0]?.top_color_code;
        //     consultant.text_icon_color_code = consultant.consultantCustomzations[0]?.text_icon_color_code;
        //     consultant.pie_chart_color_1 = consultant.consultantCustomzations[0]?.pie_chart_color_1;
        //     consultant.pie_chart_color_2 = consultant.consultantCustomzations[0]?.pie_chart_color_2;
        //     consultant.pie_chart_color_3 = consultant.consultantCustomzations[0]?.pie_chart_color_3;
        //     consultant.pie_chart_color_4 = consultant.consultantCustomzations[0]?.pie_chart_color_4;
        //     consultant.pie_chart_color_5 = consultant.consultantCustomzations[0]?.pie_chart_color_5;
        //     consultant.pie_chart_points_color = consultant.consultantCustomzations[0]?.pie_chart_points_color;
        //     consultant.data_exchange_url = consultant.consultantCustomzations[0]?.data_exchange_url;
        //     consultant.font_color_1 = consultant.consultantCustomzations[0]?.font_color_1;
        //     consultant.font_color_2 = consultant.consultantCustomzations[0]?.font_color_2;
        //     consultant.pmx = consultant.consultantCustomzations[0]?.pmx;
        //     consultant.active = consultant.consultantCustomzations[0]?.active;
        //     consultant.chowis_logo = consultant.consultantCustomzations[0]?.chowis_logo;
        //     consultant.channel_io = consultant.consultantCustomzations[0]?.channel_io;
        //     consultant.medical_version = consultant.consultantCustomzations[0]?.medical_version;
        //     consultant.result_expiration_time = consultant.consultantCustomzations[0]?.result_expiration_time;
        //     consultant.image_upload = consultant.consultantCustomzations[0]?.image_upload;
        //     consultant.font = consultant.consultantCustomzations[0]?.font;
        //     delete consultant.consultantCustomzations;
        // }

        return consultant;
    }

    async getOneCompanyByFilters(conditions?: any, selections?: string[], includes?: string[]) {
        const companies = await this.companyRepository.findOne({
            where: conditions ? conditions : {},
            select: selections ? (selections as FindOptionsSelectByString<ConsultantCompanies>) : [],
            relations: includes ? includes : [],
        });
        return companies;
    }

    async getCompanies(conditions?: any, selections?: string[], includes?: string[]) {
        const companies = await this.companyRepository.find({
            where: conditions ? conditions : {},
            select: selections ? (selections as FindOptionsSelectByString<ConsultantCompanies>) : [],
            relations: includes ? includes : [],
        });
        return companies;
    }
}
