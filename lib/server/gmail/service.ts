'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { GmailClient } from './client';
import type {
  GetMailOptions,
  SendMailOptions,
  ModifyMessageOptions,
  GmailMessage,
  MessagePart,
  EmailAttachmentUpsert,
  GmailSyncResult,
  GmailSyncError,
} from '~/types/gmail';
import { GmailError } from './errors';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/lib/database.types';

/**
 * メール一覧を取得し、データベースに同期する
 * @param options 取得オプション
 */
export async function syncEmails(
  options: GetMailOptions = {}
): Promise<GmailSyncResult> {
  const client = await GmailClient.create();
  const supabase = await getSupabaseServerClient();
  const errors: GmailSyncError[] = [];

  // 最後の同期時刻を取得
  const { data: lastSync } = await supabase
    .from('email_settings')
    .select('id, last_sync_at')
    .single();

  // 検索クエリを構築（最後の同期以降のメールのみを取得）
  const searchQuery = lastSync?.last_sync_at
    ? `after:${new Date(lastSync.last_sync_at).getTime() / 1000}`
    : undefined;

  const { messages, nextPageToken } = await client.getMessages({
    ...options,
    q: searchQuery,
  });

  // メッセージをデータベースに保存
  for (const message of messages) {
    const headers = message.payload.headers;
    const from = headers.find((h) => h.name.toLowerCase() === 'from');
    const to = headers.find((h) => h.name.toLowerCase() === 'to');
    const cc = headers.find((h) => h.name.toLowerCase() === 'cc');
    const subject = headers.find((h) => h.name.toLowerCase() === 'subject');

    // メール本文の取得
    const textPart = findPartByMimeType(message.payload, 'text/plain');
    const htmlPart = findPartByMimeType(message.payload, 'text/html');

    // 添付ファイルの情報を取得（ファイル本体は保存しない）
    const attachments = findAttachments(message.payload).map((attachment) => ({
      file_name: attachment.filename,
      file_type: attachment.mimeType,
      file_size: attachment.body.size,
      attachment_id: attachment.body.attachmentId,
    }));

    // メールの保存または更新
    const { data: existingEmail } = await supabase
      .from('emails')
      .select('id')
      .eq('gmail_message_id', message.id)
      .single();

    const emailData = {
      gmail_message_id: message.id,
      thread_id: message.threadId,
      from_email: parseEmailAddress(from?.value ?? ''),
      from_name: parseEmailName(from?.value ?? ''),
      to_email: parseEmailAddresses(to?.value ?? ''),
      cc_email: cc ? parseEmailAddresses(cc.value) : null,
      subject: subject?.value ?? '',
      body_text: textPart ? decodeBody(textPart.body.data ?? '') : null,
      body_html: htmlPart ? decodeBody(htmlPart.body.data ?? '') : null,
      received_at: new Date(
        Number.parseInt(message.internalDate, 10)
      ).toISOString(),
      labels: message.labelIds,
      has_attachments: attachments.length > 0,
      updated_at: new Date().toISOString(),
    };

    type Email = Database['public']['Tables']['emails']['Row'];
    let savedEmail: Email | null = null;

    try {
      if (existingEmail) {
        // 既存のメールを更新
        const { data: updated, error: updateError } = await supabase
          .from('emails')
          .update(emailData)
          .eq('id', existingEmail.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }
        savedEmail = updated;
      } else {
        // 新規メールを挿入
        const { data: inserted, error: insertError } = await supabase
          .from('emails')
          .insert(emailData)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
        savedEmail = inserted;
      }
      // 添付ファイルの情報をデータベースに保存
      if (savedEmail && attachments.length > 0) {
        console.log(
          `[Gmail Sync] Processing ${attachments.length} attachments for email ${savedEmail.id}`,
          {
            emailSubject: savedEmail.subject,
            attachments: attachments.map((a) => a.file_name),
          }
        );

        for (const attachment of attachments) {
          try {
            // デバッグ用：添付ファイル処理開始ログ
            console.log('[Gmail Sync] Processing attachment:', {
              file_name: attachment.file_name,
              file_type: attachment.file_type,
              file_size: attachment.file_size,
              email_id: savedEmail.id,
              email_subject: savedEmail.subject,
            });

            const attachmentData: EmailAttachmentUpsert = {
              email_id: savedEmail.id,
              file_name: attachment.file_name,
              file_type: attachment.file_type,
              file_size: attachment.file_size,
              file_path: `emails/${savedEmail.id}/attachments/${attachment.file_name}`,
              attachment_id: attachment.attachment_id,
              is_downloaded: false,
              created_at: new Date().toISOString(),
            };

            // 既存の添付ファイルをチェック
            const { data: existingAttachment } = await supabase
              .from('email_attachments')
              .select('id, file_name')
              .match({
                email_id: savedEmail.id,
                file_name: attachment.file_name,
              })
              .single();

            if (existingAttachment) {
              console.log('[Gmail Sync] Skipping existing attachment:', {
                file_name: existingAttachment.file_name,
                email_id: savedEmail.id,
                email_subject: savedEmail.subject,
              });
              continue; // 既存の添付ファイルはスキップ
            }

            // 新規添付ファイルの保存
            const { error: attachmentError } = await supabase
              .from('email_attachments')
              .insert(attachmentData);

            if (attachmentError) {
              console.error('[Gmail Sync] Failed to save attachment:', {
                error: attachmentError,
                file_name: attachment.file_name,
                email_id: savedEmail.id,
                email_subject: savedEmail.subject,
              });

              errors.push({
                type: 'attachment',
                message: '添付ファイルの保存に失敗しました',
                details: {
                  fileName: attachment.file_name,
                  emailSubject: savedEmail.subject,
                  errorMessage: attachmentError.message,
                },
              });

              continue;
            }

            console.log(
              `[Gmail Sync] Successfully saved attachment metadata for ${attachment.file_name}`,
              {
                email_id: savedEmail.id,
                email_subject: savedEmail.subject,
              }
            );
          } catch (error) {
            const err = error as Error;
            console.error(
              '[Gmail Sync] Unexpected error while processing attachment:',
              {
                error: err,
                file_name: attachment.file_name,
                email_id: savedEmail.id,
                email_subject: savedEmail.subject,
              }
            );

            errors.push({
              type: 'attachment',
              message: '予期せぬエラーが発生しました',
              details: {
                fileName: attachment.file_name,
                emailSubject: savedEmail.subject,
                errorMessage: err.message,
              },
            });
          }
        }
      }

      // デバッグ用：処理完了後の確認
      if (savedEmail) {
        const { data: savedAttachments, error: checkError } = await supabase
          .from('email_attachments')
          .select('*')
          .eq('email_id', savedEmail.id);

        console.log('[Gmail Sync] Attachment processing completed:', {
          email_id: savedEmail.id,
          email_subject: savedEmail.subject,
          total_attachments: attachments.length,
          saved_attachments: savedAttachments?.length ?? 0,
          error: checkError?.message,
        });
      }
    } catch (error) {
      const err = error as Error;
      console.error('[Gmail Sync] Failed to process email:', err);
      errors.push({
        type: 'email',
        message: 'メールの処理中にエラーが発生しました',
        details: {
          emailSubject: subject?.value ?? '不明',
          errorMessage: err.message,
        },
      });
    }
  }

  // 同期時刻を更新
  await supabase
    .from('email_settings')
    .upsert({
      last_sync_at: new Date().toISOString(),
    })
    .match({ id: lastSync?.id ?? 'default' });

  return {
    success: errors.length === 0,
    nextPageToken,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * メールを送信する
 * @param options 送信オプション
 */
export async function sendEmail(options: SendMailOptions) {
  const client = await GmailClient.create();
  const messageId = await client.sendMessage(options);

  // 送信したメールの情報をデータベースに保存
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from('email_replies').insert({
    gmail_message_id: messageId,
    from_email: 'me', // 認証済みユーザーのメールアドレス
    to_email: options.to,
    cc_email: options.cc,
    bcc_email: options.bcc,
    subject: options.subject,
    body_text: options.text,
    body_html: options.html,
    sent_at: new Date().toISOString(),
  });

  if (error) {
    throw new GmailError(`Failed to save sent email: ${error.message}`);
  }

  return messageId;
}

/**
 * メールのラベルを更新する
 * @param messageId メッセージID
 * @param options 更新オプション
 */
export async function updateEmailLabels(
  messageId: string,
  options: ModifyMessageOptions
) {
  const client = await GmailClient.create();
  await client.modifyMessage(messageId, options);

  // データベースの更新
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('emails')
    .update({
      labels: options.addLabelIds, // 新しいラベルで上書き
      updated_at: new Date().toISOString(),
    })
    .eq('gmail_message_id', messageId);

  if (error) {
    throw new GmailError(`Failed to update email labels: ${error.message}`);
  }
}

// ヘルパー関数

/**
 * MIMEタイプに基づいてメッセージパートを検索
 */
function findPartByMimeType(
  payload: MessagePart,
  mimeType: string
): MessagePart | null {
  if (payload.mimeType === mimeType) {
    return payload;
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const found = findPartByMimeType(part, mimeType);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Base64エンコードされた本文をデコード
 */
function decodeBody(data: string): string {
  return Buffer.from(data, 'base64').toString('utf-8');
}

/**
 * メールアドレスをパース（名前部分）
 */
function parseEmailName(email: string): string {
  const match = email.match(/^"?([^"<]+)"?\s*<?[^>]*>?$/);
  return match?.[1]?.trim() || '';
}

/**
 * メールアドレスをパース（アドレス部分）
 */
function parseEmailAddress(email: string): string {
  const match = email.match(/<([^>]+)>$/);
  return match?.[1] || email.trim();
}

/**
 * 複数のメールアドレスをパース
 */
function parseEmailAddresses(emails: string): string[] {
  return emails.split(/,\s*/).map(parseEmailAddress).filter(Boolean);
}

/**
 * 添付ファイルの処理
 */
async function processAttachments(
  client: GmailClient,
  supabase: SupabaseClient,
  message: GmailMessage
) {
  // まず、メールのUUIDを取得
  const { data: email } = await supabase
    .from('emails')
    .select('id')
    .eq('gmail_message_id', message.id)
    .single();

  if (!email) {
    console.error('Failed to find email record for attachment');
    return;
  }

  const attachments = findAttachments(message.payload);
  for (const attachment of attachments) {
    if (!attachment.body.attachmentId) continue;

    const buffer = await client.getAttachment(
      message.id,
      attachment.body.attachmentId
    );
    if (!buffer) continue;

    // Supabase Storageに保存
    const filePath = `emails/${email.id}/attachments/${attachment.filename}`;
    const { error: uploadError } = await supabase.storage
      .from('email-attachments')
      .upload(filePath, buffer);

    if (uploadError) {
      console.error(`Failed to upload attachment: ${uploadError.message}`);
      continue;
    }

    // データベースに記録
    const { error: dbError } = await supabase.from('email_attachments').insert({
      email_id: email.id,
      file_name: attachment.filename,
      file_type: attachment.mimeType,
      file_size: attachment.body.size,
      file_path: filePath,
    });

    if (dbError) {
      console.error(`Failed to save attachment info: ${dbError.message}`);
    }
  }
}

/**
 * 添付ファイルを検索
 */
function findAttachments(payload: MessagePart): MessagePart[] {
  const attachments: MessagePart[] = [];

  if (payload.mimeType.startsWith('multipart/')) {
    for (const part of payload.parts ?? []) {
      attachments.push(...findAttachments(part));
    }
  } else if (payload.body.attachmentId) {
    attachments.push(payload);
  }

  return attachments;
}
