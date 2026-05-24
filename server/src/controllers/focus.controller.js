import { supabase } from '../config/supabase.js';

const missingSchema = (error) => /focus_sessions|schema cache|does not exist/i.test(error?.message || '');

export const updateFocus = async (req, res) => {
  try {
    const { focus_text, eta = 'today', status = 'focused' } = req.body;
    if (!focus_text?.trim()) {
      return res.status(400).json({ success: false, message: 'focus_text is required.' });
    }

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert([{ user_id: req.user.id, focus_text, eta, status, last_updated: new Date().toISOString() }])
      .select('id, user_id, focus_text, eta, status, created_at, last_updated')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, focus: data });
  } catch (error) {
    if (missingSchema(error)) return res.status(200).json({ success: false, message: 'Focus Pulse schema is not ready yet.', focus: null });
    console.error('Focus update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update focus.', error: error.message });
  }
};

export const getTeamFocus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('id, focus_text, eta, status, created_at, last_updated, user:users(id, name, email, departments(name))')
      .order('last_updated', { ascending: false })
      .limit(100);

    if (error) throw error;

    const latestByUser = new Map();
    (data || []).forEach((session) => {
      const id = session.user?.id || session.user_id;
      if (id && !latestByUser.has(id)) latestByUser.set(id, session);
    });

    const today = new Date().toISOString().slice(0, 10);
    const switchCounts = {};
    (data || [])
      .filter((session) => session.last_updated?.slice(0, 10) === today && session.status === 'switched')
      .forEach((session) => {
        const id = session.user?.id;
        switchCounts[id] = (switchCounts[id] || 0) + 1;
      });

    const frequentSwitchers = Object.values(switchCounts).filter((count) => count >= 3).length;
    const insight = frequentSwitchers > 0
      ? `${frequentSwitchers} employees have switched focus 3+ times today — possible distraction pattern detected.`
      : 'Focus patterns look steady today. No repeated switching pattern detected.';

    return res.status(200).json({
      success: true,
      focus_feed: Array.from(latestByUser.values()),
      insight,
      powered_by: 'NudgeAI'
    });
  } catch (error) {
    if (missingSchema(error)) return res.status(200).json({ success: true, focus_feed: [], insight: 'Focus Pulse schema is not ready yet.', powered_by: 'NudgeAI' });
    console.error('Team focus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve team focus.', error: error.message });
  }
};
