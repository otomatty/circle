/**
 * Next.js middleware — Better Auth route protection (Cloudflare-native).
 *
 * Uses an optimistic session-cookie check at the edge (no DB call). Full
 * session validation happens in Server Components / Server Actions.
 */

import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

import pathsConfig from '~/config/paths.config';

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|locales|assets|api/).*)'],
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

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (sessionCookie && pathname === pathsConfig.auth.signIn) {
    const next = request.nextUrl.searchParams.get('next') ?? '/';
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!sessionCookie && !isPublicPath(pathname)) {
    const signInUrl = new URL(pathsConfig.auth.signIn, request.url);
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}
