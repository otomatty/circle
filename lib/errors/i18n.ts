/**
 * Error i18n Utilities
 *
 * エラーメッセージの国際化に関するユーティリティを提供します。
 */

import type { AppError } from './types';

/**
 * エラーメッセージをi18nキーに変換する関数
 */
export function getErrorI18nKey(error: AppError): string {
  // i18nKeyが指定されている場合はそれを使用
  if (error.i18nKey) {
    return error.i18nKey;
  }

  // エラーコードに基づいてi18nキーを生成
  const codeToKeyMap: Record<string, string> = {
    DATABASE_ERROR: 'errors.database',
    DATABASE_CONNECTION_ERROR: 'errors.database',
    DATABASE_QUERY_ERROR: 'errors.database',
    VALIDATION_ERROR: 'errors.validation',
    INVALID_INPUT: 'errors.validation',
    NOT_FOUND: 'errors.notFound',
    RESOURCE_NOT_FOUND: 'errors.notFound',
    UNAUTHORIZED: 'errors.unauthorized',
    FORBIDDEN: 'errors.forbidden',
    INTERNAL_ERROR: 'errors.server',
    SERVER_ERROR: 'errors.server',
    CLIENT_ERROR: 'errors.generic',
    NETWORK_ERROR: 'errors.network',
    UNKNOWN_ERROR: 'errors.unknown',
  };

  return codeToKeyMap[error.code] || 'errors.unknown';
}

/**
 * エラーメッセージを取得する関数（i18n対応）
 * クライアントサイドで使用する場合は、i18nextを使用して翻訳を取得
 */
export function getErrorMessage(error: AppError, t?: (key: string, params?: Record<string, string | number>) => string): string {
  if (t) {
    const i18nKey = getErrorI18nKey(error);
    return t(i18nKey, error.i18nParams);
  }

  // i18nが利用できない場合は、エラーメッセージをそのまま返す
  return error.message;
}

