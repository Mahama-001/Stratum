'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StratumLogo from '@/components/StratumLogo';
import ThemeSelector from '@/components/ThemeSelector';
import {
  BarChart3,
  Users,
  Database,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  Cpu,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Lock,
  Key,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Activity,
  Terminal,
  LogOut,
  ChevronRight,
  Server,
  Loader2,
  UserCheck,
  Play,
  RotateCcw
} from 'lucide-react';

type AdminTab = 'analytics' | 'users' | 'database' | 'procedures';

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TableColumn {
  name: string;
  type: string;
  pk: boolean;
}

interface TableMetadata {
  name: string;
  rowCount: number;
  columns: TableColumn[];
}

interface DatabaseMetadata {
  tableNames: string[];
  tables: TableMetadata[];
  dbSizeBytes: number;
  dbPath: string;
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    adminUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    newToday: number;
    newThisWeek: number;
    auditCount: number;
  };
  system: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memoryUsage: {
      rssMB: string;
      heapTotalMB: string;
      heapUsedMB: string;
      externalMB: string;
    };
    database: {
      sizeBytes: number;
      sizeFormatted: string;
      path: string;
      tablesCount: number;
      tables: TableMetadata[];
    };
    settings: Record<string, string>;
  };
  propFirmDistribution: Array<{
    firm: string;
    model: string;
    count: number;
    riskBuffer: string;
  }>;
  recentUsers: UserRecord[];
}

interface AuditLogRecord {
  id: string;
  action: string;
  actorEmail: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export default function AdminPortalPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  // Users state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [userPage, setUserPage] = useState<number>(1);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // User Modals state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState<boolean>(false);
  const [createEmail, setCreateEmail] = useState<string>('');
  const [createName, setCreateName] = useState<string>('');
  const [createPassword, setCreatePassword] = useState<string>('');
  const [createRole, setCreateRole] = useState<string>('trader');
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>('');

