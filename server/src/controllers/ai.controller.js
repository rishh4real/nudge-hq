import { groq, GROQ_MODEL } from '../config/groq.js';
import { supabase } from '../config/supabase.js';

const isNudgeAIConfigured = () => process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_your_groq_api_key_goes_here';

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const wordCount = (text = '') => text.trim().split(/\s+/).filter(Boolean).length;

const average = (values) => {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
};

const riskColor = (risk = 'LOW') => {
  const normalized = String(risk).toUpperCase();
  if (normalized === 'HIGH') return 'red';
  if (normalized === 'MEDIUM') return 'yellow';
  return 'green';
};

const parseJson = (content, fallback) => {
  try {
    return JSON.parse(content);
  } catch {
    return fallback;
  }
};

const callNudgeAIJson = async ({ system, prompt, fallback, temperature = 0.25 }) => {
  if (!isNudgeAIConfigured()) return { data: fallback, unavailable: true };

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      model: GROQ_MODEL,
      response_format: { type: 'json_object' },
      temperature
    });

    return {
      data: parseJson(completion.choices[0].message.content, fallback),
      unavailable: false
    };
  } catch (error) {
    console.error('NudgeAI unavailable:', error.message);
    return { data: fallback, unavailable: true };
  }
};

const saveAiOutput = async (featureType, entityId, outputJson, ttlHours = 24) => {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('ai_outputs')
    .insert([{ feature_type: featureType, entity_id: entityId || null, output_json: outputJson, expires_at: expiresAt }]);

  if (error) {
    console.warn('AI output cache skipped:', error.message);
  }
};

const getCachedAiOutput = async (featureType, entityId) => {
  const { data, error } = await supabase
    .from('ai_outputs')
    .select('output_json, generated_at, expires_at')
    .eq('feature_type', featureType)
    .eq('entity_id', entityId || '')
    .gt('expires_at', new Date().toISOString())
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
};

const getScopedDepartmentId = (req) => (
  req?.user?.role === 'manager'
    ? req.user.department_id
    : req?.body?.department_id || req?.query?.department_id || null
);

