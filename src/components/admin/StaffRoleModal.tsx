import React, { useState } from "react";
import { Teacher } from "../../data/teachersData";
import { ALL_ROLES_METADATA, SystemRole, getCombinedPermissions } from "../../data/rolesAndPermissions";
import { logAuditEvent } from "../../data/auditLogData";
import { 
  ShieldCheck, X, Check, CheckCircle2, UserCog, 
  AlertCircle, Sparkles, Layers, Info
} from "lucide-react";
import { Button } from "@/src/components/ui";

interface StaffRoleModalProps {
  teacher: Teacher;
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacherId: string, updatedRoles: SystemRole[]) => void;
}

export default function StaffRoleModal({
  teacher,
  isOpen,
  onClose,
  onSave,
}: StaffRoleModalProps) {
  if (!isOpen) return null;

  // Initialize with current roles or fallback to ['Staff/Teacher']
  const initialRoles: SystemRole[] = teacher.systemRoles && teacher.systemRoles.length > 0
    ? [...teacher.systemRoles]
    : ['Teacher'];

  const [selectedRoles, setSelectedRoles] = useState<SystemRole[]>(initialRoles);

  const toggleRole = (roleId: SystemRole) => {
    // If attempting to toggle 'Teacher' or 'Staff/Teacher', prevent removing base staff capability
    if (roleId === 'Teacher' || roleId === 'Staff/Teacher') {
      // Base role cannot be removed per Requirement 1: Every administrator retains normal staff features
      return;
    }

    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(prev => prev.filter(r => r !== roleId));
    } else {
      setSelectedRoles(prev => [...prev, roleId]);
    }
  };

  const handleSave = () => {
    // Ensure base teacher role is always retained
    let finalRoles = [...selectedRoles];
    if (!finalRoles.includes('Teacher') && !finalRoles.includes('Staff/Teacher')) {
      finalRoles.unshift('Staff/Teacher');
    }

    const previousRolesStr = (teacher.systemRoles || ['Staff/Teacher']).join(", ");
    const newRolesStr = finalRoles.join(", ");

    // Audit log the role assignment/update
    logAuditEvent({
      action: `Updated administrative roles and department permissions for staff member ${teacher.name}`,
      module: 'Staff & Roles',
      recordAffected: `${teacher.name} (${teacher.id})`,
      previousValue: `[${previousRolesStr}]`,
      newValue: `[${newRolesStr}]`,
      severity: finalRoles.includes('Super Admin') ? 'Critical' : 'Warning',
    });

    onSave(teacher.id, finalRoles);
    onClose();
  };

  const calculatedPermissions = getCombinedPermissions(selectedRoles);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserCog size={24} className="text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading">Manage Staff Roles & Permissions</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Staff: <span className="font-semibold text-white">{teacher.name}</span> ({teacher.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {/* Account Continuity Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wide">
                Account Preservation Guarantee
              </h4>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Promoting or assigning administrative duties does not create a duplicate account or remove existing teaching subjects (<span className="font-semibold">{teacher.subjects?.join(", ") || "Assigned Subjects"}</span>) and classes (<span className="font-semibold">{teacher.assignedClasses?.join(", ") || "Assigned Classes"}</span>). Their base Staff Profile remains active.
              </p>
            </div>
          </div>

          {/* Role Checkboxes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Select Departmental & Administrative Roles
            </label>
            <div className="space-y-2.5">
              {ALL_ROLES_METADATA.map(role => {
                const isSelected = selectedRoles.includes(role.id) || (role.id === 'Staff/Teacher' && (selectedRoles.includes('Teacher') || selectedRoles.includes('Staff/Teacher')));
                const isBaseStaff = role.id === 'Staff/Teacher';

                return (
                  <div
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center text-white text-xs font-bold transition-colors ${
                          isSelected ? 'bg-indigo-600' : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{role.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${role.badgeColor}`}>
                            {role.department}
                          </span>
                          {isBaseStaff && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                              Base (Mandatory)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-normal">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Combined Permissions Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-600" />
                Aggregated Permissions ({calculatedPermissions.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Combined from {selectedRoles.length} assigned role{selectedRoles.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
              {calculatedPermissions.map(p => (
                <span
                  key={p}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-600 shadow-2xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Changes take effect immediately upon saving.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
              Save Role Permissions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
