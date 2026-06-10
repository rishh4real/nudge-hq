import { supabase } from '../config/supabase.js';
import {
  buildTwilioReplyXml,
  normalizePhoneNumber,
  sendWhatsAppNudge,
  sendWhatsAppWeeklyWin,
} from '../services/whatsapp.js';

const startOfDay = (date = new Date()) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const dayBounds = (daysAgo = 0) => {
  const start = startOfDay();
  start.setDate(start.getDate() - daysAgo);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const weekBounds = (weeksAgo = 0) => {
  const now = startOfDay();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1 - (weeksAgo * 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const formatDueLabel = (dueDate) => {
  if (!dueDate) return 'No deadline';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dueDate));
};

const hasTodayNudge = (employee) => {
  if (!employee.last_whatsapp_nudge && !employee.whatsapp_nudge_sent_at) return false;
  const last = new Date(employee.last_whatsapp_nudge || employee.whatsapp_nudge_sent_at);
  return last >= startOfDay();
};

const getSubmissionMaps = async (employeeIds) => {
  const { start, end } = dayBounds();
  const [updatesResult, checkinsResult] = await Promise.all([
    supabase.from('progress_updates').select('user_id, created_at').in('user_id', employeeIds).gte('created_at', start.toISOString()).lt('created_at', end.toISOString()),
    supabase.from('daily_checkins').select('user_id, created_at, date').in('user_id', employeeIds).eq('date', start.toISOString().slice(0, 10)),
  ]);

  if (updatesResult.error) throw updatesResult.error;
  if (checkinsResult.error) throw checkinsResult.error;

  const submitted = new Map();
  for (const update of updatesResult.data || []) submitted.set(update.user_id, update.created_at);
  for (const checkin of checkinsResult.data || []) submitted.set(checkin.user_id, checkin.created_at || checkin.date);
  return submitted;
};

const getLastSubmissionLabel = async (employeeId) => {
  const [updateResult, checkinResult] = await Promise.all([
    supabase.from('progress_updates').select('created_at').eq('user_id', employeeId).order('created_at', { ascending: false }).limit(1),
    supabase.from('daily_checkins').select('created_at, date').eq('user_id', employeeId).order('date', { ascending: false }).limit(1),
  ]);
  const lastDates = [
    updateResult.data?.[0]?.created_at,
    checkinResult.data?.[0]?.created_at || checkinResult.data?.[0]?.date,
  ].filter(Boolean).map((value) => new Date(value));

  if (!lastDates.length) return 'Never submitted';
  const last = new Date(Math.max(...lastDates));
  const diffDays = Math.floor((Date.now() - last.getTime()) / 86400000);
  if (diffDays <= 0) return 'Submitted today';
  if (diffDays === 1) return 'Last seen 1 day ago';
  return `Last seen ${diffDays} days ago`;
};

const getEmployeesForPreview = async (organizationId = null) => {
  let query = supabase
    .from('users')
    .select('id, name, email, phone_number, organization_id, last_whatsapp_nudge, whatsapp_nudge_sent_at')
    .eq('role', 'employee')
    .not('organization_id', 'is', null)
    .order('name', { ascending: true });

  if (organizationId) query = query.eq('organization_id', organizationId);

  const { data: employees, error } = await query;
  if (error) throw error;
  if (!employees?.length) return [];

  const submittedMap = await getSubmissionMaps(employees.map((employee) => employee.id));
  return Promise.all(employees.map(async (employee) => ({
    ...employee,
    submitted_today: submittedMap.has(employee.id),
    already_nudged_today: hasTodayNudge(employee),
    last_seen_label: submittedMap.has(employee.id)
      ? 'Submitted today'
      : await getLastSubmissionLabel(employee.id),
  })));
};

const getNotificationMessage = ({ status, type, errorMessage }) => {
  const labelMap = {
    daily_nudge: 'WhatsApp nudge',
    deadline_reminder: 'WhatsApp deadline reminder',
    weekly_win: 'WhatsApp weekly win',
    weekly_manager_report: 'WhatsApp weekly report',
  };
  const label = labelMap[type] || 'WhatsApp notification';
  if (status === 'skipped') return `${label} skipped: ${errorMessage || 'not needed'}`;
  return status === 'sent'
    ? `${label} sent.`
    : `${label} failed: ${errorMessage || 'unknown error'}`;
};

const logWhatsAppNotification = async ({ employee, status, twilioSid = null, errorMessage = null, type = 'daily_nudge', triggeredBy = null, taskId = null }) => {
  await Promise.allSettled([
    supabase.from('whatsapp_notification_logs').insert([{
      organization_id: employee.organization_id,
      user_id: employee.id,
      phone_number: employee.phone_number || null,
      status,
      notification_type: type,
      triggered_by: triggeredBy,
      task_id: taskId,
      twilio_sid: twilioSid,
      error_message: errorMessage,
    }]),
    supabase.from('employee_notifications').insert([{
      user_id: employee.id,
      type: `whatsapp_${type}`,
      message: getNotificationMessage({ status, type, errorMessage }),
    }]),
  ]);
};

export const sendPendingWhatsAppNudges = async ({ organizationId = null, employeeIds = null, triggeredBy = null } = {}) => {
  const employees = await getEmployeesForPreview(organizationId);
  const selectedIds = employeeIds?.length ? new Set(employeeIds) : null;
  const targets = employees.filter((employee) => (
    !employee.submitted_today &&
    !employee.already_nudged_today &&
    (!selectedIds || selectedIds.has(employee.id))
  ));
  const results = [];

  for (const employee of targets) {
    if (!employee.phone_number) {
      results.push({ employee_id: employee.id, name: employee.name, status: 'skipped', reason: 'missing_phone_number' });
      await logWhatsAppNotification({ employee, status: 'skipped', errorMessage: 'Missing phone number.', triggeredBy });
      continue;
    }

    try {
      const message = await sendWhatsAppNudge(employee.phone_number, employee.name || 'there', employee);
      results.push({ employee_id: employee.id, name: employee.name, status: 'sent', sid: message.sid });
      await Promise.allSettled([
        logWhatsAppNotification({ employee, status: 'sent', twilioSid: message.sid, triggeredBy }),
        supabase.from('users').update({ last_whatsapp_nudge: new Date().toISOString(), whatsapp_nudge_sent_at: new Date().toISOString() }).eq('id', employee.id),
      ]);
    } catch (error) {
      results.push({ employee_id: employee.id, name: employee.name, status: 'failed', reason: error.message });
      await logWhatsAppNotification({ employee, status: 'failed', errorMessage: error.message, triggeredBy });
    }
  }

  return {
    checked: targets.length,
    sent: results.filter((result) => result.status === 'sent').length,
    skipped: results.filter((result) => result.status === 'skipped').length,
    failed: results.filter((result) => result.status === 'failed').length,
    results,
  };
};

export const previewWhatsAppNudges = async (req, res) => {
  try {
    const organizationId = req.user.organization_id || req.user.company_id;
    const employees = await getEmployeesForPreview(organizationId);
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error('WhatsApp preview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to preview WhatsApp nudges.', error: error.message });
  }
};