const getEmployees = async (req = null) => {
  let query = supabase
    .from('users')
    .select('id, name, email, role, department_id, departments(name)')
    .eq('role', 'employee');

  const departmentId = getScopedDepartmentId(req);
  if (req?.user?.organization_id) query = query.eq('organization_id', req.user.organization_id);
  if (departmentId) query = query.eq('department_id', departmentId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const scopeUpdates = (updates = [], req = null) => {
  const departmentId = getScopedDepartmentId(req);
  return departmentId
    ? updates.filter((update) => update.user?.department_id === departmentId)
    : updates;
};

const aiEntityKey = (req, fallback = 'company') => {
  const departmentId = getScopedDepartmentId(req);
  return departmentId ? `department:${departmentId}` : fallback;
};

const assistantFallback = (message = '', context = 'public') => {
  const text = message.toLowerCase();
  if (/price|pricing|cost|plan/.test(text)) {
    return 'NudgeHQ pricing is currently temporary. Current plans are Free Trial, Starter at Rs. 2,000/month for up to 15 employees, Growth at Rs. 6,000/month for up to 45 employees, and Enterprise custom.';
  }
  if (/feature|what.*do|nudgeai|ai/.test(text)) {
    return 'NudgeHQ tracks workforce progress through employee updates, task status, blockers, focus, daily check-ins, deep work, admin dashboards, reports, and NudgeAI summaries, forecasts, care alerts, skill gap analysis, and appreciation suggestions.';
  }
  if (/login|signup|sign up|account|invite/.test(text)) {
    return 'Admins can create a workspace, invite employees by email, and assign tasks. Employees can sign in to submit progress updates, blockers, focus, presence, and deep work outputs.';
  }
  if (/security|privacy|data/.test(text)) {
    return 'NudgeHQ uses role-based access, secure authentication, protected Supabase-backed data, and structured privacy and terms pages. Admin and employee views are separated by role.';
  }
  if (context === 'dashboard') {
    return 'Inside the dashboard, you can ask me about tasks, progress updates, blockers, employee check-ins, NudgeAI reports, focus sessions, deep work, admin actions, or general questions like writing, planning, coding, and explanations.';
  }
  if (/write|email|caption|message|draft/.test(text)) {
    return 'I can help draft that. Share the audience, tone, and key points, and I will turn it into a clear message.';
  }
  if (/plan|schedule|focus|prioriti/.test(text)) {
    return 'A practical plan is to pick one main outcome, split it into 2-3 actions, do the hardest action first, and end with a short review or update.';
  }
  return 'NudgeAI can answer general questions too, but the live AI service is unavailable right now. Try again in a moment for deeper answers, or ask about NudgeHQ, writing, planning, coding, or explanations.';
};

export const assistantChat = async (req, res) => {
  try {
    const { message, context = 'public', role = 'visitor', page = 'landing', dashboard_snapshot = null } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'message is required.' });
    }

    const fallback = {
      answer: assistantFallback(message, context),
      suggestions: ['What does NudgeHQ do?', 'How does NudgeAI help?', 'What can admins see?']
    };

    if (/price|pricing|cost|plan/i.test(message)) {
      return res.status(200).json({
        success: true,
        data: {
          ...fallback,
          powered_by: 'NudgeAI',
          unavailable: false
        }
      });
    }

    const snapshotText = dashboard_snapshot
      ? `\nDashboard snapshot:\n${JSON.stringify(dashboard_snapshot, null, 2)}`
      : '';

    const { data, unavailable } = await callNudgeAIJson({
      system: `You are NudgeAI, a helpful general-purpose AI assistant inside NudgeHQ. Never mention Groq. You can answer general questions about writing, planning, coding, learning, ideas, explanations, and NudgeHQ product usage. Be concise, useful, and friendly. Known NudgeHQ facts: NudgeHQ is a workforce progress tracking SaaS. It has employee updates, tasks, blockers, Focus Pulse, Smart Presence, Deep Work, Employee Growth, admin dashboards, reports, privacy/terms pages, and NudgeAI insights. Current pricing: Free Trial Rs.0 for 14 days and up to 20 employees, Starter Rs.2,000/month for up to 15 employees, Growth Rs.6,000/month for up to 45 employees, Enterprise custom. Never invent NudgeHQ prices, customers, integrations, or policies. If dashboard context is provided, use it. For unrelated general questions, answer normally. Return only JSON with schema {"answer":"answer","suggestions":["short follow-up 1","short follow-up 2","short follow-up 3"]}.`,
      prompt: `User role: ${role}\nPage/context: ${page} / ${context}\nQuestion: ${message}${snapshotText}`,
      fallback,
      temperature: 0.2
    });

    return res.status(200).json({
      success: true,
      data: {
        answer: data.answer || fallback.answer,
        suggestions: Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : fallback.suggestions,
        powered_by: 'NudgeAI',
        unavailable
      }
    });
  } catch (error) {
    console.error('NudgeAI assistant error:', error);
    return res.status(200).json({
      success: true,
      data: {
        answer: assistantFallback(req.body?.message, req.body?.context),
        suggestions: ['What does NudgeHQ do?', 'How do dashboards work?', 'What is NudgeAI?'],
        powered_by: 'NudgeAI',
        unavailable: true
      }
    });
  }
};

const getRecentUpdates = async (fromDate) => {
  const { data, error } = await supabase
    .from('progress_updates')
    .select('id, user_id, task_id, progress_text, quality_score, quality_tip, created_at, user:users(id, name, email, department_id, departments(name)), tasks(id, title, status)')
    .gte('created_at', fromDate.toISOString())
    .order('created_at', { ascending: false });

  if (error && /quality_score|quality_tip|schema cache/i.test(error.message || '')) {
    const fallback = await supabase
      .from('progress_updates')
      .select('id, user_id, task_id, progress_text, created_at, user:users(id, name, email, department_id, departments(name)), tasks(id, title, status)')
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: false });

    if (fallback.error) throw fallback.error;
    return fallback.data || [];
  }

  if (error) throw error;
  return data || [];
};

export const scoreUpdateWithNudgeAI = async (progressText) => {
  const fallbackScore = Math.min(10, Math.max(1, Math.round(wordCount(progressText) / 3)));
  const fallback = {
    score: fallbackScore,
    tip: fallbackScore < 7
      ? 'Try adding the exact task, outcome, and next step so your manager can understand progress quickly.'
      : ''
  };

  const { data, unavailable } = await callNudgeAIJson({
    system: 'You are NudgeAI. Score employee progress updates for specificity. Return only valid JSON.',
    prompt: `Score this progress update from 1-10 for quality and specificity. If score is below 7, include one short improvement tip. Return schema: {"score": number, "tip": "short tip or empty string"}\n\nUpdate: ${progressText}`,
    fallback,
    temperature: 0.1
  });

  return {
    score: Number(data.score) || fallback.score,
    tip: data.tip || '',
    unavailable
  };
};

