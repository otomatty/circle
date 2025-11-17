import type { gmail_v1 } from 'googleapis';
import { google } from 'googleapis';
import type {
  GmailMessage,
  GmailMessageList,
  GetMailOptions,
  SendMailOptions,
  ModifyMessageOptions,
} from '~/types/gmail';
import {
  GmailError,
  GmailFetchError,
  GmailSendError,
  GmailAttachmentError,
} from './errors';
import { getAuthenticatedClient } from './auth';

/**
 * Gmail APIクライアントクラス
 */
export class GmailClient {
  private gmail: gmail_v1.Gmail;

  constructor(gmail: gmail_v1.Gmail) {
    this.gmail = gmail;
  }

  /**
   * GmailClientのインスタンスを作成する
   */
  static async create(): Promise<GmailClient> {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });
    return new GmailClient(gmail);
  }

  /**
   * メール一覧を取得する
   * @param options 取得オプション
   */
  async getMessages(options: GetMailOptions = {}): Promise<GmailMessageList> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: options.maxResults ?? 20,
        pageToken: options.pageToken,
        labelIds: options.labelIds,
        q: options.q,
      });

      if (!response.data.messages) {
        return {
          messages: [],
          resultSizeEstimate: 0,
        };
      }

      // メッセージの詳細情報を取得
      const messages = await Promise.all(
        response.data.messages
          .filter((message): message is { id: string } => message.id != null)
          .map((message) => this.getMessageDetail(message.id))
      );

      return {
        messages,
        nextPageToken: response.data.nextPageToken ?? undefined,
        resultSizeEstimate: response.data.resultSizeEstimate ?? 0,
      };
    } catch (error) {
      throw new GmailFetchError(
        `Failed to fetch messages: ${(error as Error).message}`
      );
    }
  }

  /**
   * メールの詳細を取得する
   * @param messageId メッセージID
   */
  async getMessageDetail(messageId: string): Promise<GmailMessage> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return response.data as GmailMessage;
    } catch (error) {
      throw new GmailFetchError(
        `Failed to fetch message detail: ${(error as Error).message}`
      );
    }
  }

  /**
   * メールを送信する
   * @param options 送信オプション
   */
  async sendMessage(options: SendMailOptions): Promise<string> {
    try {
      // メールヘッダーの作成
      const headers = [
        `To: ${options.to.join(', ')}`,
        options.cc ? `Cc: ${options.cc.join(', ')}` : null,
        options.bcc ? `Bcc: ${options.bcc.join(', ')}` : null,
        `Subject: ${options.subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset="UTF-8"',
      ]
        .filter(Boolean)
        .join('\r\n');

      // メール本文の作成
      const message = [
        headers,
        '',
        options.text || '',
        options.html
          ? [
              '--boundary_string',
              'Content-Type: text/html; charset="UTF-8"',
              '',
              options.html,
            ].join('\r\n')
          : '',
      ].join('\r\n');

      // Base64エンコード
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      if (!response.data.id) {
        throw new GmailSendError('No message ID returned from Gmail API');
      }

      return response.data.id;
    } catch (error) {
      throw new GmailSendError(
        `Failed to send message: ${(error as Error).message}`
      );
    }
  }

  /**
   * メールを修正する（ラベルの追加/削除）
   * @param messageId メッセージID
   * @param options 修正オプション
   */
  async modifyMessage(
    messageId: string,
    options: ModifyMessageOptions
  ): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: options.addLabelIds,
          removeLabelIds: options.removeLabelIds,
        },
      });
    } catch (error) {
      throw new GmailError(
        `Failed to modify message: ${(error as Error).message}`
      );
    }
  }

  /**
   * 添付ファイルを取得する
   * @param messageId メッセージID
   * @param attachmentId 添付ファイルID
   */
  async getAttachment(
    messageId: string,
    attachmentId: string
  ): Promise<Buffer | null> {
    try {
      const response = await this.gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: attachmentId,
      });

      if (!response.data.data) {
        return null;
      }

      // Base64データをデコード
      const buffer = Buffer.from(
        response.data.data.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      );

      return buffer;
    } catch (error) {
      throw new GmailAttachmentError(
        `Failed to fetch attachment: ${(error as Error).message}`
      );
    }
  }
}