export const sendWhatsAppNudgesForRequest = async (req, res) => {
  try {
    const organizationId = req.user.organization_id || req.user.company_id;
    const employeeIds = Array.isArray(req.body?.employee_ids) ? req.body.employee_ids : null;
    const result = await sendPendingWhatsAppNudges({ organizationId, employeeIds, triggeredBy: req.user.id });

    return res.status(200).json({
      success: true,
      message: `WhatsApp nudge sent to ${result.sent} employees.`,
      ...result,
    });
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send WhatsApp nudges.', error: error.message });
  }
};

export const handleWhatsAppReply = async (req, res) => {
  try {
    const phone = normalizePhoneNumber(req.body?.From);
    const replyText = String(req.body?.Body || '').trim();

    const { data: employee, error } = await supabase
      .from('users')
      .select('id, name, phone_number, organization_id')
      .eq('phone_number', phone)
      .maybeSingle();

    if (error && /phone_number|schema cache|does not exist/i.test(error.message || '')) {
      res.type('text/xml');
      return res.status(200).send(buildTwilioReplyXml("We couldn't find your WhatsApp number yet. Please ask your admin to add it in NudgeHQ."));
    }

    if (error) throw error;

    if (!employee) {
      res.type('text/xml');
      return res.status(200).send(buildTwilioReplyXml("We couldn't find your account. Please login at nudgehq.app"));
    }

    if (replyText) {
      await Promise.allSettled([
        supabase.from('progress_updates').insert([{ user_id: employee.id, progress_text: replyText }]),
        supabase.from('daily_checkins').upsert([{
          user_id: employee.id,
          location: 'home',
          goals_json: [replyText],
          energy_level: 'medium',
          date: startOfDay().toISOString().slice(0, 10),
        }], { onConflict: 'user_id,date' }),
      ]);
    }

    res.type('text/xml');
    return res.status(200).send(buildTwilioReplyXml(`✅ Got it ${employee.name || 'there'}! Your update has been saved to NudgeHQ.\nHave a productive day! 🚀`));
  } catch (error) {
    console.error('WhatsApp reply webhook error:', error);
    res.type('text/xml');
    return res.status(200).send(buildTwilioReplyXml('NudgeHQ could not save that update right now. Please try again in a few minutes.'));
  }
};