/**
 * Generate Daily Team Summary
 * GET /ai/summary/daily
 */
export const generateDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch progress updates since midnight
    const { data: rawUpdates, error } = await supabase
      .from('progress_updates')
      .select('progress_text, created_at, user:users(name, email, department_id, departments(name)), task:tasks(title, status)')
      .gte('created_at', today.toISOString());

    if (error) throw error;
    const updates = scopeUpdates(rawUpdates || [], req);

    if (!updates || updates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No daily updates found to summarize today.',
        data: {
          summary: 'No updates have been logged by the team today yet.',
          achievements: [],
          blockers: [],
          needs_attention: []
        }
      });
    }

    // Format updates list for Groq prompt
    const formattedUpdates = updates.map(u => ({
      employee: u.user ? u.user.name : 'Unknown Employee',
      department: u.user && u.user.departments ? u.user.departments.name : 'Unassigned',
      task: u.task ? u.task.title : 'General Update',
      status: u.task ? u.task.status : 'N/A',
      update: u.progress_text,
      timestamp: u.created_at
    }));

    // Check if Groq client is configured
    if (process.env.GROQ_API_KEY === 'gsk_your_groq_api_key_goes_here' || !process.env.GROQ_API_KEY) {
      console.warn('Groq API Key is not set. Returning a mock summary.');
      return res.status(200).json({
        success: true,
        message: 'Groq API Key is not configured. Returning simulated summary results.',
        is_mocked: true,
        data: {
          summary: `The team logged ${updates.length} updates today. Major themes include ongoing task progress.`,
          achievements: updates.slice(0, 3).map(u => `${u.user?.name || 'Employee'} updated: ${u.progress_text.substring(0, 50)}...`),
          blockers: updates.filter(u => u.task?.status === 'blocked').map(u => `${u.user?.name || 'Employee'}: Blocked on task '${u.task?.title || 'General'}'`),
          needs_attention: []
        }
      });
    }

    const systemPrompt = 'You are NudgeHQ AI, an expert workforce operations assistant. Analyze team updates and output your analysis strictly in JSON format.';
    const userPrompt = `Below are the workforce progress logs submitted today:
${JSON.stringify(formattedUpdates, null, 2)}

Provide a concise operations summary. Group achievements, blockers, and highlights needing immediate attention. 
Your output must be a valid JSON object matching this schema:
{
  "summary": "Paragraph summarizing daily momentum...",
  "achievements": ["achievement sentence 1", "achievement sentence 2"],
  "blockers": ["blocker description 1", "blocker description 2"],
  "needs_attention": ["urgent item requiring action 1"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const reportContent = JSON.parse(completion.choices[0].message.content);

    // Save generated report to DB
    const { error: reportSaveError } = await supabase
      .from('reports')
      .insert([
        {
          generated_by: req.user.id,
          type: 'daily',
          content: reportContent
        }
      ]);

    if (reportSaveError) {
      console.error('Failed to log report history:', reportSaveError.message);
    }

    return res.status(200).json({
      success: true,
      data: reportContent
    });
  } catch (error) {
    console.error('AI generate summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI team summary.',
      error: error.message
    });
  }
};

/**
 * Detect Delayed or At-Risk Tasks
 * GET /ai/delays
 */
export const detectDelayedTasks = async (req, res) => {
  try {
    const now = new Date().toISOString();

    // Query tasks that are overdue (due_date < now and status != completed) OR are blocked
    const { data: atRiskTasksRaw, error } = await supabase
      .from('tasks')
      .select('id, title, description, status, due_date, created_at, assignee:users(name, email, department_id, departments(name))')
      .neq('status', 'completed');

    if (error) throw error;
    const scopedDepartmentId = getScopedDepartmentId(req);
    const atRiskTasks = scopedDepartmentId
      ? (atRiskTasksRaw || []).filter((task) => task.assignee?.department_id === scopedDepartmentId)
      : (atRiskTasksRaw || []);

    // Filter tasks that are actually overdue or currently blocked
    const filteredAtRisk = atRiskTasks.filter(task => {
      const isOverdue = task.due_date && task.due_date < now;
      const isBlocked = task.status === 'blocked';
      return isOverdue || isBlocked;
    });

    if (filteredAtRisk.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No overdue or blocked tasks detected.',
        delayed_tasks: []
      });
    }

    // Format tasks for AI review
    const taskDetails = filteredAtRisk.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date,
      assignee: task.assignee ? task.assignee.name : 'Unassigned',
      is_overdue: task.due_date && task.due_date < now
    }));

    // If Groq is not configured, fall back to simple JSON list
    if (process.env.GROQ_API_KEY === 'gsk_your_groq_api_key_goes_here' || !process.env.GROQ_API_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Groq API Key is not configured. Returning simple data check.',
        is_mocked: true,
        delayed_tasks: taskDetails.map(t => ({
          ...t,
          ai_risk_assessment: `Task status is '${t.status}' with due date ${t.due_date || 'None'}. Immediate review recommended.`
        }))
      });
    }

    const systemPrompt = 'You are NudgeHQ AI. Analyze the list of overdue and blocked tasks and provide risk assessments. Output only JSON.';
    const userPrompt = `Review the following overdue and blocked tasks:
${JSON.stringify(taskDetails, null, 2)}

Provide an assessment for each task specifying risk level ('high', 'medium', 'low') and suggested remedy.
Return a valid JSON object matching this schema:
{
  "assessments": [
    {
      "task_id": "UUID",
      "task_title": "Title",
      "risk_level": "high | medium | low",
      "remedy": "Recommended step..."
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODEL,
      response_format: { type: 'json_object' }
    });

    const parsedAssessment = JSON.parse(completion.choices[0].message.content);

    // Merge assessments back into tasks
    const assessedTasks = taskDetails.map(task => {
      const assessment = parsedAssessment.assessments.find(a => a.task_id === task.id) || {};
      return {
        ...task,
        risk_level: assessment.risk_level || 'medium',
        remedy: assessment.remedy || 'Check with assignee for updates.'
      };
    });

    return res.status(200).json({
      success: true,
      delayed_tasks: assessedTasks
    });
  } catch (error) {
    console.error('AI delay check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze task delay risks.',
      error: error.message
    });
  }
};

/**
 * Identify Inactive Employees (No updates in last 3 days)
 * GET /ai/inactivity
 */
export const identifyInactiveEmployees = async (req, res) => {
  try {
    // 1. Get all employees
    const { data: employees, error: empError } = await supabase
      .from('users')
      .select('id, name, email, department_id, departments(name)')
      .eq('role', 'employee');

    if (empError) throw empError;

    // 2. Fetch updates logged in the last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: recentUpdates, error: updError } = await supabase
      .from('progress_updates')
      .select('user_id, created_at')
      .gte('created_at', threeDaysAgo.toISOString());

    if (updError) throw updError;

    // 3. Match employees who have NOT logged any updates in last 3 days
    const activeUserIds = new Set(recentUpdates.map(u => u.user_id));
    const inactiveEmployees = employees.filter(emp => !activeUserIds.has(emp.id));

    if (inactiveEmployees.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All employees are active. No inactive patterns detected.',
        inactive_employees: []
      });
    }

    const inactiveList = inactiveEmployees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      department: emp.departments ? emp.departments.name : 'Unassigned'
    }));

    // If Groq is not configured, supply mock check-in templates
    if (process.env.GROQ_API_KEY === 'gsk_your_groq_api_key_goes_here' || !process.env.GROQ_API_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Groq API Key is not configured. Returning checklist with template.',
        is_mocked: true,
        inactive_employees: inactiveList.map(e => ({
          ...e,
          checkin_nudge: `Hi ${e.name}, hope all is well! Just checking in to see if you have any progress or blockers you'd like to share on your active tasks.`
        }))
      });
    }

    const systemPrompt = 'You are NudgeHQ AI. Draft personalized check-in messages for inactive employees. Output only JSON.';
    const userPrompt = `Below are employees who have not logged any progress updates in the last 3 days:
${JSON.stringify(inactiveList, null, 2)}

Draft a friendly, encouraging nudge message for each employee to check in on their current assignments.
Return a valid JSON object matching this schema:
{
  "nudges": [
    {
      "employee_id": "UUID",
      "message": "Friendly check-in text..."
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODEL,
      response_format: { type: 'json_object' }
    });

    const parsedNudges = JSON.parse(completion.choices[0].message.content);

    const result = inactiveList.map(e => {
      const nudge = parsedNudges.nudges.find(n => n.employee_id === e.id) || {};
      return {
        ...e,
        checkin_nudge: nudge.message || `Hi ${e.name}, just checking in to see if you need help with anything!`
      };
    });

    return res.status(200).json({
      success: true,
      inactive_employees: result
    });
  } catch (error) {
    console.error('AI inactive employee check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze employee activity reports.',
      error: error.message
    });
  }
};

export const burnoutCheck = async (req, res) => {
  try {
    const { refresh = true } = req.body || {};
    if (!refresh) {
      const cached = await getCachedAiOutput('burnout-check', 'admin');
      if (cached) return res.status(200).json({ success: true, cached: true, data: cached.output_json });
    }

    const employees = await getEmployees(req);
    const updates = scopeUpdates(await getRecentUpdates(daysAgo(14)), req);

    const results = await Promise.all(employees.map(async (employee) => {
      const employeeUpdates = updates.filter((update) => update.user_id === employee.id);
      const blockerCount = employeeUpdates.filter((update) => update.tasks?.status === 'blocked').length;
      const missedCheckins = Math.max(0, 10 - new Set(employeeUpdates.map((update) => update.created_at.slice(0, 10))).size);
      const textLengths = employeeUpdates.map((update) => wordCount(update.progress_text));
      const submissionHours = employeeUpdates.map((update) => new Date(update.created_at).getHours() + (new Date(update.created_at).getMinutes() / 60));
      const signals = {
        employee: { id: employee.id, name: employee.name, department: employee.departments?.name || 'Unassigned' },
        last_14_days: {
          update_count: employeeUpdates.length,
          average_submission_hour: Number(average(submissionHours).toFixed(2)),
          latest_submission_hour: submissionHours[0] || null,
          average_update_words: Math.round(average(textLengths)),
          latest_update_words: textLengths[0] || 0,
          blocker_count: blockerCount,
          missed_checkins: missedCheckins,
          mood_score: null
        }
      };

      const heuristicRisk = missedCheckins >= 6 || blockerCount >= 3 ? 'HIGH' : missedCheckins >= 3 || average(textLengths) < 8 ? 'MEDIUM' : 'LOW';
      const fallback = {
        employee_id: employee.id,
        employee_name: employee.name,
        risk_level: heuristicRisk,
        reason: heuristicRisk === 'LOW' ? 'Recent update patterns look steady.' : 'Recent check-in consistency or blocker signals need a private HR review.'
      };

      const { data, unavailable } = await callNudgeAIJson({
        system: 'You are NudgeAI, a private HR care assistant. Return only JSON. Be careful, non-diagnostic, and concise.',
        prompt: `Analyze these 14-day workforce signals. Return burnout risk LOW, MEDIUM, or HIGH and one private reason. Schema: {"employee_id":"id","employee_name":"name","risk_level":"LOW|MEDIUM|HIGH","reason":"one line"}\n${JSON.stringify(signals, null, 2)}`,
        fallback
      });

      return {
        ...fallback,
        ...data,
        color: riskColor(data.risk_level || fallback.risk_level),
        unavailable
      };
    }));

    const output = { generated_at: new Date().toISOString(), powered_by: 'NudgeAI', burnout_risks: results };
    await saveAiOutput('burnout-check', 'admin', output, 12);
    return res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error('NudgeAI burnout check error:', error);
    return res.status(200).json({ success: false, message: 'NudgeAI unavailable, try again later', data: { burnout_risks: [] } });
  }
};

export const sprintForecast = async (req, res) => {
  try {
    const { refresh = false } = req.body || {};
    const entityKey = aiEntityKey(req);
    if (!refresh) {
      const cached = await getCachedAiOutput('sprint-forecast', entityKey);
      if (cached) return res.status(200).json({ success: true, cached: true, data: cached.output_json });
    }

    const [employees, updatesResult, tasksResult, blockersResult] = await Promise.all([
      getEmployees(req),
      scopeUpdates(await getRecentUpdates(daysAgo(14)), req),
      supabase.from('tasks').select('id, title, description, status, due_date, assignee:users(id, name, email, department_id)').neq('status', 'completed'),
      supabase.from('blocker_logs').select('id, task_id, reporter_id, blocker_text, resolved, created_at').eq('resolved', false)
    ]);

    if (tasksResult.error) throw tasksResult.error;
    if (blockersResult.error) throw blockersResult.error;

    const scopedTasks = (tasksResult.data || []).filter((task) => !getScopedDepartmentId(req) || task.assignee?.department_id === getScopedDepartmentId(req));
    const scopedBlockers = (blockersResult.data || []).filter((blocker) => scopedTasks.some((task) => task.id === blocker.task_id));

    const completionByEmployee = employees.map((employee) => {
      const assignedOpen = scopedTasks.filter((task) => task.assignee?.id === employee.id).length;
      const submitted = updatesResult.filter((update) => update.user_id === employee.id).length;
      return {
        id: employee.id,
        name: employee.name,
        two_week_update_count: submitted,
        open_tasks: assignedOpen,
        estimated_completion_rate: assignedOpen ? Math.min(100, Math.round((submitted / (assignedOpen + submitted)) * 100)) : 80
      };
    });

    const payload = {
      open_tasks: scopedTasks,
      completion_by_employee: completionByEmployee,
      active_blockers: scopedBlockers,
      team_capacity: employees.length
    };

    const fallbackPercent = Math.max(35, Math.min(92, 85 - (scopedBlockers.length * 8)));
    const fallback = {
      forecast_percent: fallbackPercent,
      tasks_at_risk: scopedTasks.slice(0, 3).map((task) => ({
        task_id: task.id,
        title: task.title,
        reason: task.status === 'blocked' ? 'Task is currently blocked.' : 'Open task needs owner review.'
      })),
      recommended_actions: ['Review blocked work first.', 'Confirm owners for open tasks.', 'Ask teams for crisp daily check-ins.']
    };

    const { data, unavailable } = await callNudgeAIJson({
      system: 'You are NudgeAI, a workforce sprint forecasting assistant. Return only JSON.',
      prompt: `Predict what percentage of this week's open tasks will be completed. Identify 3 tasks most at risk and why. Give 2-3 recommended actions. Schema: {"forecast_percent": number, "tasks_at_risk":[{"task_id":"id","title":"title","reason":"why"}], "recommended_actions":["action"]}\n${JSON.stringify(payload, null, 2)}`,
      fallback
    });

    const output = { ...fallback, ...data, generated_at: new Date().toISOString(), powered_by: 'NudgeAI', unavailable };
    await saveAiOutput('sprint-forecast', entityKey, output, 24);
    return res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error('NudgeAI sprint forecast error:', error);
    return res.status(200).json({ success: false, message: 'NudgeAI unavailable, try again later', data: null });
  }
};

