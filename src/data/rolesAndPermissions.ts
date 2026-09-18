import { useState, useEffect } from "react";

/**
 * Standard System Roles as defined by Emmanuel Secondary School Management System:
 * 1. Staff/Teacher
 * 2. Admission Officer
 * 3. Finance/Bursar
 * 4. Examination Admin
 * 5. Academic Admin
 * 6. Attendance Officer
 * 7. Portal Admin
 * 8. General Admin
 * 9. Super Admin
 */
export type SystemRole =
  | 'Teacher'
  | 'Staff/Teacher'
  | 'Admission Officer'
  | 'Finance/Bursar'
  | 'Finance/Admin Officer' // Alias for backward compatibility
  | 'Examination Admin'
  | 'Academic Admin'
  | 'Attendance Officer'
  | 'Portal Admin'
  | 'General Admin'
  | 'Super Admin'
  | 'HR/Staff Admin'
  | 'Library Admin'
  | 'Inventory Admin'
  | 'Admin'; // Alias for General Admin/Super Admin backward compatibility

export type Permission =
  // Base Staff & Teaching Permissions (Every staff member and admin receives these)
  | 'staff.view'
  | 'staff.profile'
  | 'staff.classes'
  | 'staff.subjects'
  | 'staff.attendance'
  | 'staff.communication'
  | 'staff.timetable'
  | 'staff.calendar'
  | 'examination.scores' // Teacher CA/Score entry for assigned subjects

  // Admission Department Permissions
  | 'admission.view'
  | 'admission.manage'
  | 'admission.verify'
  | 'admission.exam'
  | 'admission.shortlist'
  | 'admission.reports'

  // Finance / Bursary Department Permissions
  | 'finance.view'
  | 'finance.manage'
  | 'finance.payments'
  | 'finance.receipts'
  | 'finance.expenses'
  | 'finance.reports'

  // Examination Department Permissions
  | 'examination.view'
  | 'examination.manage'
  | 'examination.cbt'
  | 'examination.questions'
  | 'examination.results'
  | 'examination.reports'

  // Academic Department Permissions
  | 'academic.view'
  | 'academic.manage'
  | 'academic.curriculum'
  | 'academic.allocations'
  | 'academic.timetable'
  | 'academic.promotion'
  | 'academic.reports'

  // Attendance Department Permissions
  | 'attendance.view'
  | 'attendance.manage'
  | 'attendance.scan'
  | 'attendance.reports'

  // Portal / Website Management Permissions
  | 'portal.view'
  | 'portal.manage'
  | 'portal.content'
  | 'portal.gallery'
  | 'portal.news'

  // School Administration & Technical Permissions
  | 'staff.manage'
  | 'students.manage'
  | 'users.manage'
  | 'roles.manage'
  | 'reports.view'
  | 'audit.view'
  | 'system.manage'
  | 'settings.manage'
  | 'database.manage';

/**
 * Base Staff permissions granted to every staff member and admin.
 * Core Principle: Every admin retains all normal Staff/Teacher features.
 */
export const BASE_STAFF_PERMISSIONS: Permission[] = [
  'staff.view',
  'staff.profile',
  'staff.classes',
  'staff.subjects',
  'staff.attendance',
  'staff.communication',
  'staff.timetable',
  'staff.calendar',
  'examination.scores',
];

/**
 * Role-to-Permissions Mapping
 */
