import assert from 'node:assert';
import test from 'node:test';
import {
  getDb,
  createUser,
  findUserByEmail,
  savePasswordReset,
  getPasswordReset,
  deletePasswordReset,
  verifyAndResetPassword,
  setUserTwoFactor,
  saveTwoFactorChallenge,
  getTwoFactorChallenge,
  verifyTwoFactorChallenge,
  createJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalAnalytics,
} from '../src/lib/db.ts';
import { hashPassword, verifyPassword } from '../src/lib/auth.ts';

test('Feature 1: Self-Service Forgot Password & Reset Code Lifecycle', async () => {
  getDb();
  const testEmail = `recovery_${Date.now()}@stratum.prop`;
  const initialPassword = 'InitialSecret!2026';
  const newPassword = 'NewResetPassword!2026';
  const initialHash = await hashPassword(initialPassword);

  const user = createUser({
    email: testEmail,
    passwordHash: initialHash,
    name: 'Reset Flow Trader',
  });
  assert.ok(user.id);

  // 1. Generate & Save 6-digit Reset Request
  const resetCode = '739201';
  savePasswordReset(testEmail, resetCode, 10);

  const record = getPasswordReset(testEmail);
  assert.ok(record);
  assert.strictEqual(record.code, resetCode);
  assert.strictEqual(record.email, testEmail);

  // 2. Reject incorrect verification code
  const wrongNewHash = await hashPassword(newPassword);
  const badAttempt = verifyAndResetPassword(testEmail, '999999', wrongNewHash);
  assert.strictEqual(badAttempt.success, false);
  assert.ok(badAttempt.error?.includes('Invalid'));

  // 3. Successful password reset
  const goodAttempt = verifyAndResetPassword(testEmail, resetCode, wrongNewHash);
  assert.strictEqual(goodAttempt.success, true);

  // 4. Reset record should be deleted/cleared
  assert.strictEqual(getPasswordReset(testEmail), null);

  // 5. Verify user's updated password verifies with new password
  const updatedUser = findUserByEmail(testEmail);
  assert.ok(updatedUser);
  const verifyOld = await verifyPassword(initialPassword, updatedUser.password);
  assert.strictEqual(verifyOld, false);
  const verifyNew = await verifyPassword(newPassword, updatedUser.password);
  assert.strictEqual(verifyNew, true);
});

test('Feature 4: Two-Factor Authentication (2FA) State & Challenge Verification', async () => {
  getDb();
  const testEmail = `twofa_${Date.now()}@stratum.prop`;
  const user = createUser({
    email: testEmail,
    passwordHash: await hashPassword('Pass123!'),
    name: '2FA Trader',
  });

  // 1. Initially 2FA is disabled (0)
  assert.strictEqual(Boolean(user.twoFactorEnabled), false);

  // 2. Toggle 2FA ON
  const enableRes = setUserTwoFactor(user.id, true);
  assert.strictEqual(enableRes.success, true);
  const updatedUser = findUserByEmail(testEmail);
  assert.strictEqual(Boolean(updatedUser?.twoFactorEnabled), true);

  // 3. Create 2FA Login Challenge
  const otpCode = '482910';
  saveTwoFactorChallenge(testEmail, otpCode, 5);

  const challenge = getTwoFactorChallenge(testEmail);
  assert.ok(challenge);
  assert.strictEqual(challenge.code, otpCode);

  // 4. Reject incorrect 2FA OTP code
  const wrongVerify = verifyTwoFactorChallenge(testEmail, '111111');
  assert.strictEqual(wrongVerify.success, false);
  assert.ok(wrongVerify.error?.includes('Invalid 2FA'));

  // 5. Accept correct 2FA OTP code
  const goodVerify = verifyTwoFactorChallenge(testEmail, otpCode);
  assert.strictEqual(goodVerify.success, true);
  assert.strictEqual(goodVerify.user?.email, testEmail);

  // 6. Challenge should be consumed
  assert.strictEqual(getTwoFactorChallenge(testEmail), null);

  // 7. Toggle 2FA OFF
  const disableRes = setUserTwoFactor(user.id, false);
  assert.strictEqual(disableRes.success, true);
  const finalUser = findUserByEmail(testEmail);
  assert.strictEqual(Boolean(finalUser?.twoFactorEnabled), false);
});

test('Feature 2: Institutional Trader Journal & Performance Analytics', async () => {
  getDb();
  const userId = `usr_journal_${Date.now()}`;

  // Log 3 closed trades and 1 open trade
  // Trade 1: Win +$850, RR 2.5
  createJournalEntry({
    userId,
    asset: 'EURUSD',
    direction: 'BUY',
    entryPrice: 1.08500,
    stopLoss: 1.08300,
    takeProfit: 1.09000,
    lotSize: 2.0,
    pnl: 850,
    riskReward: 2.5,
    strategyTag: 'London Breakout',
    emotionalState: 'Calm & Disciplined',
    notes: 'Clean breaker block retest during London open.',
    status: 'CLOSED',
  });

  // Trade 2: Win +$620, RR 2.0
  createJournalEntry({
    userId,
    asset: 'NAS100',
    direction: 'SELL',
    entryPrice: 18450,
    stopLoss: 18490,
    takeProfit: 18370,
    lotSize: 1.0,
    pnl: 620,
    riskReward: 2.0,
    strategyTag: 'NY Session Liquidity Sweep',
    emotionalState: 'Neutral',
    notes: 'Swept overnight high before aggressive drop.',
    status: 'CLOSED',
  });

  // Trade 3: Loss -$400, RR 1.5
  const lossTrade = createJournalEntry({
    userId,
    asset: 'XAUUSD',
    direction: 'BUY',
    entryPrice: 2380.0,
    stopLoss: 2375.0,
    takeProfit: 2390.0,
    lotSize: 0.5,
    pnl: -400,
    riskReward: 1.5,
    strategyTag: 'FVG Retracement',
    emotionalState: 'Mild FOMO',
    notes: 'Entered early before 15m candle close.',
    status: 'CLOSED',
  });

  // Trade 4: Open trade (should not skew closed trade win rate calculations)
  createJournalEntry({
    userId,
    asset: 'GBPUSD',
    direction: 'BUY',
    entryPrice: 1.27100,
    stopLoss: 1.26900,
    takeProfit: 1.27600,
    lotSize: 1.0,
    pnl: 0,
    riskReward: 2.5,
    status: 'OPEN',
  });

  // Fetch entries
  const entries = getJournalEntries(userId);
  assert.strictEqual(entries.length, 4);

  // Compute analytics
  const analytics = getJournalAnalytics(userId);
  assert.strictEqual(analytics.totalTrades, 4);
  assert.strictEqual(analytics.closedTrades, 3);
  assert.strictEqual(analytics.wins, 2);
  assert.strictEqual(analytics.losses, 1);
  assert.strictEqual(analytics.winRate, 66.7);
  assert.strictEqual(analytics.netPnl, 1070); // 850 + 620 - 400
  assert.strictEqual(analytics.profitFactor, Number((1470 / 400).toFixed(2))); // 3.67
  assert.strictEqual(analytics.averageRR, 2.0); // (2.5 + 2.0 + 1.5) / 3 = 2.0

  // Update entry
  const updated = updateJournalEntry(lossTrade.id, userId, {
    notes: 'Post-mortem: strict adherence to 15m close required.',
  });
  assert.strictEqual(updated, true);

  // Delete trade
  const deleted = deleteJournalEntry(lossTrade.id, userId);
  assert.strictEqual(deleted, true);
  const remaining = getJournalEntries(userId);
  assert.strictEqual(remaining.length, 3);
});
