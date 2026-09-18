import React from "react";
import { 
  Key, 
  Plus, 
  ListOrdered, 
  CheckCircle2, 
  Users, 
  Layers, 
  ToggleLeft, 
  UserCheck, 
  Download, 
  Printer, 
  History, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { PinRecord, PinSecurityConfig, PinUsageLog } from "../../data/pinsData";

interface PinsOverviewProps {
  pins: PinRecord[];
  pinConfig: PinSecurityConfig;
  usageLogs: PinUsageLog[];
  onNavigateTab: (tab: string) => void;
}

export const PinsOverview: React.FC<PinsOverviewProps> = ({
  pins,
  pinConfig,
  usageLogs,
  onNavigateTab
}) => {
  const totalCount = pins.length;
  const activeCount = pins.filter((p) => p.status === "Active").length;
  const inactiveCount = pins.filter((p) => p.status === "Inactive").length;
  const usedCount = pins.filter((p) => p.status === "Used" || p.usesRemaining < p.maxUses).length;
  const exhaustedCount = pins.filter((p) => p.status === "Used" || p.usesRemaining === 0).length;
  const revokedCount = pins.filter((p) => p.status === "Revoked" || p.status === "Expired").length;
  const totalChecks = usageLogs.length;

  const quickActions = [
    {
      id: "generate_individual",
      title: "Generate Individual PIN",
      desc: "Assign a unique, secure Result PIN to a single student",
      icon: Plus,
      badge: "Single",
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
    },
    {
      id: "generate_class_pins",
      title: "Generate Class PINs",
      desc: "Batch generate PINs for all students in a target class",
      icon: Layers,
      badge: "Batch",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
    },
    {
      id: "generated_pins",
      title: "Generated PINs",
      desc: "View and search the master directory of all generated PINs",
      icon: ListOrdered,
      badge: `${totalCount} PINs`,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
    },
    {
      id: "check_used_pins",
      title: "Check Used PINs",
      desc: "Audit utilized and exhausted PINs with remaining balance",
      icon: CheckCircle2,
      badge: `${usedCount} Used`,
      color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
    },
    {
      id: "check_class_pins",
      title: "Check Class PINs",
      desc: "Review PIN coverage and student assignment status by class",
      icon: Users,
      badge: "Class Roster",
      color: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
    },
    {
      id: "activate_class_pins",
      title: "Activate Class PINs",
      desc: "Bulk enable or suspend all PINs for an entire class cohort",
      icon: ToggleLeft,
      badge: "Bulk Toggle",
      color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
    },
    {
      id: "activate_single_student",
      title: "Activate Single Student's PIN",
      desc: "Manage individual student PIN status, unlock lockouts, or reset",
      icon: UserCheck,
      badge: "Security",
      color: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
    },
    {
      id: "download_class_pins",
      title: "Download Class PINs",
      desc: "Export class PIN roster to clean CSV or spreadsheet format",
      icon: Download,
      badge: "Export",
      color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
    },
    {
      id: "get_class_pin_slips",
      title: "GetClass PIN Slips",
      desc: "Download or print physical scratch-card slips formatted for student distribution",
      icon: Printer,
      badge: "Print & Download",
      color: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
    },
    {
      id: "checked_results_via_pin",
      title: "Checked Results Via PIN Use",
      desc: "Live audit trail of all result checks verified through PINs",
      icon: History,
      badge: `${totalChecks} Checks`,
      color: "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total PINs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-slate-400">All database records</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active PINs</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Ready for verification</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Inactive PINs</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{inactiveCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Temporarily suspended</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Used PINs</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{usedCount}</p>
          <span className="text-[11px] text-purple-600 font-medium">{exhaustedCount} exhausted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Revoked / Expired</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{revokedCount}</p>
          <span className="text-[11px] text-rose-600 font-medium">Inactive holds</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm bg-indigo-50/20">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Results Checked</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">{totalChecks}</p>
          <span className="text-[11px] text-indigo-600 font-medium">Audit events logged</span>
        </div>
      </div>

      {/* Security Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">PIN Security Protocol Active</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Enforced
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Each Result PIN is cryptographically verified against <span className="text-amber-300 font-medium">Student ID + Academic Session</span>. Brute force lockout triggered after {pinConfig.maxFailedAttempts} failed attempts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab("generate_individual")}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} />
              Generate PIN
            </button>
            <button
              onClick={() => onNavigateTab("get_class_pin_slips")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Printer size={14} />
              Print Slips
            </button>
          </div>
        </div>
      </div>

      {/* 10 Core PIN Features Launcher Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Key size={16} className="text-amber-500" />
            PIN Management Operations
          </h3>
          <span className="text-xs text-slate-500">Select any operation below</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigateTab(action.id)}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-md flex flex-col justify-between ${action.color} group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/80 shadow-xs flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 shadow-xs">
                      {action.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-slate-950">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {action.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                  <span>Open</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
