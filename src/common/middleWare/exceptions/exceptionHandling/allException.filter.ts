import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import * as fs from 'fs';
import { CustomHttpExceptionResponse } from './interface/http-exception.interface';
import { ErrorCode } from './eum/statusCode.enum';
import { ErrorMessageTranslation } from './constants/errorMessageTranslation.constants';
import { ResponseMessages } from '@/src/common/constants/response-messages';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly validLanguages = ['en', 'kr'];
    catch(exception: any, host: ArgumentsHost) {

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : exception.status || HttpStatus.INTERNAL_SERVER_ERROR;

        const customStatus =
            exception?.response?.result_code || exception?.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        let errorMessage = exception?.response?.error || ResponseMessages.InternalServerError;

        let language = request.header('X-CHOWIS-LOCALE') || 'en';

        if (!this.validLanguages.includes(language.toLowerCase())) {
            language = 'en';
        }

        errorMessage = this.translateErrorMessage(errorMessage, language);

        const errorResponse = this.getErrorResponse(customStatus, errorMessage, request);
        const errorLog = this.getErrorLog(errorResponse, request, exception);
        this.writeErrorLogToFile(errorLog);
        response.status(httpStatus).json(errorResponse);
    }

    private translateErrorMessage(errorMessage: string, language: string): string {
        if (language === 'en') {
            return errorMessage;
        }
        const translation = ErrorMessageTranslation[language]?.[errorMessage];

        if (!translation) {
            return ErrorMessageTranslation[language]?.['Internal server error.'];
        }

        return translation;
    }

    private getErrorResponse = (
        status: HttpStatus | ErrorCode,
        errorMessage: string,
        request: Request,
    ): CustomHttpExceptionResponse => ({
        result_code: status,
        error: errorMessage,
        path: request.url,
        method: request.method,
        timeStamp: new Date(),
    });

    private getErrorLog = (
        errorResponse: CustomHttpExceptionResponse,
        request: Request,
        exception: unknown,
    ): string => {
        const { result_code, error } = errorResponse;
        const { method, url } = request;

        const kr_time = new Date().toLocaleString();
        const errorLog = `Response Code: ${result_code} - Method: ${method} - URL: ${url}\n\n
      ${JSON.stringify(errorResponse)}\n\n
       ${JSON.stringify(kr_time)}\n\n
       ${JSON.stringify(request.statusMessage ?? 'error')}\n\n
      ${exception instanceof HttpException ? exception.stack : error}\n\n`;
        return errorLog;
    };

    private writeErrorLogToFile = (errorLog: string): void => {
        fs.appendFile('error.log', errorLog, 'utf8', (err) => {
            if (err) throw err;
        });
    };
}
