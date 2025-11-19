/**
 * Server-Side Error Classes
 *
 * サーバーサイドで使用するエラークラスを定義します。
 */

import { ErrorCodes, ErrorLevels, type AppError, type ErrorCode, type ErrorLevel } from './types';

/**
 * サーバーサイド用のベースエラークラス
 */
export class ServerError extends Error implements AppError {
  public readonly code: ErrorCode;
  public readonly level: ErrorLevel;
  public readonly originalError?: unknown;
  public readonly metadata?: Record<string, unknown>;
  public readonly i18nKey?: string;
  public readonly i18nParams?: Record<string, string | number>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCodes.SERVER_ERROR,
    options?: {
      level?: ErrorLevel;
      originalError?: unknown;
      metadata?: Record<string, unknown>;
      i18nKey?: string;
      i18nParams?: Record<string, string | number>;
    }
  ) {
    super(message);
    this.name = 'ServerError';
    this.code = code;
    this.level = options?.level || ErrorLevels.ERROR;
    this.originalError = options?.originalError;
    this.metadata = options?.metadata;
    this.i18nKey = options?.i18nKey;
    this.i18nParams = options?.i18nParams;

    // Error クラスのスタックトレースを保持
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }
  }

  /**
   * AppErrorインターフェースに変換
   */
  toAppError(): AppError {
    return {
      message: this.message,
      code: this.code,
      level: this.level,
      originalError: this.originalError,
      metadata: this.metadata,
      i18nKey: this.i18nKey,
      i18nParams: this.i18nParams,
    };
  }
}

/**
 * データベース関連のエラークラス
 */
export class DatabaseError extends ServerError {
  constructor(
    message: string,
    originalError?: unknown,
    metadata?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.DATABASE_ERROR, {
      level: ErrorLevels.ERROR,
      originalError,
      metadata,
      i18nKey: 'errors.database',
    });
    this.name = 'DatabaseError';
  }
}

/**
 * バリデーションエラークラス
 */
export class ValidationError extends ServerError {
  constructor(
    message: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.VALIDATION_ERROR, {
      level: ErrorLevels.WARN,
      metadata,
      i18nKey: 'errors.validation',
    });
    this.name = 'ValidationError';
  }
}

/**
 * リソースが見つからないエラークラス
 */
export class NotFoundError extends ServerError {
  constructor(
    message: string,
    resource?: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.NOT_FOUND, {
      level: ErrorLevels.WARN,
      metadata: { resource, ...metadata },
      i18nKey: 'errors.notFound',
      i18nParams: resource ? { resource } : undefined,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * 認証エラークラス
 */
export class UnauthorizedError extends ServerError {
  constructor(
    message: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.UNAUTHORIZED, {
      level: ErrorLevels.WARN,
      metadata,
      i18nKey: 'errors.unauthorized',
    });
    this.name = 'UnauthorizedError';
  }
}

/**
 * 認可エラークラス
 */
export class ForbiddenError extends ServerError {
  constructor(
    message: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.FORBIDDEN, {
      level: ErrorLevels.WARN,
      metadata,
      i18nKey: 'errors.forbidden',
    });
    this.name = 'ForbiddenError';
  }
}

