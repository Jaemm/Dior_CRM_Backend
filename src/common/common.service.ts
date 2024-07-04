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
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { IMessage } from './interfaces/message.interface';
import { IEmailParams } from './interfaces/email-params.interface';
import { ErrorStatus } from './constants/error-status';
import { ResponseMessages } from './constants/response-messages';
import { join } from 'path';

@Injectable()
export class CommonService {
    private readonly loggerService: LoggerService;
    private mailTransporter: Mail;

    constructor() {
        this.loggerService = new Logger(CommonService.name);

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

    async translate(key: string, language: string) {
        const filePath = join('src', 'common', 'translation', 'messages.json');
        const messages = JSON.parse(await fs.readFile(filePath, { encoding: 'utf-8' }));

        if (messages[language] && messages[language][key]) {
            return messages[language][key];
        } else {
            return messages['en'][key];
        }
    }
}
