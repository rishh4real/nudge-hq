import { supabase } from '../config/supabase.js';
import { scoreUpdateWithNudgeAI } from './ai.controller.js';

/**
 * Submit Daily Progress Update
 * POST /employees/updates
 */
export const submitProgressUpdate = async (req, res) => {
  try {
    const { task_id, progress_text, proof_link } = req.body;
    const userId = req.user.id;

    // Verify task exists and belongs to employee (if task_id provided)
    if (task_id) {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('id, assignee_id')
        .eq('id', task_id)
        .maybeSingle();

      if (taskError) throw taskError;

      if (!task) {
        return res.status(404).json({
          success: false,
          message: `Task with ID ${task_id} not found.`
        });
      }

      // Check if employee is assigned or if user is admin
      if (task.assignee_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update tasks assigned to you.'
        });
      }
    }

    const quality = await scoreUpdateWithNudgeAI(progress_text);

    // Insert progress update
    const { data: update, error: insertError } = await supabase
      .from('progress_updates')
      .insert([
        {
          user_id: userId,
          task_id: task_id || null,
          progress_text,
          proof_link: proof_link || null,
          quality_score: quality.score,
          quality_tip: quality.tip || null
        }
      ])
      .select('id, user_id, task_id, progress_text, proof_link, quality_score, quality_tip, created_at')
      .single();

    if (insertError && /quality_score|quality_tip|schema cache/i.test(insertError.message || '')) {
      const fallbackInsert = await supabase
        .from('progress_updates')
        .insert([
          {
            user_id: userId,
            task_id: task_id || null,
            progress_text,
            proof_link: proof_link || null
          }
        ])
        .select('id, user_id, task_id, progress_text, proof_link, created_at')
        .single();

      if (fallbackInsert.error) throw fallbackInsert.error;
      return res.status(201).json({
        success: true,
        message: 'Progress update submitted successfully.',
        update: fallbackInsert.data,
        nudgeai_quality: quality
      });
    }

    if (insertError) throw insertError;

    return res.status(201).json({
      success: true,
      message: 'Progress update submitted successfully.',
      update,
      nudgeai_quality: quality
    });
  } catch (error) {
    console.error('Submit progress update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit progress update.',
      error: error.message
    });
  }
};

/**
 * Get Authenticated Employee's Progress History
 * GET /employees/updates
 */
export const getMyProgressHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const { data: updates, error, count } = await supabase
      .from('progress_updates')
      .select('id, progress_text, proof_link, quality_score, quality_tip, created_at, tasks(id, title, status)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error && /quality_score|quality_tip|schema cache/i.test(error.message || '')) {
      const fallback = await supabase
        .from('progress_updates')
        .select('id, progress_text, proof_link, created_at, tasks(id, title, status)', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (fallback.error) throw fallback.error;
      return res.status(200).json({
        success: true,
        count: fallback.count,
        limit: Number(limit),
        offset: Number(offset),
        updates: fallback.data
      });
    }

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count,
      limit: Number(limit),
      offset: Number(offset),
      updates
    });
  } catch (error) {
    console.error('Get progress history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress history.',
      error: error.message
    });
  }
};

/**
 * Get Authenticated Employee's Dashboard/Summary stats
 * GET /employees/dashboard
 */
export const getMyDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch assigned tasks grouped by status
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('assignee_id', userId);

    if (tasksError) throw tasksError;

    // Compute stats
    const stats = {
      totalTasks: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      blocked: tasks.filter(t => t.status === 'blocked').length
    };

    // Fetch last 5 progress updates
    const { data: recentUpdates, error: updatesError } = await supabase
      .from('progress_updates')
      .select('id, progress_text, quality_score, quality_tip, created_at, tasks(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (updatesError) throw updatesError;

    return res.status(200).json({
      success: true,
      stats,
      recentUpdates
    });
  } catch (error) {
    console.error('Get my dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee dashboard data.',
      error: error.message
    });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employee_notifications')
      .select('id, type, message, read, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error && /employee_notifications|schema cache|does not exist/i.test(error.message || '')) {
      return res.status(200).json({ success: true, notifications: [] });
    }

    if (error) throw error;

    return res.status(200).json({ success: true, notifications: data || [] });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
      error: error.message
    });
  }
};
