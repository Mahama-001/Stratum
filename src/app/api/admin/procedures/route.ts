import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession, hashPassword } from '@/lib/auth';
import {
  getSystemSettings,
  setSystemSetting,
  getAuditLogs,
  vacuumDatabase,
  pruneTestUsers,
  createUser,
  getDatabaseMetadata,
  getTableRecords,
  logAuditEvent,
} from '@/lib/db';

export async function GET() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = getSystemSettings();
    const auditLogs = getAuditLogs(100);
    return NextResponse.json({
      settings,
      auditLogs,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch procedures data',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'toggle_maintenance': {
        const current = getSystemSettings();
        const newMode = current.maintenanceMode === 'true' ? 'false' : 'true';
        const reason = body.reason || (newMode === 'true' ? 'Scheduled Stratum infrastructure upgrade' : '');
        setSystemSetting('maintenanceMode', newMode);
        setSystemSetting('maintenanceReason', reason);
        logAuditEvent(
          'TOGGLE_MAINTENANCE',
          'admin',
          `Maintenance mode set to ${newMode}. Reason: ${reason}`
        );
        return NextResponse.json({
          success: true,
          maintenanceMode: newMode === 'true',
          reason,
          message: `Maintenance mode is now ${newMode === 'true' ? 'ENABLED' : 'DISABLED'}.`,
        });
      }

      case 'vacuum_database': {
        const result = vacuumDatabase();
        return NextResponse.json(result);
      }

      case 'prune_test_users': {
        const result = pruneTestUsers();
        return NextResponse.json({
          success: true,
          message: `Successfully pruned ${result.deletedCount} automated test/audit users.`,
          deletedCount: result.deletedCount,
        });
      }

      case 'seed_demo_traders': {
        const demoTraders = [
          { email: 'alex.vance@stratum.prop', name: 'Alex Vance (FTMO 100K Funded)', role: 'trader' },
          { email: 'marcus.chen@stratum.prop', name: 'Marcus Chen (Topstep 50K Futures)', role: 'trader' },
          { email: 'elena.rostova@stratum.prop', name: 'Elena Rostova (FundedNext 6K)', role: 'trader' },
          { email: 'sarah.jenkins@stratum.prop', name: 'Sarah Jenkins (Apex 150K)', role: 'trader' },
          { email: 'master.admin@stratum.prop', name: 'Lead Risk Officer', role: 'admin' },
        ];

        let createdCount = 0;
        const defaultHash = await hashPassword('StratumTrader2026!');

        for (const trader of demoTraders) {
          try {
            createUser({
              email: trader.email,
              name: trader.name,
              passwordHash: defaultHash,
              role: trader.role,
              status: 'active',
            });
            createdCount++;
          } catch {
            // Already exists, skip
          }
        }

        logAuditEvent('SEED_DEMO_DATA', 'admin', `Seeded ${createdCount} institutional traders.`);
        return NextResponse.json({
          success: true,
          message: `Successfully provisioned ${createdCount} institutional demo traders.`,
          createdCount,
        });
      }

      case 'update_setting': {
        const { key, value } = body;
        if (!key || value === undefined) {
          return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
        }
        setSystemSetting(key, String(value));
        logAuditEvent('UPDATE_SYSTEM_SETTING', 'admin', `Updated setting "${key}" to "${value}"`);
        return NextResponse.json({
          success: true,
          message: `Setting "${key}" updated successfully.`,
        });
      }

      case 'export_database': {
        const metadata = getDatabaseMetadata();
        const exportData: Record<string, unknown> = {
          exportedAt: new Date().toISOString(),
          platform: 'Stratum Enterprise Risk Operating System',
          version: '2.4.0',
          databaseSize: metadata.dbSizeBytes,
          tables: {},
        };

        for (const table of metadata.tables) {
          const records = getTableRecords(table.name, { limit: 1000, offset: 0 });
          // Strip sensitive password hashes from export
          const sanitizedRows = records.rows.map((row) => {
            if ('password' in row) {
              const { password, ...rest } = row;
              return { ...rest, password: '[REDACTED_BCRYPT_HASH]' };
            }
            return row;
          });
          (exportData.tables as Record<string, unknown>)[table.name] = {
            columns: records.columns,
            totalRows: records.total,
            rows: sanitizedRows,
          };
        }

        logAuditEvent('EXPORT_DATABASE', 'admin', 'Exported full database snapshot');
        return NextResponse.json({
          success: true,
          data: exportData,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Procedure failed',
    }, { status: 500 });
  }
}
