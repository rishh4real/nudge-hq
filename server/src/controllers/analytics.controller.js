import { supabase } from '../config/supabase.js';

/**
 * Get comprehensive dashboard metrics (Admin / Analytics view)
 * GET /analytics/dashboard
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Fetch Users counts (Employees vs. Admins)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role, department_id, departments(name)');

    if (usersError) throw usersError;

    const totalEmployees = users.filter(u => u.role === 'employee').length;

    // 2. Fetch Tasks and status distribution
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status, assignee_id');

    if (tasksError) throw tasksError;

    const taskCount = tasks.length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;

    const completionRate = taskCount > 0 ? Math.round((completed / taskCount) * 100) : 0;
    const tasksOnTrack = taskCount > 0 ? Math.round(((completed + inProgress + todo) / taskCount) * 100) : 0;

    // 3. Fetch active blockers log count
    const { data: activeBlockers, error: blockerError } = await supabase
      .from('blocker_logs')
      .select('id, task_id, blocker_text, created_at, reporter:users(name), task:tasks(title)')
      .eq('resolved', false);

    if (blockerError) throw blockerError;

    // 4. Department-wise task performance compilation
    // Group tasks by department (via assignee's department_id)
    const deptPerformance = {};

    // Get all departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name');

    if (deptError) throw deptError;

    departments.forEach(dept => {
      deptPerformance[dept.id] = {
        name: dept.name,
        total: 0,
        completed: 0,
        percentage: 0
      };
    });

    // Populate task counts per department
    tasks.forEach(task => {
      if (task.assignee_id) {
        const assignee = users.find(u => u.id === task.assignee_id);
        if (assignee && assignee.department_id && deptPerformance[assignee.department_id]) {
          deptPerformance[assignee.department_id].total += 1;
          if (task.status === 'completed') {
            deptPerformance[assignee.department_id].completed += 1;
          }
        }
      }
    });

    // Calculate percentages
    const departmentStats = Object.keys(deptPerformance).map(key => {
      const dept = deptPerformance[key];
      dept.percentage = dept.total > 0 ? Math.round((dept.completed / dept.total) * 100) : 0;
      return dept;
    });

    // 5. Fetch daily submission stats (Check-in rate for today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayUpdates, error: updatesError } = await supabase
      .from('progress_updates')
      .select('user_id')
      .gte('created_at', todayStart.toISOString());

    if (updatesError) throw updatesError;

    // Unique employees who submitted updates today
    const uniqueSubmitters = new Set(todayUpdates.map(u => u.user_id));
    const checkinRate = totalEmployees > 0 ? Math.round((uniqueSubmitters.size / totalEmployees) * 100) : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalEmployees,
        totalTasks: taskCount,
        completionRate,
        tasksOnTrack,
        checkinRate,
        blockersCount: activeBlockers.length
      },
      statusDistribution: {
        todo,
        in_progress: inProgress,
        completed,
        blocked
      },
      departmentStats,
      activeBlockers
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard analytics.',
      error: error.message
    });
  }
};