export const standupBrief = async (req, res) => {
  try {
    const { refresh = false } = req.body || {};
    const entityKey = aiEntityKey(req);
    if (!refresh) {
      const cached = await getCachedAiOutput('standup-brief', entityKey);
      if (cached) return res.status(200).json({ success: true, cached: true, data: cached.output_json });
    }

    const since = new Date();
    since.setDate(since.getDate() - 1);
    since.setHours(9, 0, 0, 0);

    const updates = scopeUpdates(await getRecentUpdates(since), req);
    const fallback = {
      brief: updates.length
        ? `What got done: ${updates.length} team updates were submitted. What is in progress: teams continue moving assigned work forward. What is blocked: review any blocked tasks in the dashboard. What needs manager attention today: follow up on unclear or delayed updates.`
        : 'What got done: No updates have been submitted since yesterday 9am. What is in progress: Not enough signal yet. What is blocked: No blocker data available. What needs manager attention today: Ask teams to submit their first update.',
      sections: {
        done: [],
        in_progress: [],
        blocked: [],
        attention: []
      }
    };

    const { data, unavailable } = await callNudgeAIJson({
      system: 'You are NudgeAI. Write concise manager standup briefs. Return only JSON.',
      prompt: `Write a clean manager standup brief from these updates since yesterday 9am. Max 150 words. Professional but conversational. Format into what got done, in progress, blocked, and manager attention. Schema: {"brief":"paragraph max 150 words","sections":{"done":[],"in_progress":[],"blocked":[],"attention":[]}}\n${JSON.stringify(updates, null, 2)}`,
      fallback,
      temperature: 0.35
    });

    const output = { ...fallback, ...data, generated_at: new Date().toISOString(), powered_by: 'NudgeAI', unavailable };
    await saveAiOutput('standup-brief', entityKey, output, 18);
    return res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error('NudgeAI standup brief error:', error);
    return res.status(200).json({ success: false, message: 'NudgeAI unavailable, try again later', data: null });
  }
};

