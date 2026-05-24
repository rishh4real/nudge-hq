import { supabase } from '../config/supabase.js';

/**
 * Create a new task (Admin only)
 * POST /tasks
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, assignee_id, due_date, status = 'todo' } = req.body;

    // Validate status values
    if (!['todo', 'in_progress', 'completed', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be: todo, in_progress, completed, or blocked.'
      });
    }

    // Verify assignee exists (if provided)
    if (assignee_id) {
      const { data: assignee, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', assignee_id)
        .maybeSingle();

      if (userError) throw userError;
      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: `Assignee user with ID ${assignee_id} does not exist.`
        });
      }
    }

    const orgId = req.user.organization_id;

    const { data: task, error: insertError } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description: description || null,
          assignee_id: assignee_id || null,
          due_date: due_date || null,
          status,
          organization_id: orgId
        }
      ])
      .select('id, title, description, status, assignee_id, due_date, created_at')
      .single();

    if (insertError) throw insertError;

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task.',
      error: error.message
    });
  }
};

/**
 * Get List of Tasks (All for Admin, filters supported for both Admin and Employee)
 * GET /tasks
 */
export const getTasks = async (req, res) => {
  try {
    const { status, assignee_id, department_id } = req.query;

    const orgId = req.user.organization_id;

    let query = supabase
      .from('tasks')
      .select('id, title, description, status, due_date, created_at, assignee:users(id, name, email, department_id)')
      .eq('organization_id', orgId);

    // Role-based restrictions: Employees can only see their assigned tasks unless department-based visibility is allowed
    if (req.user.role === 'employee' && !assignee_id) {
      query = query.eq('assignee_id', req.user.id);
    } else if (assignee_id) {
      query = query.eq('assignee_id', assignee_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: tasks, error } = await query;
    if (error) throw error;

    // In-memory filter for department_id since it belongs to nested assignee resource
    let filteredTasks = tasks;
    if (department_id) {
      filteredTasks = tasks.filter(t => t.assignee && t.assignee.department_id === department_id);
    }

    return res.status(200).json({
      success: true,
      count: filteredTasks.length,
      tasks: filteredTasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks.',
      error: error.message
    });
  }
};

/**
 * Update Task Status (Employees can update their own; Admins can update any and all fields)
 * PUT /tasks/:id/status
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status, blocker_text } = req.body;
    const userId = req.user.id;

    if (!['todo', 'in_progress', 'completed', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be: todo, in_progress, completed, or blocked.'
      });
    }

    const orgId = req.user.organization_id;

    // Fetch original task
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('id, status, assignee_id')
      .eq('id', taskId)
      .eq('organization_id', orgId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${taskId} not found.`
      });
    }

    // Auth verification: Employees can only edit their assigned tasks
    if (req.user.role === 'employee' && task.assignee_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update tasks assigned to you.'
      });
    }

    const originalStatus = task.status;

    // Handle status transitions
    // 1. Transitioning TO blocked status
    if (status === 'blocked') {
      if (!blocker_text) {
        return res.status(400).json({
          success: false,
          message: 'Blocker details (blocker_text) are required when marking a task as blocked.'
        });
      }

      // Log blocker entry
      const { error: blockError } = await supabase
        .from('blocker_logs')
        .insert([
          {
            task_id: taskId,
            reporter_id: userId,
            blocker_text,
            resolved: false
          }
        ]);

      if (blockError) throw blockError;
    }

    // 2. Transitioning FROM blocked status (resolving active blocker logs)
    if (originalStatus === 'blocked' && status !== 'blocked') {
      const { error: resolveError } = await supabase
        .from('blocker_logs')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('task_id', taskId)
        .eq('resolved', false);

      if (resolveError) throw resolveError;
    }

    // Update task status in DB
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .eq('organization_id', orgId)
      .select('id, title, status, assignee_id, due_date')
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: `Task status updated successfully from '${originalStatus}' to '${status}'.`,
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task status.',
      error: error.message
    });
  }
};

/**
 * Edit Full Task Configuration (Admin only)
 * PUT /tasks/:id
 */
export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, assignee_id, due_date, status } = req.body;

    const orgId = req.user.organization_id;

    // Fetch original task
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('organization_id', orgId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${taskId} not found.`
      });
    }

    // Build update object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (assignee_id !== undefined) updates.assignee_id = assignee_id;
    if (due_date !== undefined) updates.due_date = due_date;
    if (status !== undefined) {
      if (!['todo', 'in_progress', 'completed', 'blocked'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value.'
        });
      }
      updates.status = status;
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: 'Task configuration modified successfully.',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task configuration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to modify task layout.',
      error: error.message
    });
  }
};

/**
 * Delete a Task (Admin only)
 * DELETE /tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const orgId = req.user.organization_id;

    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('organization_id', orgId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${taskId} not found.`
      });
    }

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('organization_id', orgId);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: `Task with ID ${taskId} has been deleted.`
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task.',
      error: error.message
    });
  }
};
