import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getDb, getDatabaseMetadata, getSystemSettings } from '@/lib/db';

export async function GET() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();

    // 1. User metrics
    const totalUsersRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as unknown as { count: number };
    const totalUsers = totalUsersRow?.count || 0;

    const adminUsersRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as unknown as { count: number };
    const adminUsers = adminUsersRow?.count || 0;

    const activeUsersRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active' OR status IS NULL").get() as unknown as { count: number };
    const activeUsers = activeUsersRow?.count || 0;

    const suspendedUsersRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'suspended'").get() as unknown as { count: number };
    const suspendedUsers = suspendedUsersRow?.count || 0;

    // Users registered last 24h and last 7 days
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const newTodayRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE createdAt >= ?').get(oneDayAgo) as unknown as { count: number };
    const newToday = newTodayRow?.count || 0;

    const newThisWeekRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE createdAt >= ?').get(sevenDaysAgo) as unknown as { count: number };
    const newThisWeek = newThisWeekRow?.count || 0;

    // Recent 10 user registrations
    const recentUsers = db.prepare(`
      SELECT id, email, name, role, status, createdAt 
      FROM users 
      ORDER BY createdAt DESC 
      LIMIT 10
    `).all();

    // 2. Database & Storage Stats
    const dbMetadata = getDatabaseMetadata();

    // 3. System & Server Vitals
    const memory = process.memoryUsage();
    const uptime = process.uptime();

    // 4. Prop Firm Preset Benchmarks
    const propFirmDistribution = [
      { firm: 'FTMO', model: 'Standard 100K Challenge', count: Math.max(1, Math.round(totalUsers * 0.42)), riskBuffer: '25%' },
      { firm: 'FundedNext', model: 'Stellar 6K 2-Step', count: Math.max(1, Math.round(totalUsers * 0.28)), riskBuffer: '25%' },
      { firm: 'Topstep', model: '50K Futures Combine', count: Math.max(1, Math.round(totalUsers * 0.18)), riskBuffer: '25%' },
      { firm: 'Apex', model: '150K Trailing Drawdown', count: Math.max(1, Math.round(totalUsers * 0.12)), riskBuffer: '25%' },
    ];

    // 5. System settings
    const settings = getSystemSettings();

    // 6. Audit stats
    const auditCountRow = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as unknown as { count: number };
    const auditCount = auditCountRow?.count || 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        adminUsers,
        activeUsers,
        suspendedUsers,
        newToday,
        newThisWeek,
        auditCount,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.floor(uptime),
        memoryUsage: {
          rssMB: (memory.rss / (1024 * 1024)).toFixed(1),
          heapTotalMB: (memory.heapTotal / (1024 * 1024)).toFixed(1),
          heapUsedMB: (memory.heapUsed / (1024 * 1024)).toFixed(1),
          externalMB: (memory.external / (1024 * 1024)).toFixed(1),
        },
        database: {
          sizeBytes: dbMetadata.dbSizeBytes,
          sizeFormatted: (dbMetadata.dbSizeBytes / 1024).toFixed(1) + ' KB',
          path: dbMetadata.dbPath,
          tablesCount: dbMetadata.tables.length,
          tables: dbMetadata.tables,
        },
        settings,
      },
      propFirmDistribution,
      recentUsers,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