export const scoreUpdate = async (req, res) => {
  try {
    const { progress_text } = req.body;
    if (!progress_text) {
      return res.status(400).json({ success: false, message: 'progress_text is required.' });
    }

    const result = await scoreUpdateWithNudgeAI(progress_text);
    const output = { ...result, generated_at: new Date().toISOString(), powered_by: 'NudgeAI' };
    await saveAiOutput('score-update', req.user.id, output, 24);
    return res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error('NudgeAI score update error:', error);
    return res.status(200).json({ success: false, message: 'NudgeAI unavailable, try again later', data: null });
  }
};

export const anomalyCheck = async (req, res) => {
  try {
    const { refresh = true } = req.body || {};
    if (!refresh) {
      const cached = await getCachedAiOutput('anomaly-check', 'admin');
      if (cached) return res.status(200).json({ success: true, cached: true, data: cached.output_json });
    }

    const employees = await getEmployees(req);
    const updates = scopeUpdates(await getRecentUpdates(daysAgo(14)), req);

    const alerts = await Promise.all(employees.map(async (employee) => {
      const employeeUpdates = updates.filter((update) => update.user_id === employee.id);
      const baselineUpdates = employeeUpdates.slice(1, 8);
      const todayUpdate = employeeUpdates[0];
      const baselineHour = average(baselineUpdates.map((update) => new Date(update.created_at).getHours()));
      const todayHour = todayUpdate ? new Date(todayUpdate.created_at).getHours() : new Date().getHours();
      const baselineWords = average(baselineUpdates.map((update) => wordCount(update.progress_text)));
      const todayWords = todayUpdate ? wordCount(todayUpdate.progress_text) : 0;
      const late = baselineHour && todayHour - baselineHour >= 3;
      const short = baselineWords && todayWords < baselineWords * 0.4;

      const baseline = {
        employee: { id: employee.id, name: employee.name },
        usual_checkin_hour: Number(baselineHour.toFixed(1)) || null,
        average_update_words: Math.round(baselineWords),
        today_checkin_hour: todayUpdate ? todayHour : null,
        today_update_words: todayWords,
        no_update_today: !todayUpdate || todayUpdate.created_at.slice(0, 10) !== new Date().toISOString().slice(0, 10)
      };

      const fallback = {
        employee_id: employee.id,
        employee_name: employee.name,
        anomalous: late || short || baseline.no_update_today ? 'YES' : 'NO',
        anomaly_type: baseline.no_update_today ? 'late_checkin' : late ? 'late_checkin' : short ? 'short_update' : 'none',
        suggested_admin_action: late || short || baseline.no_update_today
          ? `${employee.name} has a different check-in pattern today. Consider a supportive check-in.`
          : 'No action needed.'
      };

      const { data, unavailable } = await callNudgeAIJson({
        system: 'You are NudgeAI, a care-oriented anomaly detector. This is a care system, not surveillance. Return only JSON.',
        prompt: `Given this employee baseline and today's data, is anything anomalous? Return YES/NO, anomaly type, and suggested admin action. Schema: {"employee_id":"id","employee_name":"name","anomalous":"YES|NO","anomaly_type":"late_checkin|output_drop|short_update|none","suggested_admin_action":"care-oriented action"}\n${JSON.stringify(baseline, null, 2)}`,
        fallback
      });

      return { ...fallback, ...data, unavailable };
    }));

    const output = { generated_at: new Date().toISOString(), powered_by: 'NudgeAI', alerts: alerts.filter((alert) => alert.anomalous === 'YES') };
    await saveAiOutput('anomaly-check', 'admin', output, 12);
    return res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error('NudgeAI anomaly check error:', error);
    return res.status(200).json({ success: false, message: 'NudgeAI unavailable, try again later', data: { alerts: [] } });
  }
};

