import {
    BadRequestException,
    ConflictException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, FindOptionsSelectByString, ILike, In, Not, Or, Equal, Repository } from 'typeorm';
import { TokenTypeEnum } from 'src/jwt/enums/auth-token.enum';

import { Consultants } from '@/src/common/entities/crmEntities/Consultants.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from 'src/jwt/jwt.service';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import {
    ResendConfirmationDto,
    AllLicenseDto,
    CalculatePriceDto,
    ChangeEmailDto,
    ChangeLicenseDto,
    ConfirmHtmlDto,
    ConsultantCompanyDetailsDto,
    ConsultantDto,
    GetConsultantDto,
    LoginSocialDto,
    NotifySalesChangeLicenseDto,
    PasswordDto,
    RenewDevicesDto,
    RequestCallBackUrlDto,
    UpdateConsultantDto,
    UpdateLicenseDto,
    LoginPhoneDto,
    ProductRecommendationsDto,
    TokenRefreshDto,
    PasswrodChangeDto,
    EnterProductDto,
    GetNotificationsDto,
    UpdatePasswordDto,
} from '@/src/modules/consultants/consultants.dto';
import { ConsultantCompanyService } from '../consultantCompany/consultantCompany.service';
import { DeviceService } from '../devices/devices.service';
import { IMessage } from 'src/common/interfaces/message.interface';
import { CommonService } from 'src/common/common.service';
import { ConsultantPositions } from '@/src/common/entities/crmEntities/ConsultantPositions.entity';
import { CrmDataReplicationService } from '../dataReplication/consultantDataReplication/consultantDataReplication.service';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { ConsultantPositionsService } from '../consultantPositions/consultantPositions.service';
import { ConsultantShopsService } from '../consultantShops/consultantShops.service';
import { GendersService } from '../genders/genders.service';
import { CountriesService } from '../countries/countries.service';
import { StoreService } from '../stores/stores.service';
import { SkinColorGroupsService } from '../skinColorGroups/skinColorGroups.service';
import { EthinicitiesService } from '../ethinicities/ethinicities.service';
import { ApplicationsService } from '../applications/applications.service';
import { ConsultantBranchesService } from '../consultantBranches/consultantBranches.service';
import { IJwt } from 'src/config/interfaces/jwt.interfaces';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { LicenceService } from '../licence/licence.service';
import { LicenseType } from '@/src/common/enums/license-type.enum';
import { Devices } from '@/src/common/entities/crmEntities/Devices.entity';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import axios from 'axios';
import { CustomersService } from '../customers/customers.service';
import { VersionItemType } from '@/src/common/enums/version-item-type.enum';
import { VersionEvent } from '@/src/common/enums/version-event.enum';
import { Versions } from '@/src/common/entities/crmEntities/Versions.entity';
import { Role } from '@/src/common/enums/role.enum';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { TargetType } from '@/src/common/enums/target-type.enum';
import { Notifications } from '@/src/common/entities/crmEntities/Notifications.entity';
import { Products } from '@/src/common/entities/crmEntities/Products.entity';

@Injectable()
export class ConsultantsService {
    private readonly jwtConfig: IJwt;

    constructor(
        @InjectRepository(Consultants)
        private readonly ConsultantsRepository: Repository<Consultants>,
        @InjectRepository(ConsultantPositions)
        private readonly position: Repository<ConsultantPositions>,
        @InjectRepository(Versions)
        private readonly versionsRepository: Repository<Versions>,
        @InjectRepository(Notifications)
        private readonly notificationRepository: Repository<Notifications>,

        @InjectRepository(Products)
        private readonly productsRepository: Repository<Products>,

        private readonly configService: ConfigService,
        private readonly licenceService: LicenceService,
        private readonly productsService: ProductsService,
        private readonly consultantPositionsService: ConsultantPositionsService,
        private readonly customerService: CustomersService,
        private readonly applicationsService: ApplicationsService,
        private readonly consultantShopsService: ConsultantShopsService,
        private readonly genderService: GendersService,
        private readonly countriesService: CountriesService,
        private readonly consultantStoreService: StoreService,
        private readonly skinColorGroupService: SkinColorGroupsService,
        private readonly ethinicityService: EthinicitiesService,
        private readonly consultantBranchesService: ConsultantBranchesService,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly companies: ConsultantCompanyService,
        private readonly devices: DeviceService,
        private readonly commonService: CommonService,
        private readonly dataReplication: CrmDataReplicationService,
    ) {
        this.jwtConfig = this.configService.get<IJwt>('jwt');
    }

    // Account

    public async sendAccountConfimationEmail(token: string, email: string, locale: string) {
        const subject = await this.commonService.translate('confirm_email_subject', locale);

        const result = await this.commonService.sendEmail({
            to: email,
            subject,
            templateName: 'email-confirmation',
            templateContext: {
                link: `${process.env.EMAIL_URL}/consultants/confirm?token=${token}`,
            },
        });
        return result;
    }

