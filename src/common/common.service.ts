import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    LoggerService,
    NotFoundException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import slugify from 'slugify';
import { v4 } from 'uuid';
import Mail from 'nodemailer/lib/mailer';
import { createTransport } from 'nodemailer';
import { readFileSync } from 'fs';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { IMessage } from './interfaces/message.interface';
import { IEmailParams } from './interfaces/email-params.interface';
import { ErrorStatus } from './constants/error-status';
import { ResponseMessages } from './constants/response-messages';
import * as ExcelJS from 'exceljs';
import { join } from 'path';
import axios from 'axios';

@Injectable()
export class CommonService {
    private readonly loggerService: LoggerService;
    private mailTransporter: Mail;
    private translations: { [key: string]: any } = {};

    constructor() {
        this.loggerService = new Logger(CommonService.name);
        this.loadTranslations();

        this.mailTransporter = createTransport({
            service: process.env.SMTP_SERVICE,
            host: process.env.EMAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                ciphers: 'SSLv3',
            },
        });
    }

    /**
     * Validate Entity
     *
     * Validates an entities with the class-validator library
     */
    public async validateEntity(entity: any): Promise<void> {
        const errors = await validate(entity);
        const messages: string[] = [];

        for (const error of errors) {
            messages.push(...Object.values(error.constraints));
        }

        if (errors.length > 0) {
            throw new BadRequestException({ result_code: ErrorStatus.BAD_REQUEST, error: messages.join(',\n') });
        }
    }

    public async throwDuplicateError<T>(promise: Promise<T>, message?: string) {
        try {
            return await promise;
        } catch (error) {
            this.loggerService.error(error);

            if (error.code === '23505') {
                throw new ConflictException({
                    result_code: ErrorStatus.DATA_ALREADY_EXIST,
                    error: message ?? 'Duplicated value in database',
                });
            }

            throw new BadRequestException({ result_code: ErrorStatus.BAD_REQUEST, error: error.message });
        }
    }

    public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
        try {
            return await promise;
        } catch (error) {
            this.loggerService.error(error);
            throw new InternalServerErrorException({ result_code: ErrorStatus.SERVER_ERROR, error: error });
        }
    }

    public formatName(title: string): string {
        return title
            .trim()
            .replace(/\n/g, ' ')
            .replace(/\s\s+/g, ' ')
            .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
    }
    public generatePointSlug(str: string): string {
        return slugify(str, { lower: true, replacement: '.', remove: /['_\.\-]/g });
    }

    public generateMessage(message: string): IMessage {
        return { id: v4(), message };
    }

    async justSendMail(to: string, subject: string, batchId: string) {
        try {
            const mailOptions: Mail.Options = {
                from: process.env.EMAIL_USER,
                to,
                subject,
            };

            await this.mailTransporter.sendMail(mailOptions);
        } catch (e) {
            throw e;
        }
    }

    async sendEmail({ to, subject, templateName, templateContext }: IEmailParams) {
        try {
            const templatePath = `${process.env.PUBLIC_FILE}/email-templates/${templateName}.hbs`;
            const template = await fs.readFile(templatePath, 'utf8');
            const compiledTemplate = handlebars.compile(template);

            const html = compiledTemplate({
                ...templateContext,
                subject,
            });

            const mailOptions: Mail.Options = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                html,
            };

            await this.mailTransporter.sendMail(mailOptions);
        } catch (error) {
        }
    }

    generateRandomPassword(length: number) {
        const lowercaseChars = process.env.LOWERCASE_CHARS;
        const uppercaseChars = process.env.UPPERCASE_CHARS;
        const numberChars = process.env.NUMBER_CHARS;
        const allChars = lowercaseChars + uppercaseChars + numberChars;

        function getRandomChar(chars: string) {
            return chars[Math.floor(Math.random() * chars.length)];
        }

        let password = [getRandomChar(lowercaseChars), getRandomChar(uppercaseChars), getRandomChar(numberChars)];

        for (let i = 3; i < length; i++) {
            password.push(getRandomChar(allChars));
        }

        password = password.sort(() => Math.random() - 0.5);

        return password.join('');
    }

    throwNotFoundError() {
        throw new NotFoundException({
            result_code: ErrorStatus.RECORD_NOT_FOUND,
            error: ResponseMessages.RecordNotFound,
        });
    }

    private loadTranslations() {
        const koPath = join('src', 'common', 'translation', 'ko.json');
        const enPath = join('src', 'common', 'translation', 'en.json');
        const errorsEnPath = join('src', 'common', 'translation', 'errors.en.json');
        const errorsKoPath = join('src', 'common', 'translation', 'errors.ko.json');
        this.translations['en'] = JSON.parse(readFileSync(enPath, { encoding: 'utf-8' }));
        this.translations['ko'] = JSON.parse(readFileSync(koPath, { encoding: 'utf-8' }));
        this.translations['errors.en'] = JSON.parse(readFileSync(errorsEnPath, { encoding: 'utf-8' }));
        this.translations['errors.ko'] = JSON.parse(readFileSync(errorsKoPath, { encoding: 'utf-8' }));
    }

    getTranslation(locale: string) {
        if (locale.startsWith('errors')) {
            return this.translations[locale] || this.translations['errors.en'];
        }

        return this.translations[locale] || this.translations['en'];
    }

    async translate(key: string, language: string) {
        const filePath = join('src', 'common', 'translation', 'messages.json');
        const messages = JSON.parse(await fs.readFile(filePath, { encoding: 'utf-8' }));

        if (messages[language] && messages[language][key]) {
            return messages[language][key];
        } else {
            return messages['en'][key];
        }
    }

    createLocaleErrorMessage(locale: string, messageKey: string, message = '') {
        const lowerLocale = locale.toLocaleLowerCase();

        const errorLocale = `errors.${lowerLocale}`;

        const translations = this.getTranslation(errorLocale)?.[lowerLocale]['chowis']['errors'];

        const translationsErrorMessage = translations[messageKey];

        let errorMessage = message;

        if (translationsErrorMessage) {
            errorMessage = translationsErrorMessage.replace(/%\{(\w+)\}/g, `${message}`).replace(/\n/g, ``);
        }

        return errorMessage;
    }

    async getWorkSheetByHTTP(fileUrl: string, token: string) {
        try {
            const fileResponse = await axios.get(fileUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
                responseType: 'arraybuffer',
            });

            const fileBinary = fileResponse.data;

            const buffer = Buffer.from(fileBinary, 'binary');

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.getWorksheet(1);

            return worksheet;
        } catch (e) {
            throw new BadRequestException({
                result_code: ErrorStatus.INVALID_REQUEST,
                error: this.createLocaleErrorMessage('en', 'invalid_request', `cannot detect ${fileUrl}`),
            });
        }
    }

    paginate(array: any[], page: number, limit: number) {
        const offset = (page - 1) * limit;
        const paginatedItems = array.slice(offset, offset + limit);
        const totalPages = Math.ceil(array.length / limit);

        return {
            data: paginatedItems,
            total_size: array.length,
            current_page_size: paginatedItems.length,
            current_page: page,
            total_pages: totalPages,
        };
    }
}
