/**
 * Error Types and Interfaces
 *
 * アプリケーション全体で使用するエラータイプとインターフェースを定義します。
 */

/**
 * エラーコードの定数定義
 */
export const ErrorCodes = {
  // データベース関連エラー
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',

  // バリデーションエラー
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // リソース関連エラー
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // 認証・認可エラー
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // サーバーエラー
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',

  // クライアントエラー
  CLIENT_ERROR: 'CLIENT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // その他
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * エラーレベルの定義
 */
export const ErrorLevels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
} as const;

export type ErrorLevel = (typeof ErrorLevels)[keyof typeof ErrorLevels];

/**
 * アプリケーション全体で使用するエラーインターフェース
 */
export interface AppError {
  /**
   * エラーメッセージ（ユーザー向け）
   */
  message: string;

  /**
   * エラーコード
   */
  code: ErrorCode;

  /**
   * エラーレベル
   */
  level?: ErrorLevel;

  /**
   * 元のエラーオブジェクト（開発環境でのみ使用）
   */
  originalError?: unknown;

  /**
   * 追加のメタデータ
   */
  metadata?: Record<string, unknown>;

  /**
   * i18nキー（エラーメッセージの国際化用）
   */
  i18nKey?: string;

  /**
   * i18nパラメータ（エラーメッセージの国際化用）
   */
  i18nParams?: Record<string, string | number>;
}

/**
 * エラーがAppErrorかどうかを判定する関数
 */
export function isAppError(error: unknown): error is AppError {
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
export function toAppError(error: unknown, defaultCode: ErrorCode = ErrorCodes.UNKNOWN_ERROR): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: defaultCode,
      level: ErrorLevels.ERROR,
      originalError: error,
    };
  }

  return {
    message: String(error),
    code: defaultCode,
    level: ErrorLevels.ERROR,
    originalError: error,
  };
}

