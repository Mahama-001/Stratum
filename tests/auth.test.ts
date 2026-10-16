import assert from 'node:assert';
import test from 'node:test';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../src/lib/auth.ts';
import { findUserByEmail, createUser, sanitizeUser, getDb, saveEmailVerification, getEmailVerification, deleteEmailVerification, verifyCodeAndCreateUser } from '../src/lib/db.ts';
import { MemoryRateLimiter } from '../src/lib/rateLimit.ts';
import { generateVerificationCode, sendVerificationEmail, renderVerificationEmailHtml } from '../src/lib/email.ts';

test('Password Hashing & Verification with bcryptjs', async () => {
  const password = 'PropTrader2026!Secure';
  const hash = await hashPassword(password);

  assert.notStrictEqual(hash, password);
  assert.ok(hash.startsWith('$2'));

  const validMatch = await verifyPassword(password, hash);
  assert.strictEqual(validMatch, true);

  const invalidMatch = await verifyPassword('WrongPassword', hash);
  assert.strictEqual(invalidMatch, false);
});

test('Password Edge Cases: Unicode & Special Characters', async () => {
  const unicodePassword = 'Trader_🔑_🛡️_€100k_Alpha!';
  const hash = await hashPassword(unicodePassword);

  const validMatch = await verifyPassword(unicodePassword, hash);
  assert.strictEqual(validMatch, true);

  const invalidMatch = await verifyPassword('Trader_🔑_🛡️_€100k_Beta!', hash);
  assert.strictEqual(invalidMatch, false);
});

test('JWT Session Token generation and validation', async () => {
  const payload = {
    userId: 'usr_test_123',
    email: 'trader@stratum.prop',
    name: 'Jordan Belfort',
  };

  const token = await createSessionToken(payload);
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = await verifySessionToken(token);
  assert.ok(decoded !== null);
  assert.strictEqual(decoded.userId, payload.userId);
  assert.strictEqual(decoded.email, payload.email);
  assert.strictEqual(decoded.name, payload.name);

  // Expired / Malformed token handling
  const invalidDecoded = await verifySessionToken('invalid.token.structure');
  assert.strictEqual(invalidDecoded, null);
});

test('SQLite Database User Creation & Retrieval with Case-Insensitivity and Trimming', async () => {
  // Ensure table exists
  getDb();

  const baseUnique = `audit_${Date.now()}`;
  const rawEmailInput = `  ${baseUnique.toUpperCase()}@STRATUM.PROP  `;
  const normalizedEmail = `${baseUnique.toLowerCase()}@stratum.prop`;
  const passwordHash = await hashPassword('password123');

  const newUser = createUser({
    email: rawEmailInput,
    name: '  Audited Trader  ',
    passwordHash,
  });

  assert.ok(newUser.id.startsWith('usr_'));
  assert.strictEqual(newUser.email, normalizedEmail, 'Email should be stored trimmed and lowercased');
  assert.strictEqual(newUser.name, 'Audited Trader', 'Name should be trimmed');
  assert.strictEqual((newUser as Record<string, unknown>).password, undefined, 'Password must not leak');

  // Retrieval with mixed-case and untrimmed query
  const fetchedUpper = findUserByEmail(` ${baseUnique.toUpperCase()}@STRATUM.PROP `);
  assert.ok(fetchedUpper !== null, 'User should be found regardless of casing or surrounding whitespace');
  assert.strictEqual(fetchedUpper.email, normalizedEmail);

  // Sanitize verification
  const safe = sanitizeUser(fetchedUpper);
  assert.strictEqual((safe as Record<string, unknown>).password, undefined);
});

