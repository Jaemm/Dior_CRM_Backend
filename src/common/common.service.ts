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
            port: Number(process.env.SMTP_PORT),
            // secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
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

    /**
     * Throw Duplicate Error
     *
     * Checks is an error is of the code 23505, PostgreSQL's duplicate value error,
     * and throws a conflict exception
     */
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

    /**
     * Throw Internal Error
     *
     * Function to abstract throwing internal server exception
     */
    public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
        try {
            return await promise;
        } catch (error) {
            this.loggerService.error(error);
            throw new InternalServerErrorException({ result_code: ErrorStatus.SERVER_ERROR, error: error });
        }
    }

    /**
     * Format Name
     *
     * Takes a string trims it and capitalizes every word
     */
    public formatName(title: string): string {
        return title
            .trim()
            .replace(/\n/g, ' ')
            .replace(/\s\s+/g, ' ')
            .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
    }

    /**
     * Generate Point Slug
     *
     * Takes a string and generates a slug with dtos as word separators
     */
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
            console.log('Error sending email', error);
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

        // Ensure the password contains at least one lowercase, one uppercase, and one number
        let password = [getRandomChar(lowercaseChars), getRandomChar(uppercaseChars), getRandomChar(numberChars)];

        // Fill the rest of the password length with random characters from all characters
        for (let i = 3; i < length; i++) {
            password.push(getRandomChar(allChars));
        }

        // Shuffle the password array to mix the guaranteed characters with the random ones
        password = password.sort(() => Math.random() - 0.5);

        // Join the array to form the final password string
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
        // const elPath = join('src', 'common', 'translation', 'el.json');
        // const activeAdminEnPath = join('src', 'common', 'translation', 'activeadmin.en.json');
        // const chowisEnPath = join('src', 'common', 'translation', 'chowis.en.json');
        // const deviseEnPath = join('src', 'common', 'translation', 'devise.en.json');
        const errorsEnPath = join('src', 'common', 'translation', 'errors.en.json');
        const errorsKoPath = join('src', 'common', 'translation', 'errors.ko.json');
        // const errorsDePath = join('src', 'common', 'translation', 'errors.de.json');
        // const errorsEsPath = join('src', 'common', 'translation', 'errors.es.json');
        // const errorsFrPath = join('src', 'common', 'translation', 'errors.fr.json');
        // const errorsHePath = join('src', 'common', 'translation', 'errors.he.json');
        // const errorsItPath = join('src', 'common', 'translation', 'errors.it.json');
        // const errorsJaPath = join('src', 'common', 'translation', 'errors.ja.json');
        // const errorsNlPath = join('src', 'common', 'translation', 'errors.nl.json');
        // const errorsRuPath = join('src', 'common', 'translation', 'errors.ru.json');
        // const errorsViPath = join('src', 'common', 'translation', 'errors.vi.json');
        // const errorsZhHansPath = join('src', 'common', 'translation', 'errors.zh_hans.json');
        // const errorsZhHantPath = join('src', 'common', 'translation', 'errors.zh_hant.json');
        // const esPath = join('src', 'common', 'translation', 'es.json');
        // const frPath = join('src', 'common', 'translation', 'fr.json');
        // const huPath = join('src', 'common', 'translation', 'hu.json');
        // const itPath = join('src', 'common', 'translation', 'it.json');
        // const jaPath = join('src', 'common', 'translation', 'ja.json');
        // const messagesPath = join('src', 'common', 'translation', 'messages.json');
        // const nbPath = join('src', 'common', 'translation', 'nb.json');
        // const nlPath = join('src', 'common', 'translation', 'nl.json');
        // const plPath = join('src', 'common', 'translation', 'pl.json');
        // const ruPath = join('src', 'common', 'translation', 'ru.json');
        // const simpleFormEnPath = join('src', 'common', 'translation', 'simple_form.en.json');
        // const thPath = join('src', 'common', 'translation', 'th.json');
        // const validateEnPath = join('src', 'common', 'translation', 'validate.en.json');
        // const validateKoPath = join('src', 'common', 'translation', 'validate.ko.json');
        // const viPath = join('src', 'common', 'translation', 'vi.json');
        // const zhCnPath = join('src', 'common', 'translation', 'zh-CN.json');
        // const zhHansPath = join('src', 'common', 'translation', 'zh-Hans.json');
        // const zhHantPath = join('src', 'common', 'translation', 'zh-Hant.json');
        // const zhTwPath = join('src', 'common', 'translation', 'zh-TW.json');

        this.translations['en'] = JSON.parse(readFileSync(enPath, { encoding: 'utf-8' }));
        this.translations['ko'] = JSON.parse(readFileSync(koPath, { encoding: 'utf-8' }));
        // this.translations['el'] = JSON.parse(fs.readFileSync(elPath, { encoding: 'utf-8' }));
        // this.translations['activeadmin.en'] = JSON.parse(fs.readFileSync(activeAdminEnPath, { encoding: 'utf-8' }));
        // this.translations['chowis.en'] = JSON.parse(fs.readFileSync(chowisEnPath, { encoding: 'utf-8' }));
        // this.translations['devise.en'] = JSON.parse(fs.readFileSync(deviseEnPath, { encoding: 'utf-8' }));
        this.translations['errors.en'] = JSON.parse(readFileSync(errorsEnPath, { encoding: 'utf-8' }));
        this.translations['errors.ko'] = JSON.parse(readFileSync(errorsKoPath, { encoding: 'utf-8' }));
        // this.translations['errors.de'] = JSON.parse(fs.readFileSync(errorsDePath, { encoding: 'utf-8' }));
        // this.translations['errors.es'] = JSON.parse(fs.readFileSync(errorsEsPath, { encoding: 'utf-8' }));
        // this.translations['errors.fr'] = JSON.parse(fs.readFileSync(errorsFrPath, { encoding: 'utf-8' }));
        // this.translations['errors.he'] = JSON.parse(fs.readFileSync(errorsHePath, { encoding: 'utf-8' }));
        // this.translations['errors.it'] = JSON.parse(fs.readFileSync(errorsItPath, { encoding: 'utf-8' }));
        // this.translations['errors.ja'] = JSON.parse(fs.readFileSync(errorsJaPath, { encoding: 'utf-8' }));
        // this.translations['errors.nl'] = JSON.parse(fs.readFileSync(errorsNlPath, { encoding: 'utf-8' }));
        // this.translations['errors.ru'] = JSON.parse(fs.readFileSync(errorsRuPath, { encoding: 'utf-8' }));
        // this.translations['errors.vi'] = JSON.parse(fs.readFileSync(errorsViPath, { encoding: 'utf-8' }));
        // this.translations['errors.zh-hans'] = JSON.parse(fs.readFileSync(errorsZhHansPath, { encoding: 'utf-8' }));
        // this.translations['errors.zh-hant'] = JSON.parse(fs.readFileSync(errorsZhHantPath, { encoding: 'utf-8' }));
        // this.translations['es'] = JSON.parse(fs.readFileSync(esPath, { encoding: 'utf-8' }));
        // this.translations['fr'] = JSON.parse(fs.readFileSync(frPath, { encoding: 'utf-8' }));
        // this.translations['hu'] = JSON.parse(fs.readFileSync(huPath, { encoding: 'utf-8' }));
        // this.translations['it'] = JSON.parse(fs.readFileSync(itPath, { encoding: 'utf-8' }));
        // this.translations['ja'] = JSON.parse(fs.readFileSync(jaPath, { encoding: 'utf-8' }));
        // this.translations['messages'] = JSON.parse(fs.readFileSync(messagesPath, { encoding: 'utf-8' }));
        // this.translations['nb'] = JSON.parse(fs.readFileSync(nbPath, { encoding: 'utf-8' }));
        // this.translations['nl'] = JSON.parse(fs.readFileSync(nlPath, { encoding: 'utf-8' }));
        // this.translations['pl'] = JSON.parse(fs.readFileSync(plPath, { encoding: 'utf-8' }));
        // this.translations['ru'] = JSON.parse(fs.readFileSync(ruPath, { encoding: 'utf-8' }));
        // this.translations['simple_form.en'] = JSON.parse(fs.readFileSync(simpleFormEnPath, { encoding: 'utf-8' }));
        // this.translations['th'] = JSON.parse(fs.readFileSync(thPath, { encoding: 'utf-8' }));
        // this.translations['validate.en'] = JSON.parse(fs.readFileSync(validateEnPath, { encoding: 'utf-8' }));
        // this.translations['validate.ko'] = JSON.parse(fs.readFileSync(validateKoPath, { encoding: 'utf-8' }));
        // this.translations['vi'] = JSON.parse(fs.readFileSync(viPath, { encoding: 'utf-8' }));
        // this.translations['zh-CN'] = JSON.parse(fs.readFileSync(zhCnPath, { encoding: 'utf-8' }));
        // this.translations['zh-Hans'] = JSON.parse(fs.readFileSync(zhHansPath, { encoding: 'utf-8' }));
        // this.translations['zh-Hant'] = JSON.parse(fs.readFileSync(zhHantPath, { encoding: 'utf-8' }));
        // this.translations['zh-TW'] = JSON.parse(fs.readFileSync(zhTwPath, { encoding: 'utf-8' }));
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

    createLocaleErrorMessage(locale: string, messageKey: string, message: string = '') {
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
            // await fs.writeFile('downloaded.xlsx', fileBinary);

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.getWorksheet(1);

            return worksheet;
        } catch (e) {
            console.log(e);
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
