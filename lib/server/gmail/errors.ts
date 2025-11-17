import type { GmailApiError } from '~/types/gmail';

/**
 * Gmail API関連の基本エラークラス
 */
export class GmailError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'GmailError';
  }

  static fromApiError(error: GmailApiError): GmailError {
    return new GmailError(
      error.error.message,
      error.error.status,
      error.error.code
    );
  }
}

/**
 * 認証関連のエラークラス
 */
export class GmailAuthError extends GmailError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'GmailAuthError';
  }
}

/**
 * トークン関連のエラークラス
 */
export class GmailTokenError extends GmailError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'GmailTokenError';
  }
}

/**
 * メール送信関連のエラークラス
 */
export class GmailSendError extends GmailError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'GmailSendError';
  }
}

/**
 * メール取得関連のエラークラス
 */
export class GmailFetchError extends GmailError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'GmailFetchError';
  }
}

/**
 * 添付ファイル関連のエラークラス
 */
export class GmailAttachmentError extends GmailError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'GmailAttachmentError';
  }
}

/**
 * レート制限関連のエラークラス
 */
export class GmailRateLimitError extends GmailError {
  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'GmailRateLimitError';
  }
}

/**
 * エラーコードの定数
 */
export const GmailErrorCodes = {
  UNAUTHORIZED: '401',
  FORBIDDEN: '403',
  NOT_FOUND: '404',
  RATE_LIMIT_EXCEEDED: '429',
  INTERNAL_ERROR: '500',
} as const;
