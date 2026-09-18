import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient, getActiveSupabaseConfig, testSupabaseConnection, isValidHttpUrl } from './supabase';
import { logAuditEvent } from '../data/auditLogData';

export interface TableDefinition {
  name: string;
  tableName: string;
  localStorageKey: string;
  description: string;
  category: 'academic' | 'administrative' | 'financial' | 'security' | 'portal';
  primaryKey: string;
}

export const DATABASE_TABLES: TableDefinition[] = [
  {
    name: 'Students Directory',
    tableName: 'students',
    localStorageKey: 'ess_students',
    description: 'Enrolled students, classes, gender, guardian details, and enrollment status',
    category: 'academic',
    primaryKey: 'id',
  },
  {
    name: 'Staff & Teachers',
    tableName: 'teachers',
    localStorageKey: 'ess_teachers',
    description: 'Academic and non-academic staff roster, assigned roles, subjects, and classes',
    category: 'administrative',
    primaryKey: 'id',
  },
  {
    name: 'Continuous Assessment & Scores',
    tableName: 'scores',
    localStorageKey: 'ess_scores',
    description: 'Termly CA1, CA2, CA3, CA4, Exam scores, grades, remarks, and positions',
    category: 'academic',
    primaryKey: 'id',
  },
  {
    name: 'Affective & Behavioral Records',
    tableName: 'affective_records',
    localStorageKey: 'ess_skills_db',
    description: 'Behavioral ratings, punctuality, neatness, politeness, honesty, and leadership',
    category: 'academic',
    primaryKey: 'student_id',
  },
  {
    name: 'Scratch Card PINs',
    tableName: 'pin_records',
    localStorageKey: 'ess_pins',
    description: 'Generated result checker scratch cards, serial numbers, usage counts, and status',
    category: 'financial',
    primaryKey: 'id',
  },
  {
    name: 'PIN Verification Audit Logs',
    tableName: 'pin_audit_logs',
    localStorageKey: 'ess_pin_audit_logs',
    description: 'Timestamped logs of student portal result checking scratch card redemptions',
    category: 'security',
    primaryKey: 'id',
  },
  {
    name: 'Academic Sessions & Terms',
    tableName: 'academic_sessions',
    localStorageKey: 'ess_sessions',
    description: 'Configured academic sessions and active term calendar pointers',
    category: 'academic',
    primaryKey: 'session_string',
  },
  {
    name: 'Admission Applications',
    tableName: 'admission_applications',
    localStorageKey: 'ess_admission_applicants',
    description: 'Online applicants, candidate biodata, entrance scores, and offer letter status',
    category: 'administrative',
    primaryKey: 'id',
  },
  {
    name: 'Entrance Examination Batches',
    tableName: 'entrance_exam_schedules',
    localStorageKey: 'ess_entrance_exam_schedules',
    description: 'Admission CBT schedules, venue assignments, candidate capacities, and status',
    category: 'administrative',
    primaryKey: 'id',
  },
  {
    name: 'CBT Question Repository',
    tableName: 'cbt_questions',
    localStorageKey: 'ess_cbt_questions',
    description: 'Question bank for computer-based tests, options, keys, and AI generated tests',
    category: 'academic',
    primaryKey: 'id',
  },
  {
    name: 'Finance & Tuition Payments',
    tableName: 'finance_transactions',
    localStorageKey: 'ess_transactions',
    description: 'Tuition fees ledger, bank references, payment receipts, and bursary entries',
    category: 'financial',
    primaryKey: 'id',
  },
  {
    name: 'Tuition Fee Structures',
    tableName: 'fee_breakdowns',
    localStorageKey: 'ess_fee_breakdowns',
    description: 'Class-by-class statutory fees, ICT, PTA, sports, and laboratory levies',
    category: 'financial',
    primaryKey: 'class_name',
  },
  {
    name: 'Gate & Attendance Scanner Logs',
    tableName: 'attendance_logs',
    localStorageKey: 'ess_student_attendance',
    description: 'Daily QR gate clock-in/out timestamps for students and teaching personnel',
    category: 'security',
    primaryKey: 'id',
  },
  {
    name: 'Digital ID Cards & QR Tokens',
    tableName: 'student_id_cards',
    localStorageKey: 'ess_student_id_cards',
    description: 'Issued smart student ID cards, encrypted QR tokens, and blood group data',
    category: 'security',
    primaryKey: 'id',
  },
  {
    name: 'School Branding & Portal Settings',
    tableName: 'portal_settings',
    localStorageKey: 'ess_portal_settings',
    description: 'Institution identity, motto, official stamp, contact information, and principal note',
    category: 'portal',
    primaryKey: 'id',
  },
  {
    name: 'News & Official Circulars',
    tableName: 'news_announcements',
    localStorageKey: 'ess_news',
    description: 'Published campus news bulletins, press releases, and circulars',
    category: 'portal',
    primaryKey: 'id',
  },
  {
    name: 'Campus Media Gallery',
    tableName: 'gallery_items',
    localStorageKey: 'ess_gallery',
    description: 'Campus photo gallery categories, event photographs, and press albums',
    category: 'portal',
    primaryKey: 'id',
  },
  {
    name: 'Security & Action Audit Logs',
    tableName: 'audit_logs',
    localStorageKey: 'ess_audit_logs',
    description: 'Immutable compliance record of administrative actions, user logins, and role updates',
    category: 'security',
    primaryKey: 'id',
  },
];

