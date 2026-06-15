/**
 * Better Auth route handler. Handles OAuth callbacks, session endpoints, and
 * sign-out. The auth instance is request-scoped (D1 binding), so we build it
 * per request instead of using `toNextJsHandler` with a module singleton.
 */

import { getAuth } from '~/lib/auth';

export async function GET(request: Request) {
  return getAuth().handler(request);
}

export async function POST(request: Request) {
  return getAuth().handler(request);
}
