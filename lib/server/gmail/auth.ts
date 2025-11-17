import { OAuth2Client } from 'google-auth-library';

import type { GmailToken } from '~/types/gmail';

import { GmailAuthError, GmailTokenError } from './errors';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// 認証に必要なスコープ
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];

/**
 * OAuth2クライアントを作成する
 */
export function createOAuth2Client(): OAuth2Client {
  console.log('Creating OAuth2Client with environment variables...');
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI;

  console.log('Environment variables check:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasRedirectUri: !!redirectUri,
    redirectUri: redirectUri, // URIは安全に表示可能
  });

  if (!clientId || !clientSecret || !redirectUri) {
    throw new GmailAuthError('Gmail API credentials are not configured');
  }

  const client = new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  });

  console.log('OAuth2Client created successfully');
  return client;
}

/**
 * 認証URLを生成する
 */
export function generateAuthUrl(): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * 認証コードからトークンを取得する
 * @param code 認証コード
 */
export async function getTokenFromCode(code: string): Promise<GmailToken> {
  const oauth2Client = createOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new GmailTokenError('Invalid token response');
    }

    const gmailToken: GmailToken = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope ?? SCOPES.join(' '),
      token_type: tokens.token_type ?? 'Bearer',
      expiry_date: tokens.expiry_date ?? Date.now() + 3600000,
    };

    // トークンをデータベースに保存
    await saveToken(gmailToken);

    return gmailToken;
  } catch (error) {
    throw new GmailTokenError(
      `Failed to get token: ${(error as Error).message}`
    );
  }
}

/**
 * トークンを更新する
 * @param refreshToken リフレッシュトークン
 */
export async function refreshToken(refreshToken: string): Promise<GmailToken> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new GmailTokenError('No access token returned from refresh');
    }

    const gmailToken: GmailToken = {
      access_token: credentials.access_token,
      refresh_token: refreshToken,
      scope: credentials.scope ?? SCOPES.join(' '),
      token_type: credentials.token_type ?? 'Bearer',
      expiry_date: credentials.expiry_date ?? Date.now() + 3600000,
    };

    // 更新したトークンをデータベースに保存
    await saveToken(gmailToken);

    return gmailToken;
  } catch (error) {
    throw new GmailTokenError(
      `Failed to refresh token: ${(error as Error).message}`
    );
  }
}

/**
 * 古い認証情報を削除する
 */
async function cleanupOldCredentials(): Promise<void> {
  console.log('Cleaning up old credentials...');
  const supabase = await getSupabaseServerClient();

  // 最新の認証情報以外を削除
  const { error } = await supabase
    .from('gmail_credentials')
    .delete()
    .order('created_at', { ascending: false })
    .gt('created_at', 1)
    .select();

  if (error) {
    console.error('Failed to cleanup old credentials:', error);
  }
}

/**
 * トークンをデータベースに保存する
 * @param token トークン情報
 */
async function saveToken(token: GmailToken): Promise<void> {
  const supabase = await getSupabaseServerClient();

  // 古い認証情報をクリーンアップ
  await cleanupOldCredentials();

  const { error } = await supabase.from('gmail_credentials').upsert({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_type: token.token_type,
    expiry_date: new Date(token.expiry_date).toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new GmailTokenError(`Failed to save token: ${error.message}`);
  }
}

/**
 * 認証済みのOAuth2クライアントを取得する
 */
export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  console.log('Starting getAuthenticatedClient...');
  const supabase = await getSupabaseServerClient();

  console.log('Fetching credentials from database...');
  const { data: credentials, error } = await supabase
    .from('gmail_credentials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  console.log('Database query result:', {
    hasCredentials: !!credentials,
    error: error
      ? {
          message: error.message,
          code: error.code,
          details: error.details,
        }
      : null,
  });

  if (error || !credentials) {
    throw new GmailAuthError('No Gmail credentials found');
  }

  console.log('Creating OAuth2Client...');
  const oauth2Client = createOAuth2Client();

  console.log('Setting credentials...');
  oauth2Client.setCredentials({
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token,
    token_type: credentials.token_type,
    expiry_date: new Date(credentials.expiry_date).getTime(),
  });

  // トークンが期限切れの場合は更新
  const expiryDate = new Date(credentials.expiry_date).getTime();
  const now = Date.now();
  console.log('Token expiry check:', {
    expiryDate: new Date(expiryDate).toISOString(),
    currentTime: new Date(now).toISOString(),
    timeUntilExpiry: (expiryDate - now) / 1000 / 60, // 分単位で表示
    needsRefresh: expiryDate < now + 300000,
  });

  if (expiryDate < now + 300000) {
    // 5分前から更新
    console.log('Token needs refresh, attempting to refresh...');
    try {
      const newToken = await refreshToken(credentials.refresh_token);
      console.log('Token refresh successful');
      oauth2Client.setCredentials({
        access_token: newToken.access_token,
        refresh_token: newToken.refresh_token,
        token_type: newToken.token_type,
        expiry_date: newToken.expiry_date,
      });
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      throw refreshError;
    }
  }

  console.log('getAuthenticatedClient completed successfully');
  return oauth2Client;
}