export interface TableSyncStat {
  name: string;
  tableName: string;
  localStorageKey: string;
  category: string;
  localRowCount: number;
  cloudRowCount: number | null;
  status: 'synced' | 'local_only' | 'pending' | 'error';
  lastSyncedAt?: string;
  errorMessage?: string;
}

export interface DatabaseSyncResult {
  success: boolean;
  totalPushed: number;
  totalPulled: number;
  tablesSummary: Record<string, { pushed: number; pulled: number; status: string; error?: string }>;
  timestamp: string;
}

/**
 * Normalizes an entity record for database serialization (converts camelCase to snake_case if applicable)
 */
function normalizeRecordForDb(record: any, tableName: string): any {
  if (!record || typeof record !== 'object') return record;
  const clone = { ...record };

  // Common conversions
  if (tableName === 'students') {
    return {
      id: String(clone.id),
      name: clone.name || '',
      class: clone.class || '',
      previous_class: clone.previousClass || clone.previous_class || null,
      gender: clone.gender || 'Not Specified',
      status: clone.status || 'Active',
      fees: clone.fees || 'Unpaid',
      email: clone.email || null,
      parent_number: clone.parentNumber || clone.parent_number || null,
      address: clone.address || null,
      password: clone.password || 'password123',
      enrollment_status: clone.enrollmentStatus || clone.enrollment_status || 'Enrolled',
    };
  }

  if (tableName === 'scores') {
    return {
      id: String(clone.id),
      student_id: clone.studentId || clone.student_id,
      student_name: clone.studentName || clone.student_name,
      class: clone.class,
      subject: clone.subject,
      session: clone.session,
      ca1: Number(clone.ca1) || 0,
      ca2: Number(clone.ca2) || 0,
      ca3: Number(clone.ca3) || 0,
      ca4: Number(clone.ca4) || 0,
      exam: Number(clone.exam) || 0,
      total: Number(clone.total) || 0,
      grade: clone.grade || 'F',
      remark: clone.remark || 'Fail',
      position: clone.position || null,
      annual_score: clone.annualScore ?? clone.annual_score ?? null,
      teacher_note: clone.teacherNote || clone.teacher_note || null,
    };
  }

  if (tableName === 'pin_records') {
    return {
      id: String(clone.id),
      pin_code: clone.pinCode || clone.pin_code,
      serial_number: clone.serialNumber || clone.serial_number,
      student_id: clone.studentId || clone.student_id,
      student_name: clone.studentName || clone.student_name,
      class: clone.class,
      session: clone.session,
      status: clone.status || 'Active',
      uses_remaining: Number(clone.usesRemaining ?? clone.uses_remaining ?? 5),
      max_uses: Number(clone.maxUses ?? clone.max_uses ?? 5),
      date_generated: clone.dateGenerated || clone.date_generated || new Date().toISOString().split('T')[0],
      last_used_at: clone.lastUsedAt || clone.last_used_at || null,
    };
  }

  if (tableName === 'academic_sessions') {
    const sessStr = typeof clone === 'string' ? clone : clone.session_string || clone.session || String(clone);
    return {
      session_string: sessStr,
    };
  }

  // Fallback: pass through with id guaranteed
  return clone;
}

