import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomHttpExceptionResponse } from './interface/http-exception.interface';
import { ErrorCode } from './eum/statusCode.enum';
import { ErrorMessageTranslation } from './constants/errorMessageTranslation.constants';
import { ResponseMessages } from '@/src/common/constants/response-messages';
import { getRequestId, writePm2Log } from '@/src/common/logging/pm2-log.util';

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
        if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) {
            const errorLog = this.getErrorLog(errorResponse, request, exception, httpStatus);
            writePm2Log('error', 'http_exception', errorLog);
        }

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
        httpStatus: HttpStatus,
    ): Record<string, unknown> => {
        const { result_code, error } = errorResponse;
        const { method, url } = request;

        return {
            requestId: getRequestId(request),
            status: httpStatus,
            resultCode: result_code,
            method,
            path: url,
            error,
            statusMessage: request.statusMessage ?? 'error',
            stack:
                httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error
                    ? exception.stack
                    : undefined,
        };
    };
}