export const appreciation = async (req, res) => {
  try {
    const { send = false, employee_id, message, refresh = true } = req.body || {};
    const entityKey = aiEntityKey(req);

    if (send && employee_id && message) {
      if (req.user.role === 'manager') {
        const { data: employee, error: employeeError } = await supabase
          .from('users')
          .select('id, department_id, organization_id')
          .eq('id', employee_id)
          .maybeSingle();
        if (employeeError) throw employeeError;
        if (!employee || employee.organization_id !== req.user.organization_id || employee.department_id !== req.user.department_id) {
          return res.status(403).json({ success: false, message: 'Managers can send appreciation only to their own department.' });
        }
      }
      const { error } = await supabase
        .from('employee_notifications')
        .insert([{ user_id: employee_id, type: 'recognition', message }]);

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Recognition sent to employee dashboard.' });
    }

    if (!refresh) {
      const cached = await getCachedAiOutput('appreciation', entityKey);
      if (cached) return res.status(200).json({ success: true, cached: true, data: cached.output_json });
    }

    const employees = await getEmployees(req);
    const updates = scopeUpdates(await getRecentUpdates(daysAgo(7)), req);
    const suggestions = await Promise.all(employees.slice(0, 6).map(async (employee) => {
      const employeeUpdates = updates.filter((update) => update.user_id === employee.id);
      const completedCount = employeeUpdates.filter((update) => update.tasks?.status === 'completed').length;
      const zeroMissed = new Set(employeeUpdates.map((update) => update.created_at.slice(0, 10))).size >= 5;
      const achievement = completedCount > 0
        ? `completed ${completedCount} task-linked updates this week`
        : zeroMissed
        ? 'kept a steady check-in rhythm this week'
        : 'kept their team updated with useful progress notes';
      const fallback = {
        employee_id: employee.id,
        employee_name: employee.name,
        achievement,
        message: `Nice work, ${employee.name}. Your ${achievement} helped the team stay clear and moving.`
      };

      const { data, unavailable } = await callNudgeAIJson({
        system: 'You are NudgeAI. Write warm, genuine employee appreciation messages. Return only JSON.',
        prompt: `Write a short, genuine, warm appreciation message for a manager to send. Max 2 sentences. Mention the specific achievement. Schema: {"employee_id":"id","employee_name":"name","achievement":"specific achievement","message":"message"}\n${JSON.stringify({ employee, achievement }, null, 2)}`,
        fallback,
        temperature: 0.45
      });

      return { ...fallback, ...data, unavailable };
    }));

    const output = { generated_at: new Date().toISOString(), powered_by: 'NudgeAI', suggestions };
    await saveAiOutput('appreciation', entityKey, output, 24);
    return res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error('NudgeAI appreciation error:', error);
    return res.status(200).json({ success: false, message: 'NudgeAI unavailable, try again later', data: { suggestions: [] } });
  }
};

