/**
 * Next.js middleware — Supabase session refresh and route protection.
 */

import { type NextRequest, NextResponse } from 'next/server';

import pathsConfig from '~/config/paths.config';
import { isSupabaseConfigured } from '~/lib/supabase/env';
import { updateSession } from '~/lib/supabase/middleware';

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|locales|assets|api/*).*)'],
};

const PUBLIC_PATH_PREFIXES = [
  pathsConfig.auth.signIn,
  pathsConfig.auth.signUp,
  pathsConfig.auth.callback,
  pathsConfig.auth.passwordReset,
  pathsConfig.auth.passwordUpdate,
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (user && pathname === pathsConfig.auth.signIn) {
    const next = request.nextUrl.searchParams.get('next') ?? '/';
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!user && !isPublicPath(pathname)) {
    const signInUrl = new URL(pathsConfig.auth.signIn, request.url);
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return supabaseResponse;
}
