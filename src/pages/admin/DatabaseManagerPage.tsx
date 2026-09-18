import React, { useState } from "react";
import { 
  DATABASE_TABLES, 
  useDatabaseSync, 
  pushTableToDatabase, 
  pullTableFromDatabase, 
  exportFullDatabaseJson, 
  restoreDatabaseFromJson, 
  TableDefinition 
} from "../../lib/databaseSync";
import { testSupabaseConnection } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Database, RefreshCw, UploadCloud, DownloadCloud, CheckCircle2, 
  AlertTriangle, ShieldCheck, HardDrive, FileCode, Download, 
  Upload, Copy, Check, Eye, EyeOff, Sparkles, Filter, Server
} from "lucide-react";

export default function DatabaseManagerPage() {
  const { 
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
    disconnectDatabase 
  } = useDatabaseSync();

  // Credentials editing
  const [inputUrl, setInputUrl] = useState(config.url || "");
  const [inputKey, setInputKey] = useState(config.anonKey || "");
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // Table filtering
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Schema modal state
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Toast feedback
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setBannerNotice({ text, type });
    setTimeout(() => setBannerNotice(null), 5000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(inputUrl, inputKey);
      setTestResult(res);
      if (res.success) {
        showToast("Database connection test succeeded!", "success");
      } else {
        showToast(`Connection failed: ${res.message}`, "error");
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveCredentials = () => {
    if (!inputUrl.trim() || !inputKey.trim()) {
      showToast("Please enter both Supabase URL and Anon Key", "error");
      return;
    }
    saveCredentials(inputUrl.trim(), inputKey.trim());
    showToast("Database credentials saved! Connecting to cloud database...", "success");
  };

  const handleDisconnect = () => {
    if (window.confirm("Are you sure you want to disconnect from Cloud Database and revert to Local Storage mode?")) {
      disconnectDatabase();
      setInputUrl("");
      setInputKey("");
      setTestResult(null);
      showToast("Disconnected from Cloud Database. Operating in Local Mode.", "info");
    }
  };

  const handleSyncSingleTable = async (tableDef: TableDefinition, action: "push" | "pull") => {
    try {
      if (action === "push") {
        const res = await pushTableToDatabase(tableDef);
        if (res.error) {
          showToast(`Error pushing ${tableDef.name}: ${res.error}`, "error");
        } else {
          showToast(`Successfully pushed ${res.pushed} records to ${tableDef.tableName}!`, "success");
        }
      } else {
        const res = await pullTableFromDatabase(tableDef);
        if (res.error) {
          showToast(`Error pulling ${tableDef.name}: ${res.error}`, "error");
        } else {
          showToast(`Successfully pulled ${res.pulled} records from ${tableDef.tableName}!`, "success");
        }
      }
      refreshStats();
    } catch (err: any) {
      showToast(`Operation failed: ${err.message}`, "error");
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportFullDatabaseJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ESS_Database_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Full database backup downloaded successfully!", "success");
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = restoreDatabaseFromJson(content);
        if (res.success) {
          showToast(res.message, "success");
          refreshStats();
        } else {
          showToast(res.message, "error");
        }
      } catch (err: any) {
        showToast(`Restore error: ${err.message}`, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopySql = () => {
    fetch("/supabase_schema.sql")
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setSqlCopied(true);
        setTimeout(() => setSqlCopied(false), 3000);
        showToast("SQL Schema copied to clipboard!", "success");
      })
      .catch(() => {
        showToast("Unable to fetch SQL file. Please view supabase_schema.sql directly.", "error");
      });
  };

  // Filtered stats
  const filteredStats = stats.filter(st => {
    const matchesCat = selectedCategory === "all" || st.category === selectedCategory;
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          st.tableName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalLocalRecords = stats.reduce((acc, s) => acc + s.localRowCount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      {bannerNotice && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border animate-in fade-in duration-200 ${
          bannerNotice.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : bannerNotice.type === "error"
            ? "bg-rose-50 text-rose-800 border-rose-200"
            : "bg-indigo-50 text-indigo-800 border-indigo-200"
        }`}>
          <span>{bannerNotice.text}</span>
          <button onClick={() => setBannerNotice(null)} className="text-xs underline ml-4 hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-slate-900">
                School Database & Cloud Synchronization
              </h1>
              <p className="text-xs text-slate-500">
                Centralized management for all 18 institutional database tables, PostgreSQL/Supabase connectivity, and automated backups.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshStats} 
            disabled={isSyncing} 
            className="gap-2 text-xs"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            Refresh Status
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadBackup} 
            className="gap-2 text-xs"
          >
            <Download size={14} />
            Export Backup
          </Button>

          <Button 
            variant="brand" 
            size="sm" 
            onClick={pushAll} 
            disabled={isSyncing} 
            className="gap-2 text-xs shadow-sm"
          >
            <UploadCloud size={14} />
            Push All to Cloud
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={pullAll} 
            disabled={isSyncing} 
            className="gap-2 text-xs"
          >
            <DownloadCloud size={14} />
            Pull from Cloud
          </Button>
        </div>
      </div>

      {/* Connection Status Banner Card */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isConnected 
          ? "bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/30 text-white" 
          : "bg-gradient-to-r from-slate-900 to-indigo-950 border-slate-700 text-white"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
            }`}>
              {isConnected ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">
                  {isConnected ? "Cloud Database Connected & Active" : "Operating in Local Storage Fallback Mode"}
                </h3>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isConnected ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {isConnected ? "Live Postgres / Supabase" : "Offline Safe"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {statusMessage || (isConnected 
                  ? `Connected to ${config.url}` 
                  : "All data operations are currently preserved in high-speed browser persistent storage.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Active Tables</span>
              <span className="font-bold text-white text-sm">18 / 18</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Records</span>
              <span className="font-bold text-white text-sm">{totalLocalRecords.toLocaleString()}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Last Synced</span>
              <span className="font-medium text-emerald-400 text-xs">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not Synced"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Configuration & SQL Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cloud Connection Settings */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={18} className="text-indigo-600" />
                <CardTitle className="text-base">Database Provider Credentials</CardTitle>
              </div>
              {config.isConfigured && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDisconnect}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="supabaseUrl" className="text-xs font-semibold text-slate-700">
                Supabase / PostgreSQL Endpoint URL
              </Label>
              <Input 
                id="supabaseUrl" 
                placeholder="https://your-project.supabase.co" 
                value={inputUrl} 
                onChange={(e) => setInputUrl(e.target.value)} 
                className="font-mono text-xs bg-slate-50"
              />
              <p className="text-[11px] text-slate-400">
                Found in your Supabase Dashboard under Project Settings &gt; API &gt; Project URL.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supabaseKey" className="text-xs font-semibold text-slate-700">
                Anon / Public API Key
              </Label>
              <div className="relative">
                <Input 
                  id="supabaseKey" 
                  type={showKey ? "text" : "password"} 
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                  value={inputKey} 
                  onChange={(e) => setInputKey(e.target.value)} 
                  className="font-mono text-xs pr-10 bg-slate-50"
                />
                <button 
                  type="button"
                  onClick={() => setShowKey(!showKey)} 
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Found in your Supabase Dashboard under Project Settings &gt; API &gt; anon public key.
              </p>
            </div>

            {testResult && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
                testResult.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-rose-600" />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.latencyMs && (
                  <span className="font-mono text-[11px] font-semibold opacity-80">
                    {testResult.latencyMs} ms
                  </span>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleTestConnection} 
                disabled={testingConnection || !inputUrl}
                className="gap-2 text-xs"
              >
                <RefreshCw size={14} className={testingConnection ? "animate-spin" : ""} />
                Test Connection
              </Button>

              <Button 
                variant="brand" 
                onClick={handleSaveCredentials} 
                disabled={!inputUrl || !inputKey}
                className="gap-2 text-xs"
              >
                <HardDrive size={14} />
                Save & Connect Database
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Schema & Disaster Recovery */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <div className="flex items-center gap-2">
                <FileCode size={18} className="text-indigo-600" />
                <CardTitle className="text-base">PostgreSQL DDL Schema</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Execute the pre-built schema script in your Supabase SQL Editor to provision all 18 tables with matching primary keys and Row Level Security.
              </p>
              
              <div className="flex flex-col gap-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopySql} 
                  className="w-full justify-center gap-2 text-xs"
                >
                  {sqlCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {sqlCopied ? "SQL Copied to Clipboard!" : "Copy Full SQL Migration"}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSqlModal(true)} 
                  className="w-full justify-center gap-2 text-xs"
                >
                  <Eye size={14} />
                  View Schema Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" />
                <CardTitle className="text-base">Disaster Recovery</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Export an unencrypted, complete JSON backup containing all students, scores, scratch cards, and finance logs, or restore previous states.
              </p>

              <div className="space-y-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadBackup} 
                  className="w-full justify-center gap-2 text-xs"
                >
                  <Download size={14} />
                  Download JSON Backup
                </Button>

                <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                  <Upload size={14} />
                  Restore from JSON File
                  <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Database Tables Health & Inspection Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Connected Database Collections ({filteredStats.length})
            </h2>
            <p className="text-xs text-slate-500">
              Live inspection of local row counts, cloud sync status, and granular per-table push/pull controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {["all", "academic", "administrative", "financial", "security", "portal"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                    selectedCategory === cat ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Input 
              placeholder="Search tables..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-48 text-xs h-8"
            />
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStats.map((st) => {
            const def = DATABASE_TABLES.find(d => d.tableName === st.tableName)!;
            return (
              <Card key={st.tableName} className="border-slate-200 shadow-xs hover:border-slate-300 transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                        {st.category}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 leading-tight mt-0.5">
                        {st.name}
                      </h4>
                      <p className="font-mono text-[11px] text-slate-400">
                        public.{st.tableName}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.status === "synced" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : st.status === "error"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {st.status === "synced" ? "Synced" : st.status === "error" ? "Needs Schema" : "Local Mode"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                    {def.description}
                  </p>

                  <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Local Records</span>
                      <span className="font-bold text-slate-800">{st.localRowCount}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Cloud Records</span>
                      <span className="font-bold text-indigo-600">
                        {st.cloudRowCount !== null ? st.cloudRowCount : "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Last Synced</span>
                      <span className="text-slate-600 text-[11px]">
                        {st.lastSyncedAt ? new Date(st.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Never"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSyncSingleTable(def, "push")}
                      className="flex-1 text-[11px] h-7 gap-1 border-slate-200 hover:bg-slate-50"
                    >
                      <UploadCloud size={12} />
                      Push
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSyncSingleTable(def, "pull")}
                      className="flex-1 text-[11px] h-7 gap-1 border-slate-200 hover:bg-slate-50"
                    >
                      <DownloadCloud size={12} />
                      Pull
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SQL Migration Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-base text-slate-900">PostgreSQL / Supabase Schema (18 Tables)</h3>
                <p className="text-xs text-slate-500">Copy this code and execute it in your Supabase SQL Editor.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSqlModal(false)}>
                Close
              </Button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-slate-950 text-slate-300 font-mono text-xs rounded-b-none">
              <pre className="whitespace-pre-wrap">
{`-- 1. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    previous_class TEXT,
    gender TEXT DEFAULT 'Not Specified',
    status TEXT DEFAULT 'Active',
    fees TEXT DEFAULT 'Unpaid',
    email TEXT,
    parent_number TEXT,
    address TEXT,
    password TEXT DEFAULT 'password123',
    enrollment_status TEXT DEFAULT 'Enrolled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Teachers & Staff Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subjects JSONB DEFAULT '[]'::jsonb,
    classes JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Active',
    qualification TEXT,
    join_date TEXT,
    avatar TEXT,
    is_admin BOOLEAN DEFAULT false,
    system_roles JSONB DEFAULT '["Teacher"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Continuous Assessment & Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class TEXT NOT NULL,
    subject TEXT NOT NULL,
    session TEXT NOT NULL,
    ca1 INTEGER DEFAULT 0,
    ca2 INTEGER DEFAULT 0,
    ca3 INTEGER DEFAULT 0,
    ca4 INTEGER DEFAULT 0,
    exam INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    grade TEXT,
    remark TEXT,
    position TEXT,
    annual_score INTEGER,
    teacher_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Affective Domain Table
CREATE TABLE IF NOT EXISTS public.affective_records (
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session TEXT NOT NULL,
    attentiveness INTEGER DEFAULT 0,
    attendance INTEGER DEFAULT 0,
    punctuality INTEGER DEFAULT 0,
    neatness INTEGER DEFAULT 0,
    politeness INTEGER DEFAULT 0,
    honesty INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (student_id, session)
);

-- 5. Scratch Card PINs Table
CREATE TABLE IF NOT EXISTS public.pin_records (
    id TEXT PRIMARY KEY,
    pin_code TEXT NOT NULL UNIQUE,
    serial_number TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class TEXT NOT NULL,
    session TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    uses_remaining INTEGER NOT NULL DEFAULT 5,
    max_uses INTEGER NOT NULL DEFAULT 5,
    date_generated DATE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6-18. Other Tables (admission_applications, entrance_exam_schedules, cbt_questions, finance_transactions, fee_breakdowns, attendance_logs, student_id_cards, portal_settings, news_announcements, gallery_items, audit_logs)
-- Full SQL file available in root: supabase_schema.sql`}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-between items-center">
              <Button variant="brand" onClick={handleCopySql} className="gap-2 text-xs">
                {sqlCopied ? <Check size={14} /> : <Copy size={14} />}
                {sqlCopied ? "Copied to Clipboard" : "Copy Complete supabase_schema.sql"}
              </Button>
              <Button variant="outline" onClick={() => setShowSqlModal(false)} className="text-xs">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
