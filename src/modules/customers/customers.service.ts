import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsSelectByString, In, Like } from 'typeorm';
import { TokenTypeEnum } from 'src/jwt/enums/auth-token.enum';

import { Customers } from '@/src/common/entities/crmEntities/Customers.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from 'src/jwt/jwt.service';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import {
    ChangePasswordCustomerDto,
    UpdateCustomersDto,
    CountriesListDto,
    PresignedUploadDto,
    ResendConfirmationDto,
    PasswordDto,
    DeleteCustomerDto,
} from '@/src/modules/customers/customers.dto';
import { ConsultantCompanyService } from '../consultantCompany/consultantCompany.service';
import { DeviceService } from '../devices/devices.service';
import { IMessage } from 'src/common/interfaces/message.interface';
import { CommonService } from 'src/common/common.service';
import { CrmDataReplicationService } from '../dataReplication/consultantDataReplication/consultantDataReplication.service';
import { ConsultantsService } from '../consultants/consultants.service';
import { ConsultantShopsService } from '../consultantShops/consultantShops.service';
import { ConsultantPositionsService } from '../consultantPositions/consultantPositions.service';
import { GendersService } from '../genders/genders.service';
import { CountriesService } from '../countries/countries.service';
import { EthinicitiesService } from '../ethinicities/ethinicities.service';
import { SkinColorGroupsService } from '../skinColorGroups/skinColorGroups.service';
import { CustomerDataReplicationService } from '../dataReplication/customerDataReplication/customerDataReplication.service';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { ProductsService } from '../products/products.service';

