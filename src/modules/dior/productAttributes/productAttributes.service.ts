import { Injectable, NotFoundException } from '@nestjs/common';
import * as csv from 'csv';
import { Request } from 'express';

import { In } from 'typeorm';
import {
    CreateProductAttributeDto,
    ExportProductAttributeDataDto,
    GetProductAttributesDto,
    ImportProductAttributeDataDto,
    ImportProductAttributeTranslationsDataDto,
    UpdateProductAttributeDto,
} from './productAttributes.dto';
import {
    ConsultantsRepository,
    ProductAttributeTranslationsRepository,
    ProductAttributesRepository,
} from '@/src/common/repositories/crm';
import { ProductAttributesForDiorT } from '@/src/common/types/entities/product_attributes.type';

import { ProductAttributeTranslationsForDiorT } from '@/src/common/types/entities';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { CommonService } from '@/src/common/common.service';
import { ProductAttributes } from '@/src/common/entities/crmEntities';

@Injectable()
export class DiorProductAttributesService {
    constructor(
        private readonly commonService: CommonService,

        // Repos
        private readonly consultantsRepository: ConsultantsRepository,
        private readonly productAttributesRepository: ProductAttributesRepository,
        private readonly productAttributeTranslationsRepository: ProductAttributeTranslationsRepository,
    ) {}

