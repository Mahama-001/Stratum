import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { findUserById, type SafeUser } from './db.ts';

export const AUTH_COOKIE_NAME = 'stratum_session';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'stratum_jwt_super_secure_secret_prop_firm_auth_2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const TOKEN_EXPIRY = '7d';

export interface AuthSessionPayload {
  userId: string;
  email: string;
  name?: string | null;
  role?: string;
}

/**
 * Securely hashes a plain-text password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain password against the stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates an encrypted JWT session token for authenticated users.
 */
export async function createSessionToken(payload: AuthSessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT session token and returns the payload if valid.
 */
export async function verifySessionToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId || typeof payload.userId !== 'string') {
      return null;
    }
    return {
      userId: payload.userId,
      email: (payload.email as string) || '',
      name: (payload.name as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated user from incoming cookies.
 * Safe for use in Server Components and Route Handlers.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const user = findUserById(payload.userId);
    if (!user) return null;

    // Ensure password is never exposed
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = 'stratum_admin_session';

/**
 * Checks if the request has valid administrator authorization.
 * Supports both admin session cookie and authenticated user with 'admin' role.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const masterKey = process.env.ADMIN_SECRET_KEY || 'stratum_admin_master_2026';
    if (adminToken && adminToken === masterKey) {
      return true;
    }

    const user = await getCurrentUser();
    if (user && user.role === 'admin') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

