import { supabase } from '../config/supabase.js';
import { groq, GROQ_MODEL } from '../config/groq.js';

const pdfEscape = (text = '') => String(text).replace(/[()\\]/g, '\\$&').slice(0, 3000);

const buildSimplePdf = (title, lines) => {
  const text = [title, '', ...lines].map(pdfEscape);
  const content = `BT /F1 16 Tf 50 780 Td (${text[0]}) Tj /F1 10 Tf ${text.slice(1).map((line) => `0 -18 Td (${line}) Tj`).join(' ')} ET`;
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
};

export const generateBoardPack = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.body?.month) || now.getMonth() + 1;
    const year = Number(req.body?.year) || now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [usersRes, tasksRes, blockersRes, departmentsRes, checkinsRes] = await Promise.all([
      supabase.from('users').select('id, name, role, department_id, departments(name)'),
      supabase.from('tasks').select('id, title, status, assignee_id, created_at').gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
      supabase.from('blocker_logs').select('id, blocker_text, resolved, created_at, resolved_at, reporter:users(departments(name))').gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
      supabase.from('departments').select('id, name'),
      supabase.from('daily_checkins').select('energy_level, date').gte('date', start.toISOString().slice(0, 10)).lte('date', end.toISOString().slice(0, 10))
    ]);

    if (usersRes.error) throw usersRes.error;
    if (tasksRes.error) throw tasksRes.error;
    if (blockersRes.error) throw blockersRes.error;

    const users = usersRes.data || [];
    const tasks = tasksRes.data || [];
    const blockers = blockersRes.data || [];
    const departments = departmentsRes.data || [];
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    const departmentPerformance = departments.map((dept) => {
      const deptUsers = users.filter((user) => user.department_id === dept.id).map((user) => user.id);
      const deptTasks = tasks.filter((task) => deptUsers.includes(task.assignee_id));
      const deptCompleted = deptTasks.filter((task) => task.status === 'completed').length;
      return {
        department: dept.name,
        completion_rate: deptTasks.length ? Math.round((deptCompleted / deptTasks.length) * 100) : 0,
        total_tasks: deptTasks.length
      };
    });

    let aiSections = {
      executive_summary: `This month, the team completed ${completed} of ${tasks.length} tracked tasks with a ${completionRate}% completion rate.`,
      biggest_win: completed ? 'The biggest win was steady task completion across active work.' : 'The biggest win was establishing clearer progress tracking.',
      biggest_risk: blockers.length ? 'Recurring blockers need leadership attention.' : 'No major blocker trend detected.',
      recommendations: ['Keep goals visible.', 'Review blockers weekly.', 'Protect deep work time.'],
      next_month_forecast: `${Math.max(40, Math.min(90, completionRate + 8))}% completion likely next month if blocker reviews continue.`
    };

    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_your_groq_api_key_goes_here') {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are NudgeAI. Write concise board-level workforce report sections. Return only JSON.' },
            { role: 'user', content: `Generate sections 1, 4 and 5 for a monthly board pack. Schema: {"executive_summary":"...","biggest_win":"...","biggest_risk":"...","recommendations":["..."],"next_month_forecast":"..."}\n${JSON.stringify({ employees: users.filter(u => u.role === 'employee').length, tasks: tasks.length, completed, completionRate, blockers: blockers.length, departmentPerformance }, null, 2)}` }
          ],
          model: GROQ_MODEL,
          response_format: { type: 'json_object' },
          temperature: 0.35
        });
        aiSections = { ...aiSections, ...JSON.parse(completion.choices[0].message.content) };
      } catch {
        // fallback remains
      }
    }

    const boardPack = {
      month,
      year,
      generated_at: new Date().toISOString(),
      powered_by: 'NudgeAI',
      executive_summary: aiSections.executive_summary,
      department_performance: departmentPerformance,
      team_health: {
        blocker_count: blockers.length,
        energy_patterns: checkinsRes.error ? [] : checkinsRes.data,
        burnout_risk_summary: 'Use NudgeAI Burnout Predictor for detailed private HR care signals.'
      },
      ai_highlights: {
        biggest_win: aiSections.biggest_win,
        biggest_risk: aiSections.biggest_risk,
        recommendations: aiSections.recommendations
      },
      next_month_forecast: aiSections.next_month_forecast
    };

    await supabase.from('reports').insert([{ generated_by: req.user.id, type: 'weekly', content: boardPack, report_month: month, report_year: year }]);

    const pdf = buildSimplePdf(`NudgeHQ Board Pack ${month}/${year}`, [
      `Executive Summary: ${boardPack.executive_summary}`,
      `Completion Rate: ${completionRate}%`,
      `Departments: ${departmentPerformance.map(d => `${d.department} ${d.completion_rate}%`).join(', ')}`,
      `Team Health: ${blockers.length} blockers logged this month.`,
      `Biggest Win: ${boardPack.ai_highlights.biggest_win}`,
      `Biggest Risk: ${boardPack.ai_highlights.biggest_risk}`,
      `Recommendations: ${boardPack.ai_highlights.recommendations.join('; ')}`,
      `Next Month Forecast: ${boardPack.next_month_forecast}`
    ]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="nudgehq-board-pack-${year}-${month}.pdf"`);
    return res.status(200).send(pdf);
  } catch (error) {
    console.error('Board pack error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate board pack.', error: error.message });
  }
};
