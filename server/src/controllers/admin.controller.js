import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const TEMP_PASSWORD = 'nudgehq123';

const isMissingSchema = (error) => (
  error?.code === '42P01' ||
  error?.code === '42703' ||
  /does not exist|schema cache|column/i.test(error?.message || '')
);

/**
 * Get all employee progress updates with filters
 * GET /admin/updates
 */
export const getAllEmployeeUpdates = async (req, res) => {
  try {
    const { department_id, user_id, start_date, end_date, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('progress_updates')
      .select('id, progress_text, proof_link, quality_score, quality_tip, created_at, user:users(id, name, email, department_id, departments(name)), tasks(id, title, status)', { count: 'exact' });

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    query = query.order('created_at', { ascending: false })
                 .range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data: updates, error, count } = await query;
    if (error && /quality_score|quality_tip|schema cache/i.test(error.message || '')) {
      let fallbackQuery = supabase
        .from('progress_updates')
        .select('id, progress_text, proof_link, created_at, user:users(id, name, email, department_id, departments(name)), tasks(id, title, status)', { count: 'exact' });

      if (user_id) fallbackQuery = fallbackQuery.eq('user_id', user_id);
      if (start_date) fallbackQuery = fallbackQuery.gte('created_at', start_date);
      if (end_date) fallbackQuery = fallbackQuery.lte('created_at', end_date);

      fallbackQuery = fallbackQuery.order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      const fallback = await fallbackQuery;
      if (fallback.error) throw fallback.error;
      const filtered = department_id
        ? fallback.data.filter(u => u.user && u.user.department_id === department_id)
        : fallback.data;

      return res.status(200).json({
        success: true,
        count: department_id ? filtered.length : fallback.count,
        limit: Number(limit),
        offset: Number(offset),
        updates: filtered
      });
    }
    if (error) throw error;

    // Filter by department in-memory if requested
    let finalUpdates = updates;
    if (department_id) {
      finalUpdates = updates.filter(u => u.user && u.user.department_id === department_id);
    }

    return res.status(200).json({
      success: true,
      count: department_id ? finalUpdates.length : count,
      limit: Number(limit),
      offset: Number(offset),
      updates: finalUpdates
    });
  } catch (error) {
    console.error('Get all updates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress updates.',
      error: error.message
    });
  }
};

/**
 * List all departments
 * GET /admin/departments
 */
export const getDepartments = async (req, res) => {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, name, description, created_at')
      .order('name', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments.',
      error: error.message
    });
  }
};

/**
 * Create a new department
 * POST /admin/departments
 */
export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    const { data: existingDept, error: checkError } = await supabase
      .from('departments')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingDept) {
      return res.status(409).json({
        success: false,
        message: `Department with name '${name}' already exists.`
      });
    }

    const { data: department, error } = await supabase
      .from('departments')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department
    });
  } catch (error) {
    console.error('Create department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create department.',
      error: error.message
    });
  }
};

/**
 * Update department details
 * PUT /admin/departments/:id
 */
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const { data: department, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department
    });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update department.',
      error: error.message
    });
  }
};

/**
 * Delete a department
 * DELETE /admin/departments/:id
 */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete department.',
      error: error.message
    });
  }
};

/**
 * Invite an employee by email.
 * POST /admin/employees/invite
 */
export const inviteEmployee = async (req, res) => {
  try {
    const { name, email, department_id } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email already exists.',
        user: existingUser
      });
    }

    const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 10);

    const { data: employee, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: normalizedEmail,
          password_hash: passwordHash,
          role: 'employee',
          department_id: department_id || null
        }
      ])
      .select('id, name, email, role, department_id, created_at')
      .single();

    if (insertError) throw insertError;

    const { error: inviteLogError } = await supabase
      .from('employee_invitations')
      .insert([
        {
          email: normalizedEmail,
          invited_by: req.user.id,
          user_id: employee.id,
          status: 'accepted'
        }
      ]);

    if (inviteLogError && !isMissingSchema(inviteLogError)) {
      throw inviteLogError;
    }

    return res.status(201).json({
      success: true,
      message: 'Employee invited and demo login created successfully.',
      employee,
      temporary_password: TEMP_PASSWORD,
      invitation_logged: !inviteLogError
    });
  } catch (error) {
    console.error('Invite employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to invite employee.',
      error: error.message
    });
  }
};

/**
 * Export-ready CSV/JSON dataset endpoint for reports
 * GET /admin/reports/export
 */
export const exportReportData = async (req, res) => {
  try {
    // Collect all tasks, progress updates, and blocker logs for export
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, description, status, due_date, assignee:users(name, email, departments(name))');

    if (taskError) throw taskError;

    const { data: blockers, error: blockerError } = await supabase
      .from('blocker_logs')
      .select('id, task_id, blocker_text, resolved, resolved_at, created_at, reporter:users(name)');

    if (blockerError) throw blockerError;

    const exportData = tasks.map(task => {
      const taskBlockers = blockers.filter(b => b.task_id === task.id);
      return {
        task_id: task.id,
        title: task.title,
        status: task.status,
        assignee_name: task.assignee ? task.assignee.name : 'Unassigned',
        assignee_email: task.assignee ? task.assignee.email : '',
        department: task.assignee && task.assignee.departments ? task.assignee.departments.name : 'N/A',
        due_date: task.due_date,
        blockers_count: taskBlockers.length,
        active_blocker: taskBlockers.some(b => !b.resolved) ? 'Yes' : 'No',
        blocker_details: taskBlockers.map(b => `${b.blocker_text} (by ${b.reporter.name}, resolved: ${b.resolved})`).join(' | ')
      };
    });

    return res.status(200).json({
      success: true,
      generated_at: new Date().toISOString(),
      format: 'JSON (CSV-ready structure)',
      data: exportData
    });
  } catch (error) {
    console.error('Export report data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compile report export database.',
      error: error.message
    });
  }
};
