'use client';

import { useTranslation } from 'react-i18next';

import { useToast } from './useToast';
import { logClientError, toAppError, getErrorMessage, getErrorRecoveryMessage, type AppError } from '~/lib/errors';
import { ErrorCodes } from '~/lib/errors/types';

/**
 * エラーハンドリング用のカスタムフック
 */
export function useErrorHandler() {
  const { toast } = useToast();
  const { t } = useTranslation(['errors', 'common']);

  const handleError = async <T>(
    promise: Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: AppError) => void;
      successMessage?: string;
      component?: string;
      retry?: () => Promise<T>;
    }
  ): Promise<T | undefined> => {
    try {
      const data = await promise;

      if (options?.successMessage) {
        toast({
          description: options.successMessage,
        });
      }

      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      const appError = toAppError(error);

      // エラーログを記録
      logClientError(appError, {
        component: options?.component || 'useErrorHandler',
      });

      // i18n対応のエラーメッセージを取得
      const errorMessage = getErrorMessage(appError, t);
      const recoveryMessage = getErrorRecoveryMessage(appError, t);

      // エラーメッセージと回復メッセージを結合
      // ネットワークエラーの場合は再試行のヒントを追加
      let fullMessage = errorMessage;
      if (recoveryMessage) {
        fullMessage = `${errorMessage}\n\n${recoveryMessage}`;
      }
      if (appError.code === ErrorCodes.NETWORK_ERROR && options?.retry) {
        fullMessage = `${fullMessage}\n\n${t('errors.recovery.retry')}ボタンをクリックして再試行できます。`;
      }

      toast({
        title: t('errors.title'),
        description: fullMessage,
        variant: 'destructive',
      });

      options?.onError?.(appError);
      return undefined;
    }
  };

  return { handleError };
}