    async verifyPasswordBcrypt(enteredPassword: string, bcryptHash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(enteredPassword, bcryptHash);
        } catch (error) {
            throw new InternalServerErrorException({
                result_code: ErrorStatus.SERVER_ERROR,
                error: `Error verifying password with bcrypt: ${error.message}`,
            });
        }
    }

    // Sample method to verify passwords using argon2
    async verifyPasswordArgon2(enteredPassword: string, argon2Hash: string): Promise<boolean> {
        try {
            return await argon2.verify(argon2Hash, enteredPassword);
        } catch (error) {
            throw new InternalServerErrorException({
                result_code: ErrorStatus.SERVER_ERROR,
                error: `Error verifying password with argon2: ${error.message}`,
            });
        }
    }

    // Method to determine which hashing algorithm was used for a stored password
    determineHashAlgorithm(storedHash: string): 'bcrypt' | 'argon2' {
        return storedHash.startsWith('$2a$') ? 'bcrypt' : 'argon2';
    }

    // Method to verify password based on the hashing algorithm used
    async verifyPassword(enteredPassword: string, storedHash: string): Promise<boolean> {
        const hashAlgorithm = this.determineHashAlgorithm(storedHash);

        switch (hashAlgorithm) {
            case 'bcrypt':
                return this.verifyPasswordBcrypt(enteredPassword, storedHash);
            case 'argon2':
                return this.verifyPasswordArgon2(enteredPassword, storedHash);
            default:
                throw new InternalServerErrorException({
                    result_code: ErrorStatus.SERVER_ERROR,
                    error: ResponseMessages.InvalidHashAlogorithm,
                });
        }
    }

    async insertConsultant(newConsultant: Consultants) {
        const newCustomer = this.ConsultantsRepository.create(newConsultant);
        const result = await this.ConsultantsRepository.save(newCustomer);
        return result;
    }

    async updateConsultant(id: number, consultantInput: any) {
        const result = await this.ConsultantsRepository.update(id, consultantInput);
        return result;
    }

    async createConsultant(newUser: any) {
        try {
            const user: any = {
                password_digest: (await argon2.hash(newUser.password)) ?? null,
                email: newUser.email,
                unconfirmed_email: newUser.email,
                app_id: newUser.app_id,
                email_confirmed: newUser.email_confirmed ? newUser.email_confirmed : false,
                rememberCreatedAt: new Date(),
                updated_at: new Date(),
                created_at: new Date(),
            };

            const result: any = await this.insertConsultant(user);
            return result;
        } catch (e) {
            throw new InternalServerErrorException({
                result_code: ErrorStatus.SERVER_ERROR,
                error: ResponseMessages.ConsultantNotCreated,
            });
        }
    }

    public async signUp(newUser: any, locale: string = 'en') {
        const errors: string[] = [];

        if (newUser.password.length < 6) {
            errors.push('Password should contain more than 6 letters');
        }
        if (errors.length) {
            throw new BadRequestException({ result_code: ErrorStatus.VALIDATION_ERROR, error: errors.join('\n') });
        }

        const user = await this.findConsultant(newUser.app_id, newUser.email);

        if (user) {
            throw new ConflictException({
                result_code: ErrorStatus.BAD_REQUEST,
                error: ResponseMessages.EmailAlreadyExist,
            });
        }

        if (newUser.email.includes('@chowistest.com')) {
            newUser.email_confirmed = true;
        }
        const consultant = await this.createConsultant(newUser);

        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'phone_country_code',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'zip_code',
            'state',
            'note',
            'push_token',
            'memo',
            'app_id',
            'company_name',
            'company_address',
            'branch',
            'position',
            'skin_color_group_id',
            'ethnicity_id',
            'callback_url',
            'code',
            'country_id',
            'token',
            'social',
        ];

        const includes = ['country_details', 'gender', 'consultant_shop'];

        const [confirmationToken, tokens, consultantData] = await Promise.all([
            this.jwtService.generateToken(
                { id: consultant.id, email: consultant.email, role: Role.Consultant },
                TokenTypeEnum.CONFIRMATION,
                consultant.domain,
            ),
            this.authService.generateAuthTokens(
                { id: consultant.id, email: consultant.email, role: Role.Consultant },
                '',
            ),
            this.getConsultant({ id: consultant.id }, selections, includes),
        ]);

        const [accessToken, refreshToken] = tokens;

        const [emailSent, updateStatus] = await Promise.all([
            this.sendAccountConfimationEmail(confirmationToken, newUser.email, locale),
            this.updateConsultant(consultantData.id, {
                confirm_token: confirmationToken,
                token: refreshToken,
                confirmation_sent_at: new Date(),
            }),
        ]);

        consultantData.token = accessToken;
        consultantData.refresh_token = refreshToken;
        consultantData.country_code = consultantData.getContryCode;
        consultantData.optic_number = consultantData.getOpticNumbers;
        consultantData.country = consultantData.country_details;
        consultantData.store = consultantData.consultant_shop;

        delete consultantData.country_details;
        delete consultantData.consultant_shop;
        return consultantData;
    }

    public async signUpRuby(newUser: ConsultantDto, locale: string = 'en') {
        try {
            const existUser = await this.findConsultant(Number(newUser.app_id), newUser.email);

            if (existUser) {
                throw new ConflictException({
                    result_code: ErrorStatus.BAD_REQUEST,
                    error: ResponseMessages.EmailAlreadyExist,
                });
            }

            const consultantData: any = newUser;

            if (newUser.email.includes('@chowistest.com')) {
                consultantData['email_confirmed'] = true;
            }

            const consultant: Consultants = await this.createConsultant(consultantData);

            const [confirmationToken, token] = await Promise.all([
                this.jwtService.generateToken(
                    { id: consultant.id, email: consultant.email, role: Role.Consultant },
                    TokenTypeEnum.CONFIRMATION,
                    null,
                ),
                this.authService.generateAuthTokens(
                    { id: consultant.id, email: consultant.email, role: Role.Consultant },
                    '',
                ),
            ]);

            const [accessToken, refreshToken] = token;

            await Promise.all([
                this.sendAccountConfimationEmail(confirmationToken, consultant.email, locale),
                this.updateConsultant(consultant.id, {
                    confirm_token: confirmationToken,
                    token: refreshToken,
                }),
            ]);

            const consultantResponseData = await this.ConsultantsRepository.findOne({
                where: {
                    id: consultant.id,
                },
                relations: ['country_details', 'products', 'products.device'],
            });

            return {
                id: consultantResponseData.id,
                email: consultantResponseData.email,
                name: consultantResponseData.name,
                surname: consultantResponseData.surname,
                gender: consultantResponseData.gender,
                os: consultantResponseData.os,
                language: consultantResponseData.language,
                phone: consultantResponseData.phone,
                address: consultantResponseData.address,
                city: consultantResponseData.city,
                country: consultantResponseData.country,
                zip_code: consultantResponseData.zip_code,
                state: consultantResponseData.state,
                birthdate: consultantResponseData.birthdate,
                note: consultantResponseData.note,
                push_token: consultantResponseData.push_token,
                memo: consultantResponseData.memo,
                app_id: consultantResponseData.app_id,
                company_name: consultantResponseData.company_name,
                company_address: consultantResponseData.company_address,
                branch: consultantResponseData.branch,
                position: consultantResponseData.position,
                skin_color_group_id: consultantResponseData.skin_color_group_id,
                ethnicity_id: consultantResponseData.ethnicity_id,
                callback_url: consultantResponseData.callback_url,
                code: consultantResponseData.code,
                token: accessToken,
                refresh_token: refreshToken,
                social: consultantResponseData.social,
                country_code: consultantResponseData.country_details?.code,
                store: consultantResponseData.consultant_shop,
                optic_number: consultantResponseData.products[0]?.device.optic_number,
                password_update_needed: consultantResponseData.password_update_needed,
            };
        } catch (e) {
            throw e;
        }
    }

    async checkConsultantPosition(id: number) {
        const position = await this.position.findOne({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
            },
        });
        return position;
    }

    async getConsultant(conditions: any, selections?: any, includes?: string[]) {
        const consultant: any = await this.ConsultantsRepository.findOne({
            where: conditions,
            select: selections
                ? Array.isArray(selections)
                    ? (selections as FindOptionsSelectByString<Consultants>)
                    : selections
                : ['id', 'email', 'app_id', 'name'],
            relations: includes ? includes : [],
        });

        if (!consultant && conditions.email && conditions.app_id) {
            const newConsultant = await this.dataReplication.replicateUserToMasterOperation(
                conditions.email,
                conditions.app_id,
            );

            const consultant = await this.ConsultantsRepository.findOne({
                where: { id: newConsultant['id'] },
                select: selections
                    ? (selections as FindOptionsSelectByString<Consultants>)
                    : ['id', 'email', 'app_id', 'name'],
                relations: includes ? includes : [],
            });
            return consultant;
        }

        return consultant;
    }

    async fetchConsultants(conditions?: any, selections?: string[], includes?: string[], addFields?: string[]) {
        const consultants: any[] = await this.ConsultantsRepository.find({
            where: conditions ? conditions : {},
            select: selections
                ? (selections as FindOptionsSelectByString<Consultants>)
                : ['id', 'email', 'app_id', 'name'],
            relations: includes ? includes : [],
        });

        if (addFields) {
            consultants.forEach((consultant) => {
                addFields.forEach((field) => {
                    if (field === 'country_code') {
                        consultant.country_code = consultant.getContryCode;
                    }

                    if (field === 'optic_number') {
                        consultant.optic_number = consultant.getOpticNumbers;
                    }
                });
            });
        }
        return consultants;
    }

    async findConsultant(app_id: number, email: string) {
        const consultant = await this.ConsultantsRepository.findOne({
            where: [
                {
                    app_id: app_id,
                    email: email,
                },
                {
                    app_id: null,
                    email: email,
                },
            ],
            relations: [
                'consultant_shop',
                'country_details',
                'consultant_company',
                'consultant_position',
                'products',
                'products.device',
                'products.device.consultant_company',
            ],
        });

        return consultant;
    }

    async findNotifications(
        conditions: any,
        selections?: string[],
        includes?: string[],
        search?: string,
        page?: number,
        perPage?: number,
    ) {
        if (!page) page = 1;
        if (!perPage) perPage = 10;
        const skip = (page - 1) * perPage;

        if (search) {
            conditions = {
                ...conditions,
                title: ILike(`%${search}%`),
            };
        }

        const notifications: any = await this.notificationRepository.find({
            where: conditions,
            select: selections
                ? (selections as FindOptionsSelect<Notifications>)
                : ['id', 'target_type', 'target_id', 'title'],
            relations: includes ? includes : [],
            take: perPage,
            skip: skip,
            order: { created_at: 'DESC' },
        });

        return notifications;
    }

    async checkConsultant(app_id: number, email: string) {
        const consultant: any = await this.findConsultant(Number(app_id), email);

        if (!consultant) {
            throw new BadRequestException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: ResponseMessages.LoginFailed,
            });
        }

        const file = await this.companies.getCompaniesFiles(consultant?.consultant_company_id ?? 1);

        const attachmentObject: any = {};
        file.forEach((attachment) => {
            const { name, blob } = attachment;
            const { filename, key } = blob;
            const extension = filename.split('.').pop();
            attachmentObject[name] = `${process.env.URL}/api/image/${key}`;
        });

        if (consultant?.consultant_company) {
            consultant.consultant_company = await this.getCompanyDetails({
                consultant_company_id: consultant.consultant_company.id,
            });
        }

        if (consultant?.country_details) {
            consultant.country_id = consultant.country_details?.id ?? '';
            consultant.country = consultant.country_details?.name ?? '';
            consultant.country_code = consultant.country_details?.countryCode ?? '';
        }

        if (consultant?.consultant_position_id) {
            //positiom
            consultant.consultant_position = await this.checkConsultantPosition(consultant?.consultant_position_id);
        }

        const products = await this.devices.getCompaniesFiles(consultant?.id ?? null, Number(app_id));

        const promises: Promise<any>[] = [];
        products.map((p) => {
            if (p.device.consultant_company_id) {
                promises.push(
                    this.getCompanyDetails({ consultant_company_id: String(p.device.consultant_company_id) }),
                );
            }
        });

        const result = await Promise.all(promises);
        const optic_number: string[] = [];

        products.map(async (p: any) => {
            // Calculaet expired date
            const companyDetails = result.find((r) => r.id === p.device.consultant_company_id);
            p.device.consultant_company = companyDetails;
            const expiredDate = this.expiredDate(p.first_use_date, p.license_period);
            let formattedDate;

            if (expiredDate) {
                const month = (expiredDate.getMonth() + 1).toString().padStart(2, '0');
                const date = expiredDate.getDate().toString().padStart(2, '0');
                const year = expiredDate.getFullYear();
                formattedDate = `${year}-${month}-${date}`;
            }
            p.expired_date = formattedDate ?? null;
            p.is_expired = p.expired_date ? new Date() > p.expired_date : false;

            const files = await this.companies.getCompaniesFiles(String(p.application.id));
            const attachmentObject: any = {};
            files.forEach((attachment) => {
                const { name, blob } = attachment;
                const { key } = blob;
                attachmentObject[name] = `${process.env.URL}/api/image/${key}`;
            });
            p.application.apk_url = attachmentObject.apk;
            p.application.old_apk_url = attachmentObject.old_apk;
            p.application.app_icon = attachmentObject.icon;
            p.device.offline_qo = p.device.offline_qo ? p.device.offline_qo : true;

            if (p?.device?.optic_number) {
                optic_number.push(p.device['optic_number']);
            }
        });

        if (consultant?.optic_number) {
            consultant.optic_number = optic_number;
        }

        if (consultant?.products) {
            consultant.products = products;
        }

        return consultant;
    }

    async validateUser(email: string, app_id: number, password: string) {
        const user = await this.checkConsultant(Number(app_id), email);

        const confirmPwd = await this.verifyPassword(password, user?.password_digest ?? null);

        if (confirmPwd) {
            return user;
        }

        throw new BadRequestException({
            result_code: ErrorStatus.LOGIN_FAILED,
            error: ResponseMessages.LoginFailed,
        });
    }

    async validateUserSocial(email: string, app_id: number, social_id: string) {
        const user = await this.checkConsultant(Number(app_id), email);

        // const user: any = {
        //     password_digest: (await argon2.hash(newUser.password)) ?? null,
        //     email: newUser.email,
        //     unconfirmed_email: newUser.email,
        //     app_id: newUser.app_id,
        //     email_confirmed: newUser.email_confirmed ? newUser.email_confirmed : false,
        //     rememberCreatedAt: new Date(),
        //     updated_at: new Date(),
        //     created_at: new Date(),
        // };

        const confirmUser = await this.ConsultantsRepository.findOne({
            where: {
                social_id,
            },
        });

        if (confirmUser) {
            return user;
        }

        throw new BadRequestException({
            result_code: ErrorStatus.LOGIN_FAILED,
            error: ResponseMessages.LoginFailed,
        });
    }

    async login(data: ConsultantDto, locale: string = 'en') {
        const { app_id, password, email } = data;
        const consultant = await this.validateUser(email, Number(app_id), password);
        const checkToken = this.authService.isTokenExpired(consultant.token);

        console.log(consultant);

        if (!consultant.email_confirmed) {
            if (!checkToken) {
                const confirmationToken = await this.jwtService.generateToken(
                    { id: consultant.id, email: consultant.email, role: Role.Consultant },
                    TokenTypeEnum.CONFIRMATION,
                    '',
                );
                await this.updateConsultant(consultant.id, {
                    confirm_token: confirmationToken,
                });

                await this.sendAccountConfimationEmail(confirmationToken, consultant.email, locale);
            }

            throw new BadRequestException({
                result_code: ErrorStatus.EMAIL_NOT_CONFIRMED,
                error: ResponseMessages.EmailNotConfirmed,
            });
        }
        const [accessToken, refreshToken] = await this.authService.generateAuthTokens(
            { id: consultant.id, email: consultant.email, role: Role.Consultant },
            '',
        );
        delete consultant.password_digest;
        delete consultant.recovery_password_digest;
        delete consultant.email_confirmed;
        if (consultant?.consultant_company?.applications) {
            consultant.consultant_company.applications = [];
        }

        consultant.products.forEach((product: any) => {
            if (product.device && product.device.consultant_company) {
                product.device.consultant_company.applications = [];
            }
        });

        consultant.token = accessToken;
        consultant.refresh_token = refreshToken;

        await this.updateConsultant(consultant.id, {
            token: refreshToken,
            confirm_token: consultant.confirm_token,
        });

        await this.updateConsultant(consultant.id, { token: refreshToken, confirm_token: consultant.confirm_token });
        return {
            id: consultant.id,
            email: consultant.email,
            token: accessToken,
            refresh_token: refreshToken,
            name: consultant.name,
            surname: consultant.surname,
            phone_country_code: consultant.phone_country_code,
            os: consultant.os,
            language: consultant.language,
            phone: consultant.phone,
            address: consultant.address,
            city: consultant.city,
            zip_code: consultant.zip_code,
            state: consultant.state,
            note: consultant.note,
            push_token: consultant.push_token,
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
            country_id: consultant?.country_id ? Number(consultant?.country_id) : null,
            country: consultant.country_details?.name ?? null,
            gender: consultant.gender,
            social: consultant.social,
            country_code: consultant.getContryCode,
            store: consultant.consultant_shop?.name ?? null,
            consultant_shop: consultant.consultant_shop,
            country_details: consultant.country_details,
            optic_number: consultant.getOpticNumbers,
            products: consultant.products,
            consultant_company: consultant.consultant_company,
            consultant_position: consultant.consultant_position,
        };
    }

    async loginRuby(data: ConsultantDto, locale: string = 'en') {
        try {
            const { app_id, password, email } = data;
            const consultant: Consultants = await this.validateUser(email, Number(app_id), password);

            // ONLY APP_ID IS NULL
            if (consultant.app_id === null) {
                consultant.app_id = Number(data.app_id);

                await this.ConsultantsRepository.save(consultant);
            }

            if (!consultant.email_confirmed) {
                throw new BadRequestException({
                    result_code: ErrorStatus.EMAIL_NOT_CONFIRMED,
                    error: ResponseMessages.EmailNotConfirmed,
                });
            }

            const [accessToken, refreshToken] = await this.authService.generateAuthTokens(
                { id: consultant.id, email: consultant.email, role: Role.Consultant },
                '',
            );

            consultant.token = accessToken;
            await this.ConsultantsRepository.save(consultant);

            return {
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
                token: accessToken,
                refresh_token: refreshToken,
                social: consultant.social,
                country_code: consultant.country_details?.code || null,
                store: consultant.consultant_shop,
                optic_number: consultant.products[0]?.device.optic_number || ([] as any[]),
                password_update_needed: consultant.password_update_needed,
                products: consultant.products,
                consultant_position: consultant?.consultant_position || null,
            };
        } catch (e) {
            throw e;
        }
    }

    async logout(id: number): Promise<IMessage> {
        await this.updateConsultant(id, {
            token: null,
        });
        return this.commonService.generateMessage('success');
    }

    public async findOneConsultant(id: number) {
        const consultant = await this.ConsultantsRepository.findOne({
            where: { id },
            relations: ['consultant_company', 'country_details', 'gender', 'consultant_position'],
        });

        return consultant;
    }

    public async getConsultants(data: GetConsultantDto) {
        const { company_ids = [], shop_ids = [], position_ids = [], country_ids = [] } = data;

        const selections = [
            'id',
            'email',
            'token',
            'app_id',
            'name',
            'surname',
            'phone_country_code',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'zip_code',
            'state',
            'note',
            'push_token',
            'memo',
            'company_name',
            'company_address',
            'branch',
            'position',
            'skin_color_group_id',
            'ethnicity_id',
            'callback_url',
            'code',
            'social',
            'country_id',
        ];

        const includes = [
            'country_details',
            'gender',
            'consultant_shop',
            'consultant_company',
            'consultant_position',
            'products',
            'products.device',
        ];

        const addFeilds = ['country_code', 'optic_number'];

        const conditions: any = {};

        if (company_ids.length) conditions['consultant_company_id'] = In(company_ids);
        if (shop_ids.length) conditions['consultant_shop_id'] = In(shop_ids);
        if (position_ids.length) conditions['consultant_position_id'] = In(position_ids);
        if (country_ids.length) conditions['country_id'] = In(country_ids);

        const consultants = await this.fetchConsultants(conditions, selections, includes, addFeilds);
        const promises: Promise<any>[] = [];

        consultants.map((c) => {
            if (c.consultant_company?.id) {
                promises.push(this.getCompanyDetails({ consultant_company_id: c.consultant_company.id }));
            }
            c['country'] = c.country_details;
            c['store'] = c.consultant_shop;
            c['refresh_token'] = c.token;
            c['token'] = null;

            delete c.country_details;
            delete c.consultant_shop;

            return c;
        });

        const result = await Promise.all(promises);

        const modifiedConsultants = consultants.map((consultant) => {
            const companyDetails = result.find((r) => r.id == consultant.consultant_company?.id);
            consultant['consultant_company'] = companyDetails;
            return consultant;
        });

        return modifiedConsultants;
    }

    public async modifyConsultant(userId: number, data: UpdateConsultantDto, locale: string = 'en') {
        // Commented code in this function can be use in future

        const consultant = await this.ConsultantsRepository.findOne({
            where: { id: userId },
            relations: [
                'gender',
                'consultant_company',
                'consultant_position',
                'consultant_shop',
                'country_details',
                'products',
                'products.device',
                'products.device.consultant_company',
            ],
        });

        if (!consultant) {
            throw new NotFoundException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.RecordNotFound,
            });
        }

        const promises: Promise<any>[] = [];

        if (data.email && data.email !== consultant.email) {
            const confirmationToken = await this.jwtService.generateToken(
                { id: consultant.id, email: consultant.email, role: Role.Consultant },
                TokenTypeEnum.CONFIRMATION,
                '',
            );
            consultant.unconfirmed_email = data.email;
            consultant.confirm_token = confirmationToken;
            consultant.email_confirmed = false;
            consultant.confirmation_sent_at = new Date();

            const emailPromises = [
                this.sendAccountConfimationEmail(confirmationToken, data.email, locale),
                this.sendAccountConfimationEmail(confirmationToken, consultant.email, locale),
            ];
            promises.push(...emailPromises);
            data.email = consultant.email;
        }

        if (data.new_password) {
            const confirmPwd = await this.verifyPassword(data.new_password, consultant.password_digest ?? null);
            if (!confirmPwd) {
                throw new UnauthorizedException({
                    result_code: ErrorStatus.UNAUTHORIZED,
                    error: ResponseMessages.InvalidPassword,
                });
            }

            consultant.password_digest = await argon2.hash(data.new_password);

            const subject = await this.commonService.translate('password_reset_subject', locale);

            promises.push(
                this.commonService.sendEmail({
                    to: consultant.email,
                    subject: subject,
                    templateName: 'password-reset-success',
                    templateContext: {},
                }),
            );
        }

        if (data.consultant_shop_id) {
            promises.push(this.consultantShopsService.findOneConsultantShops(Number(data.consultant_shop_id)));
        }

        if (data.gender_id) {
            promises.push(this.genderService.findOneGender(String(data.gender_id)));
        }

        if (data.app_id) {
            promises.push(this.applicationsService.findOneApplication(Number(data.app_id)));
        }

        if (data.skin_color_group_id) {
            promises.push(this.skinColorGroupService.findOneskinColorGroups(data.skin_color_group_id));
        }

        if (data.ethnicity_id) {
            promises.push(this.ethinicityService.findOneEthinicities(data.ethnicity_id));
        }

        if (data.country_code) {
            const countries = await this.countriesService.findCountry({ country_code: data.country_code }, [
                'id',
                'country_code',
                'name',
            ]);
            const country = countries[0];
            if (!country) {
                this.commonService.throwNotFoundError();
            }

            // consultant.country_id = country?.id ? Number(country.id) : null;
            // consultant.country_code = country.country_code;
            // consultant.country_name = country.name;
        }

        const results = await Promise.all(promises);
        for (const result of results) {
            if (!result) {
                this.commonService.throwNotFoundError();
            }
        }

        consultant.updated_at = new Date();
        Object.assign(consultant, data);
        if (consultant?.products.length > 0) {
            for (const productData of consultant.products) {
                await this.productsRepository.save(productData).catch((error) => {
                    console.log(error);
                });
            }
        }

        const products = consultant?.products;
        delete consultant?.products;
        const updatedConsultant: any = await this.ConsultantsRepository.save(consultant);
        updatedConsultant.products = products;

        delete updatedConsultant.password_digest;
        delete updatedConsultant.recovery_password_digest;

        updatedConsultant.consultant_company = await this.getCompanyDetails({
            consultant_company_id: updatedConsultant.consultant_company.id,
        });

        if (updatedConsultant?.consultant_company?.applications) {
            updatedConsultant.consultant_company.applications = [];
        }

        const [accessToken, refreshToken] = await this.authService.generateAuthTokens(
            { id: consultant.id, email: consultant.email, role: Role.Consultant },
            '',
        );

        // Prepare the response object
        const response = {
            id: updatedConsultant.id,
            email: updatedConsultant.email,
            token: accessToken,
            refresh_token: refreshToken,
            name: updatedConsultant.name,
            surname: updatedConsultant.surname,
            phone_country_code: updatedConsultant.phone_country_code,
            os: updatedConsultant.os,
            language: updatedConsultant.language,
            phone: updatedConsultant.phone,
            address: updatedConsultant.address,
            city: updatedConsultant.city,
            zip_code: updatedConsultant.zip_code,
            state: updatedConsultant.state,
            note: updatedConsultant.note,
            push_token: updatedConsultant.push_token,
            memo: updatedConsultant.memo,
            app_id: updatedConsultant.app_id,
            company_name: updatedConsultant.company_name,
            company_address: updatedConsultant.company_address,
            branch: updatedConsultant.branch,
            position: updatedConsultant.position,
            skin_color_group_id: updatedConsultant.skin_color_group_id,
            ethnicity_id: updatedConsultant.ethnicity_id,
            callback_url: updatedConsultant.callback_url,
            code: updatedConsultant.code,
            country_id: updatedConsultant?.country_id ? Number(updatedConsultant?.country_id) : null,
            country: updatedConsultant.country_details?.name ?? null,
            consultant_shop: consultant.consultant_shop,
            country_details: consultant.country_details,
            gender: updatedConsultant.gender,
            social: updatedConsultant.social,
            country_code: updatedConsultant.getContryCode,
            store: updatedConsultant.consultant_shop?.name ?? null,
            optic_number: updatedConsultant.getOpticNumbers,
            products: updatedConsultant.products,
            consultant_company: updatedConsultant.consultant_company,
            consultant_position: updatedConsultant.consultant_position,
        };

        // Call updateConsultant in the background
        this.updateConsultant(consultant.id, { token: refreshToken }).catch((error) => {
            console.error('Error updating consultant:', error);
        });

        return response;
    }

    public async confirmation(token: string) {
        const consultant = await this.getConsultant({
            confirm_token: token,
        });

        if (!consultant) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.InvalidToken,
            });
        }

        await this.updateConsultant(consultant.id, {
            email_confirmed: true,
            confirmed_at: new Date(),
        });

        return this.commonService.generateMessage('Email confirmed successfully');
    }

    public async resendConfirmation(data: ResendConfirmationDto, locale: string = 'en') {
        const { email, app_id } = data;

        const customer = await this.getConsultant({ email, app_id }, [
            'id',
            'email',
            'confirm_token',
            'email_confirmed',
        ]);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        if (customer.email_confirmed) {
            throw new BadRequestException({
                result_code: ErrorStatus.BAD_REQUEST,
                error: ResponseMessages.EmailAlreadyConfirmed,
            });
        }

        const [emailSent, updateStatus] = await Promise.all([
            this.sendAccountConfimationEmail(customer.confirm_token, customer.email, locale),
            this.updateConsultant(customer.id, {
                confirmation_sent_at: new Date(),
            }),
        ]);

        return this.commonService.generateMessage('Success!');
    }

    public async changeEmail(consultantId: number, data: ChangeEmailDto, locale: string = 'en') {
        const consultant = await this.getConsultant({ id: consultantId });

        if (!consultant) {
            throw new NotFoundException({
                result_code: ErrorStatus.RECORD_NOT_FOUND,
                error: ResponseMessages.RecordNotFound,
            });
        }

        const confirmationToken = await this.jwtService.generateToken(
            { id: consultant.id, email: consultant.email, role: Role.Consultant },
            TokenTypeEnum.CONFIRMATION,
            '',
        );

        const [emailSent, newEmailSent, updatedConsultant] = await Promise.all([
            this.sendAccountConfimationEmail(confirmationToken, data.email, locale),
            this.sendAccountConfimationEmail(confirmationToken, consultant.email, locale),
            this.updateConsultant(consultantId, {
                unconfirmed_email: data.email,
                confirm_token: confirmationToken,
                email_confirmed: false,
                confirmation_sent_at: new Date(),
            }),
        ]);

        return this.commonService.generateMessage('Success!');
    }

    public async confirmEmail(data: ConfirmHtmlDto) {
        const { token } = data;
        const templatePath = `${process.env.PUBLIC_FILE}/templates/confirm.hbs`;
        const [template, consultant] = await Promise.all([
            fs.readFile(templatePath, 'utf8'),
            this.getConsultant({ confirm_token: token }),
        ]);
        const compiledTemplate = handlebars.compile(template);

        if (!consultant) {
            const htmlFile = compiledTemplate({
                success: false,
            });
            return htmlFile;
        }

        if (consultant.email_confirmed) {
            const htmlFile = compiledTemplate({
                success: true,
            });
            return htmlFile;
        }

        await this.updateConsultant(consultant.id, {
            email: consultant.unconfirmed_email,
            unconfirmed_email: null,
            email_confirmed: true,
            confirmed_at: new Date(),
            confirm_token: null,
            token: null,
        });

        const htmlFile = compiledTemplate({
            success: true,
        });
        return htmlFile;
    }

    public async confirmEmailById(token: string) {
        const templatePath = `${process.env.PUBLIC_FILE}/templates/confirm.hbs`;
        const [template, consultant] = await Promise.all([
            fs.readFile(templatePath, 'utf8'),
            this.getConsultant({ confirm_token: token }),
        ]);
        const compiledTemplate = handlebars.compile(template);

        if (!consultant) {
            const htmlFile = compiledTemplate({
                success: false,
            });
            return htmlFile;
        }

        if (consultant.email_confirmed) {
            const htmlFile = compiledTemplate({
                success: true,
            });
            return htmlFile;
        }

        const htmlFile = compiledTemplate({
            success: false,
        });
        return htmlFile;
    }

    public async getMe(userId: number) {
        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'phone_country_code',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'zip_code',
            'state',
            'note',
            'push_token',
            'memo',
            'app_id',
            'company_name',
            'company_address',
            'branch',
            'position',
            'skin_color_group_id',
            'ethnicity_id',
            'callback_url',
            'code',
            'country_id',
            'token',
            'social',
        ];

        const includes = [
            'country_details',
            'gender',
            'consultant_shop',
            'consultant_position',
            'consultant_company',
            'products',
            'products.license',
            'products.application',
            'products.device',
            'products.device.consultant_company',
        ];

        try {
            const consultant = await this.getConsultant({ id: userId }, selections, includes);

            if (consultant.country_details) {
                consultant.country_details.phone_code = consultant.country_details.phone_code ?? null;
                delete consultant.country_details.phone_code;
            }

            if (consultant.consultant_shop) {
                consultant.consultant_shop.country_name = consultant.consultant_shop.getContryName;
                consultant.consultant_shop.postal_code = consultant.consultant_shop.postal_code;
                delete consultant.consultant_shop.postal_code;
            }

            let companyDetailsPromises;
            if (consultant.consultant_company) {
                // consultant.consultant_company = await this.getCompanyDetails({
                //     consultant_company_id: consultant.consultant_company['id'],
                // });
                companyDetailsPromises = consultant.products.map((p: any) => {
                    return this.getCompanyDetails({
                        consultant_company_id: String(consultant.consultant_company['id']),
                    });
                });
            }

            const companyDetailsResults = await Promise.all(companyDetailsPromises);

            consultant.products.forEach((p: any, index: number) => {
                const companyDetails = companyDetailsResults[index];
                p.device.consultant_company = companyDetails;

                // Calculate expired date
                const expiredDate = this.expiredDate(p.first_use_date, p.license_period);
                if (expiredDate) {
                    const month = (expiredDate.getMonth() + 1).toString().padStart(2, '0');
                    const date = expiredDate.getDate().toString().padStart(2, '0');
                    const year = expiredDate.getFullYear();
                    p.expired_date = `${year}-${month}-${date}`;
                    p.is_expired = new Date() > expiredDate;
                } else {
                    p.expired_date = null;
                    p.is_expired = false;
                }
            });

            const applicationUrlsPromises = consultant.products.map((p: any) => {
                return this.getApplicatioUrls(p.application.id);
            });

            const applicationUrlsResults = await Promise.all(applicationUrlsPromises);

            consultant.products.forEach((p: any, index: number) => {
                const applicationUrls = applicationUrlsResults[index];
                p.application = { ...p.application, ...applicationUrls };
            });

            consultant.country = consultant.getContryName;
            consultant.country_code = consultant.getContryCode;
            consultant.store = consultant.getStoreName;
            consultant.optic_number = consultant.getOpticNumbers;
            consultant.refresh_token = consultant.token;
            consultant.token = null;

            return consultant;
        } catch (error) {
            console.error('Error fetching consultant data:', error);
            throw new Error('Unable to fetch consultant data');
        }
    }

    async getApplicatioUrls(applicationId: number) {
        const files = await this.companies.getCompaniesFiles(String(applicationId));

        const attachmentObject: any = {};
        files.forEach((attachment) => {
            const { name, blob } = attachment;
            const { key } = blob;
            attachmentObject[name] = `${process.env.URL}/api/image/${key}`;
        });
        return {
            apk_url: attachmentObject.apk,
            old_apk_url: attachmentObject.old_apk,
            app_icon: attachmentObject.icon,
        };
    }

    public async password(data: PasswordDto, locale: string = 'en') {
        const { email, app_id } = data;

        let consultant = await this.findConsultant(Number(app_id), email);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const password = this.commonService.generateRandomPassword(12);
        const hashedPassword = await argon2.hash(password);

        await this.updateConsultant(consultant.id, { password_digest: hashedPassword });

        const subject = await this.commonService.translate('password_recovery_subject', locale);

        await this.commonService.sendEmail({
            to: consultant.email,
            subject: subject,
            templateName: 'password-recovery',
            templateContext: {
                password: password,
            },
        });

        return this.commonService.generateMessage('Success!');
    }

    public async passwordChange(consultantId: number, data: PasswrodChangeDto, locale = 'en') {
        const { new_password, password } = data;

        const consultant = await this.getConsultant({ id: consultantId }, ['id', 'email', 'password_digest']);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const confirmPwd = await this.verifyPassword(password, consultant.password_digest ?? null);

        if (!confirmPwd) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.InvalidPassword,
            });
        }

        const password_digest = await argon2.hash(new_password);

        const updatedConsultant = await this.updateConsultant(consultantId, {
            password_digest,
        });

        if (!updatedConsultant.affected) {
            throw new BadRequestException({
                result_code: ErrorStatus.PASSWORD_CHANGE_FAILED,
                error: ResponseMessages.PasswordChangeFailed,
            });
        }
        const subject = await this.commonService.translate('password_reset_subject', locale);

        if (consultant.email) {
            this.commonService.sendEmail({
                to: consultant.email,
                subject: subject,
                templateName: 'password-reset-success',
                templateContext: {},
            });
        }

        return this.commonService.generateMessage('Success!');
    }

    public async passwordChangeNew(token: string) {
        const templatePath = `${process.env.PUBLIC_FILE}/email-templates/password-recovery-form.hbs`;
        const [template, consultant] = await Promise.all([
            fs.readFile(templatePath, 'utf8'),
            this.getConsultant({ recovery_password_digest: token }),
        ]);
        const compiledTemplate = handlebars.compile(template);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const htmlFile = compiledTemplate({
            link: `${process.env.BASE_URL}/consultants/update-password`,
            email: consultant.email,
            app_id: consultant.app_id,
            recoverPasswordToken: token,
        });
        return htmlFile;
    }

    public async passwordRecovery(data: PasswordDto, locale = 'en') {
        const { email, app_id } = data;

        let consultant = await this.findConsultant(Number(app_id), email);

        if (!consultant) {
            consultant = await this.getConsultant({ email });

            if (!consultant) {
                this.commonService.throwNotFoundError();
            }
        }

        const token = await this.jwtService.generateToken(
            { id: consultant.id, email: consultant.email, role: Role.Consultant },
            TokenTypeEnum.RESET_PASSWORD,
            '',
        );

        await this.updateConsultant(consultant.id, { recovery_password_digest: token });

        const link = `${process.env.BASE_URL}/consultants/password-change?token=${token}`;

        const subject = await this.commonService.translate('password_recovery_subject', locale);

        await this.commonService.sendEmail({
            to: consultant.email,
            subject: subject,
            templateName: 'password-recovery-new',
            templateContext: {
                link: link,
            },
        });

        return this.commonService.generateMessage('Email sent successfully!');
    }

    public async updatePassword(data: UpdatePasswordDto) {
        const { recoveryPasswordToken, email, app_id, password, confirmPassword } = data;

        const consultant = await this.getConsultant({ email, app_id }, ['id', 'email', 'recovery_password_digest']);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        if (consultant.recovery_password_digest !== recoveryPasswordToken) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: 'Invalid recovery password token.',
            });
        }

        if (password !== confirmPassword) {
            throw new BadRequestException({
                result_code: ErrorStatus.BAD_REQUEST,
                error: 'Password & Confirm Password must be same.',
            });
        }

        const hashedPassword = await argon2.hash(password);

        await this.updateConsultant(consultant.id, { password_digest: hashedPassword, recovery_password_digest: null });

        return this.commonService.generateMessage('Password updated successfully.');
    }

    public async requestCallbackUrl(data: RequestCallBackUrlDto, token: string) {
        const batchIds = data.batch_ids;
        let urlMissing = false;

        const analysisTypes = batchIds.map((b) => b.analysis_type);
        const results: any = [];

        for (let analysisType of analysisTypes || []) {
            let batchId = this.findBatchIdByAnalysis(batchIds, analysisType);

            if (batchId) {
                const result: any[] = await new Promise(async (resolve) => {
                    const result = await this.getWebResultAnalysisByBatchId(batchId, analysisType, token);
                    resolve(result);
                });

                results.push(
                    ...result.map((h: any) => ({
                        measurement: h.measurement,
                        value: h.value,
                        date: h.date,
                        avg_value: h.avg_value,
                    })),
                );
            }
        }

        const customer = await this.customerService.getCustomer(
            { id: data.customer_id },
            ['id', 'birth', 'age', 'skin_color_group_id', 'ethnicity_id', 'email', 'phone'],
            ['gender'],
        );

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }
        customer['customer_id'] = customer.id;
        delete customer.id;

        const consultant = await this.getConsultant(
            { id: data.consultant_id },
            ['id', 'name', 'email'],
            ['consultant_company.consultantCustomzations'],
        );

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }
        consultant['consultant_id'] = consultant.id;
        delete consultant.id;

        const details: any = {
            consultant: consultant,
            customer: customer,
            bc_name: consultant.name,
            branch_name: null,
            device_code: consultant.getSerialNumbers.length ? consultant.getSerialNumbers : null,
            analysis: results,
        };

        let message = '';
        const url = consultant.consultant_company?.consultantCustomzations[0]?.data_exchange_url;

        if (url) {
            const response = await axios
                .post(url, details, { headers: { 'Content-Type': 'application/json' } })
                .catch(() => {
                    message = 'Something went wrong while sending data!';
                });
            if (!response) {
                message = 'Something went wrong while sending data!';
            } else {
                message = 'Success send data to URL';
            }
        } else {
            message = 'Data exchange url is missing for company';
            urlMissing = true;
        }

        if (urlMissing) {
            return { status: ErrorStatus.BAD_REQUEST, message: message };
        } else {
            delete consultant.consultant_company;
            return { status: HttpStatus.OK, body: details, message: message };
        }
    }

    public async getCompany() {
        const companies = await this.companies.getCompanies();
        return companies;
    }

    public async getCompanyDetails(data: ConsultantCompanyDetailsDto) {
        console.log('data: ', data);
        const { consultant_company_id: id } = data;

        console.log('getOneCompany', id);
        const company: any = await this.companies.getOneCompany(Number(id) ?? null);

        const file = await this.companies.getCompaniesFiles(id ?? String(1));

        const attachmentObject: any = {};
        file.forEach((attachment) => {
            const { name, blob } = attachment;
            const { filename, key } = blob;
            const extension = filename.split('.').pop();
            attachmentObject[name] = `${process.env.URL}/api/image/${key}`;
        });

        if (company) {
            company.logo_url = attachmentObject?.logo ?? '';
            company.app_icon_url = attachmentObject?.app_icon ?? '';
            company.background_image_url = attachmentObject?.background_image ?? '';
            company.pmx_banner_url = attachmentObject?.pmx_banner ?? '';
            company.progressbar_image_1_url = attachmentObject?.progressbar_image_1 ?? '';
            company.progressbar_image_2_url = attachmentObject?.progressbar_image_2 ?? '';
            company.progressbar_image_3_url = attachmentObject?.progressbar_image_3 ?? '';
            company.progressbar_image_4_url = attachmentObject?.progressbar_image_4 ?? '';
            company.progressbar_image_5_url = attachmentObject?.progressbar_image_5 ?? '';
            company.progressbar_image_6_url = attachmentObject?.progressbar_image_6 ?? '';
            company.progressbar_image_7_url = attachmentObject?.progressbar_image_7 ?? '';
            company.progressbar_image_8_url = attachmentObject?.progressbar_image_8 ?? '';
        }

        return company;
    }

    public async deleteAccount(userId: number) {
        const consultant = await this.ConsultantsRepository.findOne({
            where: { id: userId },
        });

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        await this.ConsultantsRepository.delete(userId);
        return this.commonService.generateMessage(ResponseMessages.AccountDeleted);
    }

    public async getAllLicense(data: AllLicenseDto) {
        const { application_id, optic_number } = data;

        const device = await this.devices.findOneDevices({ optic_number });
        if (!device) {
            this.commonService.throwNotFoundError();
        }

        const product = await this.productsService.findOneProduct({ device_id: device.id, application_id });
        if (!product) {
            this.commonService.throwNotFoundError();
        }

        const licenses = await this.licenceService.findLicence({ id: product.license_id });
        if (!licenses) {
            this.commonService.throwNotFoundError();
        }

        return {
            data: licenses,
        };
    }

    public async changeLicense(consultantID: number, data: ChangeLicenseDto) {
        // TODO: Send Email
        const { optic_number, license_id } = data;

        const [license, devices] = await Promise.all([
            this.licenceService.findLicence({ id: license_id }),
            this.devices.findDevices({ optic_number }),
        ]);

        if (!license || !devices) {
            this.commonService.throwNotFoundError();
        }

        const deviceIds = devices.map((device: Devices) => device.id);
        const products = await this.productsService.findProduct({
            device_id: In(deviceIds),
            consultant_id: consultantID,
        });

        // add entries in license change history table
        // old_license_id, new_license_id, updater_type, updater_id
        // price = new_change_license_cost(license_id)

        // update new license id in products table

        // const updatedProduct = await this.productsService.updateProduct(product.id, { license_id });

        // if (updatedProduct.affected < 1) {
        this.commonService.throwNotFoundError();
        // }

        return this.commonService.generateMessage('License changed successfully');
    }

    public async notifySalesChangeLicense(data: NotifySalesChangeLicenseDto) {}

    public async calculatePrice(consultantId: number, data: CalculatePriceDto) {
        const { duration, license_id, optic_number, selection_type, time_type } = data;
        let cost = 0;

        let deviceIds = await this.devices.findDevices({ optic_number: In(optic_number.split(',')) }, ['id']);
        deviceIds = deviceIds.map((d: { id: string }) => Number(d.id));

        const products = await this.productsService.findProduct({
            device_id: In(deviceIds),
            consultant_id: consultantId,
        });
        if (!products.length) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                error: ResponseMessages.DeviceNotBelong,
            });
        }

        switch (selection_type) {
            case 'change':
                for (const product of products) {
                    // Check if already expired
                    const remaining = this.daysLeftFromExpired(Number(product.license_period), product.first_use_date);
                    if (remaining < 1) {
                        throw new BadRequestException({
                            result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                            error: `Sorry! Product #${product.id} is already expired!`,
                        });
                    }

                    // Calculate cost
                    cost += await new Promise<number>(async (resolve, reject) => {
                        await this.newChangeLicenseCost(
                            license_id,
                            product.license_id,
                            Number(product.application_id),
                            product.first_use_date,
                            Number(product.id),
                            product.license_period,
                            product.license_remaining_days,
                        )
                            .then((newCost) => resolve(newCost))
                            .catch((error) => {
                                reject(
                                    new BadRequestException({
                                        result_code:
                                            error?.response?.result_code || ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                                        error: error?.response?.error || ResponseMessages.InternalServerError,
                                    }),
                                );
                            });
                    });
                }

                break;
            case 'extend':
                if (!duration || !time_type) {
                    throw new BadRequestException({
                        result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                        error: ResponseMessages.DurationAndTimeTypeRequired,
                    });
                }
                for (const product of products) {
                    const licenseId = product.license_id;
                    cost += await new Promise<number>(async (resolve, reject) => {
                        await this.extendLicenseCost(
                            Number(licenseId),
                            Number(duration),
                            time_type,
                            Number(product.application_id),
                        )
                            .then((newCost) => resolve(newCost))
                            .catch((error) => {
                                reject(
                                    new BadRequestException({
                                        result_code:
                                            error?.response?.result_code || ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                                        error: error?.response?.error || ResponseMessages.InternalServerError,
                                    }),
                                );
                            });
                    });
                }

                break;

            default:
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                    error: ResponseMessages.InvalidSelectionTyoe,
                });
        }

        return { message: 'Success', total_cost: cost.toFixed(2) };
    }

    public async updateLicense(data: UpdateLicenseDto) {
        // TODO: Send Email
        const { optic_number, duration, time_type } = data;

        const device = await this.devices.findOneDevices({ optic_number });
        const product = await this.productsService.findOneProduct({ device_id: device.id });

        if (!device || !product) {
            this.commonService.throwNotFoundError();
        }

        let additionalDays = 0;
        switch (time_type.toLowerCase()) {
            case 'days':
                additionalDays = Number(duration);
                break;
            case 'months':
                additionalDays = Number(duration) * 28; // Assuming 30 days in a month
                break;
            case 'years':
                additionalDays = Number(duration) * 365; // Assuming 365 days in a year
                break;
            default:
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: ResponseMessages.InvalidTimeType,
                });
        }

        const newLicensePeriod = product.license_period + additionalDays;
        const newLicenseRemainingDays = product.license_remaining_days + additionalDays;
        const newDaysRemainingUpdatedAt = new Date();

        const newProduct = await this.productsService.updateProduct(product.id, {
            license_period: newLicensePeriod,
            license_remaining_days: newLicenseRemainingDays,
            days_remaining_updated_at: newDaysRemainingUpdatedAt,
        });

        if (newProduct.affected < 1) {
            this.commonService.throwNotFoundError();
        }

        return this.commonService.generateMessage('License updated successfully');
    }

    public async renewDevices(data: RenewDevicesDto) {}

    public async loginSocial(data: LoginSocialDto, locale = 'en') {
        const { app_id, social_id, email } = data;
        const consultant = await this.validateUserSocial(email, Number(app_id), social_id);
        const checkToken = this.authService.isTokenExpired(consultant.token);

        if (!consultant.email_confirmed) {
            if (!checkToken) {
                const confirmationToken = await this.jwtService.generateToken(
                    { id: consultant.id, email: consultant.email, role: Role.Consultant },
                    TokenTypeEnum.CONFIRMATION,
                    '',
                );
                await this.updateConsultant(consultant.id, {
                    confirm_token: confirmationToken,
                });

                await this.sendAccountConfimationEmail(confirmationToken, consultant.email, locale);
            }

            throw new BadRequestException({
                result_code: ErrorStatus.EMAIL_NOT_CONFIRMED,
                error: ResponseMessages.EmailNotConfirmed,
            });
        }
        const [accessToken, refreshToken] = await this.authService.generateAuthTokens(
            { id: consultant.id, email: consultant.email, role: Role.Consultant },
            '',
        );
        delete consultant.password_digest;
        delete consultant.recovery_password_digest;
        delete consultant.email_confirmed;
        if (consultant?.consultant_company?.applications) {
            consultant.consultant_company.applications = [];
        }

        consultant.products.forEach((product: any) => {
            if (product.device && product.device.consultant_company) {
                product.device.consultant_company.applications = [];
            }
        });

        consultant.token = accessToken;
        consultant.refresh_token = refreshToken;

        await this.updateConsultant(consultant.id, {
            token: refreshToken,
            confirm_token: consultant.confirm_token,
        });

        return {
            id: consultant.id,
            email: consultant.email,
            token: accessToken,
            refresh_token: refreshToken,
            name: consultant.name,
            surname: consultant.surname,
            phone_country_code: consultant.phone_country_code,
            os: consultant.os,
            language: consultant.language,
            phone: consultant.phone,
            address: consultant.address,
            city: consultant.city,
            zip_code: consultant.zip_code,
            state: consultant.state,
            note: consultant.note,
            push_token: consultant.push_token,
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
            country_id: consultant?.country_id ? Number(consultant?.country_id) : null,
            country: consultant.country_details?.name ?? null,
            gender: consultant.gender,
            social: consultant.social,
            country_code: consultant.getContryCode,
            store: consultant.consultant_shop?.name ?? null,
            consultant_shop: consultant.consultant_shop,
            country_details: consultant.country_details,
            optic_number: consultant.getOpticNumbers,
            products: consultant.products,
            consultant_company: consultant.consultant_company,
            consultant_position: consultant.consultant_position,
        };
    }

    public async loginPhone(data: LoginPhoneDto, consultantId: number) {
        const { phone } = data;

        const consultant = await this.getConsultant(
            { id: consultantId },
            ['customers.id', 'customers.name', 'customers.email', 'customers.phone'],
            ['customers'],
        );

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        let customers = [];

        if (consultant.customers) {
            customers = consultant.customers.filter((customer: any) => customer.phone == phone);
        }

        return customers;
    }

    public async getProductRecommendations(data: ProductRecommendationsDto) {}

    public async refreshToken(data: TokenRefreshDto) {
        const { refresh_token, token } = data;
        if (!token) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.InvalidToken,
            });
        }
        const { secret: tokenAccess, time: accessTime } = this.jwtConfig.access;
        const decoded = jwt.verify(token, tokenAccess);
        const { id } = decoded as any;

        const consultant = await this.getConsultant({ id }, ['id', 'token', 'email']);
        if (!consultant) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.InvalidToken,
            });
        }

        if (consultant.token !== refresh_token.trim()) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.NOT_FOUND,
                error: ResponseMessages.InvalidRefreshToken,
            });
        }

        const [accessToken, new_refresh_token] = await this.authService.generateAuthTokens(
            { id: consultant.id, email: consultant.email, role: Role.Consultant },
            '',
        );
        await this.updateConsultant(consultant.id, {
            token: new_refresh_token,
        });

        return {
            token: accessToken,
            refresh_token: new_refresh_token,
        };
    }

    public async enterProducts(consultantId: number, data: EnterProductDto, locale: string = 'en') {
        const { password, application_id, mac_address, lat, lng } = data;

        const macAddress = mac_address ?? null;
        const latt = lat ?? null;
        const long = lng ?? null;
        const isFirstUseDate = data.first_use_date === 'n';
        const optic_number = data.optic_number.toUpperCase();

        // const latt = lat ?? null;
        // const long = lng ?? null;
        // const macAddress = mac_address ?? '';

        let useDate = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Format: YYYYMMDD
        let useTime = new Date().toISOString().slice(11, 16).replace(/:/g, ''); // Format: HHMM

        const consultant = await this.findOneConsultant(consultantId);

        if (!consultant) {
            this.commonService.throwNotFoundError();
        }

        const device = await this.devices.findOneDevices({ optic_number, pwd: password });

        if (!device) {
            throw new BadRequestException({
                result_code: ErrorStatus.PRODUCT_NOT_FOUND,
                error: ResponseMessages.ProductNotFound,
            });
        }

        // if (device.use_yn !== 'Y') {
        //     throw new BadRequestException({
        //         result_code: ErrorStatus.DEVICE_ALREADY_IN_USE,
        //         error: ResponseMessages.DeviceAlreadyInUse,
        //     });
        // }

        const device_id = device.id;
        console.log('application_id ---------======>', device_id);
        const product = await this.productsService.findOneProduct(
            { device_id, application_id },
            [],
            ['license', 'application', 'consultant'],
        );

        if (!product || (product && !product.license)) {
            throw new BadRequestException({
                result_code: ErrorStatus.LICENSE_NOT_FOUND,
                error: ResponseMessages.LicenseNotFound,
            });
        }

        // if (product.consultant && product.consultant_id != consultant.id) {
        //     throw new ConflictException({
        //         result_code: ErrorStatus.DEVICE_ALREADY_REGISTERED,
        //         error: ResponseMessages.DeviceAlreadyRegistered,
        //     });
        // }

        const beforeUseDate = product.use_date;

        const updateProductResponse = await this.productsService.updateProduct(product.id, {
            consultant_id: consultant.id,
            use_date: useDate,
            use_time: useTime,
            mac_address: macAddress,
            app_use_yn: 'Y',
        });

        if (!updateProductResponse.affected) {
            throw new BadRequestException({
                result_code: ErrorStatus.LICENSE_NOT_UPDATED,
                error: ResponseMessages.LicenseNotUpdated,
            });
        }

        let updatedProduct: any = await this.productsService.findOneProduct(
            { id: product.id },
            [],
            ['device', 'license', 'application'],
        );

        const versionData = {
            itemId: product.id,
            itemType: VersionItemType.Product,
            event: VersionEvent.Update,
            object: JSON.stringify(product),
            objectChanges: JSON.stringify(updatedProduct),
            comments: 'done by api, triggered by user',
            whodunnit: consultant.id,
            createdAt: new Date(),
        };

        await this.versionsRepository.save(versionData);

        if (device.consultant_company_id) {
            await this.updateConsultant(consultant.id, { consultant_company_id: device.consultant_company_id });
        }

        if (beforeUseDate == null || (beforeUseDate == '' && product.use_date)) {
            if (!isFirstUseDate) {
                await this.productsService.updateProduct(product.id, {
                    consultant_id: consultant.id,
                    first_use_date: product.use_date?.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
                });

                updatedProduct = await this.productsService.findOneProduct(
                    { id: product.id },
                    [],
                    ['device', 'license', 'application'],
                );

                const versionData = {
                    itemId: product.id,
                    itemType: VersionItemType.Product,
                    event: VersionEvent.Update,
                    object: JSON.stringify(product),
                    objectChanges: JSON.stringify(updatedProduct),
                    comments: 'done by api, triggered by user',
                    whodunnit: consultant.id,
                    createdAt: new Date(),
                };

                await this.versionsRepository.save(versionData);

                if (consultant.email) {
                    const subject = await this.commonService.translate('device_activation_subject', locale);

                    await this.commonService.sendEmail({
                        to: consultant.email,
                        subject: subject,
                        templateName: 'device-activation',
                        templateContext: {
                            deviceNumber: device.optic_number,
                            email: consultant.email,
                        },
                    });
                }
            }
        }

        await this.devices.updateDevice(device.id, { lat: latt, lng: long });

        if (device.consultant_company_id) {
            updatedProduct.device.consultant_company = await this.getCompanyDetails({
                consultant_company_id: device.consultant_company_id,
            });
        }

        const expiredDate = this.expiredDate(product.first_use_date, product.license_period);
        let formattedDate;

        if (expiredDate) {
            const month = (expiredDate.getMonth() + 1).toString().padStart(2, '0');
            const date = expiredDate.getDate().toString().padStart(2, '0');
            const year = expiredDate.getFullYear();
            formattedDate = `${year}-${month}-${date}`;
        }
        updatedProduct.expired_date = formattedDate ?? null;
        updatedProduct.is_expired = updatedProduct.expired_date ? new Date() > updatedProduct.expired_date : false;

        const files = await this.companies.getCompaniesFiles(String(updatedProduct.application.id));
        const attachmentObject: any = {};
        files.forEach((attachment) => {
            const { name, blob } = attachment;
            const { key } = blob;
            attachmentObject[name] = `${process.env.URL}/api/image/${key}`;
        });
        updatedProduct.application.apk_url = attachmentObject.apk;
        updatedProduct.application.old_apk_url = attachmentObject.old_apk;
        updatedProduct.application.app_icon = attachmentObject.icon;

        return {
            result_code: '0',
            product: updatedProduct,
        };
    }

    async getNotifications(id: number, data: GetNotificationsDto) {
        const notifications = await this.findNotifications(
            { target_id: id, target_type: TargetType.Consultant },
            [],
            [],
            data.title ?? '',
            Number(data.page),
            Number(data.per),
        );

        return notifications;
    }

    async deleteNotification(id: number) {
        const notifications = await this.notificationRepository.delete(id);

        if (!notifications.affected) {
            throw new BadRequestException({
                result_code: ErrorStatus.BAD_REQUEST,
                error: ResponseMessages.NotificationNotDeleted,
            });
        }

        return this.commonService.generateMessage(ResponseMessages.NotificationDelete);
    }

    // async resetPassword(token: string, resetData: ResetPasswordDto) {
    //     const data = await this.userService.findByPasswordToken(token);
    //     const currentDate = new Date();
    //     if (!data) {
    //         throw new UnauthorizedException('Please verify you have a valid token');
    //     }
    //     const errors = [];
    //     // Verify that the reset token is valid and hasn't expired
    //     const timestamp1: any = new Date(data.resetPasswordSentAt);
    //     const timestamp2: any = new Date(currentDate);

    //     // Calculate the time difference in milliseconds
    //     const timeDifference = timestamp1 - timestamp2;

    //     // Define the maximum allowed difference in milliseconds (10 minutes)
    //     const maxDifference = 10 * 60 * 1000; // 10 minutes in milliseconds

    //     if (timeDifference < maxDifference) {
    //         //Time difference is greater than 10 minutes
    //         if (resetData.password.length < 6) {
    //             errors.push('Password should contain more than 6 letters');
    //         }

    //         if (!resetData?.confirmPassword) {
    //             errors.push('You need to confirm your password');
    //         }
    //         if (resetData.password !== resetData.confirmPassword) {
    //             errors.push('password does not match');
    //         }

    //         if (errors.length > 0) {
    //             console.log(errors);
    //             throw new BadRequestException(errors.join('\n'));
    //         }

    //         const encyptedPwd = await argon2.hash(resetData.password);
    //         data.argonPassword = encyptedPwd;
    //         data.resetPasswordSentAt = null;
    //         data.resetPasswordToken = null;

    //         return this.userService.updateUserPassword(data.id, data);
    //     } else {
    //         throw new UnauthorizedException('Time already expired'); // Time difference is not greater than 10 minutes
    //     }

    //     // Retrieve the user's email associated with the token
    //     // Update the user's password in your database with the new password
    //     // Invalidate the reset token
    //     // Return a success message or appropriate response
    // }

    // async confirmAccount(token: string) {
    //     const data = await this.userService.findByAdminToken(token);
    //     const currentDate = new Date();
    //     if (!data) {
    //         throw new UnauthorizedException('Please verify you have a valid token');
    //     }
    //     const errors = [];
    //     const checkToken = this.authService.isTokenExpired(data.adminToken);
    //     // Verify that the reset token is valid and hasn't expired
    //     // const timestamp1: any = new Date(data.adminTokenCreatedAt);
    //     // const timestamp2: any = new Date(currentDate);

    //     // Calculate the time difference in milliseconds
    //     // const timeDifference = timestamp1 - timestamp2;

    //     // // Define the maximum allowed difference in milliseconds (10 minutes)
    //     // const maxDifference = 12 * 60 * 60 * 1000; // 12 houes  in milliseconds

    //     if (checkToken === true) {
    //         //Time difference is greater than 12 hours
    //         data.userConfirm = true;
    //         return this.userService.confirmUser(data);
    //     } else {
    //         throw new UnauthorizedException('Token Time already expired, Please request another conirmation'); // Time difference is not greater than 10 minutes
    //     }

    //     // Retrieve the user's email associated with the token
    //     // Update the user's password in your database with the new password
    //     // Invalidate the reset token
    //     // Return a success message or appropriate response
    // }

    daysLeftFromExpired(licensePeriod: number, firstUseDate: string) {
        let periodLeft = 0;
        if (licensePeriod && firstUseDate) {
            const today = new Date();
            const daysSinceFirstUse = Math.floor(
                (today.getTime() - new Date(firstUseDate).getTime()) / (1000 * 60 * 60 * 24),
            ); // Convert milliseconds to days
            periodLeft = licensePeriod - daysSinceFirstUse;
        } else {
            periodLeft = licensePeriod;
        }
        return periodLeft;
    }

    async newChangeLicenseCost(
        newLicenseId: string,
        oldLicenseId: string,
        applicationId: number,
        firstUseDate: string,
        productId: number,
        licensePeriod: number,
        remainingDays: number,
    ): Promise<number> {
        let cost = 0;
        const applicationLicense = await this.licenceService.findApplicationLicence({
            applicationId: applicationId,
            licenseId: newLicenseId,
        });
        const oldApplicationLicense = await this.licenceService.findApplicationLicence({
            applicationId: applicationId,
            licenseId: oldLicenseId,
        });

        if (!applicationLicense || !oldApplicationLicense) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                error: `License cost is not defined by admin for this application (application_id = ${
                    applicationId ? applicationId : ''
                })`,
            });
        }

        // check if device is used or not
        const licenseHistories = await this.licenceService.findLicenceHistories(
            { licensableId: productId, licensableType: LicenseType.Product },
            { createdAt: { direction: 'DESC' } },
        );
        const licenseHistory = licenseHistories[licenseHistories.length - 1];

        if (firstUseDate) {
            // Check for license history
            if (licenseHistory) {
                const extendedDays = this.expectedDaysIncrease(
                    licenseHistory.extended,
                    licenseHistory.extendType,
                    firstUseDate,
                    licensePeriod,
                );
                if (licenseHistories.length > 1) {
                    let initialCost, newCost, extendedPrice, newExtendedPrice;
                    let initialDays = this.getInitialDaysSumFromHistory(licenseHistories, firstUseDate, licensePeriod);
                    initialDays = this.getInitialDays(initialDays, licensePeriod);

                    switch (initialDays) {
                        case 1095:
                            initialCost = oldApplicationLicense.licenseChangeThreeYearPrice;
                            newCost = applicationLicense.licenseChangeThreeYearPrice;
                            extendedPrice = oldApplicationLicense.licenseExtendThreeYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendThreeYearPrice;
                            break;
                        case 730:
                            initialCost = oldApplicationLicense.licenseChangeTwoYearPrice;
                            newCost = applicationLicense.licenseChangeTwoYearPrice;
                            extendedPrice = oldApplicationLicense.licenseExtendTwoYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendTwoYearPrice;
                            break;
                        case 365:
                            initialCost = oldApplicationLicense.licenseChangeOneYearPrice;
                            newCost = applicationLicense.licenseChangeOneYearPrice;
                            extendedPrice = oldApplicationLicense.licenseExtendOneYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendOneYearPrice;
                            break;
                        case 30:
                            initialCost = oldApplicationLicense.licenseChangeOneMonthPrice;
                            newCost = applicationLicense.licenseChangeOneMonthPrice;
                            extendedPrice = oldApplicationLicense.licenseExtendOneMonthPrice;
                            newExtendedPrice = applicationLicense.licenseExtendOneMonthPrice;
                            break;
                        default:
                            throw new BadRequestException({
                                result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                                error: ResponseMessages.InvalidInitialDays,
                            });
                    }

                    if (remainingDays === extendedDays) {
                        cost = newCost - extendedPrice;
                    } else if (remainingDays < extendedDays) {
                        let extensionUsedDays = extendedDays - remainingDays;
                        let totalDays = extendedDays - extensionUsedDays;
                        cost = totalDays * (newCost / extendedDays) - totalDays * (extendedPrice / extendedDays);
                    } else if (remainingDays >= extendedDays) {
                        let upgradeCosts = this.getUpgradeCosts(applicationLicense);
                        cost = await this.calculateUpgradeCost(
                            upgradeCosts,
                            initialCost,
                            productId,
                            firstUseDate,
                            licensePeriod,
                        );
                    }
                } else {
                    let initialCost, newCost, extendedPrice, newExtendedPrice;
                    const initialDays = this.getInitialDays(extendedDays, licensePeriod);

                    switch (initialDays) {
                        case 1095:
                            initialCost = oldApplicationLicense.licenseChangeThreeYearPrice;
                            newCost = applicationLicense.licenseChangeThreeYearPrice;
                            extendedPrice = oldApplicationLicense.licenseExtendThreeYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendThreeYearPrice;
                            break;
                        case 730:
                            initialCost = oldApplicationLicense.licenseChangeTwoYearPrice;
                            newCost = applicationLicense.licenseChangeTwoYearPrice;
                            extendedPrice = oldApplicationLicense.licenseExtendTwoYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendTwoYearPrice;
                            break;
                        case 365:
                            initialCost = oldApplicationLicense.licenseChangeOneYearPrice;
                            newCost = applicationLicense.licenseChangeOneYearPrice;
                            extendedPrice = oldApplicationLicense.licenseExtendOneYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendOneYearPrice;
                            break;
                        case 30:
                            initialCost = oldApplicationLicense.licenseChangeOneMonthPrice;
                            newCost = applicationLicense.licenseChangeOneMonthPrice;
                            extendedPrice = oldApplicationLicense.licenseExtendOneMonthPrice;
                            newExtendedPrice = applicationLicense.licenseExtendOneMonthPrice;
                            break;
                        default:
                            throw new BadRequestException({
                                result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                                error: ResponseMessages.InvalidInitialDays,
                            });
                    }

                    if (remainingDays === extendedDays) {
                        cost = newCost - extendedPrice;
                    } else if (remainingDays < extendedDays) {
                        let totalDays = remainingDays;
                        cost = totalDays * (newCost / extendedDays) - totalDays * (extendedPrice / extendedDays);
                    } else if (remainingDays >= extendedDays) {
                        const pendingDays = remainingDays - extendedDays;
                        const perDayCost = pendingDays * (initialCost / initialDays);
                        cost = newCost - initialCost * perDayCost;
                    }
                }
            } else {
                const initialDays = this.getInitialDays(0, licensePeriod);
                let initialCost, newCost;
                switch (initialDays) {
                    case 1095:
                        initialCost = oldApplicationLicense.licenseChangeThreeYearPrice;
                        newCost = applicationLicense.licenseChangeThreeYearPrice;
                        break;
                    case 730:
                        initialCost = oldApplicationLicense.licenseChangeTwoYearPrice;
                        newCost = applicationLicense.licenseChangeTwoYearPrice;
                        break;
                    case 365:
                        initialCost = oldApplicationLicense.licenseChangeOneYearPrice;
                        newCost = applicationLicense.licenseChangeOneYearPrice;
                        break;
                    case 30:
                        initialCost = oldApplicationLicense.licenseChangeOneMonthPrice;
                        newCost = applicationLicense.licenseChangeOneMonthPrice;
                        break;

                    default:
                        throw new BadRequestException({
                            result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                            error: ResponseMessages.InvalidInitialDays,
                        });
                }
                cost = newCost - remainingDays * (initialCost / initialDays);
            }
        } else {
            // Check for license history
            if (licenseHistory) {
                const daysIncreased = this.expectedDaysIncrease(
                    licenseHistory.extended,
                    licenseHistory.extendType,
                    firstUseDate,
                    licensePeriod,
                );
                let extendedPrice, newExtendedPrice;

                switch (licenseHistory.extendType.toLowerCase()) {
                    case 'years':
                        if (licenseHistory.extended === 1) {
                            extendedPrice = oldApplicationLicense.licenseExtendOneYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendOneYearPrice;
                        } else if (licenseHistory.extended === 2) {
                            extendedPrice = oldApplicationLicense.licenseExtendTwoYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendTwoYearPrice;
                        } else if (licenseHistory.extended === 3) {
                            extendedPrice = oldApplicationLicense.licenseExtendThreeYearPrice;
                            newExtendedPrice = applicationLicense.licenseExtendThreeYearPrice;
                        } else {
                            extendedPrice = oldApplicationLicense.licenseExtendOneYearPrice * licenseHistory.extended;
                            newExtendedPrice = applicationLicense.licenseExtendOneYearPrice * licenseHistory.extended;
                        }
                        break;

                    case 'months':
                        extendedPrice = oldApplicationLicense.licenseExtendOneMonthPrice * licenseHistory.extended;
                        newExtendedPrice = applicationLicense.licenseExtendOneMonthPrice * licenseHistory.extended;
                        break;

                    case 'days':
                        extendedPrice =
                            Number((oldApplicationLicense.licenseExtendOneMonthPrice / 30).toFixed(2)) *
                            licenseHistory.extended;
                        newExtendedPrice =
                            Number((applicationLicense.licenseExtendOneMonthPrice / 30).toFixed(2)) *
                            licenseHistory.extended;
                        break;

                    default:
                        throw new BadRequestException({
                            result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                            error: ResponseMessages.InvalidExtendedType,
                        });
                }

                const initialDays = this.getInitialDays(daysIncreased, licensePeriod);
                switch (initialDays) {
                    case 1095:
                        cost =
                            applicationLicense.licenseChangeThreeYearPrice +
                            newExtendedPrice -
                            (oldApplicationLicense.licenseChangeThreeYearPrice + extendedPrice);
                        break;
                    case 730:
                        cost =
                            applicationLicense.licenseChangeTwoYearPrice +
                            newExtendedPrice -
                            (oldApplicationLicense.licenseChangeTwoYearPrice + extendedPrice);
                        break;
                    case 365:
                        cost =
                            applicationLicense.licenseChangeOneYearPrice +
                            newExtendedPrice -
                            (oldApplicationLicense.licenseChangeOneYearPrice + extendedPrice);
                        break;
                    case 30:
                        cost =
                            applicationLicense.licenseChangeOneMonthPrice +
                            newExtendedPrice -
                            (oldApplicationLicense.licenseChangeOneMonthPrice + extendedPrice);
                        break;

                    default:
                        throw new BadRequestException({
                            result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                            error: ResponseMessages.InvalidInitialDays,
                        });
                }
            } else {
                // No license history
                switch (licensePeriod) {
                    case 1095:
                        cost = Number(oldApplicationLicense.licenseChangeThreeYearPrice.toFixed(2));
                        cost = applicationLicense.licenseChangeThreeYearPrice - remainingDays * (cost / 1095);
                        break;
                    case 730:
                        cost = Number(oldApplicationLicense.licenseChangeTwoYearPrice.toFixed(2));
                        cost = applicationLicense.licenseChangeTwoYearPrice - remainingDays * (cost / 730);
                        break;
                    case 365:
                        cost = Number(oldApplicationLicense.licenseChangeOneYearPrice.toFixed(2));
                        cost = applicationLicense.licenseChangeOneYearPrice - remainingDays * (cost / 365);
                        break;
                    case 30:
                        cost = Number(oldApplicationLicense.licenseChangeOneMonthPrice.toFixed(2));
                        cost = applicationLicense.licenseChangeOneMonthPrice - remainingDays * (cost / 30);
                        break;

                    default:
                        throw new BadRequestException({
                            result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                            error: ResponseMessages.InvalidLicensePeriod,
                        });
                }
            }
        }

        return cost;
    }

    expiredDate(firstUseDate: string, licensePeriod: number) {
        if (firstUseDate && licensePeriod) {
            return new Date(new Date(firstUseDate).getTime() + licensePeriod * 24 * 60 * 60 * 1000); // Convert days to milliseconds
        }
    }

    expectedDaysIncrease(days: number, type: string = 'days', firstUseDate: string, licensePeriod: number) {
        let currentDate = new Date();
        let expireDate;
        if (firstUseDate && licensePeriod) {
            let expirationDate = this.expiredDate(firstUseDate, licensePeriod);
            if (this.daysLeftFromExpired(licensePeriod, firstUseDate) < 1) {
                expirationDate = currentDate;
            }
            expireDate = new Date(expirationDate.getTime() + days * this.timeTypeToMilliseconds(type));
        } else {
            expireDate = currentDate;
        }
        const calculatedDays = Math.round(
            (new Date(expireDate).getTime() - new Date(currentDate).getTime()) / (1000 * 60 * 60 * 24),
        ); // milliseconds to days
        return calculatedDays;
    }

    timeTypeToMilliseconds(type: string) {
        switch (type) {
            case 'days':
                return 24 * 60 * 60 * 1000; // 1 day in milliseconds
            case 'months':
                return 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
            case 'years':
                return 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds
            default:
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                    error: ResponseMessages.InvalidTimeType,
                });
        }
    }

    getInitialDaysSumFromHistory(licenseHistories: any, firstUseDate: string, licensePeriod: number) {
        let sum = 0;
        licenseHistories.map((lh: any) => {
            sum += this.expectedDaysIncrease(lh.extended, lh.extendType, firstUseDate, licensePeriod);
        });
        return sum;
    }

    getInitialDays(daysIncreased: number, licensePeriod: number) {
        const num = licensePeriod - daysIncreased;
        const a = [30, 365, 730, 1095];
        const closest = a.reduce((prev, curr) => (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev));
        return closest;
    }

    getUpgradeCosts(al: any) {
        return {
            '365': al.licenseChangeOneYearPrice,
            '730': al.licenseChangeTwoYearPrice,
            '1025': al.licenseChangeThreeYearPrice,
            '31': al.licenseChangeOneMonthPrice,
        };
    }

    async calculateUpgradeCost(
        upgradeCosts: any,
        initialCost: number,
        productId: number,
        firstUseDate: string,
        licensePeriod: number,
    ) {
        let totalUpgradeCost = 0;
        let totalPaid = initialCost;

        const licenseHistory = await this.licenceService.findLicenceHistory(
            { licensable_id: productId, licensable_type: LicenseType.Product },
            { createdAt: { direction: 'DESC' } },
        );
        if (licenseHistory) {
            let startDate = new Date(licenseHistory.createdAt);
            const expectedDays = this.expectedDaysIncrease(
                licenseHistory.extended,
                licenseHistory.extendType,
                firstUseDate,
                licensePeriod,
            );
            let endDate = new Date(
                new Date(licenseHistory.expectedExpiryDate).getTime() -
                    new Date(expectedDays * 24 * 60 * 60 * 1000).getTime(), // Convert days to milliseconds
            );
            totalUpgradeCost = this.checkCost(startDate, endDate, upgradeCosts);
            totalPaid = initialCost;
            if (firstUseDate) {
                if (licenseHistory) {
                    // #TODO : expected_days_increase function implementation
                }
                const licenseHistories = await this.licenceService.findLicenceHistories({
                    licensable_id: productId,
                    licensable_type: LicenseType.Product,
                    expectedExpiryDate: Not(null),
                });
                licenseHistories.map((lh) => {
                    const tempExpectedDays =
                        this.expectedDaysIncrease(
                            licenseHistory.extended,
                            licenseHistory.extendType,
                            firstUseDate,
                            licensePeriod,
                        ) - 1;
                    startDate = new Date(
                        new Date(lh.expectedExpiryDate).getTime() -
                            new Date(tempExpectedDays * 24 * 60 * 60 * 1000).getTime(),
                    );
                    endDate = lh.expectedExpiryDate;
                    totalUpgradeCost = this.checkCost(startDate, endDate, upgradeCosts);
                    totalPaid += lh.price;
                });
                totalUpgradeCost = Math.round(Math.max(totalUpgradeCost - totalPaid, 0));
                return totalUpgradeCost;
            } else {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: ResponseMessages.LicenseHistoryNotFound,
                });
            }
        }
    }

    checkCost(startDate: Date, endDate: Date, upgradeCosts: any) {
        let totalUpgradeCost = 0;
        let currentDate = new Date();

        if (currentDate <= endDate) {
            new Date(endDate).getTime();
            Math.max(new Date(currentDate).getTime(), new Date(startDate).getTime());
            let remainingDays = Math.floor(
                Math.max(
                    (new Date(endDate).getTime() - Math.max(currentDate.getTime(), new Date(startDate).getTime())) /
                        (1000 * 60 * 60 * 24),
                    0,
                ),
            );

            let closestDays = Object.keys(upgradeCosts)
                .map((c) => parseInt(c, 10))
                .reduce((prev, curr) =>
                    Math.abs(curr - remainingDays) < Math.abs(prev - remainingDays) ? curr : prev,
                );

            let upgradeCostForPeriod = upgradeCosts[closestDays.toString()];
            let dailyUpgradeCost = parseFloat(upgradeCostForPeriod) / closestDays;
            totalUpgradeCost = dailyUpgradeCost * remainingDays;
        }
        return totalUpgradeCost;
    }

    async extendLicenseCost(licenseId: number, duration: number, type: string, applicationId: number) {
        const al = await this.licenceService.findApplicationLicence({
            applicationId: applicationId,
            licenseId: licenseId,
        });

        if (!al) {
            this.commonService.throwNotFoundError();
        }

        let cost;
        switch (type.toLowerCase()) {
            case 'months':
                cost = al.licenseExtendOneMonthPrice * duration;
                break;

            case 'years':
                switch (duration) {
                    case 3:
                        cost = al.licenseExtendThreeYearPrice;
                        break;
                    case 2:
                        cost = al.licenseExtendTwoYearPrice;
                        break;
                    case 1:
                        cost = al.licenseExtendOneYearPrice;
                        break;

                    default:
                        throw new BadRequestException({
                            result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                            error: ResponseMessages.LicenseCanNotExtend,
                        });
                }
                break;

            case 'days':
                const cal = Number((al.licenseExtendOneMonthPrice / 30).toFixed(3));
                cost = cal * duration;
                break;
            default:
                throw new BadRequestException({
                    result_code: ErrorStatus.CUSTOM_ERROR_CONSULTANT,
                    error: ResponseMessages.InvalidTimeType,
                });
        }

        return cost;
    }

    findBatchIdByAnalysis(batchIds: { analysis_type: string; batch_id: string }[], analysisType: string) {
        return batchIds.find((b) => b.analysis_type === analysisType)?.batch_id;
    }

    async getWebResultAnalysisByBatchId(batchId: string, analysisType: string, token: string) {
        let result, baseUrl;

        switch (analysisType) {
            case 'CNDP Skin':
                baseUrl = `${process.env.CNDP_SKIN_ANALYSIS_URL}/web-result/cndpskin/${batchId}`;
                break;
            case 'CNDP Hair':
                baseUrl = `${process.env.CNDP_HAIR_ANALYSIS_URL}/web-result/cndphair/${batchId}`;
                break;
            case 'FFA':
                baseUrl = `${process.env.FFA_ANALYSIS_URL}/web-result/ffa/${batchId}`;
                break;
            case 'CFA':
                baseUrl = `${process.env.CFA_ANALYSIS_URL}/web-result/cfa-cpu/${batchId}?page=1&limit=200`;
                break;
            case 'CMA Hair':
                baseUrl = `${process.env.CMA_HAIR_ANALYSIS_URL}/web-result/cmahair/${batchId}?page=1&limit=200`;
                break;
            case 'CMA Skin':
                baseUrl = `${process.env.CMA_SKIN_ANALYSIS_URL}/web-result/cmaskin/${batchId}?page=1&limit=200`;
                break;
            default:
                throw new BadRequestException({
                    result_code: ErrorStatus.BAD_REQUEST,
                    error: ResponseMessages.InvalidAnalysisType,
                });
        }

        try {
            const response = await axios.get(baseUrl, {
                timeout: 10000,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            result = response.data.body || response.data.data;
            return result;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException({
                result_code: ErrorStatus.SERVER_ERROR,
                error: error.message || ResponseMessages.InternalServerError,
            });
        }
    }
}

// "total_size": 5,
// "current_page_size": 5,
// "current_page": 1,
// "total_pages": 1
