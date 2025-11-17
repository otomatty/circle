/**
 * Next.jsミドルウェアファイル
 *
 * 認証は廃止されたため、このミドルウェアは最小限の処理のみを行います。
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * ミドルウェアが適用されるパスのマッチャー設定
 * 静的ファイルや画像、APIルートなどを除外
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|images|locales|assets|api/*).*)'],
};

/**
 * ミドルウェア関数
 * 全てのリクエストに対して実行される
 *
 * @param request - Nextリクエストオブジェクト
 * @returns Nextレスポンスオブジェクト
 */
export async function middleware(request: NextRequest) {
  // 認証が廃止されたため、単にリクエストを通す
  return NextResponse.next();
}