    async createProductAttributes(body: CreateProductAttributeDto) {
        try {
            const { typ, value, product_translations } = body;

            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const newProductAttribute = this.productAttributesRepository.create({
                typ: typ,
                value: value,
                consultantCompanyId: diorCompanyId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const savedProductAttribute = await this.productAttributesRepository.save(newProductAttribute);

            if (product_translations && product_translations.length > 0) {
                const promiseSaveTranslationList = product_translations.map(async (translation) => {
                    const newProductAttributeTranslations = this.productAttributeTranslationsRepository.create({
                        productAttributeId: Number(savedProductAttribute.id),
                        fieldName: translation.field_name,
                        language: translation.language,
                        value: translation.value,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });

                    return await this.productAttributeTranslationsRepository.save(newProductAttributeTranslations);
                });

                const translationList = await Promise.all(promiseSaveTranslationList);
                savedProductAttribute.productAttributeTranslations = translationList;
            }

            const reformatProductAttribute: ProductAttributesForDiorT = {
                id: Number(savedProductAttribute.id),
                typ: savedProductAttribute.typ,
                value: savedProductAttribute.value,
                product_attribute_translations: savedProductAttribute?.productAttributeTranslations
                    ? savedProductAttribute.productAttributeTranslations.map((translation) => {
                          return {
                              id: Number(translation.id),
                              field_name: translation.fieldName,
                              language: translation.language,
                              value: translation.value,
                          };
                      })
                    : [],
            };

            return reformatProductAttribute;
        } catch (e) {
            throw e;
        }
    }

    async updateProductAttribute(attributeId: string, body: UpdateProductAttributeDto, locale = 'en') {
        try {
            const { typ, value, product_translations } = body;
            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const attribute = await this.productAttributesRepository.findOne({
                where: {
                    id: attributeId,
                    consultantCompanyId: diorCompanyId,
                },
                relations: ['productAttributeTranslations'],
            });

            if (!attribute) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            attribute.typ = typ ? typ : attribute.typ;
            attribute.value = value ? value : attribute.value;
            attribute.updatedAt = new Date();

            const savedProductAttribute = await this.productAttributesRepository.save(attribute);
            savedProductAttribute.productAttributeTranslations = attribute.productAttributeTranslations;

            if (product_translations) {
                if (attribute.productAttributeTranslations && attribute.productAttributeTranslations.length > 0) {
                    const translationIds = attribute.productAttributeTranslations;

                    await this.productAttributeTranslationsRepository.remove(translationIds);
                }

                const promiseSaveTranslationList = product_translations.map(async (translation) => {
                    const newProductAttributeTranslations = this.productAttributeTranslationsRepository.create({
                        productAttributeId: Number(savedProductAttribute.id),
                        fieldName: translation.field_name,
                        language: translation.language,
                        value: translation.value,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });

                    return await this.productAttributeTranslationsRepository.save(newProductAttributeTranslations);
                });

                const translationList = await Promise.all(promiseSaveTranslationList);
                savedProductAttribute.productAttributeTranslations = translationList;
            }

            const reformatProductAttribute: ProductAttributesForDiorT = {
                id: Number(savedProductAttribute.id),
                typ: savedProductAttribute.typ,
                value: savedProductAttribute.value,
                product_attribute_translations: savedProductAttribute?.productAttributeTranslations
                    ? savedProductAttribute.productAttributeTranslations.map((translation) => {
                          return {
                              id: Number(translation.id),
                              field_name: translation.fieldName,
                              language: translation.language,
                              value: translation.value,
                          };
                      })
                    : [],
            };

            return reformatProductAttribute;
        } catch (e) {
            throw e;
        }
    }

    async getProductAttributes(query: GetProductAttributesDto) {
        try {
            const { search, page, per } = query;
            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const attributesQuery = this.productAttributesRepository
                .createQueryBuilder('productAttributes')
                .leftJoinAndSelect('productAttributes.productAttributeTranslations', 'productAttributeTranslations')
                .where('productAttributes.consultantCompanyId = :diorCompanyId', {
                    diorCompanyId,
                });

            if (search) {
                attributesQuery.andWhere('productAttributes.value LIKE :search OR productAttributes.typ LIKE :search', {
                    search: `%${search}%`,
                });
            }

            const searchPage = Number(page || 1);
            const searchPer = Number(per || 25);

            const [productAttributes, totalCount] = await attributesQuery
                .skip((searchPage - 1) * searchPer)
                .take(searchPer)
                .getManyAndCount();

            const reformatProductAttributeList: ProductAttributesForDiorT[] = productAttributes.map((attributes) => {
                let translations: ProductAttributeTranslationsForDiorT[] = [];

                if (attributes.productAttributeTranslations && attributes.productAttributeTranslations.length > 0) {
                    translations = attributes.productAttributeTranslations.map((translation) => {
                        return {
                            id: Number(translation.id),
                            field_name: translation.fieldName,
                            language: translation.language,
                            value: translation.value,
                        };
                    });
                }

                return {
                    id: Number(attributes.id),
                    typ: attributes.typ,
                    value: attributes.value,
                    product_attribute_translations: translations,
                };
            });

            return {
                data: reformatProductAttributeList,
                total_size: totalCount,
                current_page_size: reformatProductAttributeList.length,
                current_page: searchPage,
                total_pages: Math.ceil(totalCount / searchPer),
            };
        } catch (e) {
            throw e;
        }
    }

    async deletePrdouctAttribute(attributeId: string, locale = 'en') {
        try {
            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const productAttributes = await this.productAttributesRepository.findOne({
                where: {
                    consultantCompanyId: diorCompanyId,
                    id: attributeId,
                },
            });

            if (!productAttributes) {
                throw new NotFoundException({
                    result_code: ErrorStatus.RECORD_NOT_FOUND,
                    error: this.commonService.createLocaleErrorMessage(locale, 'record_not_found'),
                });
            }

            await this.productAttributesRepository.remove(productAttributes);

            return {
                message: 'Delete product attribute successful',
            };
        } catch (e) {
            throw e;
        }
    }

    async deleteMultiplePrdouctAttributes(attributeIds: string) {
        try {
            const splitIds = attributeIds.split(',');

            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const productAttributes = await this.productAttributesRepository.find({
                where: {
                    consultantCompanyId: diorCompanyId,
                    id: In(splitIds),
                },
            });

            await this.productAttributesRepository.remove(productAttributes);

            return {
                message: 'Successfully deleted multiple record',
            };
        } catch (e) {
            throw e;
        }
    }

    async exportProductAttributes(query: ExportProductAttributeDataDto) {
        try {
            const { search } = query;
            const diorConsultant = await this.consultantsRepository.getDiorConsultant();
            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const attributeQuery = this.productAttributesRepository
                .createQueryBuilder('attributes')
                .where('attributes.consultantCompanyId = :companyId', {
                    companyId: diorCompanyId,
                })
                .andWhere('attributes.id != :id', {
                    id: diorConsultant.id,
                });

            if (search) {
                attributeQuery.andWhere('(attributes.typ LIKE :search OR attributes.value LIKE :search)', {
                    search: `%${search}%`,
                });
            }

            const attributes = await attributeQuery.getMany();

            return await this.createCSVFileForExportProductAttribute(attributes);
        } catch (e) {
            throw e;
        }
    }

    async importProductAttributes(req: Request, body: ImportProductAttributeDataDto) {
        try {
            const splitToken = req.headers.authorization.split(' ');
            const token = splitToken[1];

            const fileUrl = body.file_url;
            const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);

            const diorCompanyId = await this.consultantsRepository.getDiorConsultantCompanyId();

            const headers = worksheet.getRow(1);

            const rowCount = worksheet.rowCount + 1;

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const newProductAttribute = this.productAttributesRepository.create({
                    typ: row.getCell(1).value.toLocaleString(),
                    value: row.getCell(2).value.toLocaleString(),
                    consultantCompanyId: diorCompanyId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await this.productAttributesRepository.save(newProductAttribute);
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    async importProductAttributeTranslations(req: Request, body: ImportProductAttributeTranslationsDataDto) {
        try {
            const splitToken = req.headers.authorization.split(' ');
            const token = splitToken[1];

            const fileUrl = body.file_url;
            const country = body.file_url;

            const worksheet = await this.commonService.getWorkSheetByHTTP(fileUrl, token);

            const rowCount = worksheet.rowCount + 1;

            const headers = worksheet.getRow(1);

            for (let i = 2; i < rowCount; i++) {
                const row = worksheet.getRow(i);

                const typ = row.getCell(1).value.toLocaleString();
                const value = row.getCell(2).value.toLocaleString();

                const attribute = await this.productAttributesRepository.findOne({
                    where: {
                        typ: typ,
                        value: value,
                    },
                });

                const attributeId = attribute.id;

                const newTranslations = this.productAttributeTranslationsRepository.create({
                    fieldName: 'product_name',
                    language: country,
                    value: row.getCell(3).value.toLocaleString(),
                    productAttributeId: Number(attributeId),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await this.productAttributeTranslationsRepository.save(newTranslations);
            }

            return {
                message: 'Success import data',
            };
        } catch (e) {
            throw e;
        }
    }

    createCSVFileForExportProductAttribute(attributes: ProductAttributes[]) {
        const header = ['product_attribute Type', 'product_attribute Value'];

        const records = attributes.map((u) => [u.typ, u.value]);

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