export const skillGapAnalysis = async (req, res) => {
  try {
    const { refresh = false } = req.body || {};
    if (!refresh) {
      const cached = await getCachedAiOutput('skill_gap', 'company');
      if (cached) return res.status(200).json({ success: true, cached: true, data: cached.output_json });
    }

    const monthStart = daysAgo(30);
    const { data: blockers, error } = await supabase
      .from('blocker_logs')
      .select('id, blocker_text, created_at, reporter:users(name, departments(name)), task:tasks(title)')
      .gte('created_at', monthStart.toISOString());

    if (error) throw error;

    const fallback = {
      gaps: [
        {
          gap_name: 'Blocker resolution process',
          frequency: blockers?.length || 0,
          suggested_learning_area: 'Root-cause updates and escalation hygiene',
          urgency: blockers?.length > 5 ? 'high' : 'medium'
        }
      ],
      generated_at: new Date().toISOString(),
      powered_by: 'NudgeAI'
    };

    const { data, unavailable } = await callNudgeAIJson({
      system: 'You are NudgeAI. Analyze blocker descriptions and identify skill or knowledge gaps. Return only JSON.',
      prompt: `Analyze these blocker descriptions and identify the top 3 skill gaps or knowledge gaps they indicate. Return schema: {"gaps":[{"gap_name":"name","frequency":number,"suggested_learning_area":"area","urgency":"high|medium|low"}]}\n${JSON.stringify(blockers || [], null, 2)}`,
      fallback
    });

    const output = { ...fallback, ...data, generated_at: new Date().toISOString(), powered_by: 'NudgeAI', unavailable };
    await saveAiOutput('skill_gap', 'company', output, 24 * 7);
    return res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error('NudgeAI skill gap error:', error);
    return res.status(200).json({ success: false, message: 'NudgeAI unavailable, try again later', data: { gaps: [] } });
  }
};
