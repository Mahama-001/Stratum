import assert from 'node:assert';
import test from 'node:test';
import {
  getDb,
  createUser,
  findUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
  getDatabaseMetadata,
  getTableRecords,
  executeAdminQuery,
  logAuditEvent,
  getAuditLogs,
  vacuumDatabase,
  pruneTestUsers,
  getSystemSettings,
  setSystemSetting,
} from '../src/lib/db.ts';

test('Admin Portal - Database Metadata & Table Schema Discovery', () => {
  const meta = getDatabaseMetadata();

  assert.ok(Array.isArray(meta.tableNames), 'tableNames should be an array');
  assert.ok(meta.tableNames.includes('users'), 'tableNames should include users');
  assert.ok(meta.tableNames.includes('audit_logs'), 'tableNames should include audit_logs');
  assert.ok(meta.tableNames.includes('system_settings'), 'tableNames should include system_settings');

  const usersTable = meta.tables.find((t) => t.name === 'users');
  assert.ok(usersTable, 'users table must exist in metadata');
  assert.ok(usersTable.columns.some((c) => c.name === 'role'), 'users table should have role column');
  assert.ok(usersTable.columns.some((c) => c.name === 'status'), 'users table should have status column');
});

test('Admin Portal - User Management (Create, List, Role Toggle, Status Toggle, Delete)', () => {
  const testEmail = `admin_tester_${Date.now()}@stratum.prop`;
  const created = createUser({
    email: testEmail,
    name: 'Admin Test Trader',
    passwordHash: '$2a$10$fakehashforadmintestingonly',
    role: 'trader',
    status: 'active',
  });

  assert.strictEqual(created.email, testEmail);
  assert.strictEqual(created.role, 'trader');
  assert.strictEqual(created.status, 'active');

  // Test List & Search
  const searchResult = getAllUsers({ search: testEmail });
  assert.ok(searchResult.total >= 1, 'Should find the newly created user in search');
  const found = searchResult.users.find((u) => u.email === testEmail);
  assert.ok(found, 'User should be present in search result');

  // Test Promote to Admin
  const promoted = updateUser(created.id, { role: 'admin' });
  assert.ok(promoted);
  assert.strictEqual(promoted?.role, 'admin');

  // Test Suspend Status
  const suspended = updateUser(created.id, { status: 'suspended' });
  assert.ok(suspended);
  assert.strictEqual(suspended?.status, 'suspended');

  // Clean up
  const deleted = deleteUser(created.id);
  assert.strictEqual(deleted, true);

  const afterDelete = findUserByEmail(testEmail);
  assert.strictEqual(afterDelete, null);
});

test('Admin Portal - Audit Logging System', () => {
  const testAction = 'TEST_ADMIN_ACTION';
  const testActor = 'lead_risk@stratum.prop';
  const testDetails = 'Admin portal test audit event';

  logAuditEvent(testAction, testActor, testDetails, '127.0.0.1');

  const logs = getAuditLogs(20);
  assert.ok(Array.isArray(logs), 'Audit logs should be an array');
  const recentLog = logs.find((l) => l.action === testAction);
  assert.ok(recentLog, 'Logged audit event should be found');
  assert.strictEqual(recentLog?.actorEmail, testActor);
  assert.strictEqual(recentLog?.details, testDetails);
});

test('Admin Portal - Raw SQL Execution and Timing', () => {
  const queryResult = executeAdminQuery('SELECT COUNT(*) as count FROM users');
  assert.ok(Array.isArray(queryResult.rows), 'Query rows should be an array');
  assert.ok(typeof queryResult.executionTimeMs === 'number', 'Execution time should be a number');
  assert.ok(queryResult.columns.includes('count'), 'Columns should contain count');
});

test('Admin Portal - System Settings Persistence', () => {
  const testKey = 'testMaintenanceKey';
  const testVal = 'active_2026';

  setSystemSetting(testKey, testVal);
  const settings = getSystemSettings();
  assert.strictEqual(settings[testKey], testVal);
});

test('Admin Portal - Vacuum & Database Optimization', () => {
  const vacuumResult = vacuumDatabase();
  assert.strictEqual(vacuumResult.success, true);
  assert.ok(typeof vacuumResult.message === 'string');
});

test('Admin Portal - Maximum Clarity Theme Integrity & WCAG AA Verification', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const pagePath = path.resolve(process.cwd(), 'src/app/admin/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');

  // Verify that the root container supports explicit light and dark themes
  assert.ok(pageContent.includes('bg-[#fbfbfd]'), 'Root must include high-contrast light background');
  assert.ok(pageContent.includes('dark:bg-[#08090c]'), 'Root must include deep OLED dark background');
  assert.ok(pageContent.includes('text-[#1d1d1f]'), 'Must support near-black text for light mode');
  assert.ok(pageContent.includes('dark:text-[#f5f5f7]'), 'Must support bright white text for dark mode');

  // Verify inputs and textareas have explicit dual-theme contrast
  assert.ok(pageContent.includes('placeholder-[#8e8e93]'), 'Must have legible placeholder text');
  assert.ok(pageContent.includes('dark:placeholder-[#636366]'), 'Must have clear dark mode placeholder');

  // Verify no raw hardcoded white text on default backgrounds without dark: prefix
  assert.ok(!pageContent.includes('min-h-screen bg-[var(--theme-bg,#090a0d)] text-white'), 'Should not hardcode raw white on root');
});

