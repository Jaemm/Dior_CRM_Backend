import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConsultantsRepository } from '@/src/common/repositories/crm';
import { ConsultantT } from '@/src/common/types/entities';
import { ConsultantForDiorT } from '@/src/common/types/entities/consultants.type';

@Injectable()
export class PartnerDbService {
    constructor(private readonly consultantRepository: ConsultantsRepository) {}

    async getConsultantById(consultantId: string) {
        try {
            const consultant = await this.consultantRepository.findOne({
                where: {
                    id: Number(consultantId),
                },
                relations: [
                    'products',
                    'products.device',
                    'consultant_licenses',
                    'consultant_licenses.licenses',
                    'consultant_company',
                    'consultant_branch',
                    'country_details',
                    'consultant_store',
                    'consultant_shop',
                    'consultant_position',
                ],
            });

            const reformatConsultant = {
                id: consultant.id,
                email: consultant.email,
                name: consultant.name,
                surname: consultant.surname,
                gender: consultant.gender,
                os: consultant.os,
                language: consultant.language,
                phone: consultant.phone,
                address: consultant.address,
                city: consultant.city,
                country: consultant.country,
                zip_code: consultant.zip_code,
                state: consultant.state,
                birthdate: consultant.birthdate,
                note: consultant.note,
                push_token: consultant.push_token,
                social: consultant.social,
                memo: consultant.memo,
                app_id: consultant.app_id,
                company_name: consultant.company_name,
                company_address: consultant.company_address,
                branch: consultant.branch,
                position: consultant.position,
                skin_color_group_id: consultant.skin_color_group_id,
                ethnicity_id: consultant.ethnicity_id,
                callback_url: consultant.callback_url,
                code: consultant.code,
                country_code: consultant.getContryCode,
                store: consultant.getStoreName,
                optic_number: consultant.getOpticNumbers,
                password_update_needed: consultant.password_update_needed,
                licenses: consultant.consultant_licenses
                    ? consultant.consultant_licenses.map((license) => {
                          return {
                              id: license.id,
                              name: license.licenses?.name,
                          };
                      })
                    : [],
                products: consultant.products
                    ? consultant.products.map((product) => {
                          return {
                              id: product.id,
                              first_use_date: product.first_use_date,
                              use_date: product.use_date,
                              use_time: product.use_time,
                              mac_address: product.mac_address,
                              app_use_yn: product.app_use_yn,
                              license_period: product.license_period,
                              created_at: product.created_at,
                              is_expired: product.getIsExpired,
                              device: product.device,
                              license: product.license,
                              application: product.application,
                          };
                      })
                    : [],
                consultant_company: consultant.consultant_company
                    ? {
                          id: consultant.consultant_company.id,
                          name: consultant.consultant_company.name,
                          created_at: consultant.consultant_company.created_at,
                          updated_at: consultant.consultant_company.updated_at,
                          address: consultant.consultant_company.address,
                          email: consultant.consultant_company.email,
                          phone: consultant.consultant_company.phone,
                          registeration_date: consultant.consultant_company.registeration_date,
                          primary_color_code: consultant.consultant_company.primary_color_code,
                          secondary_color_code: consultant.consultant_company.secondary_color_code,
                          font: consultant.consultant_company.font,
                          program_color_code: consultant.consultant_company.program_color_code,
                          top_color_code: consultant.consultant_company.top_color_code,
                          text_icon_color_code: consultant.consultant_company.text_icon_color_code,
                          pie_chart_color_1: consultant.consultant_company.pie_chart_color_1,
                          pie_chart_color_2: consultant.consultant_company.pie_chart_color_2,
                          pie_chart_color_3: consultant.consultant_company.pie_chart_color_3,
                          pie_chart_color_4: consultant.consultant_company.pie_chart_color_4,
                          pie_chart_color_5: consultant.consultant_company.pie_chart_color_5,
                          pie_chart_points_color: consultant.consultant_company.pie_chart_points_color,
                          active: consultant.consultant_company.active,
                          font_color_1: consultant.consultant_company.font_color_1,
                          font_color_2: consultant.consultant_company.font_color_2,
                          data_exchange_url: consultant.consultant_company.data_exchange_url,
                          pmx: consultant.consultant_company.pmx,
                      }
                    : {},
                consultant_branch: consultant.consultant_branch
                    ? {
                          id: Number(consultant.consultant_branch.id),
                          consultant_company_id: Number(consultant.consultant_branch.consultantCompanyId),
                          name: consultant.consultant_branch.name,
                          created_at: consultant.consultant_branch.createdAt,
                          updated_at: consultant.consultant_branch.updatedAt,
                          code: consultant.consultant_branch.code,
                          email: consultant.consultant_branch.email,
                          password: consultant.consultant_branch.password,
                          country: consultant.consultant_branch.country,
                          consultant_country_id: consultant.consultant_branch.countryId,
                      }
                    : {},
                consultant_country: consultant.country_details
                    ? {
                          id: consultant.country_details.id,
                          consultant_branch_id: consultant.country_details.consultantBranchId,
                          name: consultant.country_details.name,
                          code: consultant.country_details.code,
                          created_at: consultant.country_details.createdAt,
                          updated_at: consultant.country_details.updatedAt,
                          consultant_company_id: consultant.country_details.consultantCompanyId,
                          url_and_port: consultant.country_details.urlAndPort,
                          default_recommendation: consultant.country_details.defaultRecommendation,
                      }
                    : {},
                consultant_store: consultant.consultant_store
                    ? {
                          id: Number(consultant.consultant_store.id),
                          consultant_country_id: Number(consultant.consultant_store.consultantCountryId),
                          name: consultant.consultant_store.name,
                          created_at: consultant.consultant_store.createdAt,
                          updated_at: consultant.consultant_store.updatedAt,
                      }
                    : {},
                consultant_shop: consultant.consultant_shop
                    ? {
                          id: consultant.consultant_shop.id,
                          name: consultant.consultant_shop.name,
                          created_at: consultant.consultant_shop.createdAt,
                          updated_at: consultant.consultant_shop.updatedAt,
                      }
                    : {},
                consultant_position: consultant.consultant_position
                    ? {
                          id: consultant.consultant_position.id,
                          name: consultant.consultant_position.name,
                          created_at: consultant.consultant_position.created_at,
                          updated_at: consultant.consultant_position.updated_at,
                      }
                    : {},
            };

            return reformatConsultant;
        } catch (e) {
            throw e;
        }
    }
}
