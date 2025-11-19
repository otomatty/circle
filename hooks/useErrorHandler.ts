'use client';

import { useTranslation } from 'react-i18next';

import { useToast } from './useToast';
import { logClientError, toAppError, getErrorMessage, type AppError } from '~/lib/errors';

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

      toast({
        title: t('errors.title'),
        description: errorMessage,
        variant: 'destructive',
      });

      options?.onError?.(appError);
      return undefined;
    }
  };

  return { handleError };
}
