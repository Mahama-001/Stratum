import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role?: string; // 'admin' | 'trader'
  status?: string; // 'active' | 'suspended'
  twoFactorEnabled?: number; // 0 | 1
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<DbUser, 'password'>;

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    let dbPath = path.resolve(process.cwd(), 'stratum.db');

    // In serverless environments like Vercel, the project root is read-only.
    // The only writable directory is /tmp.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const tmpPath = path.join('/tmp', 'stratum.db');
      if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
        try {
          fs.copyFileSync(dbPath, tmpPath);
        } catch (e) {
          console.warn('Could not copy seed stratum.db to /tmp:', e);
        }
      }
      dbPath = tmpPath;
    }

    dbInstance = new DatabaseSync(dbPath);

    // Initialize Base Schema
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL COLLATE NOCASE,
        name TEXT,
        password TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Safely migrate existing users table with role and status if not present
    try {
      dbInstance.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'trader'`);
    } catch {
      // Column already exists
    }
    try {
      dbInstance.exec(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'`);
    } catch {
      // Column already exists
    }
    try {
      dbInstance.exec(`ALTER TABLE users ADD COLUMN twoFactorEnabled INTEGER DEFAULT 0`);
    } catch {
      // Column already exists
    }

    // Initialize Audit Logs & System Settings
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        actorEmail TEXT,
        details TEXT,
        ipAddress TEXT,
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(createdAt);

      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS email_verifications (
        email TEXT PRIMARY KEY COLLATE NOCASE,
        code TEXT NOT NULL,
        name TEXT,
        passwordHash TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_verifications_email ON email_verifications(email);

      CREATE TABLE IF NOT EXISTS password_resets (
        email TEXT PRIMARY KEY COLLATE NOCASE,
        code TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_pw_resets_email ON password_resets(email);

      CREATE TABLE IF NOT EXISTS two_factor_challenges (
        email TEXT PRIMARY KEY COLLATE NOCASE,
        code TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_2fa_email ON two_factor_challenges(email);

      CREATE TABLE IF NOT EXISTS trade_journal (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        asset TEXT NOT NULL,
        direction TEXT NOT NULL,
        entryPrice REAL NOT NULL,
        stopLoss REAL NOT NULL,
        takeProfit REAL NOT NULL,
        exitPrice REAL,
        lotSize REAL NOT NULL,
        pnl REAL DEFAULT 0,
        riskReward REAL DEFAULT 0,
        strategyTag TEXT,
        emotionalState TEXT,
        notes TEXT,
        status TEXT DEFAULT 'CLOSED',
        openedAt TEXT NOT NULL,
        closedAt TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_journal_user ON trade_journal(userId);
      CREATE INDEX IF NOT EXISTS idx_journal_opened ON trade_journal(openedAt);
    `);
  }
  return dbInstance;
}


export function findUserByEmail(email: string): DbUser | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
  const row = stmt.get(email.trim().toLowerCase()) as unknown as DbUser | undefined;
  return row || null;
}

export function findUserById(id: string): DbUser | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
  const row = stmt.get(id) as unknown as DbUser | undefined;
  return row || null;
}

export function createUser(data: {
  email: string;
  name?: string | null;
  passwordHash: string;
  role?: string;
  status?: string;
}): SafeUser {
  const db = getDb();
  const now = new Date().toISOString();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name?.trim() || null;
  const role = data.role || 'trader';
  const status = data.status || 'active';

  const stmt = db.prepare(`
    INSERT INTO users (id, email, name, password, role, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, cleanEmail, cleanName, data.passwordHash, role, status, now, now);

  return {
    id,
    email: cleanEmail,
    name: cleanName,
    role,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

export function sanitizeUser(user: DbUser): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = user;
  return safe;
}

/* ============================================================ */
/* ADMIN UTILITIES: USER MANAGEMENT, DATABASE & PROCEDURES       */
/* ============================================================ */

export function getAllUsers(options: {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
} = {}): { users: SafeUser[]; total: number } {
  const db = getDb();
  const limit = options.limit || 50;
  const offset = options.offset || 0;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.search) {
    conditions.push('(email LIKE ? OR name LIKE ?)');
    params.push(`%${options.search.trim()}%`, `%${options.search.trim()}%`);
  }
  if (options.role && options.role !== 'all') {
    conditions.push('role = ?');
    params.push(options.role);
  }
  if (options.status && options.status !== 'all') {
    conditions.push('status = ?');
    params.push(options.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`);
  const totalRow = countStmt.get(...params) as unknown as { count: number };
  const total = totalRow?.count || 0;

  const dataStmt = db.prepare(`
    SELECT id, email, name, role, status, createdAt, updatedAt 
    FROM users 
    ${whereClause} 
    ORDER BY createdAt DESC 
    LIMIT ? OFFSET ?
  `);
  const rows = dataStmt.all(...params, limit, offset) as unknown as SafeUser[];

  return { users: rows, total };
}

export function updateUser(id: string, updates: {
  name?: string | null;
  role?: string;
  status?: string;
  passwordHash?: string;
}): SafeUser | null {
  const db = getDb();
  const existing = findUserById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const newName = updates.name !== undefined ? updates.name : existing.name;
  const newRole = updates.role !== undefined ? updates.role : (existing.role || 'trader');
  const newStatus = updates.status !== undefined ? updates.status : (existing.status || 'active');
  const newPassword = updates.passwordHash || existing.password;

  const stmt = db.prepare(`
    UPDATE users 
    SET name = ?, role = ?, status = ?, password = ?, updatedAt = ?
    WHERE id = ?
  `);
  stmt.run(newName, newRole, newStatus, newPassword, now, id);

  return {
    id,
    email: existing.email,
    name: newName,
    role: newRole,
    status: newStatus,
    createdAt: existing.createdAt,
    updatedAt: now,
  };
}

export function deleteUser(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id) as unknown as { changes: number };
  return (result?.changes || 0) > 0;
}

export function logAuditEvent(action: string, actorEmail?: string, details?: string, ipAddress?: string): void {
  try {
    const db = getDb();
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, action, actorEmail, details, ipAddress, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, action, actorEmail || 'system', details || '', ipAddress || '', now);
  } catch {
    // Non-blocking
  }
}

export function getAuditLogs(limit = 100): Array<{
  id: string;
  action: string;
  actorEmail: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT ?');
  return (stmt.all(limit) as unknown) as Array<{
    id: string;
    action: string;
    actorEmail: string;
    details: string;
    ipAddress: string;
    createdAt: string;
  }>;
}

export function getSystemSettings(): Record<string, string> {
  const db = getDb();
  const stmt = db.prepare('SELECT key, value FROM system_settings');
  const rows = stmt.all() as unknown as Array<{ key: string; value: string }>;
  const settings: Record<string, string> = {
    maintenanceMode: 'false',
    maintenanceReason: '',
    platformVersion: '2.4.0-enterprise',
    aiCopilotModel: 'gemini-2.5-flash',
    maxRiskGuardrailDefault: '25.0',
    globalAlertBanner: '',
  };
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return settings;
}

export function setSystemSetting(key: string, value: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO system_settings (key, value, updatedAt)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
  `);
  stmt.run(key, value, now);
}

export function getDatabaseMetadata(): {
  tableNames: string[];
  tables: Array<{ name: string; rowCount: number; columns: Array<{ name: string; type: string; pk: boolean }> }>;
  dbSizeBytes: number;
  dbPath: string;
} {
  const db = getDb();
  const dbPath = path.resolve(process.cwd(), 'stratum.db');
  let dbSizeBytes = 0;
  try {
    const stats = fs.statSync(dbPath);
    dbSizeBytes = stats.size;
  } catch {
    // Ignore
  }

  const tablesStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tableRows = tablesStmt.all() as unknown as Array<{ name: string }>;
  const tables = tableRows.map((t) => {
    let rowCount = 0;
    try {
      const c = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get() as unknown as { count: number };
      rowCount = c?.count || 0;
    } catch {
      // Ignore
    }
    const cols = (db.prepare(`PRAGMA table_info("${t.name}")`).all() as unknown as Array<{ name: string; type: string; pk: number }>).map((col) => ({
      name: col.name,
      type: col.type,
      pk: col.pk === 1,
    }));
    return { name: t.name, rowCount, columns: cols };
  });

  return {
    tableNames: tables.map((t) => t.name),
    tables,
    dbSizeBytes,
    dbPath,
  };
}

export function getTableRecords(tableName: string, options: { limit?: number; offset?: number; search?: string } = {}): {
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
} {
  const db = getDb();
  // Sanitize table name against known tables in sqlite_master
  const validTables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as unknown as Array<{ name: string }>).map((t) => t.name);
  if (!validTables.includes(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }

  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`).get() as unknown as { count: number };
  const total = countRow?.count || 0;

  const rows = db.prepare(`SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`).all(limit, offset) as unknown as Record<string, unknown>[];
  const colInfo = db.prepare(`PRAGMA table_info("${tableName}")`).all() as unknown as Array<{ name: string }>;
  const columns = colInfo.map((c) => c.name);

  return { columns, rows, total };
}

export function executeAdminQuery(sql: string): {
  columns: string[];
  rows: Record<string, unknown>[];
  changes?: number;
  executionTimeMs: number;
} {
  const db = getDb();
  const startTime = Date.now();
  const trimmed = sql.trim();
  const isSelect = /^SELECT\b|^PRAGMA\b|^EXPLAIN\b/i.test(trimmed);

  if (isSelect) {
    const stmt = db.prepare(trimmed);
    const rows = stmt.all() as unknown as Record<string, unknown>[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return {
      columns,
      rows,
      executionTimeMs: Date.now() - startTime,
    };
  } else {
    db.exec(trimmed);
    return {
      columns: [],
      rows: [],
      changes: 1,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export function vacuumDatabase(): { success: boolean; message: string; reclaimedBytes?: number } {
  const db = getDb();
  const dbPath = path.resolve(process.cwd(), 'stratum.db');
  let beforeSize = 0;
  try {
    beforeSize = fs.statSync(dbPath).size;
  } catch {
    // Ignore
  }

  try {
    db.exec('VACUUM;');
    db.exec('PRAGMA optimize;');
    let afterSize = beforeSize;
    try {
      afterSize = fs.statSync(dbPath).size;
    } catch {
      // Ignore
    }
    const reclaimed = Math.max(0, beforeSize - afterSize);
    logAuditEvent('DATABASE_VACUUM', 'admin', `Database vacuumed. Reclaimed: ${(reclaimed / 1024).toFixed(1)} KB`);
    return {
      success: true,
      message: `Database optimized successfully. Reclaimed ${(reclaimed / 1024).toFixed(1)} KB.`,
      reclaimedBytes: reclaimed,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Vacuum failed',
    };
  }
}

export function pruneTestUsers(): { deletedCount: number } {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM users WHERE email LIKE 'audit_%@stratum.prop'");
  const result = stmt.run() as unknown as { changes: number };
  const count = result?.changes || 0;
  logAuditEvent('PRUNE_TEST_USERS', 'admin', `Pruned ${count} temporary test/audit users.`);
  return { deletedCount: count };
}

/* ============================================================ */
/* EMAIL VERIFICATION SYSTEM                                    */
/* ============================================================ */

export interface EmailVerificationRecord {
  email: string;
  code: string;
  name: string | null;
  passwordHash: string;
  expiresAt: string;
  createdAt: string;
}

export function saveEmailVerification(data: {
  email: string;
  name?: string | null;
  passwordHash: string;
  code: string;
  expiresInMinutes?: number;
}): EmailVerificationRecord {
  const db = getDb();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name?.trim() || null;
  const now = new Date();
  const ttl = data.expiresInMinutes || 10;
  const expiresAt = new Date(now.getTime() + ttl * 60 * 1000).toISOString();
  const createdAt = now.toISOString();

  const stmt = db.prepare(`
    INSERT INTO email_verifications (email, code, name, passwordHash, expiresAt, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      code = excluded.code,
      name = excluded.name,
      passwordHash = excluded.passwordHash,
      expiresAt = excluded.expiresAt,
      createdAt = excluded.createdAt
  `);

  stmt.run(cleanEmail, data.code.trim(), cleanName, data.passwordHash, expiresAt, createdAt);

  return {
    email: cleanEmail,
    code: data.code.trim(),
    name: cleanName,
    passwordHash: data.passwordHash,
    expiresAt,
    createdAt,
  };
}

export function getEmailVerification(email: string): EmailVerificationRecord | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM email_verifications WHERE email = ? LIMIT 1');
  const row = stmt.get(email.trim().toLowerCase()) as unknown as EmailVerificationRecord | undefined;
  return row || null;
}

export function deleteEmailVerification(email: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM email_verifications WHERE email = ?');
  stmt.run(email.trim().toLowerCase());
}

export function verifyCodeAndCreateUser(email: string, code: string): {
  success: boolean;
  user?: SafeUser;
  error?: string;
} {
  const record = getEmailVerification(email);
  if (!record) {
    return {
      success: false,
      error: 'No pending verification found for this email. Please sign up again.',
    };
  }

  // Check expiration
  if (new Date() > new Date(record.expiresAt)) {
    deleteEmailVerification(email);
    return {
      success: false,
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  // Check code match
  if (record.code.trim() !== code.trim()) {
    return {
      success: false,
      error: 'Invalid verification code. Please check your email and try again.',
    };
  }

  // Check if user already exists
  const existing = findUserByEmail(record.email);
  if (existing) {
    deleteEmailVerification(email);
    return {
      success: false,
      error: 'An account with this email address already exists. Please log in.',
    };
  }

  // Create active verified user
  const newUser = createUser({
    email: record.email,
    name: record.name,
    passwordHash: record.passwordHash,
    role: 'trader',
    status: 'active',
  });

  // Clean up pending verification
  deleteEmailVerification(email);

  logAuditEvent('EMAIL_VERIFIED_SIGNUP', record.email, 'Trader email verified and account activated.');

  return { success: true, user: newUser };
}

/* ============================================================ */
/* PASSWORD RESET SYSTEM                                        */
/* ============================================================ */

export interface PasswordResetRecord {
  email: string;
  code: string;
  expiresAt: string;
  createdAt: string;
}

export function savePasswordReset(email: string, code: string, expiresInMinutes: number = 10): PasswordResetRecord {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000).toISOString();
  const createdAt = now.toISOString();

  const stmt = db.prepare(`
    INSERT INTO password_resets (email, code, expiresAt, createdAt)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      code = excluded.code,
      expiresAt = excluded.expiresAt,
      createdAt = excluded.createdAt
  `);
  stmt.run(cleanEmail, code.trim(), expiresAt, createdAt);

  return { email: cleanEmail, code: code.trim(), expiresAt, createdAt };
}

export function getPasswordReset(email: string): PasswordResetRecord | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM password_resets WHERE email = ? LIMIT 1');
  const row = stmt.get(email.trim().toLowerCase()) as unknown as PasswordResetRecord | undefined;
  return row || null;
}

export function deletePasswordReset(email: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM password_resets WHERE email = ?');
  stmt.run(email.trim().toLowerCase());
}

export function verifyAndResetPassword(email: string, code: string, newPasswordHash: string): {
  success: boolean;
  error?: string;
} {
  const cleanEmail = email.trim().toLowerCase();
  const record = getPasswordReset(cleanEmail);

  if (!record) {
    return { success: false, error: 'No active password reset request found. Please request a new code.' };
  }

  if (new Date() > new Date(record.expiresAt)) {
    deletePasswordReset(cleanEmail);
    return { success: false, error: 'Reset code has expired. Please request a new code.' };
  }

  if (record.code.trim() !== code.trim()) {
    return { success: false, error: 'Invalid verification code. Please check your email and try again.' };
  }

  const user = findUserByEmail(cleanEmail);
  if (!user) {
    deletePasswordReset(cleanEmail);
    return { success: false, error: 'User account not found.' };
  }

  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?');
  stmt.run(newPasswordHash, now, user.id);

  deletePasswordReset(cleanEmail);
  logAuditEvent('PASSWORD_RESET_SUCCESS', cleanEmail, `Password was successfully reset for user ${user.id}.`);

  return { success: true };
}

/* ============================================================ */
/* TWO-FACTOR AUTHENTICATION (2FA) SYSTEM                       */
/* ============================================================ */

export interface TwoFactorChallengeRecord {
  email: string;
  code: string;
  expiresAt: string;
  createdAt: string;
}

export function setUserTwoFactor(userId: string, enabled: boolean): { success: boolean; error?: string } {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE users SET twoFactorEnabled = ?, updatedAt = ? WHERE id = ?');
  stmt.run(enabled ? 1 : 0, now, userId);

  const user = findUserById(userId);
  if (user) {
    logAuditEvent('2FA_TOGGLED', user.email, `2FA was ${enabled ? 'enabled' : 'disabled'}.`);
  }
  return { success: true };
}

export function saveTwoFactorChallenge(email: string, code: string, expiresInMinutes: number = 5): TwoFactorChallengeRecord {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000).toISOString();
  const createdAt = now.toISOString();

  const stmt = db.prepare(`
    INSERT INTO two_factor_challenges (email, code, expiresAt, createdAt)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      code = excluded.code,
      expiresAt = excluded.expiresAt,
      createdAt = excluded.createdAt
  `);
  stmt.run(cleanEmail, code.trim(), expiresAt, createdAt);

  return { email: cleanEmail, code: code.trim(), expiresAt, createdAt };
}

export function getTwoFactorChallenge(email: string): TwoFactorChallengeRecord | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM two_factor_challenges WHERE email = ? LIMIT 1');
  const row = stmt.get(email.trim().toLowerCase()) as unknown as TwoFactorChallengeRecord | undefined;
  return row || null;
}

export function deleteTwoFactorChallenge(email: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM two_factor_challenges WHERE email = ?');
  stmt.run(email.trim().toLowerCase());
}

export function verifyTwoFactorChallenge(email: string, code: string): { success: boolean; user?: SafeUser; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const record = getTwoFactorChallenge(cleanEmail);

  if (!record) {
    return { success: false, error: 'No pending 2FA challenge found. Please log in again.' };
  }

  if (new Date() > new Date(record.expiresAt)) {
    deleteTwoFactorChallenge(cleanEmail);
    return { success: false, error: '2FA verification code expired. Please log in again.' };
  }

  if (record.code.trim() !== code.trim()) {
    return { success: false, error: 'Invalid 2FA code. Please check your email and try again.' };
  }

  const user = findUserByEmail(cleanEmail);
  if (!user) {
    deleteTwoFactorChallenge(cleanEmail);
    return { success: false, error: 'User not found.' };
  }

  deleteTwoFactorChallenge(cleanEmail);
  logAuditEvent('2FA_LOGIN_SUCCESS', cleanEmail, `Successful 2FA sign in for user ${user.id}.`);

  return { success: true, user: sanitizeUser(user) };
}

/* ============================================================ */
/* TRADE JOURNAL SYSTEM                                         */
/* ============================================================ */

export interface TradeJournalEntry {
  id: string;
  userId: string;
  asset: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number | null;
  lotSize: number;
  pnl: number;
  riskReward: number;
  strategyTag?: string | null;
  emotionalState?: string | null;
  notes?: string | null;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  openedAt: string;
  closedAt?: string | null;
}

export function createJournalEntry(data: {
  userId: string;
  asset: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number | null;
  lotSize: number;
  pnl?: number;
  riskReward?: number;
  strategyTag?: string | null;
  emotionalState?: string | null;
  notes?: string | null;
  status?: 'OPEN' | 'CLOSED' | 'CANCELLED';
  openedAt?: string;
  closedAt?: string | null;
}): TradeJournalEntry {
  const db = getDb();
  const id = `jnl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();
  const openedAt = data.openedAt || now;
  const status = data.status || 'CLOSED';
  const pnl = data.pnl ?? 0;

  // Calculate R:R if not explicitly provided
  let rr = data.riskReward ?? 0;
  if (!rr && data.entryPrice && data.stopLoss && data.takeProfit) {
    const risk = Math.abs(data.entryPrice - data.stopLoss);
    const reward = Math.abs(data.takeProfit - data.entryPrice);
    if (risk > 0) {
      rr = Number((reward / risk).toFixed(2));
    }
  }

  const stmt = db.prepare(`
    INSERT INTO trade_journal (
      id, userId, asset, direction, entryPrice, stopLoss, takeProfit, exitPrice,
      lotSize, pnl, riskReward, strategyTag, emotionalState, notes, status, openedAt, closedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.userId,
    data.asset.toUpperCase(),
    data.direction,
    data.entryPrice,
    data.stopLoss,
    data.takeProfit,
    data.exitPrice ?? null,
    data.lotSize,
    pnl,
    rr,
    data.strategyTag || null,
    data.emotionalState || null,
    data.notes || null,
    status,
    openedAt,
    data.closedAt || (status === 'CLOSED' ? now : null)
  );

  return {
    id,
    userId: data.userId,
    asset: data.asset.toUpperCase(),
    direction: data.direction,
    entryPrice: data.entryPrice,
    stopLoss: data.stopLoss,
    takeProfit: data.takeProfit,
    exitPrice: data.exitPrice ?? null,
    lotSize: data.lotSize,
    pnl,
    riskReward: rr,
    strategyTag: data.strategyTag || null,
    emotionalState: data.emotionalState || null,
    notes: data.notes || null,
    status,
    openedAt,
    closedAt: data.closedAt || (status === 'CLOSED' ? now : null),
  };
}

export function getJournalEntries(userId: string): TradeJournalEntry[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM trade_journal WHERE userId = ? ORDER BY openedAt DESC');
  const rows = stmt.all(userId) as unknown as TradeJournalEntry[];
  return rows || [];
}

export function updateJournalEntry(
  id: string,
  userId: string,
  updates: Partial<Omit<TradeJournalEntry, 'id' | 'userId' | 'openedAt'>>
): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM trade_journal WHERE id = ? AND userId = ?').get(id, userId) as unknown as TradeJournalEntry | undefined;
  if (!existing) return false;

  const updated = { ...existing, ...updates };
  const stmt = db.prepare(`
    UPDATE trade_journal SET
      asset = ?, direction = ?, entryPrice = ?, stopLoss = ?, takeProfit = ?, exitPrice = ?,
      lotSize = ?, pnl = ?, riskReward = ?, strategyTag = ?, emotionalState = ?, notes = ?,
      status = ?, closedAt = ?
    WHERE id = ? AND userId = ?
  `);

  stmt.run(
    updated.asset.toUpperCase(),
    updated.direction,
    updated.entryPrice,
    updated.stopLoss,
    updated.takeProfit,
    updated.exitPrice ?? null,
    updated.lotSize,
    updated.pnl,
    updated.riskReward,
    updated.strategyTag || null,
    updated.emotionalState || null,
    updated.notes || null,
    updated.status,
    updated.closedAt || null,
    id,
    userId
  );
  return true;
}

export function deleteJournalEntry(id: string, userId: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM trade_journal WHERE id = ? AND userId = ?');
  const res = stmt.run(id, userId) as unknown as { changes: number };
  return (res?.changes || 0) > 0;
}

export function getJournalAnalytics(userId: string): {
  totalTrades: number;
  closedTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnl: number;
  profitFactor: number;
  averageRR: number;
  bestTrade: number;
  worstTrade: number;
} {
  const entries = getJournalEntries(userId);
  const closed = entries.filter((e) => e.status === 'CLOSED');

  if (closed.length === 0) {
    return {
      totalTrades: entries.length,
      closedTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      netPnl: 0,
      profitFactor: 0,
      averageRR: 0,
      bestTrade: 0,
      worstTrade: 0,
    };
  }

  let wins = 0;
  let losses = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let netPnl = 0;
  let sumRR = 0;
  let bestTrade = -Infinity;
  let worstTrade = Infinity;

  for (const t of closed) {
    netPnl += t.pnl;
    sumRR += t.riskReward;
    if (t.pnl > bestTrade) bestTrade = t.pnl;
    if (t.pnl < worstTrade) worstTrade = t.pnl;

    if (t.pnl > 0) {
      wins++;
      grossProfit += t.pnl;
    } else if (t.pnl < 0) {
      losses++;
      grossLoss += Math.abs(t.pnl);
    }
  }

  const winRate = Number(((wins / closed.length) * 100).toFixed(1));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.9 : 0;
  const averageRR = Number((sumRR / closed.length).toFixed(2));

  return {
    totalTrades: entries.length,
    closedTrades: closed.length,
    wins,
    losses,
    winRate,
    netPnl: Number(netPnl.toFixed(2)),
    profitFactor,
    averageRR,
    bestTrade: bestTrade === -Infinity ? 0 : Number(bestTrade.toFixed(2)),
    worstTrade: worstTrade === Infinity ? 0 : Number(worstTrade.toFixed(2)),
  };
}