export const ROLE_PERMISSIONS_MAP: Record<string, Permission[]> = {
  // 1. Normal Staff / Teacher
  'Teacher': [...BASE_STAFF_PERMISSIONS],
  'Staff/Teacher': [...BASE_STAFF_PERMISSIONS],

  // 2. Admission Officer = Base Staff + Admission Features
  'Admission Officer': [
    ...BASE_STAFF_PERMISSIONS,
    'admission.view',
    'admission.manage',
    'admission.verify',
    'admission.exam',
    'admission.shortlist',
    'admission.reports',
  ],

  // 3. Finance / Bursar = Base Staff + Finance Features
  'Finance/Bursar': [
    ...BASE_STAFF_PERMISSIONS,
    'finance.view',
    'finance.manage',
    'finance.payments',
    'finance.receipts',
    'finance.expenses',
    'finance.reports',
  ],
  'Finance/Admin Officer': [
    ...BASE_STAFF_PERMISSIONS,
    'finance.view',
    'finance.manage',
    'finance.payments',
    'finance.receipts',
    'finance.expenses',
    'finance.reports',
  ],

  // 4. Examination Admin = Base Staff + Examination Features
  'Examination Admin': [
    ...BASE_STAFF_PERMISSIONS,
    'examination.view',
    'examination.manage',
    'examination.cbt',
    'examination.questions',
    'examination.results',
    'examination.reports',
  ],

  // 5. Academic Admin = Base Staff + Academic Management Features
  'Academic Admin': [
    ...BASE_STAFF_PERMISSIONS,
    'academic.view',
    'academic.manage',
    'academic.curriculum',
    'academic.allocations',
    'academic.timetable',
    'academic.promotion',
    'academic.reports',
  ],

  // 6. Attendance Officer = Base Staff + Attendance Features
  'Attendance Officer': [
    ...BASE_STAFF_PERMISSIONS,
    'attendance.view',
    'attendance.manage',
    'attendance.scan',
    'attendance.reports',
  ],

  // 7. Portal Admin = Base Staff + Website/Portal Management
  'Portal Admin': [
    ...BASE_STAFF_PERMISSIONS,
    'portal.view',
    'portal.manage',
    'portal.content',
    'portal.gallery',
    'portal.news',
    'audit.view',
  ],

  // 8. General Admin = High-level administrator (Almost everything)
  'General Admin': [
    ...BASE_STAFF_PERMISSIONS,
    'admission.view',
    'admission.manage',
    'admission.verify',
    'admission.exam',
    'admission.shortlist',
    'admission.reports',
    'finance.view',
    'finance.manage',
    'finance.payments',
    'finance.receipts',
    'finance.expenses',
    'finance.reports',
    'examination.view',
    'examination.manage',
    'examination.cbt',
    'examination.questions',
    'examination.results',
    'examination.reports',
    'academic.view',
    'academic.manage',
    'academic.curriculum',
    'academic.allocations',
    'academic.timetable',
    'academic.promotion',
    'academic.reports',
    'attendance.view',
    'attendance.manage',
    'attendance.scan',
    'attendance.reports',
    'portal.view',
    'portal.manage',
    'portal.content',
    'portal.gallery',
    'portal.news',
    'staff.manage',
    'students.manage',
    'users.manage',
    'roles.manage',
    'reports.view',
    'audit.view',
    'settings.manage',
    'database.manage',
  ],
  'Admin': [
    ...BASE_STAFF_PERMISSIONS,
    'admission.view',
    'admission.manage',
    'finance.view',
    'finance.manage',
    'examination.view',
    'examination.manage',
    'academic.view',
    'academic.manage',
    'attendance.view',
    'attendance.manage',
    'portal.view',
    'portal.manage',
    'staff.manage',
    'students.manage',
    'users.manage',
    'roles.manage',
    'reports.view',
    'audit.view',
    'settings.manage',
    'database.manage',
  ],

  // 9. Super Admin = Complete unrestricted access to the entire system
  'Super Admin': [
    ...BASE_STAFF_PERMISSIONS,
    'admission.view',
    'admission.manage',
    'admission.verify',
    'admission.exam',
    'admission.shortlist',
    'admission.reports',
    'finance.view',
    'finance.manage',
    'finance.payments',
    'finance.receipts',
    'finance.expenses',
    'finance.reports',
    'examination.view',
    'examination.manage',
    'examination.cbt',
    'examination.questions',
    'examination.results',
    'examination.reports',
    'academic.view',
    'academic.manage',
    'academic.curriculum',
    'academic.allocations',
    'academic.timetable',
    'academic.promotion',
    'academic.reports',
    'attendance.view',
    'attendance.manage',
    'attendance.scan',
    'attendance.reports',
    'portal.view',
    'portal.manage',
    'portal.content',
    'portal.gallery',
    'portal.news',
    'staff.manage',
    'students.manage',
    'users.manage',
    'roles.manage',
    'reports.view',
    'audit.view',
    'system.manage',
    'settings.manage',
    'database.manage',
  ],
};

export interface RoleMetadata {
  id: SystemRole;
  title: string;
  department: string;
  description: string;
  badgeColor: string;
  accentColor: string;
  isAdministrative: boolean;
}

