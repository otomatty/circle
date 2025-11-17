/**
 * Next.jsミドルウェアファイル
 *
 * 認証状態の確認と未認証ユーザーのリダイレクトを行います。
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createMiddlewareClient } from '@kit/supabase/middleware-client';

/**
 * ミドルウェアが適用されるパスのマッチャー設定
 * 静的ファイルや画像、APIルートなどを除外
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|images|locales|assets|api/*).*)'],
};

/**
 * 認証が必要なパスの配列
    matcher: ['/((?!_next/static|_next/image|images|locales|assets|api/*).*)'],
  };

  /**
   * 認証が必要なパスの配列
   */
const PROTECTED_PATHS = ['/[orgId]', '/[orgId]/*'];

/**
 * ミドルウェアが適用されるパスのマッチャー設定
 */
/**
 * 認証関連のパスの設定
 */
const AUTH_PATHS = {
  signIn: '/signin', // サインインページ
  callback: '/auth/callback', // 認証コールバックページ
};

/**
 * デフォルトのホームページパス
 */
const HOME_PATH = '/';

/**
 * ミドルウェア関数
 * 全てのリクエストに対して実行される
 *
 * @param request - Nextリクエストオブジェクト
 * @returns Nextレスポンスオブジェクト
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Supabaseクライアントの初期化
  const supabase = createMiddlewareClient(request, response);

  // ユーザーの認証状態を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 現在のパスが認証必要かどうかを判定
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // 認証関連のページかどうかを判定
  const isAuthPage =
    pathname === AUTH_PATHS.signIn || pathname === AUTH_PATHS.callback;

  // 未認証で保護されたパスへのアクセス → サインインページへリダイレクト
  if (isProtectedPath && !user) {
    const redirectUrl = new URL(AUTH_PATHS.signIn, request.nextUrl.origin);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 認証済みでサインインページへのアクセス → ホームページへリダイレクト
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL(HOME_PATH, request.nextUrl.origin));
  }

  // それ以外の場合は通常の処理を続行
  return response;
}
