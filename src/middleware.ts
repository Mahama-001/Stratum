import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'stratum_session';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'stratum_jwt_super_secure_secret_prop_firm_auth_2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

// Define route prefixes that require an active session
const PROTECTED_ROUTES = ['/dashboard', '/account'];
const AUTH_PAGE_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 1. If user is already authenticated and visits login/signup, redirect to home
  if (token && AUTH_PAGE_ROUTES.some((route) => pathname.startsWith(route))) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/', request.url));
    } catch {
      // Invalid/expired token: clear cookie and allow login/signup page to load
      const response = NextResponse.next();
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  // 2. Protected routes enforcement
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
