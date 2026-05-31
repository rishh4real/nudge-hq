import { supabase } from '../config/supabase.js';

const missingSchema = (error) => /daily_checkins|schema cache|does not exist/i.test(error?.message || '');

export const submitDailyCheckin = async (req, res) => {
  try {
    const { location, goals = [], energy_level } = req.body;
    if (!location || !energy_level) {
      return res.status(400).json({ success: false, message: 'location and energy_level are required.' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('daily_checkins')
      .upsert({
        user_id: req.user.id,
        location,
        goals_json: goals.filter(Boolean).slice(0, 3),
        energy_level,
        date: today
      }, { onConflict: 'user_id,date' })
      .select('id, user_id, location, goals_json, energy_level, date, completion_summary, created_at')
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, checkin: data });
  } catch (error) {
    if (missingSchema(error)) return res.status(200).json({ success: false, message: 'Smart Presence schema is not ready yet.', checkin: null });
    console.error('Daily check-in error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save daily check-in.', error: error.message });
  }
};

export const getTeamPresence = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('id, location, goals_json, energy_level, date, completion_summary, created_at, user:users(id, name, email, department_id, departments(name))')
      .eq('date', today)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const scopedDepartmentId = req.user.role === 'manager' ? req.user.department_id : req.query.department_id;
    const scopedPresence = scopedDepartmentId
      ? (data || []).filter((checkin) => checkin.user?.department_id === scopedDepartmentId)
      : (data || []);
    const withGoals = scopedPresence.filter((checkin) => (checkin.goals_json || []).length > 0).length;
    const insight = withGoals
      ? `Your team performs better when they declare goals in the morning. ${withGoals} people set goals today.`
      : 'No team goals declared yet today. Encourage a lightweight morning check-in.';

    return res.status(200).json({ success: true, presence: scopedPresence, insight, powered_by: 'NudgeAI' });
  } catch (error) {
    if (missingSchema(error)) return res.status(200).json({ success: true, presence: [], insight: 'Smart Presence schema is not ready yet.', powered_by: 'NudgeAI' });
    console.error('Team presence error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve team presence.', error: error.message });
  }
};
