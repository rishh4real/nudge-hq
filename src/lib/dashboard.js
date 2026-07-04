export const DASHBOARD_PATHS = {
  admin: '/dashboard/admin',
  hr: '/dashboard/hr',
  manager: '/dashboard/manager',
  employee: '/dashboard/employee',
};

export const LEADER_ROLES = ['admin', 'hr', 'manager'];
export const PEOPLE_ROLES = ['admin', 'hr'];
export const OPS_ROLES = ['admin', 'manager'];

export const DASHBOARD_SECTIONS_BY_ROLE = {
  admin: ['Dashboard', 'Tasks', 'People', 'NudgeSpace', 'Reports', 'Billing', 'Projects', 'NudgeAI', 'Integrations', 'Settings'],
  hr: ['Dashboard', 'Tasks', 'People', 'NudgeSpace', 'Reports', 'Projects', 'NudgeAI', 'Integrations', 'Settings'],
  manager: ['Dashboard', 'Tasks', 'People', 'NudgeSpace', 'Reports', 'Projects', 'NudgeAI', 'Settings'],
  employee: ['My Dashboard', 'My Tasks', 'Check-in', 'My Progress', 'Growth Portal', 'NudgeSpace', 'NudgeAI', 'Settings'],
};

export const getDashboardPath = (role = 'employee') => DASHBOARD_PATHS[role] || DASHBOARD_PATHS.employee;

export const getRoleFromDashboardPath = (path = '') => {
  const match = Object.entries(DASHBOARD_PATHS).find(([, dashboardPath]) => dashboardPath === path);
  return match?.[0] || null;
};
