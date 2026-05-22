import { groq, GROQ_MODEL } from '../config/groq.js';
import { supabase } from '../config/supabase.js';

/**
 * Generate Daily Team Summary
 * GET /ai/summary/daily
 */
export const generateDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch progress updates since midnight
    const { data: updates, error } = await supabase
      .from('progress_updates')
      .select('progress_text, created_at, user:users(name, email, departments(name)), task:tasks(title, status)')
      .gte('created_at', today.toISOString());

    if (error) throw error;

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
    const { data: atRiskTasks, error } = await supabase
      .from('tasks')
      .select('id, title, description, status, due_date, created_at, assignee:users(name, email, departments(name))')
      .neq('status', 'completed');

    if (error) throw error;

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
