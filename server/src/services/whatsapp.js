import twilio from 'twilio';
import { supabase } from '../config/supabase.js';

const APP_URL = 'nudgehq.app';

export const isValidPhoneNumber = (phone) => /^\+\d{10,15}$/.test(String(phone || '').trim());

export const normalizePhoneNumber = (phone) => {
  const cleanPhone = String(phone || '').trim();
  if (!cleanPhone) return null;
  return cleanPhone.replace(/^whatsapp:/, '');
};

const formatWhatsAppNumber = (phone) => {
  const cleanPhone = normalizePhoneNumber(phone);
  if (!cleanPhone) return null;
  return cleanPhone.startsWith('whatsapp:') ? cleanPhone : `whatsapp:${cleanPhone}`;
};

const getTwilioClient = () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || TWILIO_ACCOUNT_SID === 'your_sid' || TWILIO_AUTH_TOKEN === 'your_token') {
    throw new Error('Twilio WhatsApp credentials are not configured.');
  }

  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
};

export const sendWhatsAppMessage = async (phone, body) => {
  const to = formatWhatsAppNumber(phone);
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!to) throw new Error('Employee phone number is missing.');
  if (!isValidPhoneNumber(normalizePhoneNumber(phone))) throw new Error('Phone number must include country code, for example +919999999999.');
  if (!from) throw new Error('TWILIO_WHATSAPP_FROM is not configured.');

  return getTwilioClient().messages.create({ from, to, body });
};

const dayRange = (daysAgo = 0) => {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const getCheckinStreak = async (userId) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [checkinsResult, updatesResult] = await Promise.all([
    supabase.from('daily_checkins').select('date').eq('user_id', userId).gte('date', since.toISOString().slice(0, 10)),
    supabase.from('progress_updates').select('created_at').eq('user_id', userId).gte('created_at', since.toISOString()),
  ]);

  const submittedDates = new Set([
    ...(checkinsResult.data || []).map((item) => item.date),
    ...(updatesResult.data || []).map((item) => new Date(item.created_at).toISOString().slice(0, 10)),
  ]);

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (submittedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const getSmartNudgeContext = async (employee) => {
  const yesterday = dayRange(1);
  const allUpdates = await supabase
    .from('progress_updates')
    .select('id')
    .eq('user_id', employee.id)
    .limit(1);

  const completedTasks = await supabase
    .from('tasks')
    .select('id, title')
    .eq('assignee_id', employee.id)
    .eq('status', 'completed')
    .gte('created_at', yesterday.start.toISOString())
    .lt('created_at', yesterday.end.toISOString());

  const blockers = await supabase
    .from('blocker_logs')
    .select('blocker_text, created_at, tasks(title)')
    .eq('reporter_id', employee.id)
    .eq('resolved', false)
    .gte('created_at', yesterday.start.toISOString())
    .lt('created_at', yesterday.end.toISOString())
    .limit(1);

  return {
    firstTime: !(allUpdates.data || []).length,
    completedCount: (completedTasks.data || []).length,
    blockerTask: blockers.data?.[0]?.tasks?.title || null,
    streak: await getCheckinStreak(employee.id),
  };
};

export const buildSmartNudgeMessage = async (employee) => {
  const name = employee.name || 'there';
  const context = await getSmartNudgeContext(employee);

  if (context.firstTime) {
    return `👋 Welcome to NudgeHQ ${name}!\nTake 2 mins to submit your first update today → ${APP_URL}`;
  }

  if (context.blockerTask) {
    return `Hey ${name}! 👋\nHope your '${context.blockerTask}' got resolved!\nSubmit today's update when you're ready → ${APP_URL}`;
  }

  if (context.completedCount > 2) {
    return `Hey ${name}! 🔥\nGreat work yesterday — ${context.completedCount} tasks done!\nKeep the momentum going today → ${APP_URL}`;
  }

  if (context.streak > 5) {
    return `Hey ${name}! 🏆\n${context.streak}-day streak! Don't break it now.\nToday's check-in → ${APP_URL}`;
  }

  return `Hey ${name}! 👋\nDon't forget today's NudgeHQ check-in.\nTakes under 2 mins → ${APP_URL}`;
};

export const sendWhatsAppNudge = async (phone, name = 'there', employee = null) => {
  const body = employee ? await buildSmartNudgeMessage(employee) : `Hey ${name}! 👋 Your daily NudgeHQ check-in is pending. Takes 2 mins → ${APP_URL}/dashboard/employee`;
  return sendWhatsAppMessage(phone, body);
};

export const sendWhatsAppBlockerAlert = async ({ phone, employeeName, taskTitle, blockerText }) => {
  const body = `🚨 NudgeHQ Blocker Alert\n\n${employeeName} is blocked on:\n'${taskTitle}'\n\nReason: '${blockerText}'\nBlocked since: just now\n\nResolve here → ${APP_URL}/dashboard/manager`;
  return sendWhatsAppMessage(phone, body);
};

export const sendWhatsAppWeeklyWin = async ({ phone, tasksCompleted, blockersResolved, streak, betterThanLastWeek }) => {
  const comparison = betterThanLastWeek
    ? '\n📈 Better than last week! Keep it up!'
    : '\n💪 Consistent performance this week!';
  const body = `🏆 Your NudgeHQ week in review!\n\n✅ ${tasksCompleted} tasks completed\n⚡ ${blockersResolved} blockers resolved\n🔥 ${streak}-day check-in streak\n${comparison}\n\nSee your full progress → ${APP_URL}\n— NudgeAI`;
  return sendWhatsAppMessage(phone, body);
};

export const sendWhatsAppDeadlineReminder = async ({ phone, employeeName, taskTitle, dueDate, status }) => {
  const formattedDueDate = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dueDate));
  const body = `⏰ NudgeHQ deadline reminder\n\nHi ${employeeName || 'there'}, your task '${taskTitle}' is due by ${formattedDueDate}.\nCurrent status: ${status.replace('_', ' ')}.\n\nPlease update it before the deadline → ${APP_URL}/dashboard/employee`;
  return sendWhatsAppMessage(phone, body);
};

