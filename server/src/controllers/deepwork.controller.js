import { supabase } from '../config/supabase.js';

const missingSchema = (error) => /deep_work_sessions|schema cache|does not exist/i.test(error?.message || '');

export const startDeepWork = async (req, res) => {
  try {
    const { focus_declared, duration_minutes = 60 } = req.body;
    if (!focus_declared?.trim()) {
      return res.status(400).json({ success: false, message: 'focus_declared is required.' });
    }

    const minutes = Math.max(15, Math.min(Number(duration_minutes) || 60, 360));
    const end = new Date(Date.now() + minutes * 60 * 1000);
    const { data, error } = await supabase
      .from('deep_work_sessions')
      .insert([{ user_id: req.user.id, focus_declared, duration_minutes: minutes, end_time: end.toISOString() }])
      .select('id, user_id, start_time, end_time, focus_declared, output_logged, duration_minutes')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, session: data });
  } catch (error) {
    if (missingSchema(error)) return res.status(200).json({ success: false, message: 'Deep Work schema is not ready yet.', session: null });
    console.error('Start deep work error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start deep work.', error: error.message });
  }
};

export const endDeepWork = async (req, res) => {
  try {
    const { session_id, output_logged } = req.body;
    if (!session_id) return res.status(400).json({ success: false, message: 'session_id is required.' });

    const { data, error } = await supabase
      .from('deep_work_sessions')
      .update({ output_logged })
      .eq('id', session_id)
      .eq('user_id', req.user.id)
      .select('id, user_id, start_time, end_time, focus_declared, output_logged, duration_minutes')
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, session: data });
  } catch (error) {
    if (missingSchema(error)) return res.status(200).json({ success: false, message: 'Deep Work schema is not ready yet.', session: null });
    console.error('End deep work error:', error);
    return res.status(500).json({ success: false, message: 'Failed to end deep work.', error: error.message });
  }
};

export const getDeepWorkTeam = async (req, res) => {
  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('deep_work_sessions')
      .select('id, start_time, end_time, focus_declared, output_logged, duration_minutes, user:users(id, name, email, departments(name))')
      .gte('start_time', monthStart.toISOString())
      .order('start_time', { ascending: false })
      .limit(100);

    if (error) throw error;

    const active = (data || []).filter((session) => new Date(session.end_time) > new Date() && !session.output_logged);
    const minutesByUser = {};
    (data || []).forEach((session) => {
      const name = session.user?.name || 'Employee';
      minutesByUser[name] = (minutesByUser[name] || 0) + (session.duration_minutes || 0);
    });

    const topUsers = Object.entries(minutesByUser)
      .map(([name, minutes]) => ({ name, hours: Number((minutes / 60).toFixed(1)) }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      active,
      top_users: topUsers,
      insight: topUsers.length ? 'NudgeAI insight: teams using declared deep work create clearer focus windows without idle tracking.' : 'No deep work sessions logged this month yet.',
      powered_by: 'NudgeAI'
    });
  } catch (error) {
    if (missingSchema(error)) return res.status(200).json({ success: true, active: [], top_users: [], insight: 'Deep Work schema is not ready yet.', powered_by: 'NudgeAI' });
    console.error('Deep work team error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve deep work insights.', error: error.message });
  }
};