  const [resetUserTarget, setResetUserTarget] = useState<UserRecord | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetSubmitting, setResetSubmitting] = useState<boolean>(false);

  const [deleteUserTarget, setDeleteUserTarget] = useState<UserRecord | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  // Database Tab state
  const [dbMeta, setDbMeta] = useState<DatabaseMetadata | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [tableData, setTableData] = useState<{ columns: string[]; rows: Record<string, unknown>[]; total: number } | null>(null);
  const [loadingTableData, setLoadingTableData] = useState<boolean>(false);
  const [rawSql, setRawSql] = useState<string>('SELECT id, email, role, status, createdAt FROM users LIMIT 10;');
  const [rawSqlResult, setRawSqlResult] = useState<{ columns: string[]; rows: Record<string, unknown>[]; changes?: number; executionTimeMs?: number; error?: string } | null>(null);
  const [executingSql, setExecutingSql] = useState<boolean>(false);

  // Procedures Tab state
  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [maintenanceReasonInput, setMaintenanceReasonInput] = useState<string>('Scheduled Stratum infrastructure upgrade');
  const [procedureStatusMessage, setProcedureStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [procedureRunning, setProcedureRunning] = useState<boolean>(false);

  // 1. Initial Auth Check
  const checkAdminAuth = useCallback(async () => {
    try {
      setCheckingAuth(true);
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  // 2. Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // 3. Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams({
        limit: '20',
        offset: String((userPage - 1) * 20),
      });
      if (userSearch.trim()) params.set('search', userSearch.trim());
      if (userRoleFilter !== 'all') params.set('role', userRoleFilter);
      if (userStatusFilter !== 'all') params.set('status', userStatusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, userSearch, userRoleFilter, userStatusFilter]);

  // 4. Fetch Database Data
  const fetchDatabaseMeta = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/database');
      if (res.ok) {
        const data: DatabaseMetadata = await res.json();
        setDbMeta(data);
      }
    } catch (err) {
      console.error('Failed to load database meta', err);
    }
  }, []);

  const fetchTableRecords = useCallback(async (tableName: string) => {
    try {
      setLoadingTableData(true);
      const res = await fetch(`/api/admin/database?table=${encodeURIComponent(tableName)}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (err) {
      console.error('Failed to load table records', err);
    } finally {
      setLoadingTableData(false);
    }
  }, []);

  // 5. Fetch Procedures & Audit Logs
  const fetchProceduresData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/procedures');
      if (res.ok) {
        const data = await res.json();
        setSystemSettings(data.settings || {});
        setAuditLogs(data.auditLogs || []);
        if (data.settings?.maintenanceReason) {
          setMaintenanceReasonInput(data.settings.maintenanceReason);
        }
      }
    } catch (err) {
      console.error('Failed to load procedures', err);
    }
  }, []);

  // Effect to load data based on active tab
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'database') {
      fetchDatabaseMeta();
      fetchTableRecords(selectedTable);
    } else if (activeTab === 'procedures') {
      fetchProceduresData();
    }
  }, [isAuthenticated, activeTab, fetchAnalytics, fetchUsers, fetchDatabaseMeta, fetchTableRecords, selectedTable, fetchProceduresData]);

  // Handle Passkey Submission
  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyInput.trim()) return;
    try {
      setAuthLoading(true);
      setAuthError('');
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkeyInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPasskeyInput('');
      } else {
        setAuthError(data.error || 'Access denied: invalid master passkey');
      }
    } catch {
      setAuthError('Connection failed while validating passkey');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      setCreateError('');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail.trim(),
          name: createName.trim() || null,
          password: createPassword,
          role: createRole,
          status: 'active',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreateUserOpen(false);
        setCreateEmail('');
        setCreateName('');
        setCreatePassword('');
        fetchUsers();
        if (activeTab === 'analytics') fetchAnalytics();
      } else {
        setCreateError(data.error || 'Failed to create user');
      }
    } catch {
      setCreateError('Network error creating user');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handle Toggle User Role
  const handleToggleUserRole = async (user: UserRecord) => {
    const nextRole = user.role === 'admin' ? 'trader' : 'admin';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: nextRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Role update error', err);
    }
  };

  // Handle Toggle User Status
  const handleToggleUserStatus = async (user: UserRecord) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: nextStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Status update error', err);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserTarget || !resetNewPassword) return;
    try {
      setResetSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetUserTarget.id, newPassword: resetNewPassword }),
      });
      if (res.ok) {
        setResetUserTarget(null);
        setResetNewPassword('');
        fetchUsers();
      }
    } catch (err) {
      console.error('Password reset error', err);
    } finally {
      setResetSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    try {
      setDeleteSubmitting(true);
      const res = await fetch(`/api/admin/users?id=${deleteUserTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteUserTarget(null);
        fetchUsers();
        if (activeTab === 'analytics') fetchAnalytics();
      }
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Handle Execute SQL
  const handleExecuteSql = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSql.trim()) return;
    try {
      setExecutingSql(true);
      setRawSqlResult(null);
      const res = await fetch('/api/admin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: rawSql.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRawSqlResult({
          columns: data.columns || [],
          rows: data.rows || [],
          changes: data.changes,
          executionTimeMs: data.executionTimeMs,
        });
        fetchDatabaseMeta();
      } else {
        setRawSqlResult({
          columns: [],
          rows: [],
          error: data.error || 'SQL query execution failed',
        });
      }
    } catch {
      setRawSqlResult({
        columns: [],
        rows: [],
        error: 'Network failure executing SQL query',
      });
    } finally {
      setExecutingSql(false);
    }
  };

  // Handle Procedure Calls
  const triggerProcedure = async (action: string, payload: Record<string, unknown> = {}) => {
    try {
      setProcedureRunning(true);
      setProcedureStatusMessage(null);
      const res = await fetch('/api/admin/procedures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProcedureStatusMessage({ text: data.message || 'Procedure completed successfully', type: 'success' });
        fetchProceduresData();
        if (action === 'export_database' && data.data) {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `stratum-db-export-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        setProcedureStatusMessage({ text: data.error || 'Procedure execution failed', type: 'error' });
      }
    } catch {
      setProcedureStatusMessage({ text: 'Network connection error', type: 'error' });
    } finally {
      setProcedureRunning(false);
    }
  };

  // Loading Screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd] dark:bg-[#08090c] text-[#1d1d1f] dark:text-[#f5f5f7]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] dark:text-[#2997ff]" />
          <span className="font-mono-data text-xs font-semibold text-[#515154] dark:text-[#d1d1d6] tracking-wider uppercase">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  // Master Passkey Gate Modal if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfd] dark:bg-[#08090c] text-[#1d1d1f] dark:text-[#f5f5f7] px-4 relative overflow-hidden font-sans transition-colors">
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-[#0071e3]/10 dark:bg-[#2997ff]/12 rounded-full blur-[110px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <StratumLogo size="lg" badgeText="ADMIN" subtitle="Enterprise Risk Operating System" />
            <h1 className="text-2xl sm:text-3xl font-bold mt-6 tracking-tight text-[#1d1d1f] dark:text-[#ffffff]">
              Stratum Admin Console
            </h1>
          </div>

          <div className="backdrop-blur-2xl bg-white/95 dark:bg-[#14151a]/95 border border-black/[0.12] dark:border-white/[0.18] rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors">
            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#e5e5ea] uppercase tracking-wider mb-2">
                  Master Administrative Passkey
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e6e73] dark:text-[#a1a1a6]">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value)}
                    placeholder="Enter admin passkey..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.22] text-[#1d1d1f] dark:text-white placeholder-[#8e8e93] dark:placeholder-[#636366] text-sm font-semibold focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-2 focus:ring-[#0071e3]/20 font-mono-data transition-all"
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/35 text-[#c91a0f] dark:text-[#ff453a] text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading || !passkeyInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing Operator...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Admin Console</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-black/[0.08] dark:border-white/[0.12] flex items-center justify-between text-xs text-[#515154] dark:text-[#c7c7cc]">
              <span className="font-mono-data font-medium">Default: stratum_admin_master_2026</span>
              <Link href="/" className="text-[#0071e3] dark:text-[#2997ff] font-semibold hover:underline flex items-center gap-1">
                <span>Terminal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Admin Portal UI with Universal High-Clarity Styling
  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#08090c] text-[#1d1d1f] dark:text-[#f5f5f7] font-sans flex flex-col selection:bg-[#0071e3]/20 selection:text-[#0071e3] transition-colors">
      {/* 1. Global Admin Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-[#0e0f14]/90 border-b border-black/[0.1] dark:border-white/[0.14] px-4 sm:px-6 lg:px-8 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <StratumLogo size="md" badgeText="ADMIN" subtitle="Enterprise Control Hub" />
            {systemSettings.maintenanceMode === 'true' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-data font-semibold bg-[#ff453a]/15 text-[#c91a0f] dark:text-[#ff453a] border border-[#ff453a]/35">
                <AlertTriangle className="w-3.5 h-3.5" />
                MAINTENANCE ACTIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeSelector compact />
            <Link
              href="/"
              className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1d1d1f] dark:text-white bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border border-black/[0.12] dark:border-white/[0.16] transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              <span>Trader Terminal</span>
            </Link>
            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#c91a0f] dark:text-[#ff453a] hover:text-white bg-[#ff453a]/12 dark:bg-[#ff453a]/15 hover:bg-[#ff453a] border border-[#ff453a]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Lock & Exit Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Top Banner if Maintenance Mode is active */}
      {systemSettings.maintenanceMode === 'true' && (
        <div className="bg-[#ff453a]/15 border-b border-[#ff453a]/35 text-[#c91a0f] dark:text-[#ff453a] px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Maintenance Mode Active:</strong> {systemSettings.maintenanceReason || 'Platform currently undergoing scheduled maintenance.'}
              </span>
            </div>
            <button
              onClick={() => triggerProcedure('toggle_maintenance')}
              className="underline hover:text-black dark:hover:text-white cursor-pointer ml-4 shrink-0 font-bold"
            >
              Disable Maintenance
            </button>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="border-b border-black/[0.08] dark:border-white/[0.12] bg-[#f2f2f7] dark:bg-[#111217] px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/20'
                : 'text-[#48484a] dark:text-[#c7c7cc] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/20'
                : 'text-[#48484a] dark:text-[#c7c7cc] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
            {analytics?.overview?.totalUsers ? (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono-data font-bold ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-black/[0.08] dark:bg-white/[0.12] text-[#1d1d1f] dark:text-white'}`}>
                {analytics.overview.totalUsers}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === 'database'
                ? 'bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/20'
                : 'text-[#48484a] dark:text-[#c7c7cc] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Manage Database</span>
          </button>

          <button
            onClick={() => setActiveTab('procedures')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === 'procedures'
                ? 'bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/20'
                : 'text-[#48484a] dark:text-[#c7c7cc] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Vital Procedures</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Body Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ======================================================== */}
        {/* TAB 1: ANALYTICS                                         */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <span>Platform Vital Analytics</span>
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#515154] dark:text-[#d1d1d6] mt-0.5">
                  Real-time telemetry, institutional trader accounts, SQLite database footprint, and system resources.
                </p>
              </div>

              <button
                onClick={fetchAnalytics}
                disabled={loadingAnalytics}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1a1b22] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] border border-black/[0.12] dark:border-white/[0.16] text-[#1d1d1f] dark:text-white transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs relative overflow-hidden transition-colors">
                <div className="flex items-center justify-between text-[#6e6e73] dark:text-[#a1a1a6] mb-2 font-semibold">
                  <span className="text-[11px] uppercase tracking-wider">Total Traders</span>
                  <Users className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-white font-mono-data">
                  {analytics?.overview?.totalUsers ?? '—'}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#515154] dark:text-[#c7c7cc]">
                  <span className="text-[#137a34] dark:text-[#30d158] font-mono-data font-bold">
                    +{analytics?.overview?.newToday ?? 0} today
                  </span>
                  <span>•</span>
                  <span>{analytics?.overview?.activeUsers ?? 0} active</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs relative overflow-hidden transition-colors">
                <div className="flex items-center justify-between text-[#6e6e73] dark:text-[#a1a1a6] mb-2 font-semibold">
                  <span className="text-[11px] uppercase tracking-wider">Simulated Exposure</span>
                  <Activity className="w-4 h-4 text-[#137a34] dark:text-[#30d158]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#137a34] dark:text-[#30d158] font-mono-data">
                  $306,000
                </div>
                <div className="mt-2 text-xs font-medium text-[#515154] dark:text-[#c7c7cc] truncate">
                  Across 4 active prop accounts (FTMO, Topstep, FundedNext, Apex)
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs relative overflow-hidden transition-colors">
                <div className="flex items-center justify-between text-[#6e6e73] dark:text-[#a1a1a6] mb-2 font-semibold">
                  <span className="text-[11px] uppercase tracking-wider">SQLite Storage</span>
                  <HardDrive className="w-4 h-4 text-[#9a5400] dark:text-[#ff9f0a]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-white font-mono-data">
                  {analytics?.system?.database?.sizeFormatted ?? '—'}
                </div>
                <div className="mt-2 text-xs font-medium text-[#515154] dark:text-[#c7c7cc]">
                  {analytics?.system?.database?.tablesCount ?? 0} tables • WAL Journal mode
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs relative overflow-hidden transition-colors">
                <div className="flex items-center justify-between text-[#6e6e73] dark:text-[#a1a1a6] mb-2 font-semibold">
                  <span className="text-[11px] uppercase tracking-wider">Node Process RSS</span>
                  <Cpu className="w-4 h-4 text-[#af52de]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-white font-mono-data">
                  {analytics?.system?.memoryUsage?.rssMB ? `${analytics.system.memoryUsage.rssMB} MB` : '—'}
                </div>
                <div className="mt-2 text-xs font-medium text-[#515154] dark:text-[#c7c7cc]">
                  Heap: {analytics?.system?.memoryUsage?.heapUsedMB ?? 0} MB used
                </div>
              </div>
            </div>

            {/* Middle Section: Prop Firm Distribution & System Vitals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prop Firm Distribution */}
              <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs transition-colors">
                <h3 className="text-base font-bold text-[#1d1d1f] dark:text-white mb-1">
                  Prop Firm Account Model Distribution
                </h3>
                <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-5">
                  Traders active across institutional prop firm rule configurations with enforced 25% Stratum safety buffer.
                </p>

                <div className="space-y-4">
                  {(analytics?.propFirmDistribution || []).map((firm) => (
                    <div key={firm.firm} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                          <span>{firm.firm}</span>
                          <span className="text-[#515154] dark:text-[#a1a1a6] font-normal">({firm.model})</span>
                        </span>
                        <div className="flex items-center gap-2 font-mono-data">
                          <span className="text-[#137a34] dark:text-[#30d158] bg-[#30d158]/15 px-2 py-0.5 rounded text-[11px] font-bold border border-[#30d158]/30">
                            {firm.riskBuffer} Guardrail
                          </span>
                          <span className="text-[#1d1d1f] dark:text-white font-bold">{firm.count} traders</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-black/[0.06] dark:bg-white/[0.1] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#0071e3] to-[#2997ff]"
                          style={{
                            width: `${Math.min(100, Math.max(15, (firm.count / Math.max(1, analytics?.overview?.totalUsers || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Diagnostics */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs transition-colors">
                <h3 className="text-base font-bold text-[#1d1d1f] dark:text-white mb-1 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                  <span>Host Environment</span>
                </h3>
                <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-4">
                  Runtime status and Node.js process diagnostics.
                </p>

                <div className="space-y-3 font-mono-data text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-black/[0.08] dark:border-white/[0.1]">
                    <span className="text-[#515154] dark:text-[#c7c7cc] font-medium">Platform</span>
                    <span className="text-[#1d1d1f] dark:text-white font-bold capitalize">{analytics?.system?.platform ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-black/[0.08] dark:border-white/[0.1]">
                    <span className="text-[#515154] dark:text-[#c7c7cc] font-medium">Node Version</span>
                    <span className="text-[#1d1d1f] dark:text-white font-bold">{analytics?.system?.nodeVersion ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-black/[0.08] dark:border-white/[0.1]">
                    <span className="text-[#515154] dark:text-[#c7c7cc] font-medium">Process Uptime</span>
                    <span className="text-[#1d1d1f] dark:text-white font-bold">
                      {analytics?.system?.uptimeSeconds
                        ? `${Math.floor(analytics.system.uptimeSeconds / 60)} mins ${analytics.system.uptimeSeconds % 60}s`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-black/[0.08] dark:border-white/[0.1]">
                    <span className="text-[#515154] dark:text-[#c7c7cc] font-medium">Database Path</span>
                    <span className="text-[#1d1d1f] dark:text-white font-bold truncate max-w-[140px]" title={analytics?.system?.database?.path}>
                      stratum.db
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#515154] dark:text-[#c7c7cc] font-medium">AI Copilot Model</span>
                    <span className="text-[#0071e3] dark:text-[#2997ff] font-bold">
                      {analytics?.system?.settings?.aiCopilotModel ?? 'gemini-2.5-flash'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#1d1d1f] dark:text-white">
                  Recent Trader Registrations
                </h3>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Users</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/[0.1]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/[0.1] dark:border-white/[0.12] bg-[#f8f8fa] dark:bg-[#1a1b22] text-[#48484a] dark:text-[#e5e5ea] uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Trader</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                    {(analytics?.recentUsers || []).slice(0, 5).map((user) => (
                      <tr key={user.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#1d1d1f] dark:text-white">{user.name || 'Anonymous Trader'}</td>
                        <td className="py-3 px-3 text-[#48484a] dark:text-[#d1d1d6] font-mono-data font-medium">{user.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono-data uppercase font-bold ${
                              user.role === 'admin'
                                ? 'bg-[#0071e3]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30'
                                : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3a3a3c] dark:text-[#e5e5ea] border border-black/[0.1] dark:border-white/[0.15]'
                            }`}
                          >
                            {user.role || 'trader'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono-data uppercase font-bold ${
                              user.status === 'suspended'
                                ? 'bg-[#ff453a]/15 text-[#c91a0f] dark:text-[#ff453a] border border-[#ff453a]/30'
                                : 'bg-[#30d158]/15 text-[#137a34] dark:text-[#30d158] border border-[#30d158]/30'
                            }`}
                          >
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-[#515154] dark:text-[#c7c7cc] font-mono-data font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: USER MANAGEMENT                                   */}
        {/* ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                  User Management Console
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#515154] dark:text-[#d1d1d6] mt-0.5">
                  Browse, promote, suspend, manage passwords, or remove registered platform traders.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsCreateUserOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create User / Admin</span>
                </button>
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="p-2 rounded-xl text-[#1d1d1f] dark:text-white bg-white dark:bg-[#1a1b22] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] border border-black/[0.12] dark:border-white/[0.16] transition-all cursor-pointer shadow-xs"
                  title="Refresh users"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs transition-colors">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e6e73] dark:text-[#a1a1a6]" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] text-[#1d1d1f] dark:text-white placeholder-[#8e8e93] dark:placeholder-[#636366] text-xs font-semibold focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] transition-all font-mono-data"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] text-xs font-semibold text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                >
                  <option value="all">All Roles</option>
                  <option value="trader">Traders Only</option>
                  <option value="admin">Admins Only</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] text-xs font-semibold text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] overflow-hidden shadow-xs transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/[0.1] dark:border-white/[0.12] bg-[#f8f8fa] dark:bg-[#1a1b22] text-[#48484a] dark:text-[#e5e5ea] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#515154] dark:text-[#d1d1d6] font-semibold">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0071e3] dark:text-[#2997ff]" />
                          <span>Loading users...</span>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#515154] dark:text-[#d1d1d6] font-semibold">
                          No registered users match the selected query.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#1d1d1f] dark:text-white">{user.name || 'Unnamed Trader'}</div>
                            <div className="text-[#48484a] dark:text-[#d1d1d6] font-mono-data text-[11px] font-medium">{user.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold uppercase tracking-wider ${
                                user.role === 'admin'
                                  ? 'bg-[#0071e3]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30'
                                  : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3a3a3c] dark:text-[#e5e5ea] border border-black/[0.1] dark:border-white/[0.15]'
                              }`}
                            >
                              {user.role || 'trader'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold uppercase tracking-wider ${
                                user.status === 'suspended'
                                  ? 'bg-[#ff453a]/15 text-[#c91a0f] dark:text-[#ff453a] border border-[#ff453a]/30'
                                  : 'bg-[#30d158]/15 text-[#137a34] dark:text-[#30d158] border border-[#30d158]/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'suspended' ? 'bg-[#ff453a]' : 'bg-[#30d158]'}`} />
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono-data text-[#515154] dark:text-[#c7c7cc] text-[11px] font-medium">
                            {new Date(user.createdAt).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Role */}
                              <button
                                onClick={() => handleToggleUserRole(user)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] text-[#1d1d1f] dark:text-white border border-black/[0.1] dark:border-white/[0.14] transition-all cursor-pointer"
                                title={user.role === 'admin' ? 'Demote to Trader' : 'Promote to Admin'}
                              >
                                {user.role === 'admin' ? 'Demote' : 'Promote'}
                              </button>

                              {/* Toggle Status */}
                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                  user.status === 'suspended'
                                    ? 'bg-[#30d158]/15 text-[#137a34] dark:text-[#30d158] border-[#30d158]/30 hover:bg-[#30d158]/25'
                                    : 'bg-[#ff453a]/15 text-[#c91a0f] dark:text-[#ff453a] border-[#ff453a]/30 hover:bg-[#ff453a]/25'
                                }`}
                                title={user.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                              >
                                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => setResetUserTarget(user)}
                                className="p-1.5 rounded-lg text-[#515154] dark:text-[#d1d1d6] hover:text-[#1d1d1f] dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] border border-black/[0.08] dark:border-white/[0.12] transition-all cursor-pointer"
                                title="Reset Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User */}
                              <button
                                onClick={() => setDeleteUserTarget(user)}
                                className="p-1.5 rounded-lg text-[#c91a0f] dark:text-[#ff453a] bg-[#ff453a]/10 hover:bg-[#ff453a]/20 border border-[#ff453a]/25 transition-all cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.12] bg-[#f8f8fa] dark:bg-[#14151a] flex items-center justify-between text-xs text-[#515154] dark:text-[#c7c7cc] font-medium">
                <span>
                  Showing {users.length} of {totalUsers} total users
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.14] border border-black/[0.12] dark:border-white/[0.16] disabled:opacity-40 disabled:cursor-not-allowed text-[#1d1d1f] dark:text-white font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    Previous
                  </button>
                  <span className="font-mono-data font-bold text-[#1d1d1f] dark:text-white">Page {userPage}</span>
                  <button
                    disabled={userPage * 20 >= totalUsers}
                    onClick={() => setUserPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.14] border border-black/[0.12] dark:border-white/[0.16] disabled:opacity-40 disabled:cursor-not-allowed text-[#1d1d1f] dark:text-white font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DATABASE MANAGER                                  */}
        {/* ======================================================== */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#0071e3] dark:text-[#2997ff]" />
                  <span>SQLite Database Manager</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerProcedure('vacuum_database')}
                  disabled={procedureRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1a1b22] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] border border-black/[0.12] dark:border-white/[0.16] text-[#1d1d1f] dark:text-white transition-all cursor-pointer shadow-xs"
                  title="Run VACUUM & Optimize"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#137a34] dark:text-[#30d158]" />
                  <span>Vacuum DB</span>
                </button>
                <button
                  onClick={() => triggerProcedure('export_database')}
                  disabled={procedureRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Dump Snapshot (JSON)</span>
                </button>
              </div>
            </div>

            {/* Table Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs text-[#515154] dark:text-[#c7c7cc] font-bold mr-1 uppercase tracking-wider">Tables:</span>
              {(dbMeta?.tables || []).map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelectedTable(t.name);
                    fetchTableRecords(t.name);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono-data font-bold transition-all cursor-pointer shrink-0 border ${
                    selectedTable === t.name
                      ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-sm'
                      : 'bg-white dark:bg-[#14151a] text-[#48484a] dark:text-[#d1d1d6] hover:text-[#1d1d1f] dark:hover:text-white border-black/[0.1] dark:border-white/[0.14]'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${selectedTable === t.name ? 'bg-white/20 text-white' : 'bg-black/[0.08] dark:bg-white/[0.12] text-[#1d1d1f] dark:text-white'}`}>
                    {t.rowCount}
                  </span>
                </button>
              ))}
            </div>

            {/* Table Schema Drawer */}
            {dbMeta?.tables.find((t) => t.name === selectedTable) && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] text-xs shadow-xs transition-colors">
                <div className="text-[11px] text-[#515154] dark:text-[#d1d1d6] uppercase tracking-wider font-bold mb-2 flex items-center justify-between">
                  <span>Schema Definition: {selectedTable}</span>
                  <span className="font-mono-data text-[#1d1d1f] dark:text-white font-bold">{dbMeta.tables.find((t) => t.name === selectedTable)?.columns.length} columns</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dbMeta.tables.find((t) => t.name === selectedTable)?.columns.map((col) => (
                    <span
                      key={col.name}
                      className="px-2.5 py-1 rounded-lg bg-[#f8f8fa] dark:bg-[#1a1b22] border border-black/[0.08] dark:border-white/[0.12] font-mono-data text-[11px] text-[#1d1d1f] dark:text-white flex items-center gap-1.5 font-medium"
                    >
                      <span className={col.pk ? 'text-[#9a5400] dark:text-[#ff9f0a] font-bold' : 'text-[#1d1d1f] dark:text-white'}>
                        {col.name}
                      </span>
                      <span className="text-[#6e6e73] dark:text-[#a1a1a6] text-[10px] uppercase font-bold">{col.type}</span>
                      {col.pk && <span className="text-[9px] bg-[#ff9f0a]/20 text-[#9a5400] dark:text-[#ff9f0a] px-1 rounded font-bold">PK</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Table Data View */}
            <div className="rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] overflow-hidden shadow-xs transition-colors">
              <div className="p-4 border-b border-black/[0.1] dark:border-white/[0.12] bg-[#f8f8fa] dark:bg-[#14151a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1d1d1f] dark:text-white text-sm">Table Records: {selectedTable}</span>
                  <span className="text-xs text-[#515154] dark:text-[#c7c7cc] font-mono-data font-semibold">({tableData?.total || 0} total rows)</span>
                </div>
                <button
                  onClick={() => fetchTableRecords(selectedTable)}
                  className="p-1.5 rounded-lg bg-white dark:bg-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.14] border border-black/[0.12] dark:border-white/[0.16] text-[#1d1d1f] dark:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTableData ? 'animate-spin' : ''}`} />
                  <span>Reload</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-left text-xs font-mono-data">
                  <thead className="sticky top-0 bg-[#e5e5ea] dark:bg-[#1c1d24] z-10">
                    <tr className="border-b border-black/[0.12] dark:border-white/[0.14] text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider text-[11px] font-bold">
                      {(tableData?.columns || []).map((col) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                    {loadingTableData ? (
                      <tr>
                        <td colSpan={tableData?.columns?.length || 4} className="py-8 text-center text-[#515154] dark:text-[#d1d1d6] font-semibold">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-[#0071e3] dark:text-[#2997ff]" />
                          <span>Fetching records...</span>
                        </td>
                      </tr>
                    ) : (tableData?.rows || []).length === 0 ? (
                      <tr>
                        <td colSpan={tableData?.columns?.length || 4} className="py-8 text-center text-[#515154] dark:text-[#d1d1d6] font-semibold">
                          Table is empty.
                        </td>
                      </tr>
                    ) : (
                      (tableData?.rows || []).map((row, idx) => (
                        <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors">
                          {(tableData?.columns || []).map((col) => {
                            const val = row[col];
                            return (
                              <td key={col} className="py-2 px-3 whitespace-nowrap max-w-[240px] truncate text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
                                {col === 'password'
                                  ? '••••••••••••••••••••••••'
                                  : val === null || val === undefined
                                  ? <span className="text-[#8e8e93] dark:text-[#636366] italic font-normal">NULL</span>
                                  : String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SQL Terminal Console */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                  <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-white">Interactive SQL Console</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRawSql('SELECT id, email, role, status FROM users LIMIT 10;')}
                    className="text-[11px] font-semibold text-[#48484a] dark:text-[#d1d1d6] hover:text-[#1d1d1f] dark:hover:text-white px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.1] dark:border-white/[0.12] cursor-pointer"
                  >
                    Quick: Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawSql('SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action;')}
                    className="text-[11px] font-semibold text-[#48484a] dark:text-[#d1d1d6] hover:text-[#1d1d1f] dark:hover:text-white px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.1] dark:border-white/[0.12] cursor-pointer"
                  >
                    Quick: Audit Stats
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawSql('PRAGMA page_count; PRAGMA page_size;')}
                    className="text-[11px] font-semibold text-[#48484a] dark:text-[#d1d1d6] hover:text-[#1d1d1f] dark:hover:text-white px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.1] dark:border-white/[0.12] cursor-pointer"
                  >
                    Quick: Page Size
                  </button>
                </div>
              </div>

              <form onSubmit={handleExecuteSql} className="space-y-3">
                <textarea
                  value={rawSql}
                  onChange={(e) => setRawSql(e.target.value)}
                  rows={3}
                  placeholder="Enter raw SQL statement (e.g. SELECT * FROM users)..."
                  className="w-full p-3 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.22] text-[#1d1d1f] dark:text-white placeholder-[#8e8e93] dark:placeholder-[#636366] font-mono-data text-xs font-semibold focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] transition-all resize-y"
                />

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={executingSql || !rawSql.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {executingSql ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Run Query</span>
                  </button>
                </div>
              </form>

              {/* SQL Result Output */}
              {rawSqlResult && (
                <div className="mt-4 pt-4 border-t border-black/[0.08] dark:border-white/[0.12]">
                  {rawSqlResult.error ? (
                    <div className="p-3 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/35 text-[#c91a0f] dark:text-[#ff453a] text-xs font-mono-data font-semibold">
                      <strong>SQL Error:</strong> {rawSqlResult.error}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#515154] dark:text-[#c7c7cc] mb-2 font-mono-data font-bold">
                        <span className="text-[#137a34] dark:text-[#30d158]">
                          Query executed successfully • {rawSqlResult.rows.length} rows returned
                        </span>
                        <span className="text-[#1d1d1f] dark:text-white">{rawSqlResult.executionTimeMs} ms</span>
                      </div>
                      <div className="overflow-x-auto max-h-[220px] rounded-xl border border-black/[0.1] dark:border-white/[0.14] bg-white dark:bg-[#0c0d11]">
                        <table className="w-full text-left text-xs font-mono-data">
                          <thead className="bg-[#f2f2f7] dark:bg-[#1c1d24] text-[#1d1d1f] dark:text-[#f5f5f7] font-bold">
                            <tr className="border-b border-black/[0.1] dark:border-white/[0.12]">
                              {rawSqlResult.columns.map((c) => (
                                <th key={c} className="py-2 px-3 whitespace-nowrap">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                            {rawSqlResult.rows.map((row, i) => (
                              <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04]">
                                {rawSqlResult.columns.map((c) => (
                                  <td key={c} className="py-1.5 px-3 whitespace-nowrap text-[#1d1d1f] dark:text-white font-medium">
                                    {String(row[c] ?? 'NULL')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: VITAL ADMIN PROCEDURES                            */}
        {/* ======================================================== */}
        {activeTab === 'procedures' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#0071e3] dark:text-[#2997ff]" />
                <span>Vital System Procedures</span>
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#515154] dark:text-[#d1d1d6] mt-0.5">
                Execute critical maintenance tasks, clean automated test users, vacuum storage, and inspect security audit logs.
              </p>
            </div>

            {/* Status Message Banner */}
            {procedureStatusMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  procedureStatusMessage.type === 'success'
                    ? 'bg-[#30d158]/15 border border-[#30d158]/35 text-[#137a34] dark:text-[#30d158]'
                    : procedureStatusMessage.type === 'error'
                    ? 'bg-[#ff453a]/15 border border-[#ff453a]/35 text-[#c91a0f] dark:text-[#ff453a]'
                    : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#1d1d1f] dark:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {procedureStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{procedureStatusMessage.text}</span>
                </div>
                <button
                  onClick={() => setProcedureStatusMessage(null)}
                  className="text-inherit opacity-70 hover:opacity-100 cursor-pointer font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Procedures Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Maintenance Mode Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#1d1d1f] dark:text-white">Emergency Maintenance Mode</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold ${
                        systemSettings.maintenanceMode === 'true'
                          ? 'bg-[#ff453a]/15 text-[#c91a0f] dark:text-[#ff453a] border border-[#ff453a]/30'
                          : 'bg-[#30d158]/15 text-[#137a34] dark:text-[#30d158] border border-[#30d158]/30'
                      }`}
                    >
                      {systemSettings.maintenanceMode === 'true' ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-3">
                    Blocks non-admin order executions and risk calculations while displaying an announcement banner to all active traders.
                  </p>
                  <input
                    type="text"
                    value={maintenanceReasonInput}
                    onChange={(e) => setMaintenanceReasonInput(e.target.value)}
                    placeholder="Trader announcement message..."
                    className="w-full px-3 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] text-xs font-semibold text-[#1d1d1f] dark:text-white placeholder-[#8e8e93] dark:placeholder-[#636366] mb-4 font-mono-data focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                  />
                </div>

                <button
                  onClick={() => triggerProcedure('toggle_maintenance', { reason: maintenanceReasonInput })}
                  disabled={procedureRunning}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                    systemSettings.maintenanceMode === 'true'
                      ? 'bg-[#30d158] hover:bg-[#30d158]/90 text-black'
                      : 'bg-[#ff453a] hover:bg-[#ff453a]/90 text-white'
                  }`}
                >
                  {systemSettings.maintenanceMode === 'true' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Disable Maintenance Mode</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Activate Maintenance Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* 2. Prune Test Users Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#1d1d1f] dark:text-white">Clean Automated Test Users</span>
                    <Trash2 className="w-4 h-4 text-[#9a5400] dark:text-[#ff9f0a]" />
                  </div>
                  <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-4">
                    Removes automated <code className="px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.1] text-[#1d1d1f] dark:text-white font-mono-data font-bold">audit_*@stratum.prop</code> test accounts created during unit test suites to keep production database clean.
                  </p>
                </div>

                <button
                  onClick={() => triggerProcedure('prune_test_users')}
                  disabled={procedureRunning}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.14] text-[#1d1d1f] dark:text-white border border-black/[0.12] dark:border-white/[0.16] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Trash2 className="w-4 h-4 text-[#9a5400] dark:text-[#ff9f0a]" />
                  <span>Prune Test Users</span>
                </button>
              </div>

              {/* 3. Database Vacuum & Optimize */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#1d1d1f] dark:text-white">SQLite Vacuum & Index Optimization</span>
                    <RotateCcw className="w-4 h-4 text-[#137a34] dark:text-[#30d158]" />
                  </div>
                  <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-4">
                    Executes <code className="px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.1] text-[#1d1d1f] dark:text-white font-mono-data font-bold">VACUUM; PRAGMA optimize;</code> to defragment B-trees, rebuild indexes, and shrink database file size on disk.
                  </p>
                </div>

                <button
                  onClick={() => triggerProcedure('vacuum_database')}
                  disabled={procedureRunning}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.14] text-[#1d1d1f] dark:text-white border border-black/[0.12] dark:border-white/[0.16] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <RotateCcw className="w-4 h-4 text-[#137a34] dark:text-[#30d158]" />
                  <span>Execute Vacuum</span>
                </button>
              </div>

              {/* 4. Seed Institutional Demo Traders */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#1d1d1f] dark:text-white">Provision Demo Funded Traders</span>
                    <UserCheck className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                  </div>
                  <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-4">
                    Seeds sample institutional funded traders (Alex Vance, Marcus Chen, Elena Rostova) with passwords for sandbox testing.
                  </p>
                </div>

                <button
                  onClick={() => triggerProcedure('seed_demo_traders')}
                  disabled={procedureRunning}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Seed Demo Traders</span>
                </button>
              </div>
            </div>

            {/* Audit Logs Trail */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14151a] border border-black/[0.1] dark:border-white/[0.14] shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                  <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-white">Live Administrative Audit Trail</h3>
                </div>
                <button
                  onClick={fetchProceduresData}
                  className="text-xs font-semibold text-[#515154] dark:text-[#c7c7cc] hover:text-[#1d1d1f] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Logs</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-[300px] rounded-xl border border-black/[0.08] dark:border-white/[0.1]">
                <table className="w-full text-left text-xs font-mono-data">
                  <thead className="sticky top-0 bg-[#f2f2f7] dark:bg-[#1c1d24]">
                    <tr className="border-b border-black/[0.1] dark:border-white/[0.12] text-[#48484a] dark:text-[#e5e5ea] uppercase tracking-wider text-[11px] font-bold">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-[#515154] dark:text-[#d1d1d6] font-semibold">
                          No audit logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04]">
                          <td className="py-2 px-3 text-[#515154] dark:text-[#c7c7cc] whitespace-nowrap font-medium">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0071e3]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[#1d1d1f] dark:text-white font-bold">{log.actorEmail}</td>
                          <td className="py-2 px-3 text-[#48484a] dark:text-[#d1d1d6] font-medium max-w-sm truncate">{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: CREATE USER / ADMIN                               */}
      {/* ======================================================== */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-[#16171d] border border-black/[0.14] dark:border-white/[0.18] rounded-2xl p-6 shadow-2xl relative text-[#1d1d1f] dark:text-[#f5f5f7]">
            <button
              onClick={() => setIsCreateUserOpen(false)}
              className="absolute top-4 right-4 text-[#515154] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white mb-1">Create Platform User</h3>
            <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-4">Add a new trader or administrative operator to SQLite.</p>

            {createError && (
              <div className="p-3 mb-4 rounded-xl bg-[#ff453a]/15 text-[#c91a0f] dark:text-[#ff453a] text-xs font-bold border border-[#ff453a]/30">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#1d1d1f] dark:text-[#e5e5ea] mb-1 font-bold">Full Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.2] text-[#1d1d1f] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#1d1d1f] dark:text-[#e5e5ea] mb-1 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="trader@stratum.prop"
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.2] text-[#1d1d1f] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] font-mono-data"
                />
              </div>

              <div>
                <label className="block text-xs text-[#1d1d1f] dark:text-[#e5e5ea] mb-1 font-bold">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.2] text-[#1d1d1f] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#1d1d1f] dark:text-[#e5e5ea] mb-1 font-bold">Role</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.2] text-[#1d1d1f] dark:text-white text-xs font-bold focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                >
                  <option value="trader">Trader (Standard User)</option>
                  <option value="admin">Admin (Full Console Access)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] text-[#1d1d1f] dark:text-white border border-black/[0.1] dark:border-white/[0.14] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {createSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RESET PASSWORD                                    */}
      {/* ======================================================== */}
      {resetUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#16171d] border border-black/[0.14] dark:border-white/[0.18] rounded-2xl p-6 shadow-2xl text-[#1d1d1f] dark:text-[#f5f5f7]">
            <h3 className="text-base font-bold text-[#1d1d1f] dark:text-white mb-1">Reset Password</h3>
            <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-4">
              Enter a new password for <span className="text-[#1d1d1f] dark:text-white font-mono-data font-bold">{resetUserTarget.email}</span>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                required
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="New password..."
                className="w-full px-3 py-2 rounded-xl bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.2] text-[#1d1d1f] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetUserTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1d1d1f] dark:text-white bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] border border-black/[0.1] dark:border-white/[0.14] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting || !resetNewPassword}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white cursor-pointer shadow-sm"
                >
                  {resetSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION                               */}
      {/* ======================================================== */}
      {deleteUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#16171d] border border-[#ff453a]/30 rounded-2xl p-6 shadow-2xl text-[#1d1d1f] dark:text-[#f5f5f7]">
            <div className="flex items-center gap-2 text-[#c91a0f] dark:text-[#ff453a] mb-2 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm User Deletion</span>
            </div>
            <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mb-4">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#1d1d1f] dark:text-white font-mono-data">{deleteUserTarget.email}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteUserTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1d1d1f] dark:text-white bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] border border-black/[0.1] dark:border-white/[0.14] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#ff453a] hover:bg-[#ff3b30] text-white cursor-pointer shadow-sm"
              >
                {deleteSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