export const ALL_ROLES_METADATA: RoleMetadata[] = [
  {
    id: 'Super Admin',
    title: 'Super Administrator',
    department: 'Executive Directorate',
    description: 'Unrestricted system-wide control, technical configurations, audit logs, and master administrative oversight.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    accentColor: 'text-purple-600',
    isAdministrative: true,
  },
  {
    id: 'General Admin',
    title: 'General Administrator',
    department: 'Administration & Discipline',
    description: 'High-level operational authority across students, staff, academics, examinations, finance, and attendance.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    accentColor: 'text-blue-600',
    isAdministrative: true,
  },
  {
    id: 'Admission Officer',
    title: 'Admission Officer',
    department: 'Admissions Directorate',
    description: 'Portal opening/closing, applicant verifications, entrance examinations, shortlist generation, and admission letters.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentColor: 'text-emerald-600',
    isAdministrative: true,
  },
  {
    id: 'Finance/Bursar',
    title: 'Chief Bursar & Finance Officer',
    department: 'Bursary & Accounts',
    description: 'Tuition fees, payment reconciliation, official receipt generation, expenditure tracking, and financial summaries.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    accentColor: 'text-amber-600',
    isAdministrative: true,
  },
  {
    id: 'Examination Admin',
    title: 'Senior Examination Admin',
    department: 'Examinations & CBT Center',
    description: 'CBT examination setup, AI question bank, live exam proctoring, score collation, result publishing, and report cards.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    accentColor: 'text-rose-600',
    isAdministrative: true,
  },
  {
    id: 'Academic Admin',
    title: 'Academic Director',
    department: 'Academic Affairs & Curriculum',
    description: 'Class structures, curriculum management, teacher-subject allocations, school timetable, student promotion, and academic statistics.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    accentColor: 'text-indigo-600',
    isAdministrative: true,
  },
  {
    id: 'Attendance Officer',
    title: 'Chief Attendance Officer',
    department: 'Security & Operations',
    description: 'QR-code gate attendance scanning for students and staff, daily registers, lateness tracking, and attendance audit reports.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    accentColor: 'text-teal-600',
    isAdministrative: true,
  },
  {
    id: 'Portal Admin',
    title: 'Portal & Webmaster',
    department: 'ICT Directorate',
    description: 'Public website CMS, news and announcements, photo gallery, contact information, banners, and portal content management.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    accentColor: 'text-cyan-600',
    isAdministrative: true,
  },
  {
    id: 'Staff/Teacher',
    title: 'Subject Teacher & Form Master',
    department: 'Academic Faculties',
    description: 'Class teaching, subject syllabus, student progress, class attendance marking, and continuous assessment (CA) grading.',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    accentColor: 'text-slate-600',
    isAdministrative: false,
  },
];

/**
 * Combines permissions of all assigned roles without duplicate entries.
 * Multiple roles properly aggregate all permissions.
 */
export function getCombinedPermissions(roles: string[]): Permission[] {
  const permSet = new Set<Permission>();
  // Every staff member always has base staff permissions
  BASE_STAFF_PERMISSIONS.forEach(p => permSet.add(p));

  roles.forEach(role => {
    const rolePerms = ROLE_PERMISSIONS_MAP[role];
    if (rolePerms) {
      rolePerms.forEach(p => permSet.add(p));
    }
  });

  return Array.from(permSet);
}

/**
 * Checks if a given set of user roles has a specific permission.
 */
export function hasPermission(userRoles: string[], permission: Permission): boolean {
  if (userRoles.includes('Super Admin')) return true;
  const permissions = getCombinedPermissions(userRoles);
  return permissions.includes(permission);
}

/**
 * Checks if user roles have any of the provided permissions.
 */
export function hasAnyPermission(userRoles: string[], permissions: Permission[]): boolean {
  if (userRoles.includes('Super Admin')) return true;
  const userPerms = getCombinedPermissions(userRoles);
  return permissions.some(p => userPerms.includes(p));
}

/**
 * Checks if user roles have all of the provided permissions.
 */
export function hasAllPermissions(userRoles: string[], permissions: Permission[]): boolean {
  if (userRoles.includes('Super Admin')) return true;
  const userPerms = getCombinedPermissions(userRoles);
  return permissions.every(p => userPerms.includes(p));
}

/**
 * Get the current user's roles from localStorage
 */
export function getCurrentUserRoles(): string[] {
  try {
    const saved = localStorage.getItem('userRoles');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  const single = localStorage.getItem('userRole');
  if (single === 'admin') return ['General Admin'];
  if (single === 'superadmin') return ['Super Admin'];
  if (single === 'portaladmin') return ['Portal Admin'];
  if (single === 'attendance') return ['Attendance Officer'];
  return ['Staff/Teacher'];
}

/**
 * React Hook for listening to role changes across the app
 */
export function useCurrentUserRoles() {
  const [roles, setRoles] = useState<string[]>(getCurrentUserRoles);

  useEffect(() => {
    const handleUpdate = () => {
      setRoles(getCurrentUserRoles());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('ess_roles_change', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('ess_roles_change', handleUpdate);
    };
  }, []);

  const permissions = getCombinedPermissions(roles);

  const checkPermission = (permission: Permission) => hasPermission(roles, permission);
  const checkAnyPermission = (perms: Permission[]) => hasAnyPermission(roles, perms);
  const checkAllPermissions = (perms: Permission[]) => hasAllPermissions(roles, perms);

  return {
    roles,
    permissions,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    isSuperAdmin: roles.includes('Super Admin'),
    isGeneralAdmin: roles.includes('General Admin') || roles.includes('Admin') || roles.includes('Super Admin'),
    isAdmissionOfficer: roles.includes('Admission Officer'),
    isFinanceOfficer: roles.includes('Finance/Bursar') || roles.includes('Finance/Admin Officer'),
    isExaminationAdmin: roles.includes('Examination Admin'),
    isAcademicAdmin: roles.includes('Academic Admin'),
    isAttendanceOfficer: roles.includes('Attendance Officer'),
    isPortalAdmin: roles.includes('Portal Admin'),
    isTeacher: roles.includes('Teacher') || roles.includes('Staff/Teacher'),
  };
}