const countCompletedTasks = async (userId, bounds) => {
  const { data } = await supabase
    .from('tasks')
    .select('id')
    .eq('assignee_id', userId)
    .eq('status', 'completed')
    .gte('created_at', bounds.start.toISOString())
    .lt('created_at', bounds.end.toISOString());
  return data?.length || 0;
};

const getCheckinStreak = async (userId) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data } = await supabase
    .from('daily_checkins')
    .select('date')
    .eq('user_id', userId)
    .gte('date', since.toISOString().slice(0, 10));

  const dates = new Set((data || []).map((item) => item.date));
  let streak = 0;
  const cursor = startOfDay();
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const sendWeeklyWhatsAppWins = async ({ organizationId = null } = {}) => {
  let query = supabase
    .from('users')
    .select('id, name, phone_number, organization_id')
    .eq('role', 'employee')
    .not('phone_number', 'is', null);
  if (organizationId) query = query.eq('organization_id', organizationId);

  const { data: employees, error } = await query;
  if (error) throw error;

  const results = [];
  const thisWeek = weekBounds();
  const lastWeek = weekBounds(1);

  for (const employee of employees || []) {
    try {
      const [tasksCompleted, lastWeekTasks, blockersResolved, streak] = await Promise.all([
        countCompletedTasks(employee.id, thisWeek),
        countCompletedTasks(employee.id, lastWeek),
        supabase.from('blocker_logs').select('id').eq('reporter_id', employee.id).eq('resolved', true).gte('resolved_at', thisWeek.start.toISOString()).lt('resolved_at', thisWeek.end.toISOString()),
        getCheckinStreak(employee.id),
      ]);
      const message = await sendWhatsAppWeeklyWin({
        phone: employee.phone_number,
        tasksCompleted,
        blockersResolved: blockersResolved.data?.length || 0,
        streak,
        betterThanLastWeek: tasksCompleted > lastWeekTasks,
      });
      results.push({ employee_id: employee.id, status: 'sent', sid: message.sid });
      await logWhatsAppNotification({ employee, status: 'sent', twilioSid: message.sid, type: 'weekly_win' });
    } catch (sendError) {
      results.push({ employee_id: employee.id, status: 'failed', reason: sendError.message });
      await logWhatsAppNotification({ employee, status: 'failed', errorMessage: sendError.message, type: 'weekly_win' });
    }
  }

  return {
    checked: employees?.length || 0,
    sent: results.filter((item) => item.status === 'sent').length,
    failed: results.filter((item) => item.status === 'failed').length,
    results,
  };
};

export const sendWeeklyWhatsAppWinsForRequest = async (req, res) => {
  try {
    const organizationId = req.user.organization_id || req.user.company_id;
    const result = await sendWeeklyWhatsAppWins({ organizationId });
    return res.status(200).json({ success: true, message: `Weekly wins sent to ${result.sent} employees.`, ...result });
  } catch (error) {
    console.error('Weekly WhatsApp wins error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send weekly WhatsApp wins.', error: error.message });
  }
};
