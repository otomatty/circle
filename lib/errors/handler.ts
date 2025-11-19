/**
 * Error Handler Utilities
 *
 * Server Actions用のエラーハンドリングラッパーを提供します。
 */

import { logServerError } from './logger';
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  type ServerError,
} from './server';
import { ErrorCodes, toAppError, type AppError } from './types';

/**
 * Server Action用のエラーハンドリングラッパー
 * エラーをキャッチし、適切な形式に変換してログに記録します。
 */
export async function handleServerAction<T>(
  action: () => Promise<T>,
  options?: {
    actionName?: string;
    defaultErrorMessage?: string;
    i18nKey?: string;
  }
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    const appError = toAppError(error);

    // エラーログを記録
    logServerError(appError, {
      action: options?.actionName,
      metadata: {
        defaultErrorMessage: options?.defaultErrorMessage,
        i18nKey: options?.i18nKey,
      },
    });

    // エラーの種類に応じて適切なエラーをスロー
    // 既にServerErrorのインスタンスの場合はそのままスロー
    if (error instanceof ServerError) {
      throw error;
    }

    // better-sqlite3のSqliteErrorをチェック
    // SqliteErrorはErrorを継承し、codeプロパティを持つ
    if (
      error instanceof Error &&
      'code' in error &&
      typeof (error as { code?: string }).code === 'string' &&
      ((error as { code: string }).code.startsWith('SQLITE_') ||
        error.name === 'SqliteError')
    ) {
      throw new DatabaseError(
        options?.defaultErrorMessage || 'データベースエラーが発生しました',
        error
      );
    }

    // バリデーションエラーの場合（instanceofチェックを優先）
    if (error instanceof ValidationError) {
      throw error;
    }

    // リソースが見つからない場合（instanceofチェックを優先）
    if (error instanceof NotFoundError) {
      throw error;
    }

    // データベースエラーの場合（フォールバック: メッセージベースの判定）
    if (
      error instanceof Error &&
      (error.message.includes('database') ||
        error.message.includes('SQL') ||
        error.message.includes('query') ||
        error.message.includes('SQLite'))
    ) {
      throw new DatabaseError(
        options?.defaultErrorMessage || 'データベースエラーが発生しました',
        error
      );
    }

    // バリデーションエラーの場合（フォールバック: メッセージベースの判定）
    if (
      error instanceof Error &&
      (error.message.includes('validation') ||
        error.message.includes('invalid') ||
        error.message.includes('required'))
    ) {
      throw new ValidationError(
        options?.defaultErrorMessage || '入力値が不正です',
        { originalError: error.message }
      );
    }

    // リソースが見つからない場合（フォールバック: メッセージベースの判定）
    if (
      error instanceof Error &&
      (error.message.includes('not found') ||
        error.message.includes('見つかりません'))
    ) {
      throw new NotFoundError(
        options?.defaultErrorMessage || 'リソースが見つかりません',
        undefined,
        { originalError: error.message }
      );
    }

    // その他のエラー
    throw new ServerError(
      options?.defaultErrorMessage || appError.message,
      ErrorCodes.SERVER_ERROR,
      {
        originalError: error,
        i18nKey: options?.i18nKey,
      }
    );
  }
}

/**
 * データベース操作用のエラーハンドリングラッパー
 */
export async function handleDatabaseAction<T>(
  action: () => Promise<T>,
  options?: {
    actionName?: string;
    defaultErrorMessage?: string;
  }
): Promise<T> {
  return handleServerAction(action, {
    ...options,
    defaultErrorMessage: options?.defaultErrorMessage || 'データベース操作に失敗しました',
    i18nKey: 'errors.database',
  });
}

/**
 * バリデーション用のエラーハンドリングラッパー
 */
export function handleValidation(
  condition: boolean,
  message: string,
  metadata?: Record<string, unknown>
): asserts condition {
  if (!condition) {
    throw new ValidationError(message, metadata);
  }
}

