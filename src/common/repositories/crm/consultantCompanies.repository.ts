import { Injectable } from '@nestjs/common';
import { DataSource, Repository, FindOptionsSelectByString } from 'typeorm';
import { ConsultantCompanies } from '@/src/common/entities/crmEntities';

@Injectable()
export class ConsultantCompaniesRepository extends Repository<ConsultantCompanies> {
    constructor(dataSource: DataSource) {
        super(ConsultantCompanies, dataSource.createEntityManager());
    }

    async getOneCompany(id: number): Promise<ConsultantCompanies | undefined> {
        const consultant: any = await this.findOne({
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
        const companies = await this.findOne({
            where: conditions ? conditions : {},
            select: selections ? (selections as FindOptionsSelectByString<ConsultantCompanies>) : [],
            relations: includes ? includes : [],
        });
        return companies;
    }

    async getCompanies(conditions?: any, selections?: string[], includes?: string[]) {
        const companies = await this.find({
            where: conditions ? conditions : {},
            select: selections ? (selections as FindOptionsSelectByString<ConsultantCompanies>) : [],
            relations: includes ? includes : [],
        });
        return companies;
    }
}