import { Role } from '@/src/common/enums/role.enum';
import { EmailSubject } from '@/src/common/constants/email-subjects';
import { UpdateCrmCustomersDto } from '../crm/crm.dto';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ConfirmHtmlDto } from '../consultants/consultants.dto';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import { ApplicationsRepository } from '@/src/common/repositories/crm';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customers)
        private readonly CustomersRepository: Repository<Customers>,

        private readonly authService: AuthService,
        private readonly jwtService: JwtService,

        private readonly commonService: CommonService,

        private readonly countries: CountriesService,
        private readonly ethnicities: EthinicitiesService,
        private readonly skinColorGroups: SkinColorGroupsService,
        private readonly replicateCustomer: CustomerDataReplicationService,
        @Inject(forwardRef(() => ProductsService)) private readonly productService: ProductsService, // TODO: Resolve dependency issue // private readonly customerConsentsService: CustomerConsentsService,

        private readonly applicationsRepository: ApplicationsRepository,
    ) {}

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

    async insertCustomer(customer: Customers) {
        const newCustomer = this.CustomersRepository.create(customer);
        const result = await this.CustomersRepository.save(newCustomer);
        return result;
    }

    async createCrmCustomer(customer: any) {
        const result = await this.CustomersRepository.save(customer);
        return result;
    }

    async getCustomer(conditions: any, selections?: string[], includes?: string[]) {
        const customer: any = await this.CustomersRepository.findOne({
            where: conditions,
            select: selections
                ? (selections as FindOptionsSelectByString<Customers>)
                : ['id', 'name', 'email', 'app_id'],
            relations: includes ? includes : [],
        });

        return customer;
    }

    async getCustomers(
        conditions: any,
        selections?: string[],
        includes?: string[],
        search?: string,
        page?: number,
        per?: number,
    ) {
        if (!page) page = 1;
        if (!per) per = 10;
        const skip = (page - 1) * per;

        if (search) {
            conditions = {
                ...conditions,
                name: Like(`%${search}%`),
            };
        }

        const customers: any = await this.CustomersRepository.find({
            where: conditions,
            select: selections
                ? (selections as FindOptionsSelectByString<Customers>)
                : ['id', 'name', 'email', 'app_id'],
            relations: includes ? includes : [],
            take: per,
            skip: skip,
        });

        return customers;
    }
    //
    // async function getPaginatedUsers(page: number, perPage: number): Promise<PaginationResult<User>> {
    //     const userRepository = getRepository(User);

    //     // Get total number of users
    //     const total_size = await userRepository.count();

    //     // Get the users for the current page
    //     const [data, current_page_size] = await userRepository.findAndCount({
    //         skip: (page - 1) * perPage,
    //         take: perPage
    //     });

    //     // Convert gender to number
    //     data.forEach(user => {
    //         user.gender = Number(user.gender);
    //     });

    //     // Calculate total pages
    //     const total_pages = Math.ceil(total_size / perPage);

    //     return {
    //         data,
    //         total_size,
    //         current_page_size,
    //         current_page: page,
    //         total_pages,
    //         perPage
    //     };
    // }

    async getCustomersByConsultant(
        conditions: any,
        selections?: any,
        search?: string,
        page?: number,
        perPage?: number,
    ): Promise<PaginationResult<Customers>> {
        if (!page) page = 1;
        if (!perPage) perPage = 20;
        const skip = (page - 1) * perPage;

        const where = search
            ? [{ email: Like(`%${search}%`) }, { name: Like(`%${search}%`) }, { surname: Like(`%${search}%`) }]
            : {};

        if (search) {
            conditions = {
                ...conditions,
                where,
            };
        }

        const total_size = await this.CustomersRepository.count({
            where: conditions,
        });

        const total_pages = Math.ceil(total_size / perPage);

        const [data, current_page_size] = await this.CustomersRepository.findAndCount({
            where: conditions,
            select: selections
                ? (selections as FindOptionsSelectByString<Customers>)
                : ['id', 'name', 'email', 'app_id'],
            take: perPage,
            skip: skip,
        });

        data.forEach((customer: any) => {
            customer.gender = customer.gender !== null ? Number(customer.gender) : null;
        });

        return {
            data,
            total_size,
            current_page_size,
            current_page: page,
            total_pages,
            perPage,
        };
    }

    async getCustomerById(id: string) {
        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'notes',
            'push_token',
            'app_id',
            'company_id',
            'consultant_id',
            'skin_color_group_id',
            'ethnicity_id',
            'sign_in_count',
            'image_url',
            'country_id',
            'birth',
            'token',
            'social',
            'password_digest',
            'email_confirmed',
        ];
        const customer: any = await this.getCustomer({ id: id }, selections);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }
        return customer;
    }

    async updateCustomer(id: string, customerInput: any) {
        const result = await this.CustomersRepository.update(id, customerInput);
        return result;
    }

    async createCustomer(newCustomer: any) {
        try {
            const customer: any = {
                password_digest: await argon2.hash(newCustomer.password),
                email: newCustomer.email,
                app_id: newCustomer.app_id,
                email_confirmed: newCustomer.email_confirmed ? newCustomer.email_confirmed : false,
                confirm_token: newCustomer.confirm_token,
                phone: newCustomer.phone ? newCustomer.phone : null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const result: any = await this.insertCustomer(customer);
            return result;
        } catch (e) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: ResponseMessages.CustomerNotCreated,
            });
        }
    }

    async validateCustomer(email: string, app_id: number, password: string) {
        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'notes',
            'push_token',
            'app_id',
            'company_id',
            'consultant_id',
            'skin_color_group_id',
            'ethnicity_id',
            'sign_in_count',
            'image_url',
            'country_id',
            'gender_id',
            'birth',
            'token',
            'social',
            'password_digest',
            'email_confirmed',
        ];

        const includes = [
            'country',
            'products',
            'products.device',
            'products.license',
            'products.device.consultant_company',
            'products.device.consultant_company.applications',
            'products.application',
        ];

        let customer: any = await this.getCustomer({ email, app_id }, selections, includes);

        if (customer?.products && customer?.products.length === 0) {
            const product = await this.productService.getProducts(customer?.id);
            customer.products = product;
        }

        customer?.products.forEach((product: any) => {
            product.expired_date = product.getExpiredDate;
            product.is_expired = product.getIsExpired;
        });

        if (customer === null) {
            // replicateUserToMasterOperation
            customer = await this.replicateCustomer.replicateUserToMasterOperation(email, app_id, selections, includes);
            // customer = await this.replicateCustomer.userExists(email, app_id, selections, includes);

            // throw new BadRequestException({
            //     result_code: ErrorStatus.LOGIN_FAILED,
            //     error: ResponseMessages.LoginFailed,
            // });
        }

        if (customer?.optic_number) customer.optic_number = customer?.getOpticNumbers;
        if (customer?.consultant_name) customer.consultant_name = customer?.getConsultantName;

        // customer.gender = customer.gender !== null ? Number(customer.gender.id) : customer.gender;
        customer.consultant_name = customer?.getConsultantName;
        customer.optic_number = customer?.getOpticNumbers;
        customer.gender = customer.gender_id;

        const confirmPwd = await this.verifyPassword(password, customer?.password_digest ?? null);

        if (confirmPwd) {
            return { ...customer };
        }

        throw new BadRequestException({
            result_code: ErrorStatus.LOGIN_FAILED,
            error: ResponseMessages.LoginFailed,
        });
    }

    async sendAccountConfimationEmail(token: string, email: string, locale: string) {
        try {
            const subject = await this.commonService.translate('confirm_email_subject', locale);

            const result = await this.commonService.sendEmail({
                to: email,
                subject: subject,
                templateName: 'email-confirmation',
                templateContext: {
                    link: `${process.env.EMAIL_URL}/customers/confirmation?token=${token}`,
                },
            });
            return result;
        } catch (error) {
            console.log('Erorrrrrrr :', error);
        }
    }

    async resendConfirmation(body: ResendConfirmationDto, locale: string = 'en') {
        const { email, app_id } = body;

        const customer = await this.getCustomer({ email, app_id }, ['id', 'email', 'confirm_token', 'email_confirmed']);

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

        await this.sendAccountConfimationEmail(customer.confirm_token, customer.email, locale);

        return this.commonService.generateMessage('Confirmation email sent');
    }

    async confirmation(token: string) {
        const customer = await this.getCustomer({ confirm_token: token });
        if (!customer) {
            throw new UnauthorizedException({
                result_code: ErrorStatus.UNAUTHORIZED,
                error: ResponseMessages.InvalidToken,
            });
        }

        const user = await this.CustomersRepository.findOneBy({
            confirm_token: token,
        });

        if (!user?.confirm_token) {
            throw new UnauthorizedException({ message: 'Token is not valid' });
        }

        const usedId = String(user?.id) ?? null;

        await this.updateCustomer(usedId, {
            email_confirmed: true,
        });

        return 'Successfully confirmed';
        // return this.commonService.generateMessage('Confirmation successful');
    }

    public async confirmEmail(data: ConfirmHtmlDto) {
        const { token } = data;
        const templatePath = `${process.env.PUBLIC_FILE}/templates/confirm.hbs`;
        const [template, customer] = await Promise.all([
            fs.readFile(templatePath, 'utf8'),
            this.getCustomer({ confirm_token: token }),
        ]);
        const compiledTemplate = handlebars.compile(template);

        if (!customer) {
            const htmlFile = compiledTemplate({
                success: false,
            });
            return htmlFile;
        }

        if (customer.email_confirmed) {
            const htmlFile = compiledTemplate({
                success: true,
            });
            return htmlFile;
        }

        await this.updateCustomer(customer.id, { email_confirmed: true });

        const htmlFile = compiledTemplate({
            success: true,
        });
        return htmlFile;
    }

    async customreSignUp(newCustomer: any, locale: string = 'en') {
        let user = await this.getCustomer({ app_id: newCustomer.app_id });
        if (newCustomer.email) {
            if (newCustomer.phone) {
                user = await this.getCustomer({
                    phone: newCustomer.phone,
                    email: newCustomer.email,
                    app_id: newCustomer.app_id,
                });
            } else {
                user = await this.getCustomer({ email: newCustomer.email, app_id: newCustomer.app_id });
            }
        }

        if (user) {
            throw new ConflictException({
                result_code: ErrorStatus.DATA_ALREADY_EXIST,
                error: ResponseMessages.CustomerExist,
            });
        }

        if (newCustomer.email.includes('@chowistest.com')) {
            newCustomer.email_confirmed = true;
        }

        const customer = await this.createCustomer(newCustomer);

        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'notes',
            'push_token',
            'app_id',
            'company_id',
            'consultant_id',
            'skin_color_group_id',
            'ethnicity_id',
            'sign_in_count',
            'image_url',
            'country_id',
            'birth',
            'token',
            'social',
        ];

        const includes = [
            'country',
            'products',
            'products.device',
            'products.license',
            'products.application',
            'gender',
            'conslutant',
        ];

        const [confirmationToken, tokens, customerData] = await Promise.all([
            this.jwtService.generateToken(
                { id: customer.id, email: customer.email, role: Role.Customer },
                TokenTypeEnum.CONFIRMATION,
                customer.domain,
            ),
            this.authService.generateAuthTokens(customer, ''),
            this.getCustomer({ id: customer.id, email: customer.email }, selections, includes),
        ]);

        const [accessToken, refreshToken] = tokens;

        const promises: Promise<any>[] = [
            this.updateCustomer(customerData.id, {
                token: refreshToken,
                confirm_token: confirmationToken,
            }),
        ];
        if (newCustomer.email) {
            promises.push(this.sendAccountConfimationEmail(confirmationToken, newCustomer.email, locale));
        }
        await Promise.all(promises);

        customerData.token = accessToken;
        customerData.refresh_token = refreshToken;
        customerData.optic_number = [];

        customerData.consultant_name = '';
        return customerData;
    }

    async signUp(newCustomer: any, locale: string = 'en') {
        const user = await this.getCustomer({ email: newCustomer.email, app_id: newCustomer.app_id });

        if (user) {
            throw new ConflictException({
                result_code: ErrorStatus.DATA_ALREADY_EXIST,
                error: ResponseMessages.EmailAlreadyExist,
            });
        }

        if (newCustomer.email.includes('@chowistest.com')) {
            newCustomer.email_confirmed = true;
        }

        const customer = await this.createCustomer(newCustomer);

        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'notes',
            'push_token',
            'app_id',
            'company_id',
            'consultant_id',
            'skin_color_group_id',
            'ethnicity_id',
            'sign_in_count',
            'image_url',
            'country_id',
            'birth',
            'token',
            'social',
        ];

        const includes = ['country', 'products.device', 'products.license', 'products.application', 'gender'];

        const [confirmationToken, tokens, customerData] = await Promise.all([
            this.jwtService.generateToken(
                { id: customer.id, email: customer.email, role: Role.Customer },
                TokenTypeEnum.CONFIRMATION,
                customer.domain,
            ),
            this.authService.generateAuthTokens(customer, ''),
            this.getCustomer({ id: customer.id, email: customer.email }, selections, includes),
        ]);

        const [accessToken, refreshToken] = tokens;

        const [emailSent, updateStatus] = await Promise.all([
            this.sendAccountConfimationEmail(confirmationToken, newCustomer.email, locale),
            this.updateCustomer(customerData.id, {
                token: refreshToken,
                confirm_token: confirmationToken,
            }),
        ]);

        customerData.optic_number = customerData.getOpticNumbers;
        customerData.consultant_name = customerData.getConsultantName;
        customerData.token = refreshToken;
        customerData.refresh_token = accessToken;
        return customerData;
    }

    async login(email: string, password: string, app_id: number, locale: string = 'en') {
        const getCustomer = await this.validateCustomer(email, app_id, password);

        const checkToken = this.authService.isTokenExpired(getCustomer.token);

        if (!getCustomer.email_confirmed) {
            //Check if Token is not yet expired
            if (!checkToken) {
                const confirmationToken = await this.jwtService.generateToken(
                    { id: getCustomer.id, email: getCustomer.email, role: Role.Customer },
                    TokenTypeEnum.CONFIRMATION,
                    '',
                );
                await this.updateCustomer(getCustomer.id, {
                    confirm_token: confirmationToken,
                });

                await this.sendAccountConfimationEmail(confirmationToken, getCustomer.email, locale);
            }
            throw new BadRequestException({
                result_code: ErrorStatus.EMAIL_NOT_CONFIRMED,
                error: ResponseMessages.EmailNotConfirmed,
            });
        }

        const [accessToken, refreshToken] = await this.authService.generateAuthTokens(
            { id: getCustomer.id, email: getCustomer.email, role: Role.Customer },
            '',
        );

        if (getCustomer?.consultant_company?.applications) {
            getCustomer.consultant_company.applications = [];
        }

        if (getCustomer?.products?.length > 0) {
            getCustomer.products.forEach((product: any) => {
                if (product.device && product.device.consultant_company) {
                    product.device.consultant_company.applications = [];
                }
            });
        }

        delete getCustomer.password_digest;
        delete getCustomer.recovery_password_digest;
        delete getCustomer.email_confirmed;

        getCustomer.sign_in_count = Number(getCustomer.sign_in_count) + 1;
        getCustomer.token = accessToken;
        getCustomer.refresh_token = refreshToken;

        await this.updateCustomer(getCustomer.id, {
            token: accessToken,
            sign_in_count: getCustomer.sign_in_count,
        });

        getCustomer.country_details = getCustomer?.country ?? {};

        getCustomer.country = getCustomer?.country ? getCustomer?.country['name'] : '';

        getCustomer.gender = getCustomer?.gender_id ? getCustomer?.gender_id : null;

        return getCustomer;
    }

    async logout(id: string): Promise<IMessage> {
        await this.updateCustomer(id, { token: null });
        return this.commonService.generateMessage('Logout successful');
    }

    async update(userId: number, customer: UpdateCustomersDto | UpdateCrmCustomersDto) {
        // Commented code in this function can be use in future

        // if (String(customer?.consultant_shop_id)?.length === 0) {
        //     customer.consultant_shop_id = null;
        // }
        const customerData = await this.CustomersRepository.findOne({
            where: { id: userId },
        });

        if (!customerData) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        const promises: Promise<any>[] = [];

        // if (customer.social_id) {
        // }
        // if (customer.external_id) {
        // }

        // if (customer.company_id) {
        //     promises.push(this.companies.getOneCompany(String(customer?.company_id)));
        // }

        // if (customer.consultant_id) {
        //     promises.push(this.consultant.findOneConsultant(customer.consultant_id));
        // }

        // if (customer.consultant_shop_id) {
        //     promises.push(this.consultantShops.findOneConsultantShops(Number(customer.consultant_shop_id)));
        // }

        // if (customer.gender_id) {
        //     promises.push(this.genders.findOneGender(String(customer.gender_id)));
        // }

        if (customer.app_id) {
            promises.push(this.applicationsRepository.findOneApplication(customer.app_id));
        }

        if (customer.country_code) {
            const countries = await this.countries.findCountry({ country_code: customer.country_code }, [
                'id',
                'country_code',
                'name',
            ]);
            const country = countries[0];

            if (!country) {
                throw new NotFoundException({
                    result_code: ErrorStatus.NOT_FOUND,
                    error: ResponseMessages.InvalidCountryCode,
                });
            }

            // customer.country_id = country?.id ? Number(country.id) : null;
            // customer.country_code = country.code;
            // customer.country_name = country.name;
            // customer.phone_country_code = country.phone_country_code;
        }

        if (customer.skin_color_group_id) {
            promises.push(this.skinColorGroups.findOneskinColorGroups(String(customer.skin_color_group_id)));
        }

        if (customer.ethnicity_id) {
            promises.push(this.ethnicities.findOneEthinicities(String(customer.ethnicity_id)));
        }

        const results = await Promise.all(promises);

        for (const result of results) {
            if (!result) {
                this.commonService.throwNotFoundError();
            }
        }

        customerData.updated_at = new Date();

        Object.assign(customerData, customer);

        customerData.ethnicity_id = customer?.ethnicity_id ? Number(customer.ethnicity_id) : customerData.ethnicity_id;

        customerData.skin_color_group_id = customer?.skin_color_group_id
            ? Number(customer.skin_color_group_id)
            : customerData.skin_color_group_id;

        // customerData.consultant_shop_id = customer?.consultant_shop_id
        //     ? Number(customer.consultant_shop_id)
        //     : customerData.consultant_shop_id;

        customerData.age = customer?.age ? Number(customer.age) : customerData.age;

        customerData.phone_country_code = customer?.phone_country_code
            ? customerData.phone_country_code
            : customerData.phone_country_code;

        customerData.app_id = customer?.app_id ? Number(customerData.app_id) : customerData.app_id;

        // customerData.consultant_shop_id = customer?.consultant_shop_id ? Number(customerData.consultant_shop_id) : null;

        const updatedCustomer: any = await this.CustomersRepository.save(customerData);

        const updatedCustomerData = await this.getUpdatedCustomer(updatedCustomer.id);

        updatedCustomerData.country_details = updatedCustomerData?.country ?? {};

        updatedCustomerData.country = updatedCustomerData?.country ? updatedCustomerData?.country['name'] : '';

        updatedCustomerData.gender = updatedCustomerData?.gender ? Number(updatedCustomerData?.gender['id']) : null;

        return updatedCustomerData;
    }

    async getUpdatedCustomer(id: string) {
        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'notes',
            'push_token',
            'app_id',
            'company_id',
            'consultant_id',
            'skin_color_group_id',
            'ethnicity_id',
            'sign_in_count',
            'image_url',
            'country_id',
            'birth',
            'token',
            'social',
            'password_digest',
            'email_confirmed',
        ];

        const includes = [
            'country',
            'products',
            'products.device',
            'products.license',
            'products.device.consultant_company',
            'products.device.consultant_company.applications',
            'products.application',
            'gender',
        ];

        let customer: any = await this.getCustomer({ id }, selections, includes);

        console.log(customer.products);

        if (customer.products.length === 0) {
            const product = await this.productService.getProducts(customer?.id);
            customer.products = product;
        }

        customer.products.forEach((product: any) => {
            product.expired_date = product.getExpiredDate;
            product.is_expired = product.getIsExpired;
        });

        customer.optic_number = customer.getOpticNumbers;
        customer.consultant_name = customer.getConsultantName;

        delete customer.password_digest;
        delete customer.email_confirmed;

        return customer;
    }

    async customerDetails(id: string) {
        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'notes',
            'push_token',
            'app_id',
            'company_id',
            'consultant_id',
            'skin_color_group_id',
            'ethnicity_id',
            'sign_in_count',
            'image_url',
            'gender_id',
            'country_id',
            'birth',
            'token',
            'social',
        ];

        const includes = [
            'country',
            'products',
            'products.device',
            'products.license',
            'products.application',
            'conslutant',
        ];

        const customer = await this.getCustomer({ id }, selections, includes);

        if (customer.products.length === 0) {
            const product = await this.productService.getProducts(customer?.id);
            customer.products = product;
        }

        customer.products.forEach((product: any) => {
            product.expired_date = product.getExpiredDate;
            product.is_expired = product.getIsExpired;
            if (product.device && product.device.consultant_company) {
                product.device.consultant_company.applications = [];
            }
        });
        customer.gender = customer.gender_id;
        delete customer.gender_id;

        customer.optic_number = customer?.getOpticNumbers ?? [];

        customer.country_details = customer?.country ?? {};

        customer.country = customer?.country ? customer?.country['name'] : '';

        customer.gender = customer?.gender_id ? customer?.gender_id : null;

        return customer;
    }

    async generateToken() {
        const payload = {
            id: 1,
            name: '',
            email: '',
            app_id: '',
        };
        const token = await this.jwtService.generateToken(payload, TokenTypeEnum.ACCESS, '');
        return { token };
    }

    async passwordChange(id: string, customer: ChangePasswordCustomerDto, locale: string = 'en') {
        const { password, new_password } = customer;

        const customerData = await this.getCustomer({ id }, ['email', 'password_digest']);
        const confirmPwd = await this.verifyPassword(password, customerData?.password_digest);

        if (!confirmPwd) {
            throw new BadRequestException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: ResponseMessages.LoginFailed,
            });
        }

        const new_password_digest = await argon2.hash(new_password);
        const updatedCustomer = await this.updateCustomer(id, { password_digest: new_password_digest });

        if (!updatedCustomer.affected) {
            throw new BadRequestException({
                result_code: ErrorStatus.PASSWORD_CHANGE_FAILED,
                error: ResponseMessages.PasswordChangeFailed,
            });
        }
        if (customerData.email) {
            const subject = await this.commonService.translate('password_reset_subject', locale);

            this.commonService.sendEmail({
                to: customerData.email,
                subject: subject,
                templateName: 'password-reset-success',
                templateContext: {},
            });
        }

        return this.commonService.generateMessage('Password changed successfully');
    }

    async presignUpload(file: PresignedUploadDto) {
        // TODO
    }

    async password(data: PasswordDto, locale: string = 'en') {
        const selections = [
            'id',
            'email',
            'name',
            'surname',
            'os',
            'language',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'notes',
            'push_token',
            'app_id',
            'company_id',
            'consultant_id',
            'skin_color_group_id',
            'ethnicity_id',
            'sign_in_count',
            'image_url',
            'country_id',
            'country',
            'birth',
            'gender',
            'social',
            'products',
        ];

        let customer = await this.getCustomer({ email: data.email, app_id: data.app_id }, selections);

        if (!customer) {
            // customer = await this.getCustomer({ email: data.email }, selections);

            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        const password = this.commonService.generateRandomPassword(12);
        const hashedPassword = await argon2.hash(password);

        await this.updateCustomer(customer.id, { password_digest: hashedPassword });
        const subject = await this.commonService.translate('password_recovery_subject', locale);

        await this.commonService.sendEmail({
            to: customer.email,
            subject: subject,
            templateName: 'password-recovery',
            templateContext: {
                password: password,
            },
        });

        customer.optic_number = customer.getOpticNumbers;
        customer.consultant_name = customer.getConsultantName;

        return customer;
    }

    async deleteAccount(id: string, data: DeleteCustomerDto) {
        // TODO: Add translation

        if (!id) {
            return this.commonService.generateMessage('Customer id is required');
        }
        const customer = await this.getCustomer({ id: id }, [], ['products', 'chowisCustomerConsents']);

        if (!customer) {
            throw new NotFoundException({
                result_code: ErrorStatus.CUSTOMER_NOT_FOUND,
                error: ResponseMessages.CustomerNotFound,
            });
        }

        const productIds = customer.products.map((p: any) => p.id);

        if (productIds && productIds.length) {
            await this.productService.updateProducts({ id: In(productIds) }, { customer_id: null });
        }

        // const consentIds = customer.chowisCustomerConsents.map((c: any) => c.id);

        // if (consentIds && consentIds.length) {
        //     await this.chowisCustomerConsentRepository.update({ id: In(consentIds) }, { customer_id: null });
        // }

        // await this.customerLogRepository.save({
        //     customer_id: customer.id,
        //     app_id: customer.app_id,
        //     email: customer.email,
        //     reason: data.reason,
        //     created_at: new Date(),
        //     updated_at: new Date(),
        // });

        const deletedCustomer = await this.deleteCustomer(id);

        if (!deletedCustomer) {
            throw new BadRequestException({
                result_code: ErrorStatus.CUSTOM_ERROR,
                error: ResponseMessages.CustomerNotDeleted,
            });
        }

        return this.commonService.generateMessage(ResponseMessages.AccountDeleted);
    }

    async deleteCustomer(id: string) {
        const deletedCustomer = await this.CustomersRepository.delete(id);

        if (deletedCustomer.affected === 0) {
            return false;
        }
        return true;
    }
}