test('Rate Limiter Stress & Fault Tolerance', () => {
  const limiter = new MemoryRateLimiter(3, 1000);
  const testKey = 'test_ip_127.0.0.1';

  // Request 1: Allowed
  const r1 = limiter.check(testKey);
  assert.strictEqual(r1.success, true);
  assert.strictEqual(r1.remaining, 2);

  // Request 2: Allowed
  const r2 = limiter.check(testKey);
  assert.strictEqual(r2.success, true);
  assert.strictEqual(r2.remaining, 1);

  // Request 3: Allowed (last one)
  const r3 = limiter.check(testKey);
  assert.strictEqual(r3.success, true);
  assert.strictEqual(r3.remaining, 0);

  // Request 4: Blocked (rate limit exceeded)
  const r4 = limiter.check(testKey);
  assert.strictEqual(r4.success, false);
  assert.strictEqual(r4.remaining, 0);
  assert.ok(r4.reset > 0);

  // Reset check
  limiter.reset(testKey);
  const rAfterReset = limiter.check(testKey);
  assert.strictEqual(rAfterReset.success, true);
  assert.strictEqual(rAfterReset.remaining, 2);
});

test('Verification Code Generator Format and Randomness', () => {
  const codes = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const code = generateVerificationCode();
    assert.strictEqual(code.length, 6, 'Verification code must be exactly 6 digits');
    assert.ok(/^\d{6}$/.test(code), 'Verification code must contain only numeric digits');
    codes.add(code);
  }
  // With 20 random 6-digit codes, we expect high entropy (at least 15 unique values)
  assert.ok(codes.size >= 18, 'Codes should have high cryptographic randomness');
});

test('Email Verification Template & Dispatcher', async () => {
  const emailHtml = renderVerificationEmailHtml('849201', 'Elena Fisher');
  assert.ok(emailHtml.includes('849201'), 'Email HTML must include the verification code');
  assert.ok(emailHtml.includes('Elena Fisher'), 'Email HTML should greet the user by name');
  assert.ok(emailHtml.includes('10 minutes'), 'Email HTML should state code expiry');

  const origKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  const dispatchResult = await sendVerificationEmail('elena@stratum.prop', '849201', 'Elena');
  assert.strictEqual(dispatchResult.success, true);
  assert.strictEqual(dispatchResult.deliveredTo, 'elena@stratum.prop');
  assert.strictEqual(dispatchResult.previewCode, '849201');

  if (origKey) process.env.RESEND_API_KEY = origKey;
});

test('Database Email Verification: Save, Expiration, Mismatch, and Account Activation', async () => {
  getDb();
  const testEmail = `verify_${Date.now()}@stratum.prop`;
  const code = '654321';
  const passwordHash = await hashPassword('PropTrader999!');

  // 1. Save verification
  const record = saveEmailVerification({
    email: `  ${testEmail.toUpperCase()}  `,
    name: 'Verified Trader',
    passwordHash,
    code,
    expiresInMinutes: 10,
  });

  assert.strictEqual(record.email, testEmail);
  assert.strictEqual(record.code, code);

  // 2. Fetch verification
  const fetched = getEmailVerification(testEmail);
  assert.ok(fetched !== null);
  assert.strictEqual(fetched.code, code);

  // 3. Test wrong code rejection
  const invalidResult = verifyCodeAndCreateUser(testEmail, '000000');
  assert.strictEqual(invalidResult.success, false);
  assert.ok(invalidResult.error?.includes('Invalid verification code'));

  // 4. Test code verification success & user creation
  const validResult = verifyCodeAndCreateUser(testEmail, code);
  assert.strictEqual(validResult.success, true);
  assert.ok(validResult.user !== undefined);
  assert.strictEqual(validResult.user.email, testEmail);
  assert.strictEqual(validResult.user.status, 'active');

  // 5. Verification record should be cleared after activation
  const cleared = getEmailVerification(testEmail);
  assert.strictEqual(cleared, null, 'Pending verification must be deleted upon successful activation');

  // 6. User should now exist in users table
  const userInDb = findUserByEmail(testEmail);
  assert.ok(userInDb !== null);
  assert.strictEqual(userInDb.email, testEmail);

  // 7. Test expired code rejection
  const expiredEmail = `expired_${Date.now()}@stratum.prop`;
  saveEmailVerification({
    email: expiredEmail,
    name: 'Expired Trader',
    passwordHash,
    code: '112233',
    expiresInMinutes: -1, // in the past
  });

  const expiredResult = verifyCodeAndCreateUser(expiredEmail, '112233');
  assert.strictEqual(expiredResult.success, false);
  assert.ok(expiredResult.error?.includes('expired'));
});

