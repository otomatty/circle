/**
 * Error Logger
 *
 * 構造化されたエラーログ機能を提供します。
 * サーバーサイドとクライアントサイドの両方で使用可能です。
 */

import { ErrorLevels, type AppError, type ErrorLevel } from './types';

/**
 * ログエントリの型定義
 */
interface LogEntry {
  timestamp: string;
  level: ErrorLevel;
  message: string;
  code?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
  userAgent?: string;
  url?: string;
}

/**
 * エラーログを記録する関数
 */
export function logError(
  error: AppError | Error | unknown,
  context?: {
    metadata?: Record<string, unknown>;
    url?: string;
    userAgent?: string;
  }
): void {
  const appError = isAppError(error) ? error : toAppError(error);
  const level = appError.level || ErrorLevels.ERROR;

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: appError.message,
    code: appError.code,
    metadata: {
      ...appError.metadata,
      ...context?.metadata,
    },
    url: context?.url,
    userAgent: context?.userAgent,
  };

  // スタックトレースを追加（開発環境またはエラーレベルの場合）
  if (
    (process.env.NODE_ENV === 'development' || level === ErrorLevels.ERROR) &&
    appError.originalError instanceof Error
  ) {
    logEntry.stack = appError.originalError.stack;
  }

  // 環境に応じたログ出力
  if (process.env.NODE_ENV === 'production') {
    // 本番環境では詳細情報を制限
    logProductionError(logEntry);
  } else {
    // 開発環境では詳細情報を出力
    logDevelopmentError(logEntry, appError);
  }
}

/**
 * 本番環境用のログ出力（詳細情報を制限）
 */
function logProductionError(entry: LogEntry): void {
  const { stack, ...safeEntry } = entry;

  switch (entry.level) {
    case ErrorLevels.ERROR:
      console.error('[ERROR]', safeEntry);
      break;
    case ErrorLevels.WARN:
      console.warn('[WARN]', safeEntry);
      break;
    case ErrorLevels.INFO:
      console.info('[INFO]', safeEntry);
      break;
    default:
      console.error('[ERROR]', safeEntry);
  }
}

/**
 * 開発環境用のログ出力（詳細情報を出力）
 */
function logDevelopmentError(entry: LogEntry, appError: AppError): void {
  const logData = {
    ...entry,
    originalError: appError.originalError,
  };

  switch (entry.level) {
    case ErrorLevels.ERROR:
      console.error('[ERROR]', logData);
      if (entry.stack) {
        console.error('[STACK]', entry.stack);
      }
      break;
    case ErrorLevels.WARN:
      console.warn('[WARN]', logData);
      break;
    case ErrorLevels.INFO:
      console.info('[INFO]', logData);
      break;
    default:
      console.error('[ERROR]', logData);
  }
}

/**
 * AppErrorかどうかを判定する関数
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error &&
    typeof (error as AppError).message === 'string' &&
    typeof (error as AppError).code === 'string'
  );
}

/**
 * エラーをAppErrorに変換する関数
 */
function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      level: ErrorLevels.ERROR,
      originalError: error,
    };
  }

  return {
    message: String(error),
    code: 'UNKNOWN_ERROR',
    level: ErrorLevels.ERROR,
    originalError: error,
  };
}

/**
 * サーバーサイド用のエラーログ関数
 */
export function logServerError(
  error: AppError | Error | unknown,
  context?: {
    action?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  logError(error, {
    metadata: {
      ...context?.metadata,
      action: context?.action,
      environment: 'server',
    },
  });
}

/**
 * クライアントサイド用のエラーログ関数
 */
export function logClientError(
  error: AppError | Error | unknown,
  context?: {
    component?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const url = typeof window !== 'undefined' ? window.location.href : undefined;
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

  logError(error, {
    url,
    userAgent,
    metadata: {
      ...context?.metadata,
      component: context?.component,
      environment: 'client',
    },
  });
}

