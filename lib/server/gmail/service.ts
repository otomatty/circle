'use server';

// NOTE: Gmail機能は現在SQLiteスキーマにGmail関連テーブルが存在しないため、一旦無効化しています。
// 後でSQLiteスキーマにGmail関連テーブルを追加し、このファイルを再実装する必要があります。

import { GmailClient } from './client';
import type {
  GetMailOptions,
  SendMailOptions,
  ModifyMessageOptions,
  GmailSyncResult,
} from '~/types/gmail';
import { GmailError } from './errors';

/**
 * メール一覧を取得し、データベースに同期する
 * @param options 取得オプション
 * @deprecated SQLiteスキーマにGmail関連テーブルが存在しないため、一旦無効化
 */
export async function syncEmails(
  options: GetMailOptions = {}
): Promise<GmailSyncResult> {
  throw new GmailError(
    'Gmail機能は現在利用できません。SQLiteスキーマにGmail関連テーブルを追加する必要があります。'
  );
}

/**
 * メールを送信する
 * @param options 送信オプション
 * @deprecated SQLiteスキーマにGmail関連テーブルが存在しないため、一旦無効化
 */
export async function sendEmail(options: SendMailOptions): Promise<string> {
  throw new GmailError(
    'Gmail機能は現在利用できません。SQLiteスキーマにGmail関連テーブルを追加する必要があります。'
  );
}

/**
 * メールのラベルを更新する
 * @param messageId メッセージID
 * @param options 更新オプション
 * @deprecated SQLiteスキーマにGmail関連テーブルが存在しないため、一旦無効化
 */
export async function updateEmailLabels(
  messageId: string,
  options: ModifyMessageOptions
): Promise<void> {
  throw new GmailError(
    'Gmail機能は現在利用できません。SQLiteスキーマにGmail関連テーブルを追加する必要があります。'
  );
}
