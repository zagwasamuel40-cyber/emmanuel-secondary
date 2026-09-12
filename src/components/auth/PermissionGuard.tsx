import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Lock, CheckCircle2, UserCheck, AlertOctagon } from "lucide-react";
import { useCurrentUserRoles, Permission } from "../../data/rolesAndPermissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  moduleName?: string;
}

export default function PermissionGuard({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  moduleName = "Administrative Department",
}: PermissionGuardProps) {
  const { roles, permissions, hasPermission, hasAnyPermission, hasAllPermissions } = useCurrentUserRoles();
  const navigate = useNavigate();

  // Consolidate permissions to check
  const permsToCheck: Permission[] = [];
  if (requiredPermission) permsToCheck.push(requiredPermission);
  if (requiredPermissions.length > 0) permsToCheck.push(...requiredPermissions);

  if (permsToCheck.length === 0) {
    return <>{children}</>;
  }

  const isAuthorized = requireAll
    ? hasAllPermissions(permsToCheck)
    : hasAnyPermission(permsToCheck);

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-rose-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-rose-900 to-rose-800 p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Lock className="w-8 h-8 text-rose-200" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/30 mb-2">
            HTTP 403 • Access Restricted
          </span>
          <h2 className="text-2xl font-bold font-heading">Permission Denied</h2>
          <p className="text-rose-100 text-sm mt-1">
            You do not have departmental authorization to access <strong>{moduleName}</strong>.
          </p>
        </div>

        <div className="p-6 space-y-5 text-slate-700 text-sm">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-rose-900">Role-Based Access Control (RBAC) Enforcement</h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  Per Emmanuel Secondary School security policy, each administrative department is restricted strictly to authorized staff members holding appropriate roles.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block mb-1">Your Active Role(s):</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {roles.map(r => (
                  <span key={r} className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-200 text-slate-800">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-xs text-amber-700 font-medium block mb-1">Required Department Permission:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {permsToCheck.map(p => (
                  <span key={p} className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-200 text-amber-900">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-center text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to My Dashboard
            </button>
            <Link
              to="/dashboard/profile"
              className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-center text-sm transition-colors"
            >
              View My Permissions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
