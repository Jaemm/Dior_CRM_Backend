export interface HttpExceptionResponse {
    result_code: number;
    error: string;
}

export interface CustomHttpExceptionResponse extends HttpExceptionResponse {
    path: string;
    method: string;
    timeStamp: Date;
}

export interface CommonErrorResponse {
    RESULTCODE: string;
    RESULTMSG: string;
}
