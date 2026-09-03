const routeAccessMap = {
    '/dashboard': ['Admin', 'Super Admin', 'General Admin', 'Teacher', 'Examination Admin', 'Admission Officer', 'Portal Admin', 'Finance/Admin Officer', 'Academic Admin', 'HR/Staff Admin'],
    '/dashboard/admissions': ['Admin', 'Super Admin', 'General Admin', 'Admission Officer'],
    '/dashboard/enrollment': ['Admin', 'Super Admin', 'General Admin', 'Admission Officer', 'Teacher', 'Academic Admin'],
    '/dashboard/students': ['Admin', 'Super Admin', 'General Admin', 'Teacher', 'Academic Admin'],
    '/dashboard/teachers': ['Admin', 'Super Admin', 'General Admin', 'HR/Staff Admin'],
    '/dashboard/academics': ['Admin', 'Super Admin', 'General Admin', 'Academic Admin'],
    '/dashboard/examinations': ['Admin', 'Super Admin', 'General Admin', 'Teacher', 'Examination Admin'],
    '/dashboard/finance': ['Admin', 'Super Admin', 'General Admin', 'Finance/Admin Officer'],
    '/dashboard/portal-manager': ['Admin', 'Super Admin', 'General Admin', 'Portal Admin'],
    '/dashboard/settings': ['Admin', 'Super Admin', 'General Admin', 'Portal Admin'],
    '/dashboard/profile': ['*'],
};
const navigation = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Admissions', href: '/dashboard/admissions' },
  { name: 'Enrollment', href: '/dashboard/enrollment' },
  { name: 'Students', href: '/dashboard/students' },
  { name: 'Staff & Teachers', href: '/dashboard/teachers' },
  { name: 'Academics', href: '/dashboard/academics' },
  { name: 'Examinations & CA', href: '/dashboard/examinations' },
  { name: 'Finance', href: '/dashboard/finance' },
  { name: 'Portal Manager', href: '/dashboard/portal-manager' },
  { name: 'My Profile', href: '/dashboard/profile' },
  { name: 'Settings', href: '/dashboard/settings' },
];

const hasAccessToRoute = (path, userRoles) => {
    // Sort keys by length descending so that more specific routes are matched first
    const sortedKeys = Object.keys(routeAccessMap).sort((a, b) => b.length - a.length);
    const matchingKey = sortedKeys.find(key => path === key || path.startsWith(key + '/'));
    if (!matchingKey) return true;
    const allowedRoles = routeAccessMap[matchingKey];
    if (allowedRoles.includes('*')) return true;
    return userRoles.some(role => allowedRoles.includes(role));
};

const roles = ['Teacher'];
console.log(navigation.filter(item => hasAccessToRoute(item.href, roles)).map(i => i.name));