export const sendWhatsAppWeeklyManagerReport = async ({ phone, recipientName, scopeLabel, report }) => {
  const urgentLine = report.urgentTasks.length
    ? `\nTop urgent: ${report.urgentTasks.map((task) => `${task.title} (${task.dueLabel})`).join(', ')}`
    : '';
  const body = `📊 Weekly NudgeHQ report\n\nHi ${recipientName || 'there'}, here is your ${scopeLabel} summary:\n👥 Employees: ${report.employeeCount}\n📝 Active tasks: ${report.activeTasks}\n✅ Completed tasks: ${report.completedTasks}\n🚨 Blocked tasks: ${report.blockedTasks}\n⌛ Overdue tasks: ${report.overdueTasks}\n📅 Due next 7 days: ${report.dueSoonTasks}\n🗓️ Weekly check-ins: ${report.checkedInEmployees}/${report.employeeCount}${urgentLine}\n\nOpen dashboard → ${APP_URL}/dashboard/manager`;
  return sendWhatsAppMessage(phone, body);
};

export const sendWhatsAppWelcome = async ({ phone, name, companyName }) => {
  const body = `👋 Welcome to NudgeHQ, ${name}!\n\nYour workspace at ${companyName || 'your company'} is ready.\n\n✅ Submit daily updates\n📊 Track your progress\n🤖 Get AI-powered insights\n\nGet started → ${APP_URL}/dashboard/employee\n— NudgeHQ Team`;
  return sendWhatsAppMessage(phone, body);
};

export const buildTwilioReplyXml = (message) => {
  const response = new twilio.twiml.MessagingResponse();
  response.message(message);
  return response.toString();
};
