/**
 * Client-Side Error Classes
 *
 * クライアントサイドで使用するエラークラスを定義します。
 */

import { ErrorCodes, ErrorLevels, type AppError, type ErrorCode, type ErrorLevel } from './types';

/**
 * クライアントサイド用のベースエラークラス
 */
export class ClientError extends Error implements AppError {
  public readonly code: ErrorCode;
  public readonly level: ErrorLevel;
  public readonly originalError?: unknown;
  public readonly metadata?: Record<string, unknown>;
  public readonly i18nKey?: string;
  public readonly i18nParams?: Record<string, string | number>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCodes.CLIENT_ERROR,
    options?: {
      level?: ErrorLevel;
      originalError?: unknown;
      metadata?: Record<string, unknown>;
      i18nKey?: string;
      i18nParams?: Record<string, string | number>;
    }
  ) {
    super(message);
    this.name = 'ClientError';
    this.code = code;
    this.level = options?.level || ErrorLevels.ERROR;
    this.originalError = options?.originalError;
    this.metadata = options?.metadata;
    this.i18nKey = options?.i18nKey;
    this.i18nParams = options?.i18nParams;

    // Error クラスのスタックトレースを保持
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientError);
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
 * ネットワークエラークラス
 */
export class NetworkError extends ClientError {
  constructor(
    message: string,
    originalError?: unknown,
    metadata?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.NETWORK_ERROR, {
      level: ErrorLevels.ERROR,
      originalError,
      metadata,
      i18nKey: 'errors.network',
    });
    this.name = 'NetworkError';
  }
}

