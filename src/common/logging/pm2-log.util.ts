import { Logger } from '@nestjs/common';
import { Request } from 'express';

type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = Record<string, unknown>;

const logger = new Logger('HTTP');

const SENSITIVE_KEYS = new Set([
    'authorization',
    'cookie',
    'password',
    'password_digest',
    'new_password',
    'token',
    'access_token',
    'accessToken',
    'refresh_token',
    'refreshToken',
]);

export function maskSensitiveValue(value: unknown): unknown {
    if (!value || typeof value !== 'object') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => maskSensitiveValue(item));
    }

    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
        (acc, [key, entryValue]) => {
            acc[key] = SENSITIVE_KEYS.has(key) ? '***' : maskSensitiveValue(entryValue);
            return acc;
        },
        {},
    );
}

export function getRequestId(req: Request): string {
    const headerValue = req.headers['x-request-id'] || req.headers['x-correlation-id'];
    const requestId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    return requestId || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function writePm2Log(level: LogLevel, event: string, payload: LogPayload = {}): void {
    const message = formatLogMessage(event, payload);
    const stack = typeof payload.stack === 'string' ? payload.stack : undefined;

    if (level === 'error') {
        logger.error(message, stack);
        return;
    }

    if (level === 'warn') {
        logger.warn(message);
        return;
    }

    logger.log(message);
}

function formatLogMessage(event: string, payload: LogPayload): string {
    if (event === 'http_request') {
        return [
            payload.requestId ? `[${payload.requestId}]` : undefined,
            payload.method,
            payload.path,
            payload.status,
            payload.durationMs !== undefined ? `${payload.durationMs}ms` : undefined,
            formatKeyValue('ip', payload.ip),
            formatKeyValue('locale', payload.locale),
            formatKeyValue('instance', process.env.NODE_APP_INSTANCE),
            formatKeyValue('userAgent', payload.userAgent),
        ]
            .filter((value) => value !== undefined && value !== '')
            .join(' ');
    }

    if (event === 'http_exception') {
        return [
            payload.requestId ? `[${payload.requestId}]` : undefined,
            payload.method,
            payload.path,
            payload.status,
            formatKeyValue('resultCode', payload.resultCode),
            formatKeyValue('error', payload.error),
            formatKeyValue('instance', process.env.NODE_APP_INSTANCE),
        ]
            .filter((value) => value !== undefined && value !== '')
            .join(' ');
    }

    return [
        event,
        formatKeyValue('instance', process.env.NODE_APP_INSTANCE),
        ...Object.entries(payload)
            .filter(([key]) => key !== 'stack')
            .map(([key, value]) => formatKeyValue(key, value)),
    ]
        .filter((value) => value !== undefined && value !== '')
        .join(' ');
}

function formatKeyValue(key: string, value: unknown): string | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (typeof value === 'object') {
        return `${key}=${JSON.stringify(value)}`;
    }

    const stringValue = String(value);
    const needsQuotes = /\s/.test(stringValue);

    return `${key}=${needsQuotes ? JSON.stringify(stringValue) : stringValue}`;
}