/**
 * Reads local storage data for a table definition
 */
export function getLocalTableData(tableDef: TableDefinition): any[] {
  try {
    const raw = localStorage.getItem(tableDef.localStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return [parsed];
    return [];
  } catch {
    return [];
  }
}

/**
 * Writes data into local storage for a table definition and triggers system refresh event
 */
export function setLocalTableData(tableDef: TableDefinition, data: any[]): void {
  try {
    localStorage.setItem(tableDef.localStorageKey, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event(`${tableDef.localStorageKey}_change`));
  } catch (err) {
    console.error(`Failed to write local data for ${tableDef.name}:`, err);
  }
}

/**
 * Pushes all records from a specific local table to the connected database
 */
export async function pushTableToDatabase(tableDef: TableDefinition): Promise<{ pushed: number; error?: string }> {
  const { isConfigured } = getActiveSupabaseConfig();
  if (!isConfigured) {
    return { pushed: 0, error: 'Database is in local mode (not connected to cloud)' };
  }

  const client = getSupabaseClient();
  const rawLocal = getLocalTableData(tableDef);
  if (rawLocal.length === 0) return { pushed: 0 };

  const dbRows = rawLocal.map(item => normalizeRecordForDb(item, tableDef.tableName));

  try {
    // Upsert items in batches of 100
    const chunkSize = 100;
    let successCount = 0;

    for (let i = 0; i < dbRows.length; i += chunkSize) {
      const chunk = dbRows.slice(i, i + chunkSize);
      const { error } = await client.from(tableDef.tableName).upsert(chunk, {
        onConflict: tableDef.primaryKey,
      });

      if (error) {
        return { pushed: successCount, error: error.message };
      }
      successCount += chunk.length;
    }

    localStorage.setItem(`ess_db_last_sync_${tableDef.tableName}`, new Date().toISOString());
    return { pushed: successCount };
  } catch (err: any) {
    return { pushed: 0, error: err.message || 'Unknown push error' };
  }
}

/**
 * Pulls all records from the cloud database into local storage for a specific table
 */
export async function pullTableFromDatabase(tableDef: TableDefinition): Promise<{ pulled: number; error?: string }> {
  const { isConfigured } = getActiveSupabaseConfig();
  if (!isConfigured) {
    return { pulled: 0, error: 'Database is in local mode (not connected to cloud)' };
  }

  const client = getSupabaseClient();
  try {
    const { data, error } = await client.from(tableDef.tableName).select('*');
    if (error) {
      return { pulled: 0, error: error.message };
    }

    if (Array.isArray(data) && data.length > 0) {
      setLocalTableData(tableDef, data);
      localStorage.setItem(`ess_db_last_sync_${tableDef.tableName}`, new Date().toISOString());
      return { pulled: data.length };
    }

    return { pulled: 0 };
  } catch (err: any) {
    return { pulled: 0, error: err.message || 'Unknown pull error' };
  }
}

/**
 * Performs a complete push of all 18 database collections to the cloud database
 */
export async function syncAllTablesToDatabase(): Promise<DatabaseSyncResult> {
  const summary: Record<string, { pushed: number; pulled: number; status: string; error?: string }> = {};
  let totalPushed = 0;

  for (const table of DATABASE_TABLES) {
    const res = await pushTableToDatabase(table);
    totalPushed += res.pushed;
    summary[table.tableName] = {
      pushed: res.pushed,
      pulled: 0,
      status: res.error ? 'error' : 'synced',
      error: res.error,
    };
  }

  const timestamp = new Date().toISOString();
  localStorage.setItem('ess_db_global_last_sync', timestamp);
  window.dispatchEvent(new Event('ess_database_status_change'));

  logAuditEvent({
    action: `Synchronized all local database tables to Cloud Database (${totalPushed} records pushed)`,
    module: 'System & Database',
    recordAffected: `${DATABASE_TABLES.length} Tables`,
    role: localStorage.getItem('userRole') || 'Super Admin',
    userId: localStorage.getItem('loggedInUserId') || 'ADM-001',
    userName: localStorage.getItem('impersonatingName') || 'System Administrator',
  });

  return {
    success: true,
    totalPushed,
    totalPulled: 0,
    tablesSummary: summary,
    timestamp,
  };
}

/**
 * Performs a complete pull of all 18 database collections from the cloud database
 */
export async function pullAllTablesFromDatabase(): Promise<DatabaseSyncResult> {
  const summary: Record<string, { pushed: number; pulled: number; status: string; error?: string }> = {};
  let totalPulled = 0;

  for (const table of DATABASE_TABLES) {
    const res = await pullTableFromDatabase(table);
    totalPulled += res.pulled;
    summary[table.tableName] = {
      pushed: 0,
      pulled: res.pulled,
      status: res.error ? 'error' : 'synced',
      error: res.error,
    };
  }

  const timestamp = new Date().toISOString();
  localStorage.setItem('ess_db_global_last_sync', timestamp);
  window.dispatchEvent(new Event('ess_database_status_change'));

  logAuditEvent({
    action: `Pulled all Cloud Database records into local storage (${totalPulled} records retrieved)`,
    module: 'System & Database',
    recordAffected: `${DATABASE_TABLES.length} Tables`,
    role: localStorage.getItem('userRole') || 'Super Admin',
    userId: localStorage.getItem('loggedInUserId') || 'ADM-001',
    userName: localStorage.getItem('impersonatingName') || 'System Administrator',
  });

  return {
    success: true,
    totalPushed: 0,
    totalPulled,
    tablesSummary: summary,
    timestamp,
  };
}

/**
 * Computes table statistics, local row counts, and cloud row counts for all collections
 */
export async function getDatabaseTableStats(): Promise<TableSyncStat[]> {
  const { isConfigured } = getActiveSupabaseConfig();
  const client = isConfigured ? getSupabaseClient() : null;

  const stats: TableSyncStat[] = [];

  for (const table of DATABASE_TABLES) {
    const localData = getLocalTableData(table);
    let cloudCount: number | null = null;
    let status: 'synced' | 'local_only' | 'pending' | 'error' = 'local_only';
    let errorMessage: string | undefined;

    if (isConfigured && client) {
      try {
        const { count, error } = await client.from(table.tableName).select('*', { count: 'exact', head: true });
        if (error) {
          errorMessage = error.message;
          status = 'error';
        } else {
          cloudCount = count ?? 0;
          status = cloudCount === localData.length ? 'synced' : 'pending';
        }
      } catch (e: any) {
        errorMessage = e.message;
        status = 'error';
      }
    }

    const lastSyncedAt = localStorage.getItem(`ess_db_last_sync_${table.tableName}`) || undefined;

    stats.push({
      name: table.name,
      tableName: table.tableName,
      localStorageKey: table.localStorageKey,
      category: table.category,
      localRowCount: localData.length,
      cloudRowCount: cloudCount,
      status,
      lastSyncedAt,
      errorMessage,
    });
  }

  return stats;
}

/**
 * Exports a full JSON snapshot of all 18 database collections
 */
export function exportFullDatabaseJson(): string {
  const dump: Record<string, any> = {
    schemaVersion: '2.0.0',
    schoolName: 'Emmanuel Secondary School, Makurdi',
    exportedAt: new Date().toISOString(),
    tables: {},
  };

  for (const table of DATABASE_TABLES) {
    dump.tables[table.tableName] = getLocalTableData(table);
  }

  return JSON.stringify(dump, null, 2);
}

/**
 * Restores all database collections from a JSON snapshot
 */
export function restoreDatabaseFromJson(jsonContent: string): { success: boolean; restoredTables: number; message: string } {
  try {
    const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    if (!parsed || !parsed.tables) {
      return { success: false, restoredTables: 0, message: 'Invalid backup file format: Missing tables object' };
    }

    let count = 0;
    for (const table of DATABASE_TABLES) {
      if (parsed.tables[table.tableName]) {
        const data = parsed.tables[table.tableName];
        if (Array.isArray(data)) {
          setLocalTableData(table, data);
          count++;
        }
      }
    }

    logAuditEvent({
      action: `Restored database backup containing ${count} tables`,
      module: 'System & Database',
      recordAffected: `${count} Tables`,
      role: localStorage.getItem('userRole') || 'Super Admin',
      userId: localStorage.getItem('loggedInUserId') || 'ADM-001',
      userName: localStorage.getItem('impersonatingName') || 'System Administrator',
    });

    window.dispatchEvent(new Event('ess_database_status_change'));
    return { success: true, restoredTables: count, message: `Successfully restored ${count} database collections!` };
  } catch (err: any) {
    return { success: false, restoredTables: 0, message: `Restore failed: ${err.message}` };
  }
}

/**
 * React Hook for database connection status, metrics, and sync controls
 */
export function useDatabaseSync() {
  const [config, setConfig] = useState(getActiveSupabaseConfig());
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<TableSyncStat[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('ess_db_global_last_sync'));
  const [statusMessage, setStatusMessage] = useState<string>('');

  const refreshStats = useCallback(async () => {
    try {
      const currentConfig = getActiveSupabaseConfig();
      setConfig(currentConfig);

      if (currentConfig.isConfigured) {
        const testRes = await testSupabaseConnection(currentConfig.url, currentConfig.anonKey);
        setIsConnected(testRes.success);
        setStatusMessage(testRes.message);
      } else {
        setIsConnected(false);
        setStatusMessage('Operating in offline local-storage fallback mode.');
      }

      const tableStats = await getDatabaseTableStats();
      setStats(tableStats);
      setLastSyncTime(localStorage.getItem('ess_db_global_last_sync'));
    } catch (e: any) {
      console.error('Failed to load database stats:', e);
    }
  }, []);

  useEffect(() => {
    refreshStats();

    const handleUpdate = () => refreshStats();
    window.addEventListener('ess_database_status_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ess_database_status_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshStats]);

  const pushAll = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllTablesToDatabase();
      await refreshStats();
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  const pullAll = async () => {
    setIsSyncing(true);
    try {
      const res = await pullAllTablesFromDatabase();
      await refreshStats();
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  const saveCredentials = (url: string, key: string) => {
    localStorage.setItem('ess_supabase_url', url.trim());
    localStorage.setItem('ess_supabase_key', key.trim());
    window.dispatchEvent(new Event('ess_database_status_change'));
  };

  const disconnectDatabase = () => {
    localStorage.removeItem('ess_supabase_url');
    localStorage.removeItem('ess_supabase_key');
    window.dispatchEvent(new Event('ess_database_status_change'));
  };

  return {
    config,
    isConnected,
    isSyncing,
    stats,
    lastSyncTime,
    statusMessage,
    refreshStats,
    pushAll,
    pullAll,
    saveCredentials,
    disconnectDatabase,
  };
}
