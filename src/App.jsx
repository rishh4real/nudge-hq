import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Ferrofluid from './Ferrofluid'
import { fetchApi, getActiveServerPort, isBackendConnectionError, setActiveServerPort } from './lib/api'
import { formatDisplayDate, normalizeTaskStatus } from './lib/format'
import { getStoredJson } from './lib/storage'
import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  X,
  FileCheck2,
  Fingerprint,
  LayoutDashboard,
  LineChart as LineChartIcon,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound,
  Workflow,
  LogOut,
  Plus,
  AlertCircle,
  Send,
  RefreshCw,
  Download,
  User,
  ListTodo,
  Shield,
  Star,
  Search,
  Trophy,
  Zap,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

// --- CONSTANTS ---
const DEMO_AI_QUESTIONS = [
  "How should I write today's update if I'm blocked?",
  'What should I focus on first today?',
  'How do I explain a missed deadline to my manager?',
  'What makes a high quality check-in?'
]

const DASHBOARD_PATHS = {
  admin: '/dashboard/admin',
  hr: '/dashboard/hr',
  manager: '/dashboard/manager',
  employee: '/dashboard/employee',
}

const LEADER_ROLES = ['admin', 'hr', 'manager']
const PEOPLE_ROLES = ['admin', 'hr']
const OPS_ROLES = ['admin', 'manager']

const getDashboardPath = (role = 'employee') => DASHBOARD_PATHS[role] || DASHBOARD_PATHS.employee

const getRoleFromDashboardPath = (path = '') => {
  const match = Object.entries(DASHBOARD_PATHS).find(([, dashboardPath]) => dashboardPath === path)
  return match?.[0] || null
}

const DASHBOARD_SECTIONS_BY_ROLE = {
  admin: ['Dashboard', 'Tasks', 'People', 'NudgeSpace', 'Reports', 'Billing', 'Projects', 'NudgeAI', 'Integrations', 'Settings'],
  hr: ['Dashboard', 'Tasks', 'People', 'NudgeSpace', 'Reports', 'Projects', 'NudgeAI', 'Integrations', 'Settings'],
  manager: ['Dashboard', 'Tasks', 'People', 'NudgeSpace', 'Reports', 'Projects', 'NudgeAI', 'Settings'],
  employee: ['My Dashboard', 'My Tasks', 'Check-in', 'My Progress', 'Growth Portal', 'NudgeSpace', 'NudgeAI', 'Settings'],
}

const getDashboardLabel = (role) => ({
  admin: 'Admin Command Center',
  hr: 'HR People HQ',
  manager: 'Manager Team HQ',
  employee: 'Employee Workspace',
}[role] || 'Employee Workspace')

const getNudgeAiHelperIntro = (name = 'there') =>
  `Hi ${name}, I am NudgeAI. Ask me anything: work updates, coding doubts, writing, planning, ideas, or general questions.`

const getDashboardHeadline = (role) => ({
  admin: 'Run every team, role, and signal from one calm HQ.',
  hr: 'Keep company health, performance, and people signals visible.',
  manager: 'Run your department without chasing every update.',
  employee: 'Own your day without the chase.',
}[role] || 'Own your day without the chase.')

const getDashboardCopy = (role) => ({
  admin: 'Admin sees the full NudgeHQ suite: people analytics, team work, NudgeAI, billing, departments, invites, and exports.',
  hr: 'HR gets people health, burnout signals, attendance patterns, skill gaps, growth data, and reports without billing or technical settings.',
  manager: 'Managers see only their department: tasks, blockers, team updates, standups, sprint forecast, and appreciation suggestions.',
  employee: 'Check in, update tasks, protect deep work, and keep your growth story visible without messy status threads.',
}[role] || 'Check in, update tasks, protect deep work, and keep your growth story visible without messy status threads.')

const getDashboardHubName = (role) => ({
  admin: 'Admin HQ',
  hr: 'People HQ',
  manager: 'Team HQ',
  employee: 'My HQ',
}[role] || 'My HQ')

const DEMO_USERS = {
  admin: { name: 'Admin Operations', role: 'admin', email: 'admin@nudgehq.com', department_id: null },
  hr: { name: 'HR Operations', role: 'hr', email: 'hr@nudgehq.com', department_id: null },
  manager: { name: 'Sales Manager', role: 'manager', email: 'manager@nudgehq.com', department_id: 'sales-ops' },
  employee: { name: 'Kunal', role: 'employee', email: 'employee@nudgehq.com', department_id: 'sales-ops' },
}

const getDemoUserFromRole = (role = 'employee') => DEMO_USERS[role] || DEMO_USERS.employee
const getDemoUserFromEmail = (email = '') => (
  Object.values(DEMO_USERS).find((demoUser) => demoUser.email === email.trim().toLowerCase()) || DEMO_USERS.employee
)

const painPoints = [
  {
    icon: MessageSquareText,
    title: 'Updates are scattered',
    copy: 'Managers spend hours pulling status from chats, calls, and spreadsheets.',
  },
  {
    icon: Clock3,
    title: 'Delays show up late',
    copy: 'Small blockers become delivery risks because nobody sees them in time.',
  },
  {
    icon: FileCheck2,
    title: 'Reports take too long',
    copy: 'HR and ops teams rebuild the same progress summaries every week.',
  },
]

const roleFeatureCards = [
  {
    role: 'Employee',
    title: 'Own work, check-ins, and growth',
    copy: 'Employees see their tasks, submit daily progress, log blockers, use focus tools, and track their personal wins.',
    icon: User,
    accent: '#7F77DD',
    points: ['Daily check-ins', 'Assigned tasks', 'Growth portal'],
  },
  {
    role: 'Manager',
    title: 'Team execution without chasing',
    copy: 'Managers see only their department, assign work, resolve blockers, and use NudgeAI standups for their team.',
    icon: ListTodo,
    accent: '#1D9E75',
    points: ['Team task board', 'Blocker alerts', 'Sprint forecast'],
  },
  {
    role: 'HR',
    title: 'People health and performance signals',
    copy: 'HR gets company-wide people analytics, burnout signals, attendance patterns, reports, and skill-gap insights.',
    icon: ShieldCheck,
    accent: '#F59E0B',
    points: ['Burnout risk', 'Skill gaps', 'HR reports'],
  },
  {
    role: 'Admin',
    title: 'Full workspace command center',
    copy: 'Admins manage billing, invites, departments, all dashboards, exports, settings, and the full NudgeAI suite.',
    icon: LayoutDashboard,
    accent: '#3C3489',
    points: ['All roles', 'Billing', 'Company settings'],
  },
]

const platformFeatureRail = [
  ['NudgeAI summaries', Sparkles],
  ['Focus Pulse', Activity],
  ['Smart Presence', UserCheck],
  ['Deep Work Mode', Clock3],
  ['Board Pack reports', FileCheck2],
  ['Role-gated dashboards', Shield],
]

const landingReportTabs = {
  'Daily visibility': {
    eyebrow: 'NudgeHQ reports',
    title: 'Turn team signals into decisions.',
    filters: ['Department: Sales Ops', 'Status: Needs manager action'],
    stats: [['Updates today', '38'], ['Avg quality', '8.6'], ['Open blockers', '4']],
    bullets: [
      'See who updated, who is blocked, and who needs a nudge before standup.',
      'Track proof-backed tasks, update quality, and team momentum in one dashboard.',
      'Give managers a morning brief instead of making them read every message manually.',
    ],
    chartTitle: 'Weekly update quality',
    chartTag: 'This week',
    chartData: [
      { day: 'Mon', primary: 64, secondary: 34 },
      { day: 'Tue', primary: 82, secondary: 42 },
      { day: 'Wed', primary: 58, secondary: 28 },
      { day: 'Thu', primary: 72, secondary: 38 },
      { day: 'Fri', primary: 88, secondary: 46 },
      { day: 'Sat', primary: 54, secondary: 22 },
      { day: 'Sun', primary: 44, secondary: 18 },
    ],
    split: [['On track', 46, '#7F77DD'], ['Completed', 26, '#1D9E75'], ['Needs proof', 16, '#F59E0B'], ['Blocked', 12, '#EF4444']],
    splitValue: '86%',
    splitLabel: 'on track',
    impact: '42% faster blocker resolution',
    callout: '4 no-update alerts, 2 proof-required tasks, 1 blocker escalation.',
  },
  'Manager action': {
    eyebrow: 'Action center',
    title: 'Every manager gets a morning command queue.',
    filters: ['Owner: Manager', 'Priority: Today'],
    stats: [['Escalations', '3'], ['Ready nudges', '12'], ['Saved follow-ups', '5h']],
    bullets: [
      'Turn silent updates into one-click nudges before work gets delayed.',
      'Escalate blockers with context instead of starting another message thread.',
      'See the next best manager action without reading every team update.',
    ],
    chartTitle: 'Manager action volume',
    chartTag: 'Live queue',
    chartData: [
      { day: 'Mon', primary: 24, secondary: 18 },
      { day: 'Tue', primary: 36, secondary: 22 },
      { day: 'Wed', primary: 48, secondary: 30 },
      { day: 'Thu', primary: 62, secondary: 38 },
      { day: 'Fri', primary: 54, secondary: 32 },
      { day: 'Sat', primary: 28, secondary: 16 },
      { day: 'Sun', primary: 18, secondary: 10 },
    ],
    split: [['Nudge', 34, '#7F77DD'], ['Assign', 28, '#1D9E75'], ['Escalate', 24, '#F59E0B'], ['Review', 14, '#EF4444']],
    splitValue: '3',
    splitLabel: 'urgent',
    impact: '5 hours of chasing avoided',
    callout: 'Rahul missing update, Aisha proof pending, CRM blocker needs owner.',
  },
  'Proof workflows': {
    eyebrow: 'Proof layer',
    title: 'Make important work review-ready before it closes.',
    filters: ['Task type: Proof required', 'Review: Pending'],
    stats: [['Proof tasks', '18'], ['Ready review', '11'], ['Missing links', '7']],
    bullets: [
      'Require links, files, or screenshots on tasks where proof matters.',
      'Show managers what is review-ready and what still needs evidence.',
      'Reduce fake completion by making proof part of the workflow.',
    ],
    chartTitle: 'Proof completion trend',
    chartTag: 'Review flow',
    chartData: [
      { day: 'Mon', primary: 38, secondary: 18 },
      { day: 'Tue', primary: 44, secondary: 22 },
      { day: 'Wed', primary: 51, secondary: 24 },
      { day: 'Thu', primary: 63, secondary: 30 },
      { day: 'Fri', primary: 79, secondary: 36 },
      { day: 'Sat', primary: 68, secondary: 28 },
      { day: 'Sun', primary: 72, secondary: 24 },
    ],
    split: [['Approved', 42, '#1D9E75'], ['In review', 24, '#7F77DD'], ['Needs proof', 22, '#F59E0B'], ['Rejected', 12, '#EF4444']],
    splitValue: '11',
    splitLabel: 'ready',
    impact: '61% fewer unclear completions',
    callout: '2 screenshots missing, 3 links added, 1 task ready for final review.',
  },
  'Team health': {
    eyebrow: 'Team pulse',
    title: 'Spot momentum, overload, and silence early.',
    filters: ['Signal: Team health', 'Window: 7 days'],
    stats: [['Health score', '91'], ['Burnout risk', '2'], ['Momentum', '+18%']],
    bullets: [
      'Blend updates, blockers, overdue work, and quality into a calm team pulse.',
      'Help managers support people before small pressure becomes burnout.',
      'Make team rhythm visible without turning NudgeHQ into surveillance.',
    ],
    chartTitle: 'Team health rhythm',
    chartTag: '7-day pulse',
    chartData: [
      { day: 'Mon', primary: 72, secondary: 20 },
      { day: 'Tue', primary: 78, secondary: 18 },
      { day: 'Wed', primary: 74, secondary: 24 },
      { day: 'Thu', primary: 82, secondary: 16 },
      { day: 'Fri', primary: 91, secondary: 12 },
      { day: 'Sat', primary: 88, secondary: 10 },
      { day: 'Sun', primary: 84, secondary: 14 },
    ],
    split: [['Healthy', 54, '#1D9E75'], ['Focused', 24, '#7F77DD'], ['Watch', 14, '#F59E0B'], ['Risk', 8, '#EF4444']],
    splitValue: '91',
    splitLabel: 'health',
    impact: '18% better weekly momentum',
    callout: '2 overload risks, 4 strong updates, 1 team needs lighter follow-up.',
  },
}

const landingPulseCards = [
  {
    label: 'Update completion',
    value: '86%',
    accent: '#7F77DD',
    note: '+14% vs last week',
    data: [
      { day: 'Mon', value: 46 },
      { day: 'Tue', value: 58 },
      { day: 'Wed', value: 64 },
      { day: 'Thu', value: 71 },
      { day: 'Fri', value: 78 },
      { day: 'Sat', value: 83 },
      { day: 'Sun', value: 86 },
    ],
  },
  {
    label: 'Blockers resolved',
    value: '4.2x',
    accent: '#1D9E75',
    note: 'Escalations faster',
    data: [
      { day: 'Mon', value: 18 },
      { day: 'Tue', value: 24 },
      { day: 'Wed', value: 36 },
      { day: 'Thu', value: 52 },
      { day: 'Fri', value: 61 },
      { day: 'Sat', value: 74 },
      { day: 'Sun', value: 88 },
    ],
  },
  {
    label: 'Report time saved',
    value: '3 hrs',
    accent: '#F59E0B',
    note: 'Manual recap down',
    data: [
      { day: 'Mon', value: 88 },
      { day: 'Tue', value: 76 },
      { day: 'Wed', value: 64 },
      { day: 'Thu', value: 49 },
      { day: 'Fri', value: 36 },
      { day: 'Sat', value: 25 },
      { day: 'Sun', value: 18 },
    ],
  },
]

const steps = [
  {
    step: '01',
    title: 'Set teams and workflows',
    copy: 'Create departments, assign owners, and define the progress signals you want to track.',
  },
  {
    step: '02',
    title: 'Employees update fast',
    copy: 'People receive lightweight nudges and submit progress without long meetings or forms.',
  },
  {
    step: '03',
    title: 'Leaders see what changed',
    copy: 'Admins get real-time visibility into completion, blockers, and workforce momentum.',
  },
]

const pricing = [
  {
    name: 'Starter',
    priceInr: '₹2,000/month',
    priceUsd: '$9/month',
    description: 'Up to 20 employees',
    features: ['Starter free for 14 days', 'Daily check-ins', 'Task progress tracking', 'Blocker detection', 'Admin dashboard', 'Email support'],
    button: 'Get Started',
    entry: true,
  },
  {
    name: 'Growth',
    priceInr: '₹4,500/month',
    priceUsd: '$25/month',
    description: 'Up to 50 employees',
    features: ['Everything in Starter', 'WhatsApp nudges', 'NudgeAI summaries', 'Department analytics', 'Weekly reports', 'Priority support'],
    button: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Business',
    priceInr: '₹8,500/month',
    priceUsd: '$49/month',
    description: 'Up to 100 employees',
    features: ['Everything in Growth', 'Advanced role dashboards', 'Board-ready reports', 'Growth evidence views', 'Custom workflows', 'Priority onboarding'],
    button: 'Get Started',
  },
  {
    name: 'Enterprise',
    priceInr: 'Custom',
    priceUsd: 'Custom',
    description: 'Custom employee limit from 5+',
    features: ['Pick any employee limit from 5+', 'Everything in Business', 'SSO login', 'Dedicated account manager', 'Custom integrations', 'SLA options'],
    button: 'Contact Us',
    contact: true,
  },
]

const hypeSlides = [
  {
    title: 'Real-time team pulse',
    copy: 'A clean command view where leaders can see today’s work, blockers, focus, and check-ins without chasing updates.',
    stat: 'Live',
    accent: '#7F77DD',
  },
  {
    title: 'NudgeAI as the wow factor',
    copy: 'Daily briefs, sprint forecasts, burnout signals, appreciation ideas, and skill-gap insights sit inside the product.',
    stat: 'AI-first',
    accent: '#1D9E75',
  },
  {
    title: 'Four role dashboards',
    copy: 'Employee, Manager, HR, and Admin each get a separate workspace with the right controls and data boundaries.',
    stat: '4 roles',
    accent: '#3C3489',
  },
  {
    title: 'Built for Indian teams',
    copy: 'Simple onboarding, practical pricing, WhatsApp-ready thinking, and a workflow designed around fast-moving teams.',
    stat: 'India-ready',
    accent: '#F59E0B',
  },
  {
    title: 'From idea to SaaS',
    copy: 'Landing page, auth, onboarding, dashboards, backend APIs, Supabase schema, emails, and NudgeAI are coming together.',
    stat: 'Building',
    accent: '#5B7CFA',
  },
]

const whatsAppFeatureSlides = [
  {
    eyebrow: 'Daily Nudge',
    title: 'Employees get a smart WhatsApp reminder',
    stat: '5 PM',
    accent: '#1D9E75',
    chips: ['Personalized by NudgeAI', 'No app install', '1 nudge/day'],
    floating: [
      ['NudgeAI Prompt', "Hey Kunal! 6-day streak. Keep the momentum going."],
      ['Employee', 'Will update in 2 mins.'],
      ['Saved', 'Reminder logged for today']
    ],
    messages: [
      ['bot', "Hey Kunal!\n6-day streak. Keep the momentum going.\nToday's check-in → nudgehq.app", '05:00 PM'],
      ['user', 'On it. Finishing launch QA now.', '05:02 PM'],
    ],
  },
  {
    eyebrow: 'Two-way Check-in',
    title: 'Replies become daily updates automatically',
    stat: '2 mins',
    accent: '#7F77DD',
    chips: ['Reply in WhatsApp', 'Saved to dashboard', 'No duplicate work'],
    floating: [
      ['User Response', 'Completed CRM dashboard polish. Blocked on webhook test.'],
      ['Auto Saved', 'Progress update created'],
      ['Dashboard', 'Check-in marked submitted']
    ],
    messages: [
      ['bot', "Don't forget today's NudgeHQ check-in.\nTakes under 2 mins → nudgehq.app", '09:30 AM'],
      ['user', 'Completed CRM dashboard polish. Blocked on webhook test.', '09:32 AM'],
      ['bot', 'Got it Kunal. Your update has been saved to NudgeHQ.\nHave a productive day.', '09:32 AM'],
    ],
  },
  {
    eyebrow: 'Blocker Alert',
    title: 'Managers get instant WhatsApp alerts',
    stat: 'Instant',
    accent: '#EF4444',
    chips: ['Blocker reason', 'Task context', 'Manager route'],
    floating: [
      ['Blocker detected', 'Stripe webhook test is blocked'],
      ['Manager Alert', 'Resolve before standup'],
      ['No duplicate spam', 'One alert per task blocker']
    ],
    messages: [
      ['bot', "NudgeHQ Blocker Alert\n\nRahul is blocked on:\n'Stripe webhook test'\n\nReason: 'Waiting for staging keys'\n\nResolve here → nudgehq.app/dashboard/manager", '11:18 AM'],
      ['user', 'I will unblock this now.', '11:20 AM'],
    ],
  },
  {
    eyebrow: 'Weekly Wins',
    title: 'Friday summaries celebrate momentum',
    stat: 'Fri 6 PM',
    accent: '#F59E0B',
    chips: ['Tasks completed', 'Blockers resolved', 'Streak recap'],
    floating: [
      ['Weekly Win', '8 tasks completed'],
      ['NudgeAI', 'Better than last week'],
      ['Progress', 'Full report in dashboard']
    ],
    messages: [
      ['bot', "Your NudgeHQ week in review\n\n8 tasks completed\n2 blockers resolved\n7-day check-in streak\n\nBetter than last week. Keep it up.\n\nSee your full progress → nudgehq.app\n— NudgeAI", '06:00 PM'],
    ],
  },
]

const faqs = [
  {
    category: 'Basics',
    question: 'What is NudgeHQ?',
    answer: 'NudgeHQ is a B2B SaaS platform for workforce progress tracking. Teams can share check-ins, task updates, blockers, focus signals, and leadership summaries in one place.',
  },
  {
    category: 'Basics',
    question: 'Who is NudgeHQ built for?',
    answer: 'It is built for startups, HR teams, operations teams, managers, and growing Indian companies that want visibility without constantly chasing employees for updates.',
  },
  {
    category: 'NudgeAI',
    question: 'What does NudgeAI do?',
    answer: 'NudgeAI turns team updates into useful insights like daily summaries, blocker alerts, sprint forecasts, burnout signals, skill gaps, and appreciation suggestions.',
  },
  {
    category: 'Roles',
    question: 'Can managers see everyone in the company?',
    answer: 'No. Managers are designed to see only their own department. HR sees people-health signals, Admin sees everything, and Employees only see their own workspace.',
  },
  {
    category: 'Pricing',
    question: 'Is the pricing final?',
    answer: 'NudgeHQ is using early-stage launch pricing with INR for Indian teams and USD for global teams. Plans are flat monthly packages, not per-user billing, and may evolve as the product grows.',
  },
  {
    category: 'Support',
    question: 'How can I contact NudgeHQ?',
    answer: 'You can email hello.nudgehq@gmail.com, connect on Instagram at @hello.nudgehq, or follow NudgeHQ on LinkedIn.',
  },
]

const faqCategories = ['All Inquiries', 'Basics', 'NudgeAI', 'Roles', 'Pricing', 'Support']

const AUTH_INPUT_CLASS = 'block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3.5 text-sm shadow-[0_1px_0_rgba(60,52,137,0.03)] outline-none transition placeholder:text-[#A09F9A] focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]'
const STARTER_EMPLOYEE_LIMIT = 20

function PasswordField({ label, value, onChange, placeholder = 'Enter password', className = '', labelClassName = '', inputClassName = '', required = true }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={className}>
      <label className={labelClassName || 'text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]'}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`${AUTH_INPUT_CLASS} pr-12 ${inputClassName}`.trim()}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible((state) => !state)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#5F5E5A] transition hover:text-[#3C3489]"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

function LegalPage({ pageKey, setCurrentView }) {
  const page = legalPages[pageKey]

  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pageKey])

  return (
    <main className="relative isolate overflow-hidden bg-[#F8FBFF] px-5 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_8%,#DFECFF_0,transparent_30%),radial-gradient(circle_at_88%_14%,#DCF8EF_0,transparent_26%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_58%)]" />
      <div className="absolute left-1/2 top-16 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-[#EEEDFE]/70 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto max-w-5xl"
      >
        <button
          type="button"
          onClick={() => setCurrentView('landing')}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#DAD7FB] bg-white/80 px-4 py-2 text-sm font-bold text-[#3C3489] shadow-sm transition hover:bg-[#EEEDFE]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </button>

        <section className="rounded-lg border border-[#DAD7FB] bg-white/90 p-6 shadow-2xl shadow-[#3C3489]/10 backdrop-blur sm:p-10 lg:p-12">
          <div className="border-b border-[#EEEDFE] pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">{page.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-[#2C2C2A] sm:text-5xl">{page.title}</h1>
            <p className="mt-3 text-sm font-semibold text-[#5F5E5A]">{page.updated}</p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5F5E5A]">{page.intro}</p>
          </div>

          <div className="mt-8 grid gap-6">
            {page.sections.map((section, index) => (
              <article key={section.title} className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                <div className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EEEDFE] text-sm font-extrabold text-[#3C3489]">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#2C2C2A]">{section.title}</h2>
                    <p className="mt-2 leading-7 text-[#5F5E5A]">{section.body}</p>
                    {section.bullets ? (
                      <ul className="mt-4 grid gap-2">
                        {section.bullets.map((item) => (
                          <li key={item} className="flex gap-3 text-sm font-medium leading-6 text-[#5F5E5A]">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1D9E75]" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-md border border-[#DAD7FB] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-[#2C2C2A]">Need help from NudgeHQ?</p>
              <p className="mt-1 text-sm text-[#5F5E5A]">Reach our team for privacy, legal, or support questions.</p>
            </div>
            <a
              href="mailto:hello.nudgehq@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#3C3489] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7F77DD]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              hello.nudgehq@gmail.com
            </a>
          </div>
        </section>
      </motion.div>
    </main>
  )
}

function NudgeAssistant({ context, role, page, dashboardSnapshot, onAsk }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      from: 'assistant',
      text: context === 'dashboard'
        ? 'Hi, I am NudgeAI. Ask me about this dashboard, or ask any general question: writing, planning, coding, ideas, explanations, anything.'
        : 'Hi, I am NudgeAI. Ask me anything: NudgeHQ, writing, planning, coding, ideas, or quick explanations.',
    },
  ])
  const [loading, setLoading] = useState(false)

  const submitQuestion = async (question = input) => {
    const clean = question.trim()
    if (!clean || loading) return

    setMessages((items) => [...items, { from: 'user', text: clean }])
    setInput('')
    setLoading(true)

    try {
      const answer = await onAsk({ message: clean, context, role, page, dashboard_snapshot: dashboardSnapshot })
      setMessages((items) => [...items, { from: 'assistant', text: answer }])
    } catch {
      setMessages((items) => [
        ...items,
        {
          from: 'assistant',
          text: 'NudgeAI is unavailable right now. Try again in a moment.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = context === 'dashboard'
    ? ['What should I do next?', "Draft today's update", 'Explain any topic simply']
    : ['What is NudgeHQ?', 'Write a short email', 'Explain any topic simply']

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-2xl border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/20"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-[#3C3489] via-[#7F77DD] to-[#1D9E75] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-extrabold">NudgeAI Assistant</p>
                  <p className="text-[11px] font-medium text-white/75">{context === 'dashboard' ? `${role || 'workspace'} dashboard` : 'Product guide'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Close NudgeAI assistant"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto bg-[#FCFCFF] p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.from}-${index}-${message.text.slice(0, 12)}`}
                  className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.from === 'user'
                      ? 'ml-8 bg-[#3C3489] text-white'
                      : 'mr-8 border border-[#EEEDFE] bg-white text-[#2C2C2A]'
                  }`}
                >
                  {message.text}
                </div>
              ))}
              {loading ? (
                <div className="mr-8 inline-flex items-center gap-2 rounded-2xl border border-[#EEEDFE] bg-white px-4 py-3 text-sm font-semibold text-[#5F5E5A]">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#7F77DD]" aria-hidden="true" />
                  NudgeAI is thinking...
                </div>
              ) : null}
            </div>

            <div className="border-t border-[#EEEDFE] bg-white p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitQuestion(prompt)}
                    className="rounded-full border border-[#EEEDFE] bg-[#FCFCFF] px-3 py-1.5 text-[11px] font-bold text-[#3C3489] transition hover:border-[#DAD7FB] hover:bg-[#EEEDFE]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  submitQuestion()
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="min-w-0 flex-1 rounded-full border border-[#DAD7FB] px-4 py-2.5 text-sm outline-none transition focus:border-[#7F77DD]"
                  placeholder="Ask NudgeAI..."
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3C3489] text-white transition hover:bg-[#7F77DD] disabled:opacity-45"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((state) => !state)}
        className="nudgeai-pulse-button group flex items-center gap-3 rounded-full bg-[#111827] px-5 py-4 text-sm font-extrabold text-white shadow-2xl shadow-[#111827]/25 transition hover:-translate-y-0.5 hover:bg-[#3C3489]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#8DE4C3]">
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
        </span>
        Ask NudgeAI
      </button>
    </div>
  )
}

function FullPageNudgeAi({ onAsk, setCurrentView }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: 'assistant',
      text: 'Hi, I am NudgeAI. Ask me anything. I can help with NudgeHQ, writing, planning, coding, explanations, ideas, or whatever you are working through.',
    },
  ])

  const prompts = [
    'What is NudgeHQ?',
    'Write a polite follow-up email',
    'Explain AI in simple words',
    'Plan my next 2 hours of work',
    'Help me debug a React issue',
    'Give me startup launch ideas',
  ]

  const submitQuestion = async (question = input) => {
    const clean = question.trim()
    if (!clean || loading) return

    setMessages((items) => [...items, { from: 'user', text: clean }])
    setInput('')
    setLoading(true)

    try {
      const answer = await onAsk({
        message: clean,
        context: 'public_nudgeai',
        role: 'visitor',
        page: 'nudgeai',
      })
      setMessages((items) => [...items, { from: 'assistant', text: answer }])
    } catch {
      setMessages((items) => [
        ...items,
        { from: 'assistant', text: 'NudgeAI is unavailable right now. Please try again in a moment.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#F7FAFF] px-5 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#EEF4FF_0%,#FFFFFF_46%,#EAF8F2_100%)]" />
      <div className="soft-grid absolute inset-0 -z-10 opacity-30" />
      <div className="mx-auto grid min-h-[calc(100svh-9rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/12 lg:grid-cols-[18rem_1fr]">
        <aside className="border-b border-[#EEEDFE] bg-[#FCFCFF] p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-md shadow-[#3C3489]/10" />
            <div>
              <p className="text-lg font-extrabold text-[#2C2C2A]">NudgeAI</p>
              <p className="text-xs font-semibold text-[#5F5E5A]">General AI helper</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back to NudgeHQ
          </button>

          <div className="mt-6 rounded-2xl bg-[#161238] p-4 text-white">
            <p className="text-xs font-extrabold uppercase tracking-wider text-white/55">Can answer</p>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-white/80">
              <span>Anything</span>
              <span>Writing</span>
              <span>Coding</span>
              <span>Planning</span>
              <span>NudgeAI</span>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[42rem] flex-col">
          <div className="border-b border-[#EEEDFE] px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#EEEDFE] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3C3489]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Instant answers
                </span>
                <h1 className="mt-3 text-3xl font-extrabold text-[#1E2737] sm:text-4xl">Ask NudgeAI anything.</h1>
              </div>
              <a href="mailto:hello.nudgehq@gmail.com" className="inline-flex items-center gap-2 rounded-2xl bg-[#E8F7F1] px-4 py-3 text-sm font-extrabold text-[#1D9E75] transition hover:bg-[#DDF3EA]">
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                Need human help?
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitQuestion(prompt)}
                  className="rounded-full border border-[#DAD7FB] bg-white px-3 py-1.5 text-xs font-bold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#FCFCFF] px-5 py-6 sm:px-7">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}-${message.text.slice(0, 12)}`}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl rounded-[1.35rem] px-5 py-4 text-sm leading-7 shadow-sm ${
                  message.from === 'user'
                    ? 'bg-[#3C3489] text-white'
                    : 'border border-[#EEEDFE] bg-white text-[#2C2C2A]'
                }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-[1.35rem] border border-[#EEEDFE] bg-white px-5 py-4 text-sm font-semibold text-[#5F5E5A] shadow-sm">
                <RefreshCw className="h-4 w-4 animate-spin text-[#7F77DD]" aria-hidden="true" />
                NudgeAI is thinking...
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              submitQuestion()
            }}
            className="border-t border-[#EEEDFE] bg-white p-4 sm:p-5"
          >
            <div className="mx-auto flex max-w-4xl gap-3 rounded-[1.5rem] border border-[#DAD7FB] bg-[#FCFCFF] p-2 shadow-lg shadow-[#3C3489]/8">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                placeholder="Ask anything..."
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3C3489] text-white transition hover:bg-[#7F77DD] disabled:opacity-45"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

const badges = [
  {
    title: 'Encrypted data',
    copy: 'Progress and workforce records stay protected in transit and at rest.',
    icon: LockKeyhole,
  },
  {
    title: 'Role-based access',
    copy: 'Admins, HR, managers, and employees see only the views they need.',
    icon: Fingerprint,
  },
  {
    title: 'Audit-ready logs',
    copy: 'Important updates and admin actions are structured for review.',
    icon: ShieldCheck,
  },
  {
    title: 'Secure exports',
    copy: 'Reports can be shared without exposing unnecessary team data.',
    icon: FileCheck2,
  },
]

const aiSummaryItems = [
  ['12 tasks completed', 'Completed', '#1D9E75'],
  ['2 blockers detected', 'Needs review', '#EF4444'],
  ['3 delayed check-ins', 'Follow up', '#F59E0B'],
]

const trustSignals = [
  ['Workspace signup ready', Sparkles],
  ['Team onboarding flows', UsersRound],
  ['HR-friendly workflows', ClipboardCheck],
  ['AI-powered summaries', Activity],
]

const sampleTeams = ['Field teams', 'HR teams', 'Ops teams', 'Support teams', 'Sales teams']

const whyNudgePoints = [
  'Replaces manual follow-ups with one shared progress system.',
  'Helps HR and managers spot blockers before they become missed deadlines.',
  'Gives employees a simple way to share work without long meetings.',
  'Turns daily updates into admin dashboards, reports, and NudgeAI summaries.',
  'Keeps company communication structured across teams, departments, and roles.',
  'Creates a cleaner operating rhythm for founders, HR teams, and managers.',
]

const productScenarios = [
  {
    eyebrow: 'Use case',
    title: 'Field teams report progress before managers ask.',
    copy: 'Daily updates, blockers, and missed check-ins roll into one clean operating view for distributed teams.',
    cta: 'Explore field workflows',
    metric: '42%',
    metricLabel: 'faster status reviews',
    accent: '#1D9E75',
    quote: 'A manager can see who is moving, who is blocked, and who needs a quick follow-up without chasing everyone manually.',
    author: 'Example workflow',
    role: 'For distributed operations',
    visualTitle: 'Field Ops Pulse',
    visualRows: ['North zone check-ins', '2 delayed site updates', '1 blocker escalated'],
  },
  {
    eyebrow: 'Team momentum',
    title: 'Weekly review meetings start with answers, not hunting.',
    copy: 'NudgeAI highlights completed work and risk signals so HR and managers can focus on decisions.',
    cta: 'See NudgeAI summaries',
    metric: '30 hrs',
    metricLabel: 'saved every week',
    accent: '#7F77DD',
    quote: 'The summary view is designed to make progress visible without asking every employee for the same update again.',
    author: 'Example workflow',
    role: 'For HR and team leads',
    visualTitle: 'NudgeAI Brief',
    visualRows: ['18 tasks completed', '4 updates need review', '3 blockers detected'],
  },
  {
    eyebrow: 'Admin control',
    title: 'Leaders get clean exports when they need proof.',
    copy: 'Structured task, blocker, and department data can be exported for audits, reviews, and ops reporting.',
    cta: 'Review admin tools',
    metric: '1 click',
    metricLabel: 'operational export',
    accent: '#F59E0B',
    quote: 'The admin view is built to turn scattered task updates into a report-ready dataset for leadership reviews.',
    author: 'Example workflow',
    role: 'For admins and founders',
    visualTitle: 'Report Builder',
    visualRows: ['Active assignees mapped', 'Blockers grouped by team', 'JSON export ready'],
  },
]

const legalPages = {
  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'Privacy Policy - NudgeHQ',
    updated: 'Last Updated: May 2026',
    intro: 'NudgeHQ values the privacy and security of all users and organizations using our platform. This Privacy Policy explains how we collect, use, and protect information shared with us.',
    sections: [
      {
        title: 'Information We Collect',
        body: 'We may collect:',
        bullets: [
          'Name, email address, and company information',
          'Employee task updates and work progress data',
          'Uploaded files, screenshots, and attachments',
          'Usage analytics and platform activity',
        ],
      },
      {
        title: 'How We Use Information',
        body: 'We use collected data to:',
        bullets: [
          'Provide workforce tracking services',
          'Generate reports and analytics',
          'Improve platform performance and user experience',
          'Enable AI-powered summaries and insights',
          'Maintain platform security',
        ],
      },
      {
        title: 'Data Security',
        body: 'NudgeHQ uses industry-standard security practices including:',
        bullets: [
          'Encrypted data transmission',
          'Secure authentication systems',
          'Role-based access control',
          'Protected cloud infrastructure',
        ],
      },
      {
        title: 'Data Sharing',
        body: 'We do not sell or share company or employee data with third parties for advertising or marketing purposes.',
      },
      {
        title: 'User Access & Control',
        body: 'Organizations can request:',
        bullets: [
          'Data correction',
          'Account deletion',
          'Full removal of company data',
        ],
      },
      {
        title: 'Third-Party Services',
        body: 'NudgeHQ may use trusted third-party services such as Supabase, Vercel, Railway, and AI APIs to operate the platform securely.',
      },
      {
        title: 'Changes to This Policy',
        body: 'We may update this Privacy Policy as the platform evolves.',
      },
      {
        title: 'Contact',
        body: 'For questions regarding privacy or data protection, email hello.nudgehq@gmail.com.',
      },
    ],
  },
  terms: {
    eyebrow: 'Terms & Conditions',
    title: 'Terms & Conditions - NudgeHQ',
    updated: 'Last Updated: May 2026',
    intro: 'By accessing or using NudgeHQ, you agree to the following terms and conditions.',
    sections: [
      {
        title: 'Platform Usage',
        body: 'NudgeHQ provides workforce tracking, productivity monitoring, reporting, and collaboration tools for organizations and teams.',
      },
      {
        title: 'User Responsibilities',
        body: 'Users agree:',
        bullets: [
          'To provide accurate information',
          'Not to misuse the platform',
          'Not to attempt unauthorized access',
          'Not to upload harmful or illegal content',
        ],
      },
      {
        title: 'Account Security',
        body: 'Users are responsible for maintaining the security of their accounts and login credentials.',
      },
      {
        title: 'Beta Platform Disclaimer',
        body: 'NudgeHQ is currently under active development. Some features may change, improve, or become temporarily unavailable during testing phases.',
      },
      {
        title: 'Data & Content',
        body: 'Organizations retain ownership of their internal data uploaded to the platform.',
      },
      {
        title: 'Service Availability',
        body: 'We aim to provide reliable services but do not guarantee uninterrupted platform availability during early-stage development.',
      },
      {
        title: 'Limitation of Liability',
        body: 'NudgeHQ is not liable for indirect losses, data interruptions, or issues caused by third-party integrations or services.',
      },
      {
        title: 'Termination',
        body: 'We reserve the right to suspend accounts involved in misuse, abuse, or violations of these terms.',
      },
      {
        title: 'Changes to Terms',
        body: 'These Terms may be updated as the platform grows and evolves.',
      },
      {
        title: 'Contact',
        body: 'For support or legal inquiries, email hello.nudgehq@gmail.com.',
      },
    ],
  },
}

const formatRelativeTime = (value) => {
  if (!value) return 'No update yet';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return 'No update yet';
  const diffMinutes = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

const getTaskStatusMeta = (status = '') => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed') {
    return { label: 'Completed', progress: 100, color: '#1D9E75', tone: 'green', className: 'bg-[#E8F7F1] text-[#1D9E75]' };
  }
  if (normalized === 'blocked') {
    return { label: 'Blocked', progress: 25, color: '#EF4444', tone: 'red', className: 'bg-rose-50 text-rose-600' };
  }
  if (normalized === 'in_progress') {
    return { label: 'In Progress', progress: 68, color: '#7F77DD', tone: 'orange', className: 'bg-[#EEEDFE] text-[#3C3489]' };
  }
  return { label: 'Not Started', progress: 12, color: '#8A8894', tone: 'neutral', className: 'bg-[#F4F4F5] text-[#5F5E5A]' };
}

const cardMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

const getInitialView = () => {
  const path = window.location.pathname;
  const storedToken = window.localStorage.getItem('nudgehq_auth_token');
  if (path === '/blog') return 'blog';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  if (path === '/contact') return 'contact';
  if (path === '/faq') return 'faq';
  if (path === '/why-nudgehq') return 'why_nudgehq';
  if (path === '/nudgeai') return 'nudgeai';
  if (path === '/verify-email') return 'verify_email';
  if (path === '/choose-plan') return 'choose_plan';
  if (path === '/payment') return 'payment';
  if (path === '/onboarding') return 'onboarding';
  if (path.startsWith('/join/')) return 'join_workspace';
  if (path === '/forgot-password') return 'forgot_password';
  if (path === '/reset-password') return 'reset_password';
  if (path === '/oauth/callback') return 'oauth_callback';
  if (path === '/accept-invite' || path === '/set-password') return 'accept_invite';
  if (path === '/signup') return 'signup';
  if (path === '/login' || path === '/signin') return 'signin';
  if (path === '/dashboard' || Object.values(DASHBOARD_PATHS).includes(path)) return storedToken ? 'dashboard' : 'signin';
  if (path === '/demo') return 'demo_console';
  return 'landing';
}

// --- MAIN APPLICATION ---
function App() {
  const [currentView, setCurrentView] = useState(getInitialView)
  const [queryParams, setQueryParams] = useState(new URLSearchParams(window.location.search))
  const [authRole, setAuthRole] = useState(() => window.localStorage.getItem('nudgehq_auth_role') || null) // 'admin' | 'hr' | 'manager' | 'employee'
  const [user, setUser] = useState(() => getStoredJson('nudgehq_auth_user', null))
  const [token, setToken] = useState(() => window.localStorage.getItem('nudgehq_auth_token') || null)
  
  // Active Connection Metadata
  const [serverPort, setServerPort] = useState(null)
  const [isSandbox, setIsSandbox] = useState(() => window.localStorage.getItem('nudgehq_auth_token') === 'sandbox-token-jwt')
  const [statusMessage, setStatusMessage] = useState(null)
  const [cookieConsent, setCookieConsent] = useState(() => window.localStorage.getItem('nudgehq_cookie_consent') || '')
  const [activeLandingReportTab, setActiveLandingReportTab] = useState('Daily visibility')
  const [activeManagerFocusTab, setActiveManagerFocusTab] = useState('Daily Signals')
  const [mobilePhoneTilt, setMobilePhoneTilt] = useState({ x: 5, y: -14 })
  const [activeMobileTab, setActiveMobileTab] = useState('Pulse')
  const [mobileTasks, setMobileTasks] = useState([
    { id: 1, title: 'Draft release notes', done: true },
    { id: 2, title: 'Review login flow', done: false },
    { id: 3, title: 'Fix dashboard UI', done: false }
  ])
  const [mobileAiConversations, setMobileAiConversations] = useState([
    { sender: 'AI', text: "Hey Kunal! Rahul has been inactive for 4 hours. Should we nudge him?" }
  ])
  const [whatsappTilt, setWhatsappTilt] = useState({ x: -5, y: 12 })
  const [activeWhatsAppSlide, setActiveWhatsAppSlide] = useState(0)

  const [demoEmployeeSection, setDemoEmployeeSection] = useState('My Dashboard')
  const [demoNudgeSpaceView, setDemoNudgeSpaceView] = useState('Social')
  const [nudgeSpacePosts, setNudgeSpacePosts] = useState([])
  const [nudgeSpaceLoading, setNudgeSpaceLoading] = useState(false)
  const [nudgeSpaceSaving, setNudgeSpaceSaving] = useState(false)
  const [nudgeSpaceDraft, setNudgeSpaceDraft] = useState('')
  const [nudgeSpacePostType, setNudgeSpacePostType] = useState('status')
  const [selectedDemoTask, setSelectedDemoTask] = useState(null)
  const [expandedManagerActivity, setExpandedManagerActivity] = useState(null)
  const [demoTaskUpdate, setDemoTaskUpdate] = useState('')
  const [demoProofLink, setDemoProofLink] = useState('')
  const [demoProofFiles, setDemoProofFiles] = useState([])
  const [demoTaskOverrides, setDemoTaskOverrides] = useState({})
  const [demoCheckinLocation, setDemoCheckinLocation] = useState('Office')
  const [managerProjects, setManagerProjects] = useState(() => {
    const seededDemoIds = new Set(['proj-sales-revival', 'proj-proof-cleanup', 'proj-whatsapp-nudges']);
    return getStoredJson('nudgehq_manager_projects', []).filter((project) => !seededDemoIds.has(project?.id));
  })
  const [managerProjectDraft, setManagerProjectDraft] = useState({
    name: '',
    owner: '',
    status: 'Planned',
    progress: 25,
    due: '',
    summary: '',
    priority: 'Medium'
  })
  const [editingManagerProjectId, setEditingManagerProjectId] = useState(null)
  const [demoAiQuestionIndex, setDemoAiQuestionIndex] = useState(0)
  const [demoAiHelperOpen, setDemoAiHelperOpen] = useState(false)
  const [demoAiHelperInput, setDemoAiHelperInput] = useState('')
  const [demoAiHelperLoading, setDemoAiHelperLoading] = useState(false)
  const [demoAiHelperMessages, setDemoAiHelperMessages] = useState([
    {
      from: 'assistant',
      text: getNudgeAiHelperIntro(),
    },
  ])
  const [demoProfileName, setDemoProfileName] = useState('Kunal')
  const [demoProfileEmail, setDemoProfileEmail] = useState('employee@nudgehq.com')
  const [demoProfileAvatar, setDemoProfileAvatar] = useState('')

  // Sign-in States
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [signupCompany, setSignupCompany] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [signupAgree, setSignupAgree] = useState(false)
  const [signupError, setSignupError] = useState(null)
  const [signupLoading, setSignupLoading] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactType, setContactType] = useState('Product demo')
  const [contactMessage, setContactMessage] = useState('')
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [feedbackCommentName, setFeedbackCommentName] = useState('')
  const [feedbackCommentText, setFeedbackCommentText] = useState('')
  const [feedbackCategory, setFeedbackCategory] = useState('Product feedback')
  const [integrationRequestTitle, setIntegrationRequestTitle] = useState('')
  const [integrationRequestDetails, setIntegrationRequestDetails] = useState('')
  const [integrationRequests, setIntegrationRequests] = useState(() => {
    try {
      const savedRequests = JSON.parse(window.localStorage.getItem('nudgehq_integration_requests') || '[]')
      return Array.isArray(savedRequests) ? savedRequests : []
    } catch {
      return []
    }
  })
  const [feedbackComments, setFeedbackComments] = useState(() => {
    try {
      const savedComments = JSON.parse(window.localStorage.getItem('nudgehq_early_feedback_comments') || '[]')
      return Array.isArray(savedComments) ? savedComments : []
    } catch {
      return []
    }
  })
  const [faqSearch, setFaqSearch] = useState('')
  const [faqCategory, setFaqCategory] = useState('All Inquiries')
  const [verificationEmail, setVerificationEmail] = useState(() => window.localStorage.getItem('nudgehq_pending_email') || '')
  const [selectedPlan, setSelectedPlan] = useState(() => window.localStorage.getItem('nudgehq_selected_plan') || '')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [companyDetails, setCompanyDetails] = useState({ name: '', logo_url: '', industry: 'Tech', size: '1-10', country: 'India', city: '' })
  const [companyIndustryOther, setCompanyIndustryOther] = useState('')
  const [onboardingDepartments, setOnboardingDepartments] = useState([{ name: '', description: '' }])
  const [inviteEmployees, setInviteEmployees] = useState([{ name: '', email: '', phone_number: '', department: '', role: 'employee' }])
  const [csvPreview, setCsvPreview] = useState([])
  const [magicInviteLink, setMagicInviteLink] = useState('')
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const filledManualInviteCount = inviteEmployees.filter((employee) => employee.email).length
  const usedInviteSlots = inviteEmployees.length + csvPreview.length
  const totalInviteCount = filledManualInviteCount + csvPreview.length
  const visibleInviteEmployees = inviteEmployees.slice(0, Math.max(STARTER_EMPLOYEE_LIMIT - csvPreview.length, 0))
  const canAddInviteEmployee = usedInviteSlots < STARTER_EMPLOYEE_LIMIT
  const activeLandingReport = landingReportTabs[activeLandingReportTab] || landingReportTabs['Daily visibility']
  const activeLandingSplitGradient = activeLandingReport.split.reduce((gradient, [, value, color], index) => {
    const start = activeLandingReport.split.slice(0, index).reduce((sum, [, segmentValue]) => sum + segmentValue, 0)
    const end = start + value
    return `${gradient}${index ? ', ' : ''}${color} ${start}% ${end}%`
  }, '')

  useEffect(() => {
    if (token) window.localStorage.setItem('nudgehq_auth_token', token);
    else window.localStorage.removeItem('nudgehq_auth_token');
  }, [token])

  useEffect(() => {
    if (user) window.localStorage.setItem('nudgehq_auth_user', JSON.stringify(user));
    else window.localStorage.removeItem('nudgehq_auth_user');
  }, [user])

  useEffect(() => {
    if (authRole) window.localStorage.setItem('nudgehq_auth_role', authRole);
    else window.localStorage.removeItem('nudgehq_auth_role');
  }, [authRole])

  useEffect(() => {
    window.localStorage.setItem('nudgehq_early_feedback_comments', JSON.stringify(feedbackComments.slice(0, 8)))
  }, [feedbackComments])

  useEffect(() => {
    window.localStorage.setItem('nudgehq_integration_requests', JSON.stringify(integrationRequests.slice(0, 10)))
  }, [integrationRequests])

  useEffect(() => {
    window.localStorage.setItem('nudgehq_manager_projects', JSON.stringify(managerProjects))
  }, [managerProjects])

  const acceptCookieConsent = (choice = 'accepted') => {
    window.localStorage.setItem('nudgehq_cookie_consent', choice);
    setCookieConsent(choice);
  };

  const resetManagerProjectDraft = () => {
    setManagerProjectDraft({
      name: '',
      owner: '',
      status: 'Planned',
      progress: 25,
      due: '',
      summary: '',
      priority: 'Medium'
    });
    setEditingManagerProjectId(null);
  };

  const handleManagerProjectDraftChange = (field, value) => {
    setManagerProjectDraft((current) => ({ ...current, [field]: field === 'progress' ? Number(value) : value }));
  };

  const loadWorkspaceOpsData = async (activeDashboardRole = dashboardRole) => {
    if (isSandbox || !token || !LEADER_ROLES.includes(activeDashboardRole)) return;

    const roleScope = ['admin', 'hr', 'manager'].includes(activeDashboardRole) ? activeDashboardRole : 'manager';
    try {
      const { data: projectRes } = await fetchApi(`/admin/projects?role_scope=${roleScope}`, { method: 'GET' }, token);
      setManagerProjects(projectRes.projects || []);
    } catch (error) {
      if (error.status !== 503) showToast(error.message || 'Could not load workspace projects.', 'error');
    }

    if (['admin', 'hr'].includes(activeDashboardRole)) {
      try {
        const { data: integrationRes } = await fetchApi('/admin/integration-requests', { method: 'GET' }, token);
        setIntegrationRequests(integrationRes.requests || []);
      } catch (error) {
        if (error.status !== 503) showToast(error.message || 'Could not load integration requests.', 'error');
      }
    }

    try {
      const { data: feedbackRes } = await fetchApi('/admin/feedback', { method: 'GET' }, token);
      setFeedbackComments(feedbackRes.feedback || []);
    } catch (error) {
      if (error.status !== 503) showToast(error.message || 'Could not load feedback.', 'error');
    }
  };

  const handleSaveManagerProject = async (event) => {
    event.preventDefault();
    if (!managerProjectDraft.name.trim()) {
      showToast('Project name is required.', 'error');
      return;
    }

    const normalizedProject = {
      id: editingManagerProjectId || `proj-${Date.now()}`,
      name: managerProjectDraft.name.trim(),
      owner: managerProjectDraft.owner.trim() || (dashboardRole === 'admin' ? 'Admin' : dashboardRole === 'hr' ? 'HR' : 'Manager'),
      status: managerProjectDraft.status,
      progress: Number(managerProjectDraft.progress) || 0,
      due: managerProjectDraft.due.trim() || 'No date',
      summary: managerProjectDraft.summary.trim() || 'No project summary added yet.',
      priority: managerProjectDraft.priority,
      role_scope: dashboardRole === 'admin' ? 'admin' : dashboardRole === 'hr' ? 'hr' : 'manager'
    };

    if (!isSandbox && token) {
      try {
        const { data } = await fetchApi(editingManagerProjectId ? `/admin/projects/${editingManagerProjectId}` : '/admin/projects', {
          method: editingManagerProjectId ? 'PUT' : 'POST',
          body: JSON.stringify(normalizedProject)
        }, token);
        const savedProject = data.project || normalizedProject;
        setManagerProjects((current) => (
          editingManagerProjectId
            ? current.map((project) => project.id === editingManagerProjectId ? savedProject : project)
            : [savedProject, ...current]
        ));
        showToast(data.message || (editingManagerProjectId ? 'Project updated.' : 'Project created.'), 'success');
        resetManagerProjectDraft();
        return;
      } catch (error) {
        if (error.status !== 503) {
          showToast(error.message || 'Could not save project.', 'error');
          return;
        }
        showToast('Project saved locally. Run the latest database schema to enable cloud sync.', 'info');
      }
    }

    setManagerProjects((current) => (
      editingManagerProjectId
        ? current.map((project) => project.id === editingManagerProjectId ? normalizedProject : project)
        : [normalizedProject, ...current]
    ));

    showToast(editingManagerProjectId ? 'Project updated.' : 'Project created.', 'success');
    resetManagerProjectDraft();
  };

  const handleEditManagerProject = (project) => {
    setEditingManagerProjectId(project.id);
    setManagerProjectDraft({
      name: project.name,
      owner: project.owner,
      status: project.status,
      progress: project.progress,
      due: project.due,
      summary: project.summary,
      priority: project.priority
    });
  };

  const handleDeleteManagerProject = async (projectId) => {
    if (!isSandbox && token && !String(projectId).startsWith('proj-')) {
      try {
        await fetchApi(`/admin/projects/${projectId}`, { method: 'DELETE' }, token);
      } catch (error) {
        if (error.status !== 503) {
          showToast(error.message || 'Could not delete project.', 'error');
          return;
        }
        showToast('Project removed locally. Run the latest database schema to enable cloud sync.', 'info');
      }
    }
    setManagerProjects((current) => current.filter((project) => project.id !== projectId));
    if (editingManagerProjectId === projectId) resetManagerProjectDraft();
    showToast('Project removed.', 'success');
  };

  const clearAuthSession = () => {
    setUser(null);
    setToken(null);
    setAuthRole(null);
    setIsSandbox(false);
    window.localStorage.removeItem('nudgehq_auth_token');
    window.localStorage.removeItem('nudgehq_auth_user');
    window.localStorage.removeItem('nudgehq_auth_role');
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDemoAiQuestionIndex((index) => (index + 1) % DEMO_AI_QUESTIONS.length)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash?.slice(1)
      if (!hash) return
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }

    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [currentView])

  // --- DASHBOARD DATA STATES ---
  // Employee Workspace
  const [empStats, setEmpStats] = useState(null)
  const [empTasks, setEmpTasks] = useState([])
  const [empHistory, setEmpHistory] = useState([])
  const [progressText, setProgressText] = useState('')
  const [proofLink, setProofLink] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)
  const [focusText, setFocusText] = useState('')
  const [focusEta, setFocusEta] = useState('today')
  const [workLocation, setWorkLocation] = useState('')
  const [goals, setGoals] = useState(['', '', ''])
  const [energyLevel, setEnergyLevel] = useState('')
  const [deepWorkFocus, setDeepWorkFocus] = useState('')
  const [deepWorkDuration, setDeepWorkDuration] = useState(60)
  const [activeDeepWork, setActiveDeepWork] = useState(null)
  const [deepWorkOutput, setDeepWorkOutput] = useState('')
  const [growthSummary, setGrowthSummary] = useState(null)
  const [growthLoading, setGrowthLoading] = useState(false)

  // Blocker text mapping for status update modal
  const [activeBlockTask, setActiveBlockTask] = useState(null)
  const [blockerTextVal, setBlockerTextVal] = useState('')

  // Admin Workspace
  const [analytics, setAnalytics] = useState(null)
  const [allUpdates, setAllUpdates] = useState([])
  const [departments, setDepartments] = useState([])
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptDesc, setNewDeptDesc] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [adminUsers, setAdminUsers] = useState([]) // List of employees for task assignment
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteRole, setInviteRole] = useState('employee')
  const [inviteDepartmentId, setInviteDepartmentId] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)
  const [teamFocus, setTeamFocus] = useState([])
  const [focusInsight, setFocusInsight] = useState('')
  const [teamPresence, setTeamPresence] = useState([])
  const [presenceInsight, setPresenceInsight] = useState('')
  const [deepWorkTeam, setDeepWorkTeam] = useState(null)
  const [boardPackLoading, setBoardPackLoading] = useState(false)
  const [whatsappNudgeLoading, setWhatsappNudgeLoading] = useState(false)
  const [whatsappPreviewOpen, setWhatsappPreviewOpen] = useState(false)
  const [whatsappPreviewEmployees, setWhatsappPreviewEmployees] = useState([])
  const [selectedWhatsAppEmployees, setSelectedWhatsAppEmployees] = useState([])

  // AI Summary Results
  const [aiReportType, setAiReportType] = useState(null) // 'summary' | 'delays' | 'inactivity'
  const [aiReportContent, setAiReportContent] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [nudgeAiData, setNudgeAiData] = useState({})
  const [nudgeAiLoading, setNudgeAiLoading] = useState({})
  const [qualityTip, setQualityTip] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [activeStory, setActiveStory] = useState(0)

  // --- EFFECTS ---
  // Check active server port on mount
  useEffect(() => {
    const probeServer = async () => {
      const ports = [5000, 5001];
      for (const port of ports) {
        try {
          const res = await fetch(`http://localhost:${port}/health`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'healthy') {
              setActiveServerPort(port);
              setServerPort(port);
              setIsSandbox(false);
              return;
            }
          }
        } catch {
          // ignore error and check next port
        }
      }
      console.warn('Backend server not detected. Live API calls will be unavailable until the server starts.');
      setServerPort(null);
      if (window.localStorage.getItem('nudgehq_auth_token') === 'sandbox-token-jwt') {
        setIsSandbox(true);
        setMockData();
      } else {
        setIsSandbox(false);
      }
    };
    probeServer();
  }, []);

  // URL routing synchronization (listening to back/forward and initial path)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      setQueryParams(params);
      
      if (path === '/blog') {
        setCurrentView('blog');
      } else if (path === '/privacy') {
        setCurrentView('privacy');
      } else if (path === '/terms') {
        setCurrentView('terms');
      } else if (path === '/contact') {
        setCurrentView('contact');
      } else if (path === '/faq') {
        setCurrentView('faq');
      } else if (path === '/why-nudgehq') {
        setCurrentView('why_nudgehq');
      } else if (path === '/nudgeai') {
        setCurrentView('nudgeai');
      } else if (path === '/verify-email') {
        setCurrentView('verify_email');
      } else if (path === '/choose-plan') {
        setCurrentView('choose_plan');
      } else if (path === '/payment') {
        setCurrentView('payment');
      } else if (path === '/onboarding') {
        setCurrentView('onboarding');
      } else if (path.startsWith('/join/')) {
        setCurrentView('join_workspace');
      } else if (path === '/forgot-password') {
        setCurrentView('forgot_password');
      } else if (path === '/reset-password') {
        setCurrentView('reset_password');
      } else if (path === '/oauth/callback') {
        setCurrentView('oauth_callback');
      } else if (path === '/accept-invite' || path === '/set-password') {
        setCurrentView('accept_invite');
      } else if (path === '/signup') {
        setCurrentView('signup');
      } else if (path === '/login' || path === '/signin') {
        setCurrentView('signin');
      } else if (path === '/dashboard' || Object.values(DASHBOARD_PATHS).includes(path)) {
        if (token) {
          const pathRole = getRoleFromDashboardPath(path);
          if (pathRole) setAuthRole(pathRole);
          setCurrentView('dashboard');
        } else {
          window.history.replaceState({}, '', '/login');
          setCurrentView('signin');
        }
      } else if (path === '/demo') {
        setCurrentView('demo_console');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();

    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [token]);

  // Sync browser path with react view state changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    let targetPath = '/';
    
    if (currentView === 'landing') targetPath = '/';
    else if (currentView === 'blog') targetPath = '/blog';
    else if (currentView === 'privacy') targetPath = '/privacy';
    else if (currentView === 'terms') targetPath = '/terms';
    else if (currentView === 'contact') targetPath = '/contact';
    else if (currentView === 'faq') targetPath = '/faq';
    else if (currentView === 'why_nudgehq') targetPath = '/why-nudgehq';
    else if (currentView === 'nudgeai') targetPath = '/nudgeai';
    else if (currentView === 'signin') targetPath = '/login';
    else if (currentView === 'signup') targetPath = '/signup';
    else if (currentView === 'choose_plan') targetPath = '/choose-plan';
    else if (currentView === 'payment') targetPath = '/payment';
    else if (currentView === 'onboarding') targetPath = '/onboarding';
    else if (currentView === 'join_workspace') targetPath = currentPath.startsWith('/join/') ? currentPath : '/join';
    else if (currentView === 'demo_console') targetPath = '/demo';
    else if (currentView === 'dashboard') {
      const pathRole = getRoleFromDashboardPath(currentPath);
      targetPath = pathRole ? currentPath : getDashboardPath(user?.role || authRole || 'employee');
    }
    else if (currentView === 'verify_email') targetPath = '/verify-email';
    else if (currentView === 'forgot_password') targetPath = '/forgot-password';
    else if (currentView === 'reset_password') targetPath = '/reset-password';
    else if (currentView === 'oauth_callback') targetPath = '/oauth/callback';
    else if (currentView === 'accept_invite') targetPath = '/set-password';
    
    // Avoid overwriting token query parameters only while those token views are active.
    const shouldPreserveTokenUrl = ['verify_email', 'reset_password', 'accept_invite', 'oauth_callback'].includes(currentView);
    if (currentPath !== targetPath && !shouldPreserveTokenUrl) {
      window.history.pushState({}, '', targetPath);
    }
  }, [currentView]);

  // Sync dashboard data when logged in
  useEffect(() => {
    if (token) {
      refreshDashboardData();
    }
  }, [token, authRole]);

  useEffect(() => {
    if (currentView !== 'landing') return undefined;

    const storyTimer = window.setInterval(() => {
      setActiveStory((story) => (story + 1) % productScenarios.length);
    }, 5200);
    const whatsAppTimer = window.setInterval(() => {
      setActiveWhatsAppSlide((slide) => (slide + 1) % whatsAppFeatureSlides.length);
    }, 4600);

    return () => {
      window.clearInterval(storyTimer);
      window.clearInterval(whatsAppTimer);
    };
  }, [currentView]);

  // --- MOCK DATA SETUP (Sandbox Mode) ---
  const setMockData = () => {
    setDepartments([
      { id: '1', name: 'Sales Operations', description: 'Commercial check-in monitoring.' },
      { id: '2', name: 'Engineering', description: 'Product development and integration.' }
    ]);
    setAdminUsers([
      { id: 'emp-1', name: 'Kunal', email: 'employee@nudgehq.com', department_id: '1' }
    ]);
    setEmpTasks([
      { id: 't-1', title: 'Verify customer email lists for marketing campaign', description: 'Review bounce projections.', status: 'completed' },
      { id: 't-2', title: 'Finalize weekly sales forecast summary', description: 'Structure weekly updates.', status: 'in_progress' },
      { id: 't-3', title: 'Resolve database replication delays in staging', description: 'Investigate sync latency peaks.', status: 'blocked' }
    ]);
    setEmpHistory([
      { id: 'h-1', progress_text: 'Scrubbed duplicate email records and checked lists.', quality_score: 8, created_at: new Date().toISOString(), tasks: { title: 'Verify customer email lists' } }
    ]);
    setEmpStats({
      totalTasks: 3,
      todo: 0,
      inProgress: 1,
      completed: 1,
      blocked: 1
    });
    setAnalytics({
      summary: {
        totalEmployees: 1,
        totalTasks: 3,
        completionRate: 33,
        tasksOnTrack: 66,
        checkinRate: 100,
        blockersCount: 1
      },
      statusDistribution: { todo: 0, in_progress: 1, completed: 1, blocked: 1 },
      departmentStats: [{ name: 'Sales Operations', total: 3, completed: 1, percentage: 33 }],
      activeBlockers: [{ id: 'b-1', task: { title: 'Resolve database replication delays' }, reporter: { name: 'Kunal' }, blocker_text: 'Waiting for AWS DevOps staging keys.', created_at: new Date().toISOString() }]
    });
    setAllUpdates([
      { id: 'u-1', progress_text: 'Finished cleaning bounce parameters for lead campaign.', quality_score: 8, user: { name: 'Kunal', departments: { name: 'Sales Operations' } }, tasks: { title: 'Verify customer email lists' }, created_at: new Date().toISOString() }
    ]);
    setNotifications([
      { id: 'n-1', type: 'recognition', message: 'Nice work, Kunal. Your steady check-ins helped the team stay clear and moving.', created_at: new Date().toISOString() }
    ]);
    setTeamFocus([
      { id: 'f-1', focus_text: 'Finalizing weekly sales forecast', eta: 'today', status: 'focused', user: { name: 'Kunal', departments: { name: 'Sales Operations' } }, last_updated: new Date().toISOString() }
    ]);
    setFocusInsight('Focus patterns look steady today. No repeated switching pattern detected.');
    setTeamPresence([
      { id: 'p-1', location: 'home', goals_json: ['Finish weekly forecast', 'Resolve lead list cleanup', 'Share blocker status'], energy_level: 'high', user: { name: 'Kunal', departments: { name: 'Sales Operations' } } }
    ]);
    setPresenceInsight('Your team performs better when they declare goals in the morning. 1 person set goals today.');
    setDeepWorkTeam({
      active: [],
      top_users: [{ name: 'Kunal', hours: 2 }],
      insight: 'NudgeAI insight: teams using declared deep work create clearer focus windows without idle tracking.',
      powered_by: 'NudgeAI'
    });
    setNudgeAiData({
      standup: {
        brief: 'What got done: Sales Operations shared progress on list cleanup. What is in progress: weekly forecasting remains active. What is blocked: staging replication needs attention. What needs manager attention today: review the blocker and confirm next owner.',
        generated_at: new Date().toISOString(),
        powered_by: 'NudgeAI'
      },
      forecast: {
        forecast_percent: 72,
        tasks_at_risk: [{ title: 'Resolve database replication delays in staging', reason: 'Blocked by missing AWS staging keys.' }],
        recommended_actions: ['Review blocked engineering work first.', 'Confirm owner for staging credentials.', 'Ask teams for specific end-of-day updates.'],
        powered_by: 'NudgeAI'
      },
      skillGap: {
        gaps: [{ gap_name: 'Database optimization', frequency: 2, suggested_learning_area: 'SQL optimization training', urgency: 'medium' }],
        powered_by: 'NudgeAI'
      }
    });
  };

  // --- REFRESH DATA API CALLS ---
  const refreshDashboardData = async () => {
    if (isSandbox) return;
    const activeDashboardRole = getRoleFromDashboardPath(window.location.pathname) || authRole || user?.role || 'employee';
    if (activeDashboardRole === 'employee') {
      setEmpTasks([]);
      setEmpHistory([]);
      setEmpStats(null);
      setNotifications([]);
      setGrowthSummary(null);
    } else if (LEADER_ROLES.includes(activeDashboardRole)) {
      setAnalytics(null);
      setAllUpdates([]);
      setDepartments([]);
      setAdminUsers([]);
      setEmpTasks([]);
      setTeamFocus([]);
      setTeamPresence([]);
      setDeepWorkTeam(null);
      setNudgeAiData({});
    }
    try {
      if (activeDashboardRole === 'employee') {
        // Fetch employee tasks
        const { data: taskRes } = await fetchApi('/tasks', { method: 'GET' }, token);
        setEmpTasks(taskRes.tasks || []);

        // Fetch employee history
        const { data: updateRes } = await fetchApi('/employees/updates', { method: 'GET' }, token);
        setEmpHistory(updateRes.updates || []);

        // Fetch employee stats
        const { data: statRes } = await fetchApi('/employees/dashboard', { method: 'GET' }, token);
        setEmpStats(statRes.stats || null);

        const { data: notifRes } = await fetchApi('/employees/notifications', { method: 'GET' }, token);
        setNotifications(notifRes.notifications || []);
      } else if (LEADER_ROLES.includes(activeDashboardRole)) {
        const departmentScope = activeDashboardRole === 'manager' && user?.department_id ? `?department_id=${user.department_id}` : '';

        if (activeDashboardRole !== 'manager') {
          const { data: analyticRes } = await fetchApi('/analytics/dashboard', { method: 'GET' }, token);
          setAnalytics(analyticRes || null);
        } else {
          setAnalytics(null);
        }

        // Fetch updates registry
        const { data: updateRes } = await fetchApi(`/admin/updates${departmentScope}`, { method: 'GET' }, token);
        setAllUpdates(updateRes.updates || []);

        // Fetch departments
        const { data: deptRes } = await fetchApi('/admin/departments', { method: 'GET' }, token);
        setDepartments(deptRes.departments || []);

        const { data: employeeRes } = await fetchApi(`/admin/employees${departmentScope}`, { method: 'GET' }, token);
        setAdminUsers(employeeRes.employees || []);

        // Fetch scoped tasks for leader dashboards
        const { data: taskRes } = await fetchApi(`/tasks${departmentScope}`, { method: 'GET' }, token);
        setEmpTasks(taskRes.tasks || []);

        const { data: focusRes } = await fetchApi(`/focus/team${departmentScope}`, { method: 'GET' }, token);
        setTeamFocus(focusRes.focus_feed || []);
        setFocusInsight(focusRes.insight || '');

        const { data: presenceRes } = await fetchApi(`/checkin/team${departmentScope}`, { method: 'GET' }, token);
        setTeamPresence(presenceRes.presence || []);
        setPresenceInsight(presenceRes.insight || '');

        const { data: deepWorkRes } = await fetchApi(`/deepwork/team${departmentScope}`, { method: 'GET' }, token);
        setDeepWorkTeam(deepWorkRes || null);

        await loadWorkspaceOpsData(activeDashboardRole);

        runNudgeAiFeature('standup', false);
        if (activeDashboardRole !== 'manager') runNudgeAiFeature('skillGap', false);
      }

      await loadNudgeSpacePosts();
    } catch (err) {
      const message = err.message || '';
      const isAuthError =
        err.status === 401 ||
        /invalid or expired authentication token|access denied|no token provided|unauthorized/i.test(message);

      if (isAuthError) {
        clearAuthSession();
        if (currentView === 'dashboard') {
          setCurrentView('signin');
          window.history.pushState({}, '', '/login');
        }
        return;
      }

      showToast('Error syncing live dashboard values: ' + message, 'error');
    }
  };

  const getActiveNudgeSpace = () => demoNudgeSpaceView === 'U Space' ? 'u_space' : 'social';
  const getDefaultNudgeSpacePostType = (view = demoNudgeSpaceView) => view === 'U Space' ? 'goal' : 'status';

  const handleNudgeSpaceViewChange = (view) => {
    setDemoNudgeSpaceView(view);
    setNudgeSpacePostType(getDefaultNudgeSpacePostType(view));
    setNudgeSpaceDraft('');
    if (!isSandbox) loadNudgeSpacePosts(view === 'U Space' ? 'u_space' : 'social');
  };

  const loadNudgeSpacePosts = async (space = getActiveNudgeSpace()) => {
    if (isSandbox || !token) return;
    setNudgeSpaceLoading(true);
    try {
      const { data } = await fetchApi(`/nudgespace/posts?space=${space}`, { method: 'GET' }, token);
      setNudgeSpacePosts(data.posts || []);
    } catch (error) {
      showToast(error.message || 'Could not load NudgeSpace posts.', 'error');
      setNudgeSpacePosts([]);
    } finally {
      setNudgeSpaceLoading(false);
    }
  };

  const submitNudgeSpacePost = async () => {
    const content = nudgeSpaceDraft.trim();
    if (!content) {
      showToast('Write something before posting to NudgeSpace.', 'error');
      return;
    }

    if (isSandbox) {
      showToast('Demo NudgeSpace posting stays in sandbox.', 'info');
      return;
    }

    setNudgeSpaceSaving(true);
    const space = getActiveNudgeSpace();
    const safePostType = space === 'u_space'
      ? (['goal', 'reminder', 'focus'].includes(nudgeSpacePostType) ? nudgeSpacePostType : 'goal')
      : (['status', 'win', 'question', 'idea', 'announcement'].includes(nudgeSpacePostType) ? nudgeSpacePostType : 'status');
    try {
      const { data } = await fetchApi('/nudgespace/posts', {
        method: 'POST',
        body: JSON.stringify({
          space,
          post_type: safePostType,
          content,
        }),
      }, token);

      setNudgeSpacePosts((posts) => [data.post, ...posts]);
      setNudgeSpaceDraft('');
      showToast(data.message || 'NudgeSpace post saved.', 'success');
    } catch (error) {
      showToast(error.message || 'Could not save NudgeSpace post.', 'error');
    } finally {
      setNudgeSpaceSaving(false);
    }
  };

  // --- TOAST/STATUS CONTROLLERS ---
  const showToast = (message, type = 'info') => {
    setStatusMessage({ text: message, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const getUserOrganization = (nextUser) => nextUser?.organizations || nextUser?.organization || null;

  const hydrateCompanyDetails = (nextUser, fallbackName = '') => {
    const organization = getUserOrganization(nextUser);
    setCompanyDetails((current) => ({
      ...current,
      name: organization?.name || fallbackName || current.name,
      logo_url: organization?.logo_url || current.logo_url,
      industry: organization?.industry || current.industry,
      size: organization?.size || current.size,
      country: organization?.country || current.country || 'India',
      city: organization?.city || current.city,
    }));
  };

  const routeAfterAuth = (nextUser, fallbackCompanyName = '') => {
    hydrateCompanyDetails(nextUser, fallbackCompanyName);
    if (['admin', 'hr'].includes(nextUser?.role) && !nextUser?.onboarding_complete) {
      setOnboardingStep(1);
      setCurrentView('onboarding');
      return;
    }
    navigateDashboard(nextUser?.role || 'admin');
  };

  const enterSandboxDashboard = () => {
    const simulatedUser = getDemoUserFromEmail(emailInput);

    setIsSandbox(true);
    setServerPort(null);
    setMockData();
    setUser(simulatedUser);
    setToken('sandbox-token-jwt');
    setAuthRole(simulatedUser.role);
    navigateDashboard(simulatedUser.role);
    setLoginError(null);
    showToast(`Using Sandbox Mode as ${simulatedUser.name}. Connect Supabase later for live data.`, 'info');
  };

  // --- USER AUTHENTICATION ACTIONS ---
  const handleDemoSignIn = (role) => {
    const demoUser = getDemoUserFromRole(role);
    setEmailInput(demoUser.email);
    setPasswordInput('nudgehq123');
    setLoginError(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    if (currentView === 'demo_console') {
      const simulatedUser = getDemoUserFromEmail(emailInput);

      setIsSandbox(true);
      setMockData();
      setUser(simulatedUser);
      setToken('sandbox-token-jwt');
      setAuthRole(simulatedUser.role);
      navigateDashboard(simulatedUser.role);
      showToast(`Welcome back, ${simulatedUser.name}!`, 'success');
      setLoginLoading(false);
      return;
    }

    try {
      const { data } = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      setIsSandbox(false);
      setEmpStats(null);
      setEmpTasks([]);
      setEmpHistory([]);
      setQualityTip(null);
      setUser(data.user);
      setToken(data.token);
      setAuthRole(data.user.role);
      routeAfterAuth(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
    } catch (err) {
      const message = err.message || 'Incorrect email or password.';
      if (/verify/i.test(message)) {
        setVerificationEmail(emailInput);
        window.localStorage.setItem('nudgehq_pending_email', emailInput);
        setCurrentView('verify_email');
        showToast('Please verify your email address before logging in.', 'info');
        return;
      }
      setLoginError(isBackendConnectionError(message)
        ? `${message} You can continue in Sandbox Mode for now.`
        : message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword.length < 6) {
      setSignupError('Password should be at least 6 characters.');
      return;
    }

    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }

    if (!signupAgree) {
      setSignupError('Please agree to the Terms & Conditions to continue.');
      return;
    }

    setSignupLoading(true);

    try {
      const { data } = await fetchApi('/auth/company-signup', {
        method: 'POST',
        body: JSON.stringify({
          company_name: signupCompany,
          admin_name: signupName,
          email: signupEmail,
          password: signupPassword,
          agree_terms: signupAgree,
        })
      });

      if (!data.token) {
        showToast(data.message || 'Workspace registered. Please verify your email address before logging in.', 'success');
        setVerificationEmail(signupEmail);
        window.localStorage.setItem('nudgehq_pending_email', signupEmail);
        setCurrentView('verify_email');
        setSignupCompany('');
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirm('');
        setSignupAgree(false);
        return;
      }

      setUser(data.user);
      setIsSandbox(false);
      setToken(data.token);
      setAuthRole(data.user.role);
      routeAfterAuth(data.user, signupCompany);
      showToast(`Workspace created for ${signupCompany}. Welcome, ${data.user.name}.`, 'success');
      setSignupCompany('');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirm('');
    } catch (err) {
      const message = err.message || 'Could not create workspace.';
      setSignupError(isBackendConnectionError(message)
        ? `${message} Make sure the backend and Supabase are connected.`
        : message);
    } finally {
      setSignupLoading(false);
    }
  };

  const fillDemoSignupCredentials = () => {
    const alias = `hello.nudgehq+demo${Date.now()}@gmail.com`;
    const password = 'NudgeHQ@2026';

    setSignupCompany('NudgeHQ Demo');
    setSignupName('Demo Founder');
    setSignupEmail(alias);
    setSignupPassword(password);
    setSignupConfirm(password);
    setSignupAgree(true);
    setSignupError(null);
    showToast('Demo signup credentials filled. Verification will land in hello.nudgehq@gmail.com.', 'success');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSuccess(false);

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast('Please add your name, email, and query details.', 'error');
      return;
    }

    setContactLoading(true);
    try {
      await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          query_type: contactType,
          message: contactMessage
        })
      });
      setContactSuccess(true);
      setContactMessage('');
      showToast('Your query was sent to NudgeHQ.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not send your query right now.', 'error');
    } finally {
      setContactLoading(false);
    }
  };

  const handleFeedbackCommentSubmit = async (event) => {
    event.preventDefault();
    const cleanComment = feedbackCommentText.trim();

    if (!cleanComment) {
      showToast('Add your comment first.', 'error');
      return;
    }

    const fallbackFeedback = {
      id: Date.now(),
      name: feedbackCommentName.trim() || user?.name || 'Early visitor',
      category: feedbackCategory,
      comment: cleanComment,
      time: 'Just now'
    };

    if (!isSandbox && token) {
      try {
        const { data } = await fetchApi('/admin/feedback', {
          method: 'POST',
          body: JSON.stringify({
            name: fallbackFeedback.name,
            category: fallbackFeedback.category,
            comment: cleanComment
          })
        }, token);
        setFeedbackComments((comments) => [data.feedback || fallbackFeedback, ...comments].slice(0, 8));
        setFeedbackCommentName('');
        setFeedbackCommentText('');
        setFeedbackCategory('Product feedback');
        showToast(data.message || 'Feedback saved.', 'success');
        return;
      } catch (error) {
        if (error.status !== 503) {
          showToast(error.message || 'Could not save feedback.', 'error');
          return;
        }
        showToast('Feedback saved locally. Run the latest database schema to enable cloud sync.', 'info');
      }
    }

    setFeedbackComments((comments) => [fallbackFeedback, ...comments].slice(0, 8));
    setFeedbackCommentName('');
    setFeedbackCommentText('');
    setFeedbackCategory('Product feedback');
    showToast('Feedback comment added.', 'success');
  };

  const handleIntegrationRequestSubmit = async (event) => {
    event.preventDefault();
    const cleanTitle = integrationRequestTitle.trim();
    const cleanDetails = integrationRequestDetails.trim();

    if (!cleanTitle || !cleanDetails) {
      showToast('Add the integration name and what your team needs.', 'error');
      return;
    }

    const fallbackRequest = {
      id: Date.now(),
      title: cleanTitle,
      details: cleanDetails,
      requester: user?.name || user?.email || 'Workspace user',
      status: 'Requested',
      time: new Date().toISOString()
    };

    if (!isSandbox && token) {
      try {
        const { data } = await fetchApi('/admin/integration-requests', {
          method: 'POST',
          body: JSON.stringify({ title: cleanTitle, details: cleanDetails })
        }, token);
        setIntegrationRequests((requests) => [data.request || fallbackRequest, ...requests].slice(0, 10));
        setIntegrationRequestTitle('');
        setIntegrationRequestDetails('');
        showToast(data.message || 'Integration request saved.', 'success');
        return;
      } catch (error) {
        if (error.status !== 503) {
          showToast(error.message || 'Could not save integration request.', 'error');
          return;
        }
        showToast('Integration request saved locally. Run the latest database schema to enable cloud sync.', 'info');
      }
    }

    setIntegrationRequests((requests) => [fallbackRequest, ...requests].slice(0, 10));
    setIntegrationRequestTitle('');
    setIntegrationRequestDetails('');
    showToast('Integration request saved for review.', 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setAuthRole(null);
    window.localStorage.removeItem('nudgehq_auth_token');
    window.localStorage.removeItem('nudgehq_auth_user');
    window.localStorage.removeItem('nudgehq_auth_role');
    setCurrentView('landing');
    setAiReportContent(null);
    setAiReportType(null);
    showToast('Logged out of demo session.', 'info');
  };

  // --- EMPLOYEE DASHBOARD OPERATIONS ---
  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!progressText.trim()) return;
    setIsSubmittingUpdate(true);

    if (isSandbox) {
      const mockScore = Math.min(10, Math.max(1, Math.round(progressText.trim().split(/\s+/).length / 3)));
      const newMockUpdate = {
        id: Math.random().toString(),
        progress_text: progressText,
        quality_score: mockScore,
        quality_tip: mockScore < 7 ? 'Try adding the exact task, outcome, and next step.' : '',
        created_at: new Date().toISOString(),
        tasks: selectedTaskId ? { title: empTasks.find(t => t.id === selectedTaskId)?.title || 'Assigned task' } : null
      };
      setEmpHistory([newMockUpdate, ...empHistory]);
      setQualityTip(mockScore < 7 ? newMockUpdate.quality_tip : null);
      setProgressText('');
      setProofLink('');
      setSelectedTaskId('');
      setIsSubmittingUpdate(false);
      showToast('Mock check-in submitted successfully.', 'success');
      return;
    }

    try {
      if (focusText.trim()) {
        await fetchApi('/focus/update', {
          method: 'POST',
          body: JSON.stringify({ focus_text: focusText, eta: focusEta, status: 'focused' })
        }, token);
      }

      const { data } = await fetchApi('/employees/updates', {
        method: 'POST',
        body: JSON.stringify({
          task_id: selectedTaskId || null,
          progress_text: progressText,
          proof_link: proofLink || null
        })
      }, token);

      const quality = data.nudgeai_quality || data.update;
      setQualityTip(quality?.score < 7 ? (quality.tip || data.update?.quality_tip) : null);
      setProgressText('');
      setProofLink('');
      setSelectedTaskId('');
      showToast('Progress update logged successfully to the server!', 'success');
      refreshDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleUpdateStatusClick = (task, targetStatus) => {
    if (targetStatus === 'blocked') {
      setActiveBlockTask(task);
      setBlockerTextVal('');
    } else {
      updateTaskStatusApi(task.id, targetStatus, null);
    }
  };

  const updateTaskStatusApi = async (taskId, status, blockerText) => {
    if (isSandbox) {
      const updated = empTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status };
        }
        return t;
      });
      setEmpTasks(updated);
      setActiveBlockTask(null);
      showToast(`Task status set to '${status}'`, 'success');
      return;
    }

    try {
      await fetchApi(`/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, blocker_text: blockerText })
      }, token);

      showToast(`Task status updated to '${status}' successfully!`, 'success');
      refreshDashboardData();
      setActiveBlockTask(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- ADMIN/HR DASHBOARD OPERATIONS ---
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    if (isSandbox) {
      const newDept = { id: Math.random().toString(), name: newDeptName, description: newDeptDesc, created_at: new Date().toISOString() };
      setDepartments([...departments, newDept]);
      setNewDeptName('');
      setNewDeptDesc('');
      showToast(`Mock department '${newDeptName}' created.`, 'success');
      return;
    }

    try {
      await fetchApi('/admin/departments', {
        method: 'POST',
        body: JSON.stringify({ name: newDeptName, description: newDeptDesc })
      }, token);
      setNewDeptName('');
      setNewDeptDesc('');
      showToast(`Department created successfully!`, 'success');
      refreshDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (isSandbox) {
      showToast('Task creation mock completed.', 'success');
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskAssignee('');
      return;
    }

    try {
      await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          assignee_id: newTaskAssignee || null
        })
      }, token);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskAssignee('');
      showToast('Task successfully created and assigned!', 'success');
      refreshDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleInviteEmployee = async (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteResult(null);

    if (isSandbox) {
      const invited = {
        id: `emp-${Date.now()}`,
        name: inviteName,
        email: inviteEmail,
        phone_number: invitePhone,
        role: inviteRole,
        department_id: inviteDepartmentId || null
      };
      setAdminUsers([...adminUsers, invited]);
      setInviteResult({ email: inviteEmail, temporary_password: 'nudgehq123', sandbox: true });
      setInviteName('');
      setInviteEmail('');
      setInvitePhone('');
      setInviteRole('employee');
      setInviteDepartmentId('');
      setInviteLoading(false);
      showToast('Sandbox employee invite created.', 'success');
      return;
    }

    try {
      const { data } = await fetchApi('/admin/employees/invite', {
        method: 'POST',
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          phone_number: invitePhone || null,
          role: inviteRole,
          department_id: inviteDepartmentId || null
        })
      }, token);

      setAdminUsers([...adminUsers, data.employee]);
      setInviteResult({ email: data.employee.email, temporary_password: data.temporary_password, sandbox: false });
      setInviteName('');
      setInviteEmail('');
      setInvitePhone('');
      setInviteRole('employee');
      setInviteDepartmentId('');
      showToast('Employee invite created successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to invite employee.', 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  const openWhatsAppNudgePreview = async () => {
    setWhatsappNudgeLoading(true);

    if (isSandbox) {
      setTimeout(() => {
        const employees = [
          { id: 'demo-priya', name: 'Priya Singh', submitted_today: false, already_nudged_today: false, last_seen_label: 'Last seen 2 days ago', phone_number: '+919999999999' },
          { id: 'demo-karan', name: 'Karan Arora', submitted_today: false, already_nudged_today: false, last_seen_label: 'Never submitted', phone_number: '+919888888888' },
          { id: 'demo-rahul', name: 'Rahul Mehta', submitted_today: true, already_nudged_today: false, last_seen_label: 'Submitted 1h ago', phone_number: '+919777777777' },
        ];
        setWhatsappPreviewEmployees(employees);
        setSelectedWhatsAppEmployees(employees.filter((employee) => !employee.submitted_today).map((employee) => employee.id));
        setWhatsappPreviewOpen(true);
        setWhatsappNudgeLoading(false);
      }, 600);
      return;
    }

    try {
      const { data } = await fetchApi('/notify/whatsapp/preview', { method: 'GET' }, token);
      const employees = data.employees || [];
      setWhatsappPreviewEmployees(employees);
      setSelectedWhatsAppEmployees(
        employees
          .filter((employee) => !employee.submitted_today && !employee.already_nudged_today && employee.phone_number)
          .map((employee) => employee.id)
      );
      setWhatsappPreviewOpen(true);
    } catch (error) {
      showToast(error.message || 'Could not preview WhatsApp nudges.', 'error');
    } finally {
      setWhatsappNudgeLoading(false);
    }
  };

  const sendWhatsAppNudges = async () => {
    setWhatsappNudgeLoading(true);

    if (isSandbox) {
      setTimeout(() => {
        const count = selectedWhatsAppEmployees.length;
        setWhatsappNudgeLoading(false);
        setWhatsappPreviewOpen(false);
        showToast(`WhatsApp nudge sent to ${count} employees.`, 'success');
      }, 600);
      return;
    }

    try {
      const { data } = await fetchApi('/notify/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ employee_ids: selectedWhatsAppEmployees }),
      }, token);
      const sentCount = data.sent || 0;
      const failedCount = data.failed || 0;
      const skippedCount = data.skipped || 0;
      if (sentCount > 0) {
        setWhatsappPreviewOpen(false);
        showToast(data.message || `WhatsApp nudge sent to ${sentCount} employees.`, 'success');
      } else if (failedCount > 0) {
        showToast('WhatsApp nudges failed. Check Twilio credentials and phone numbers.', 'error');
      } else {
        showToast(`No WhatsApp nudges sent. ${skippedCount} employees were skipped.`, 'info');
      }
    } catch (error) {
      showToast(error.message || 'Could not send WhatsApp nudges.', 'error');
    } finally {
      setWhatsappNudgeLoading(false);
    }
  };

  const scrollToWorkspaceSection = (...ids) => {
    window.setTimeout(() => {
      const target = ids.map((id) => document.getElementById(id)).find(Boolean);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
  };

  const activateManagerFocusTab = (tab) => {
    setActiveManagerFocusTab(tab);

    if (isSandbox && dashboardRole === 'manager') {
      if (tab === 'NudgeAI') {
        setDemoEmployeeSection('NudgeAI');
        return;
      }
      setDemoEmployeeSection('Dashboard');
      if (tab === 'WhatsApp') {
        openWhatsAppNudgePreview();
        return;
      }
      const demoTargets = {
        'Daily Signals': 'manager-demo-brief-section',
        'Blockers': 'manager-demo-blockers-section',
      };
      if (demoTargets[tab]) scrollToWorkspaceSection(demoTargets[tab], 'manager-demo-brief-section');
      return;
    }

    if (tab === 'WhatsApp') {
      openWhatsAppNudgePreview();
      scrollToWorkspaceSection('manager-action-queue-section');
      return;
    }

    const liveTargets = {
      'Daily Signals': 'manager-live-brief-section',
      'Blockers': 'manager-live-blockers-section',
      'NudgeAI': 'manager-nudgeai-desk-section',
    };
    if (liveTargets[tab]) scrollToWorkspaceSection(liveTargets[tab], 'manager-action-queue-section', 'manager-live-brief-section');
  };

  const handleManagerPriorityAction = (label) => {
    if (label === 'No updates') {
      setActiveManagerFocusTab('WhatsApp');
      openWhatsAppNudgePreview();
      scrollToWorkspaceSection('manager-no-updates-section');
      return;
    }
    if (label === 'Proof needed') {
      setActiveManagerFocusTab('Daily Signals');
      scrollToWorkspaceSection('manager-proof-required-section');
      return;
    }
    if (label === 'Blockers') {
      setActiveManagerFocusTab('Blockers');
      scrollToWorkspaceSection(
        isSandbox && dashboardRole === 'manager' ? 'manager-demo-blockers-section' : 'manager-live-blockers-section',
        'manager-action-queue-section'
      );
      return;
    }
  };

  const scrollDashboardPaneToTop = () => {
    window.setTimeout(() => {
      const panel = document.querySelector('.dashboard-main-premium');
      if (panel && typeof panel.scrollTo === 'function') {
        panel.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 30);
  };

  const handleDashboardSectionSelect = (label) => {
    if (!demoDashboardCanNavigate) return;
    setDemoEmployeeSection(label);
    scrollDashboardPaneToTop();
  };

  const applyManagerTaskTemplate = (title) => {
    const templateDescriptions = {
      'Proof required follow-up': 'Follow up on completed work and request a link, file, or screenshot before final review.',
      'Blocker unblock task': 'Assign an owner, define the next unblock step, add the escalation path, and set today as the target check-in.',
      'Weekly win summary': 'Collect weekly outcomes, top wins, customer impact, and appreciation points for the Friday report.',
    };
    setNewTaskTitle(title);
    setNewTaskDesc(templateDescriptions[title] || 'Manager template task ready for quick assignment.');
    if (isSandbox && dashboardRole === 'manager') {
      setDemoEmployeeSection('Tasks');
    }
    scrollToWorkspaceSection('manager-create-task');
    showToast(`${title} template loaded into task creation.`, 'success');
  };

  // AI Generation triggers
  const triggerAiReport = async (type) => {
    setAiReportType(type);
    setAiLoading(true);
    setAiReportContent(null);

    if (isSandbox) {
      setTimeout(() => {
        setAiLoading(false);
        if (type === 'summary') {
          setAiReportContent({
            summary: "Today's engineering sprint achieved critical backend milestones. The employee registry reported 100% check-in ratios.",
            achievements: ["Successfully deployed initial schema setups", "Completed authentication logic testing"],
            blockers: ["AWS credentials sync pending on server replicas"],
            needs_attention: ["AWS sync blockers need DBA credential updates"]
          });
        } else if (type === 'delays') {
          setAiReportContent({
            assessments: [
              { task_title: "Resolve database replication delays", risk_level: "high", remedy: "Liaise with AWS devops specialist to audit replication key permissions." }
            ]
          });
        } else {
          setAiReportContent({
            inactive_employees: [
              { name: "John Miller", email: "john@nudgehq.com", checkin_nudge: "Hi John, hope you're having a good week! Let us know if you need assistance with current sprint targets." }
            ]
          });
        }
      }, 1000);
      return;
    }

    try {
      const endpoint = type === 'summary' ? '/ai/summary/daily' : type === 'delays' ? '/ai/delays' : '/ai/inactivity';
      const { data } = await fetchApi(endpoint, { method: 'GET' }, token);
      setAiReportContent(data.data || data);
    } catch (err) {
      showToast('AI request failed: ' + err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const runNudgeAiFeature = async (type, refresh = true) => {
    const endpointMap = {
      burnout: '/ai/burnout-check',
      forecast: '/ai/sprint-forecast',
      standup: '/ai/standup-brief',
      anomaly: '/ai/anomaly-check',
      appreciation: '/ai/appreciation',
      skillGap: '/ai/skill-gap-analysis',
    };

    if (!endpointMap[type]) return;

    if (isSandbox) {
      setNudgeAiLoading((current) => ({ ...current, [type]: true }));
      setTimeout(() => {
        const mockData = {
          burnout: {
            burnout_risks: [
              { employee_id: 'emp-1', employee_name: 'Kunal', risk_level: 'LOW', color: 'green', reason: 'Check-ins and blocker patterns look steady.' }
            ],
            powered_by: 'NudgeAI',
            generated_at: new Date().toISOString()
          },
          forecast: {
            forecast_percent: 72,
            tasks_at_risk: [{ title: 'Resolve database replication delays in staging', reason: 'Blocked by missing AWS staging keys.' }],
            recommended_actions: ['Resolve staging access first.', 'Keep daily updates specific.', 'Confirm task owners by noon.'],
            powered_by: 'NudgeAI',
            generated_at: new Date().toISOString()
          },
          standup: {
            brief: 'What got done: Sales Operations shared progress on list cleanup. What is in progress: weekly forecasting remains active. What is blocked: staging replication needs attention. What needs manager attention today: review the blocker and confirm next owner.',
            powered_by: 'NudgeAI',
            generated_at: new Date().toISOString()
          },
          anomaly: {
            alerts: [{ employee_name: 'Kunal', anomaly_type: 'late_checkin', suggested_admin_action: 'Kunal usually checks in by 10am. No update yet at 2pm. Consider checking in.' }],
            powered_by: 'NudgeAI',
            generated_at: new Date().toISOString()
          },
          appreciation: {
            suggestions: [{ employee_id: 'emp-1', employee_name: 'Kunal', achievement: 'steady check-ins', message: 'Nice work, Kunal. Your steady check-ins helped the team stay clear and moving.' }],
            powered_by: 'NudgeAI',
            generated_at: new Date().toISOString()
          },
          skillGap: {
            gaps: [{ gap_name: 'Database optimization', frequency: 2, suggested_learning_area: 'SQL optimization training', urgency: 'medium' }],
            powered_by: 'NudgeAI',
            generated_at: new Date().toISOString()
          }
        };
        setNudgeAiData((current) => ({ ...current, [type]: mockData[type] }));
        setNudgeAiLoading((current) => ({ ...current, [type]: false }));
      }, 800);
      return;
    }

    setNudgeAiLoading((current) => ({ ...current, [type]: true }));
    try {
      const { data } = await fetchApi(endpointMap[type], {
        method: 'POST',
        body: JSON.stringify({ refresh })
      }, token);
      setNudgeAiData((current) => ({ ...current, [type]: data.data || data }));
    } catch {
      showToast('NudgeAI unavailable, try again later', 'error');
    } finally {
      setNudgeAiLoading((current) => ({ ...current, [type]: false }));
    }
  };

  const sendAppreciation = async (suggestion) => {
    if (isSandbox) {
      setNotifications((current) => [
        { id: `n-${Date.now()}`, type: 'recognition', message: suggestion.message, created_at: new Date().toISOString() },
        ...current
      ]);
      showToast('Sandbox recognition sent.', 'success');
      return;
    }

    try {
      await fetchApi('/ai/appreciation', {
        method: 'POST',
        body: JSON.stringify({ send: true, employee_id: suggestion.employee_id, message: suggestion.message })
      }, token);
      showToast('Recognition sent to employee dashboard.', 'success');
    } catch {
      showToast('NudgeAI unavailable, try again later', 'error');
    }
  };

  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    const cleanGoals = goals.map((goal) => goal.trim()).filter(Boolean);
    if (!workLocation || !energyLevel || !cleanGoals.length) {
      showToast('Choose location, energy, and add at least one goal.', 'error');
      return;
    }

    if (isSandbox) {
      showToast('Smart Presence check-in saved in sandbox.', 'success');
      return;
    }

    try {
      await fetchApi('/checkin/daily', {
        method: 'POST',
        body: JSON.stringify({ location: workLocation, goals: cleanGoals, energy_level: energyLevel })
      }, token);
      setWorkLocation('');
      setEnergyLevel('');
      setGoals(['', '', '']);
      showToast('Smart Presence check-in saved.', 'success');
    } catch {
      showToast('Could not save Smart Presence check-in.', 'error');
    }
  };

  const startDeepWorkSession = async (e) => {
    e.preventDefault();
    if (!deepWorkFocus.trim()) return;
    if (isSandbox) {
      setActiveDeepWork({ id: 'sandbox-deep', focus_declared: deepWorkFocus, end_time: new Date(Date.now() + Number(deepWorkDuration) * 60000).toISOString(), duration_minutes: Number(deepWorkDuration) });
      showToast('Deep Work Mode started in sandbox.', 'success');
      return;
    }

    try {
      const { data } = await fetchApi('/deepwork/start', {
        method: 'POST',
        body: JSON.stringify({ focus_declared: deepWorkFocus, duration_minutes: Number(deepWorkDuration) })
      }, token);
      setActiveDeepWork(data.session);
      showToast('Deep Work Mode started.', 'success');
    } catch {
      showToast('Could not start Deep Work Mode.', 'error');
    }
  };

  const endDeepWorkSession = async () => {
    if (!activeDeepWork) return;
    if (isSandbox) {
      setActiveDeepWork(null);
      setDeepWorkOutput('');
      showToast('Deep work output logged in sandbox.', 'success');
      return;
    }

    try {
      await fetchApi('/deepwork/end', {
        method: 'POST',
        body: JSON.stringify({ session_id: activeDeepWork.id, output_logged: deepWorkOutput })
      }, token);
      setActiveDeepWork(null);
      setDeepWorkOutput('');
      showToast('Deep work output logged.', 'success');
    } catch {
      showToast('Could not end Deep Work Mode.', 'error');
    }
  };

  const loadGrowthSummary = async () => {
    setGrowthLoading(true);
    if (isSandbox) {
      setGrowthSummary({
        summary: 'You have kept a steady rhythm of updates, completed visible work, and helped the team understand blockers clearly. Your strongest pattern is consistency.',
        completed_tasks: 1,
        blockers_resolved: 0,
        most_productive_day: 'Saturday',
        completion_rate: 33,
        quality_trend: [{ date: new Date().toISOString().slice(0, 10), score: 8 }],
        streak_days: [new Date().toISOString().slice(0, 10)],
        recognitions: notifications,
        powered_by: 'NudgeAI'
      });
      setGrowthLoading(false);
      return;
    }

    try {
      const { data } = await fetchApi('/employees/growth-summary', { method: 'GET' }, token);
      setGrowthSummary(data.data);
    } catch {
      showToast('Could not load growth summary.', 'error');
    } finally {
      setGrowthLoading(false);
    }
  };

  const generateBoardPack = async () => {
    setBoardPackLoading(true);
    try {
      const port = getActiveServerPort() || serverPort || 5001;
      const response = await fetch(`http://localhost:${port}/api/reports/board-pack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Board pack request failed.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'nudgehq-board-pack.pdf';
      link.click();
      URL.revokeObjectURL(url);
      showToast('Board pack generated.', 'success');
    } catch {
      showToast('Could not generate board pack.', 'error');
    } finally {
      setBoardPackLoading(false);
    }
  };

  const createGrowthPdfBlob = () => {
    const escapePdfText = (text = '') => String(text)
      .replace(/[()\\]/g, '\\$&')
      .replace(/[^\x20-\x7E]/g, '')
      .slice(0, 3000);

    const commands = [];
    const fill = (hex) => {
      const clean = hex.replace('#', '');
      const r = parseInt(clean.slice(0, 2), 16) / 255;
      const g = parseInt(clean.slice(2, 4), 16) / 255;
      const b = parseInt(clean.slice(4, 6), 16) / 255;
      commands.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
    };
    const stroke = (hex) => {
      const clean = hex.replace('#', '');
      const r = parseInt(clean.slice(0, 2), 16) / 255;
      const g = parseInt(clean.slice(2, 4), 16) / 255;
      const b = parseInt(clean.slice(4, 6), 16) / 255;
      commands.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
    };
    const rect = (x, y, w, h, hex) => {
      fill(hex);
      commands.push(`${x} ${y} ${w} ${h} re f`);
    };
    const outline = (x, y, w, h, hex = '#EEEDFE') => {
      stroke(hex);
      commands.push(`1 w ${x} ${y} ${w} ${h} re S`);
    };
    const text = (value, x, y, size = 10, color = '#2C2C2A', font = 'F1') => {
      fill(color);
      commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`);
    };
    const wrapText = (value, x, y, maxChars, lineHeight, size = 10, color = '#2C2C2A', font = 'F1') => {
      const words = String(value).split(' ');
      const wrapped = [];
      let current = '';
      words.forEach((word) => {
        const next = current ? `${current} ${word}` : word;
        if (next.length > maxChars) {
          if (current) wrapped.push(current);
          current = word;
        } else {
          current = next;
        }
      });
      if (current) wrapped.push(current);
      (wrapped.length ? wrapped : ['']).forEach((line, index) => text(line, x, y - (index * lineHeight), size, color, font));
      return y - ((wrapped.length || 1) * lineHeight);
    };

    rect(0, 0, 612, 792, '#F7F8FB');
    rect(0, 672, 612, 120, '#3C3489');
    rect(384, 672, 228, 120, '#7F77DD');
    rect(48, 712, 42, 42, '#19113D');
    text('N.', 60, 724, 22, '#FFFFFF', 'F2');
    text('NudgeHQ', 104, 742, 15, '#FFFFFF', 'F2');
    text('90-Day Growth Snapshot', 104, 716, 28, '#FFFFFF', 'F2');
    text('Employee performance export powered by NudgeAI', 104, 696, 10, '#EEEDFE');
    text('DEMO REPORT', 472, 742, 9, '#FFFFFF', 'F2');
    text('2 Jun 2026', 472, 722, 12, '#FFFFFF', 'F2');

    rect(48, 610, 516, 44, '#FFFFFF');
    outline(48, 610, 516, 44, '#DAD7FB');
    text('Employee', 70, 635, 8, '#8A8894', 'F2');
    text('Kunal', 70, 618, 13, '#2C2C2A', 'F2');
    text('Role', 210, 635, 8, '#8A8894', 'F2');
    text('Employee', 210, 618, 13, '#2C2C2A', 'F2');
    text('Report window', 360, 635, 8, '#8A8894', 'F2');
    text('Last 90 days', 360, 618, 13, '#2C2C2A', 'F2');

    const cards = [
      ['30 DAYS', '18', 'tasks completed', '#EEEDFE', '#3C3489'],
      ['60 DAYS', '39', 'tasks completed', '#E8F7F1', '#1D9E75'],
      ['90 DAYS', '64', 'tasks completed', '#FFF3E0', '#F59E0B']
    ];
    cards.forEach(([label, value, sub, bg, color], index) => {
      const x = 48 + index * 178;
      rect(x, 500, 160, 88, bg);
      outline(x, 500, 160, 88, '#DAD7FB');
      text(label, x + 18, 560, 8, color, 'F2');
      text(value, x + 18, 526, 30, '#2C2C2A', 'F2');
      text(sub, x + 76, 527, 9, '#5F5E5A', 'F2');
    });

    text('Progress momentum', 48, 464, 16, '#2C2C2A', 'F2');
    rect(48, 438, 516, 14, '#EEEDFE');
    rect(48, 438, 410, 14, '#7F77DD');
    text('64 tasks completed across 90 days', 48, 414, 10, '#5F5E5A', 'F2');
    text('Strong consistency signal', 420, 414, 10, '#1D9E75', 'F2');

    rect(48, 318, 516, 72, '#FFFFFF');
    outline(48, 318, 516, 72, '#DAD7FB');
    text('NudgeAI career summary', 70, 362, 13, '#3C3489', 'F2');
    wrapText(
      'You are strongest on focused execution days and your most productive pattern is Tuesday morning deep work. Your updates show clear ownership and steady collaboration.',
      70,
      342,
      84,
      15,
      10,
      '#5F5E5A'
    );

    text('Personal wins', 48, 282, 16, '#2C2C2A', 'F2');
    const wins = [
      ['Lightning', 'Resolved blocker without escalation', '#FFF3E0', '#F59E0B'],
      ['Trophy', '9-day check-in streak', '#FFFDE7', '#D6A400'],
      ['Star', 'Helped teammate unblock', '#EEEDFE', '#7F77DD']
    ];
    wins.forEach(([icon, win, bg, color], index) => {
      const y = 236 - index * 48;
      rect(48, y, 516, 36, '#FFFFFF');
      outline(48, y, 516, 36, '#EEEDFE');
      rect(66, y + 8, 20, 20, bg);
      text(icon, 96, y + 13, 9, color, 'F2');
      text(win, 190, y + 13, 10, '#2C2C2A', 'F2');
    });

    rect(48, 42, 516, 64, '#161238');
    text('Manager-ready note', 70, 82, 12, '#FFFFFF', 'F2');
    wrapText(
      'Kunal has shown consistent ownership, clear update habits, and strong collaboration signals across the last 90 days.',
      70,
      64,
      86,
      14,
      9,
      '#EEEDFE'
    );
    text('Demo export. Live product will use real employee data from NudgeHQ.', 48, 22, 8, '#8A8894');

    const content = commands.join('\n');
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
      '6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj'
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
    return new Blob([pdf], { type: 'application/pdf' });
  };

  const downloadDemoGrowthPdf = () => {
    const blob = createGrowthPdfBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kunal-90-day-growth-snapshot.pdf';
    link.click();
    URL.revokeObjectURL(url);
    showToast('90-day growth PDF downloaded.', 'success');
  };

  const activateFreeTrial = async () => {
    setPaymentLoading(true);
    try {
      const { data } = await fetchApi('/payment/activate-trial', { method: 'POST' }, token);
      showToast(data.message || '14-Day Free Trial activated.', 'success');
      setCurrentView('onboarding');
    } catch (error) {
      showToast(error.message || 'Free trial could not be activated.', 'error');
    } finally {
      setPaymentLoading(false);
    }
  }

  const choosePlan = (planKey) => {
    if (!token) {
      showToast('Please verify your email and log in before selecting a plan.', 'info');
      setCurrentView('signin');
      return;
    }
    if (planKey === 'free_trial') {
      activateFreeTrial();
      return;
    }
    setSelectedPlan(planKey);
    window.localStorage.setItem('nudgehq_selected_plan', planKey);
    setCurrentView('payment');
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const activateStarterPlan = async () => {
    setPaymentLoading(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        showToast('Razorpay SDK failed to load. Are you online?', 'error');
        setPaymentLoading(false);
        return;
      }

      const currentPlan = selectedPlan || 'starter';
      const { data: orderData } = await fetchApi('/payment/create-order', { method: 'POST', body: JSON.stringify({ plan: currentPlan }) }, token);
      
      if (orderData.order && orderData.order.test_mode) {
        // If in backend test mode (no keys configured), bypass the modal and do a test verification
        const { data } = await fetchApi('/payment/verify', {
          method: 'POST',
          body: JSON.stringify({
            razorpay_order_id: orderData.order.id,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: 'test_signature',
            plan: currentPlan
          })
        }, token);
        showToast(data.message || 'Plan activated (Test Mode).', 'success');
        setCurrentView('onboarding');
      } else {
        const options = {
          key: orderData.key_id,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: 'NudgeHQ',
          description: currentPlan === 'free_trial' ? '14-Day Free Trial Verification' : 'Starter Plan Subscription',
          order_id: orderData.order.id,
          handler: async function (response) {
            setPaymentLoading(true);
            try {
              const { data } = await fetchApi('/payment/verify', {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: currentPlan
                })
              }, token);
              showToast(data.message || 'Plan activated.', 'success');
              setCurrentView('onboarding');
            } catch (verifyErr) {
              showToast(verifyErr.message || 'Payment verification failed.', 'error');
            } finally {
              setPaymentLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#3C3489'
          },
          modal: {
            ondismiss: function () {
              setPaymentLoading(false);
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      showToast(error.message || 'Payment could not be completed.', 'error');
      setPaymentLoading(false);
    }
  }



  const parseEmployeeCsv = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result || '')
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter(Boolean)
        .slice(1)
        .map((row) => {
          const [name, email, department, role, phone_number] = row.split(',').map((cell) => cell?.trim() || '');
          return { name, email, department, role: role || 'employee', phone_number };
        })
        .filter((row) => row.email);
      const availableSlots = Math.max(STARTER_EMPLOYEE_LIMIT - inviteEmployees.length, 0);
      if (!availableSlots) {
        setCsvPreview([]);
        showToast(`Starter allows up to ${STARTER_EMPLOYEE_LIMIT} employees. Remove a manual invite before uploading CSV employees.`, 'error');
        return;
      }
      setCsvPreview(rows.slice(0, availableSlots));
      if (rows.length > availableSlots) {
        showToast(`Only ${availableSlots} CSV invite${availableSlots === 1 ? '' : 's'} added because Starter allows up to ${STARTER_EMPLOYEE_LIMIT} employees.`, 'info');
      }
    };
    reader.readAsText(file);
  }

  const downloadSampleCsv = () => {
    const sample = 'Name,Email,Department,Role,Phone\nKunal Sharma,kunal@company.com,Sales Operations,employee,+919999999999\nPriya Mehta,priya@company.com,Engineering,employee,+919888888888\n';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nudgehq-employee-invite-sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const handleCompanyLogoUpload = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file for the company logo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCompanyDetails((current) => ({ ...current, logo_url: reader.result }));
      showToast('Company logo preview added.', 'success');
    };
    reader.readAsDataURL(file);
  }

  const finishOnboarding = async () => {
    const authToken = token || window.localStorage.getItem('nudgehq_auth_token');
    if (!authToken) {
      showToast('Please log in again to finish onboarding. Your session token expired.', 'error');
      setCurrentView('signin');
      return;
    }

    setOnboardingLoading(true);
    try {
      const validEmployees = [...inviteEmployees, ...csvPreview]
        .filter((employee) => employee.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email));
      if (validEmployees.length > STARTER_EMPLOYEE_LIMIT) {
        showToast(`Starter allows up to ${STARTER_EMPLOYEE_LIMIT} employees. Please remove extra invites before finishing setup.`, 'error');
        return;
      }
      const employees = validEmployees.slice(0, STARTER_EMPLOYEE_LIMIT);
      const companyPayload = {
        ...companyDetails,
        industry: companyDetails.industry === 'Other' && companyIndustryOther.trim()
          ? companyIndustryOther.trim()
          : companyDetails.industry,
      };
      const { data } = await fetchApi('/auth/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({
          company: companyPayload,
          departments: onboardingDepartments.filter((dept) => dept.name),
          employees,
          generate_invite_link: true
        })
      }, authToken);
      if (data.invite_link?.url) setMagicInviteLink(data.invite_link.url);
      setUser((current) => current ? { ...current, onboarding_complete: true } : current);
      showToast('Company setup finished. Welcome to your admin dashboard.', 'success');
      navigateDashboard('admin');
    } catch (error) {
      showToast(error.message || 'Could not finish onboarding.', 'error');
    } finally {
      setOnboardingLoading(false);
    }
  }

  const navigateDashboard = (role = null) => {
    const nextRole = role || user?.role || authRole || 'employee';
    const path = getDashboardPath(nextRole);
    window.history.pushState({}, '', path);
    setAuthRole(nextRole);
    setCurrentView('dashboard');
  }

  const openSignup = () => {
    setSignupError(null);
    setCurrentView('signup');
  }
  const openSignin = () => {
    setLoginError(null);
    setCurrentView('signin');
  }
  const showPreviousStory = () => setActiveStory((story) => (story === 0 ? productScenarios.length - 1 : story - 1))
  const showNextStory = () => setActiveStory((story) => (story + 1) % productScenarios.length)

  const currentStory = productScenarios[activeStory]
  const currentWhatsAppSlide = whatsAppFeatureSlides[activeWhatsAppSlide]
  const showMobileLaunchSection = window.localStorage.getItem('nudgehq_show_mobile_launch') === 'true'
  const assistantSnapshot = currentView === 'dashboard'
    ? {
        role: authRole,
        user: user?.name,
        stats: LEADER_ROLES.includes(authRole) ? analytics : empStats,
        tasks: LEADER_ROLES.includes(authRole) ? allUpdates.slice(0, 5) : empTasks.slice(0, 5),
        departments: departments.slice(0, 5),
        focus: LEADER_ROLES.includes(authRole) ? teamFocus.slice(0, 5) : focusText,
        presence: LEADER_ROLES.includes(authRole) ? teamPresence.slice(0, 5) : { workLocation, goals, energyLevel },
        latest_nudgeai: nudgeAiData,
      }
    : null

  const askNudgeAi = async (payload) => {
    try {
      const { data } = await fetchApi('/ai/assistant', {
        method: 'POST',
        body: JSON.stringify(payload)
      }, token);
      return data.data?.answer || data.answer || 'NudgeAI answered, but the response was empty. Try asking in a different way.';
    } catch {
      if (/\b(price|pricing|cost|plan|plans)\b/i.test(payload.message)) {
        return 'Pricing is temporary right now. The current plans are early estimates and can change as NudgeHQ grows.';
      }
      if (/feature|nudgeai|dashboard/i.test(payload.message)) {
        return 'NudgeHQ includes employee progress updates, task tracking, blockers, focus, smart presence, deep work, admin dashboards, reports, and NudgeAI insights.';
      }
      if (/write|email|caption|message|draft/i.test(payload.message)) {
        return 'Sure. Tell me the tone, audience, and key points, and I can draft it for you. If you want a quick structure: start with the goal, add the important context, then end with the exact action you want from the reader.';
      }
      if (/plan|schedule|focus|prioriti/i.test(payload.message)) {
        return 'A simple way to plan it: pick the one outcome that matters most, split it into 2-3 smaller actions, do the hardest one first, then leave 15 minutes at the end to review and send updates.';
      }
      return 'NudgeAI can answer general questions too, but the live AI service is unavailable right now. Try again in a moment, or ask me for a quick draft, plan, explanation, or NudgeHQ help.';
    }
  }

  const submitDemoAiHelperQuestion = async (question = demoAiHelperInput) => {
    const clean = question.trim();
    if (!clean || demoAiHelperLoading) return;

    setDemoAiHelperMessages((items) => [...items, { from: 'user', text: clean }]);
    setDemoAiHelperInput('');
    setDemoAiHelperLoading(true);

    try {
      const answer = await askNudgeAi({
        message: clean,
        context: 'dashboard',
        role: 'employee',
        page: 'employee_nudgeai_modal',
        dashboard_snapshot: {
          employee: 'Kunal',
          total_tasks: demoWorkQueueRows.length,
          active_section: selectedDemoSection,
          tasks: demoWorkQueueRows.map(([group, title, progress, status]) => ({
            group,
            title,
            status,
            progress,
          })),
        },
      });
      setDemoAiHelperMessages((items) => [...items, { from: 'assistant', text: answer }]);
    } catch {
      setDemoAiHelperMessages((items) => [
        ...items,
        { from: 'assistant', text: 'NudgeAI is unavailable right now. Try again in a moment.' },
      ]);
    } finally {
      setDemoAiHelperLoading(false);
    }
  };

  const signupDetailsReady = Boolean(
    signupCompany.trim() &&
    signupName.trim() &&
    signupEmail.trim() &&
    signupPassword &&
    signupConfirm &&
    signupPassword === signupConfirm
  );
  const signupPreviewStep = signupAgree ? 3 : signupDetailsReady ? 2 : 1;
  const signupStepCopy = [
    'Workspace account',
    'Email verification',
    'Team onboarding'
  ][signupPreviewStep - 1];
  const signupPreviewSteps = [
    ['Create organization', 'Add company and admin details'],
    ['Verify work email', 'Confirm the inbox before setup'],
    ['Invite employees', 'Add people, departments, and roles'],
    ['Start tracking progress', 'Open the live HR command center']
  ];
const routeDashboardRole = currentView === 'dashboard' ? getRoleFromDashboardPath(window.location.pathname) : null;
const dashboardRole = routeDashboardRole || authRole || user?.role || 'employee';
const currentPlanName = user?.organizations?.plan || 'free_trial';
const isTrialWorkspace = !isSandbox && currentView === 'dashboard' && currentPlanName === 'free_trial';
const trialDaysRemaining = Math.max(0, Math.ceil((new Date(user?.organizations?.trial_ends_at || Date.now() + 14 * 86400000).getTime() - Date.now()) / 86400000)) || 14;
const projectEditorRoleLabel = dashboardRole === 'admin' ? 'company' : dashboardRole === 'hr' ? 'people ops' : 'manager';
const latestAiResult = nudgeAiData.standup || nudgeAiData.forecast || nudgeAiData.appreciation || nudgeAiData.skillGap || null;
const isLeaderDashboard = LEADER_ROLES.includes(dashboardRole);
const isPeopleDashboard = PEOPLE_ROLES.includes(dashboardRole);
const isOpsDashboard = OPS_ROLES.includes(dashboardRole);
  const isEmployeeDashboard = dashboardRole === 'employee';
  const roleThemes = {
    admin: {
      accent: '#7F77DD',
      strong: '#3C3489',
      soft: '#EEEDFE',
      badge: 'Full company control',
      glow: 'rgba(127, 119, 221, 0.28)'
    },
    hr: {
      accent: '#F59E0B',
      strong: '#8A3A0A',
      soft: '#FFF7ED',
      badge: 'People health cockpit',
      glow: 'rgba(245, 158, 11, 0.2)'
    },
    manager: {
      accent: '#1D9E75',
      strong: '#0F6E55',
      soft: '#E8F7F1',
      badge: 'Department command',
      glow: 'rgba(29, 158, 117, 0.22)'
    },
    employee: {
      accent: '#5B7CFA',
      strong: '#3C3489',
      soft: '#EEF4FF',
      badge: 'Personal progress hub',
      glow: 'rgba(91, 124, 250, 0.22)'
    }
  };
  const roleTheme = roleThemes[dashboardRole] || roleThemes.employee;
  const roleAccent = roleTheme.accent;
  const roleScopeCards = {
    admin: [
      ['Company-wide view', 'All teams, all tasks, all people signals in one place.', ShieldCheck],
      ['Billing + settings', 'Trial, subscription, exports, roles, and workspace setup.', Building2],
      ['Role preview', 'Jump into HR, Manager, or Employee views for testing.', Eye]
    ],
    hr: [
      ['People health', 'Burnout, energy, attendance, appraisal, and safety trends.', ShieldCheck],
      ['Company reports', 'Board packs, skill gaps, HR exports, and growth records.', FileCheck2],
      ['No task clutter', 'Designed for culture and performance, not daily tickets.', UsersRound]
    ],
    manager: [
      ['Department only', 'Your team tasks, blockers, updates, and daily rhythm.', Workflow],
      ['Action focused', 'Assign work, resolve blockers, and send appreciation fast.', ListTodo],
      ['Private boundaries', 'No billing, HR-only health scores, or other departments.', LockKeyhole]
    ],
    employee: [
      ['Your workspace', 'Tasks, goals, updates, recognitions, and streaks stay personal.', User],
      ['Focus tools', 'Deep work, Smart Presence, Focus Pulse, and blocker logs.', Activity],
      ['Growth story', 'Your progress history becomes appraisal-ready evidence.', LineChartIcon]
    ]
  }[dashboardRole] || [];
  const roleSignals = {
    admin: [
      ['Workspace health', 'All roles connected'],
      ['Billing status', user?.organizations?.plan || 'free_trial'],
      ['NudgeAI suite', 'Full access']
    ],
    hr: [
      ['People signals', 'Company-wide'],
      ['Risk review', 'Private to HR'],
      ['Reports', 'Board-ready']
    ],
    manager: [
      ['Team scope', 'Department only'],
      ['Blockers', 'Live queue'],
      ['Sprint pulse', 'Forecast-ready']
    ],
    employee: [
      ['Today focus', focusText || 'Set after update'],
      ['Deep work', activeDeepWork ? 'Running' : 'Available'],
      ['Growth', 'Private view']
    ]
  }[dashboardRole] || [];
  const roleMetricCards = dashboardRole === 'admin'
    ? [
        ['NudgeAI Desk', 'Forecasts, standups, risks, and skill gaps.', Sparkles, '#7F77DD'],
        ['Team Focus Feed', 'See what people are focused on right now.', Activity, '#1D9E75'],
        ['Employee Ops', 'Invite people, create tasks, and manage teams.', UsersRound, '#3C3489'],
        ['Board Pack', 'Generate clean monthly leadership reports.', FileCheck2, '#F59E0B'],
        ['NudgeSpace', 'Company posts, wins, and async team culture.', MessageSquareText, '#1D9E75']
      ]
    : dashboardRole === 'hr'
      ? [
          ['People Health', 'Burnout, energy, attendance, and trend signals.', ShieldCheck, '#7F77DD'],
          ['Skill Gaps', 'NudgeAI groups recurring blocker themes.', Workflow, '#1D9E75'],
          ['Growth Views', 'Review employee growth and performance patterns.', LineChartIcon, '#3C3489'],
          ['HR Reports', 'Export board packs and people summaries.', FileCheck2, '#F59E0B'],
          ['NudgeSpace', 'Recognitions, culture posts, and people pulse.', MessageSquareText, '#7F77DD']
        ]
      : dashboardRole === 'manager'
        ? [
            ['Team Tasks', 'Assign and track only your department work.', ListTodo, '#7F77DD'],
            ['Blocker Alerts', 'See risks for your team before they drag.', AlertCircle, '#F59E0B'],
            ['Standup Brief', 'NudgeAI summarizes your team only.', Sparkles, '#3C3489'],
            ['Appreciation', 'Send recognition to your team members.', UserCheck, '#1D9E75'],
            ['NudgeSpace', 'Team posts, daily goals, and async context.', MessageSquareText, '#1D9E75']
          ]
        : [
            ['Daily Check-in', 'Share work location, energy, and top goals.', Activity, '#1D9E75'],
            ['Progress Update', 'Log work, proof links, blockers, and focus.', Send, '#7F77DD'],
            ['Deep Work', 'Declare focused time without noisy nudges.', Clock3, '#3C3489'],
            ['Growth Portal', 'Build your personal performance summary.', LineChartIcon, '#F59E0B'],
            ['NudgeSpace', 'Share wins, ask peers, and track personal goals.', MessageSquareText, '#7F77DD']
          ];
  const leaderTaskCount = empTasks.length;
  const leaderCompletedTasks = empTasks.filter((task) => task.status === 'completed').length;
  const leaderBlockedTasks = empTasks.filter((task) => task.status === 'blocked').length;
  const leaderOpenTasks = empTasks.filter((task) => task.status !== 'completed').length;
  const leaderCompletionRate = leaderTaskCount ? Math.round((leaderCompletedTasks / leaderTaskCount) * 100) : analytics?.summary?.completionRate || 0;
  const todayIsoDate = new Date().toDateString();
  const todayUpdatesCount = allUpdates.filter((update) => new Date(update.created_at).toDateString() === todayIsoDate).length;
  const managerTeamSize = Math.max(
    adminUsers.length || teamPresence.length || 0,
    isSandbox ? 5 : 0
  );
  const managerActiveToday = Math.min(
    todayUpdatesCount || (isSandbox ? 4 : 0),
    managerTeamSize || 0
  );
  const managerActiveTodayLabel = managerTeamSize ? `${managerActiveToday} of ${managerTeamSize} members` : '0 of 0 members';
  const managerBlockerCountForCards = isSandbox && !leaderBlockedTasks ? 1 : leaderBlockedTasks;
  const lowEnergyCount = teamPresence.filter((item) => item.energy_level === 'low').length;
  const averageQuality = (() => {
    const scores = allUpdates.map((update) => Number(update.quality_score)).filter(Boolean);
    if (!scores.length) return '—';
    return `${Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)}/10`;
  })();
  const leaderSummaryCards = dashboardRole === 'manager'
    ? [
        ['Team Tasks', isSandbox && !leaderTaskCount ? 15 : leaderTaskCount, ListTodo, 'Across your team'],
        ['Completion Rate', `${isSandbox && !leaderCompletionRate ? 67 : leaderCompletionRate}%`, CheckCircle2, 'Synced from live tasks'],
        ['Active Blockers', managerBlockerCountForCards, AlertCircle, managerBlockerCountForCards ? 'needs attention' : 'all clear'],
        ['Active Today', managerActiveTodayLabel, UsersRound, 'Live check-ins']
      ]
    : dashboardRole === 'hr'
      ? [
          ['People Tracked', analytics?.summary?.totalEmployees ?? adminUsers.length, UsersRound, 'Across the company'],
          ['Low Energy Today', lowEnergyCount, Activity, 'Check-in health signal'],
          ['Avg Update Quality', averageQuality, Sparkles, 'Clarity trend'],
          ['Today Updates', todayUpdatesCount || analytics?.summary?.checkinRate || 0, ClipboardCheck, 'Fresh people signals']
        ]
      : dashboardRole === 'admin'
        ? [
            ['Total Staff', analytics?.summary?.totalEmployees ?? adminUsers.length, UsersRound, 'All roles in workspace'],
            ['Completion Rate', `${analytics?.summary?.completionRate ?? leaderCompletionRate}%`, CheckCircle2, 'Company task rate'],
            ['Active Blockers', analytics?.summary?.blockersCount ?? leaderBlockedTasks, AlertCircle, 'Company-wide risks'],
            ['Today Updates', `${analytics?.summary?.checkinRate ?? todayUpdatesCount}${analytics?.summary?.checkinRate ? '%' : ''}`, Sparkles, 'Live workforce pulse']
          ]
        : [];
  const liveLeaderStatCards = leaderSummaryCards.map(([title, value, Icon, helper]) => [
    title,
    value,
    Icon,
    roleAccent,
    helper || 'Live workspace value',
    'flat'
  ]);
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = faqCategory === 'All Inquiries' || faq.category === faqCategory;
    const searchText = `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase();
    return matchesCategory && searchText.includes(faqSearch.trim().toLowerCase());
  });
  const managerBlockedTasks = empTasks.filter((task) => task.status === 'blocked').slice(0, 4);
  const managerDemoBlockers = [
    {
      id: 'demo-blocker-rahul',
      title: 'CRM import access issue',
      assignee: { name: 'Rahul Mehta', email: 'rahul@nudgehq.app' },
      blockedAgo: 'Blocked 2h 30m ago'
    }
  ];
  const managerActiveBlockers = (authRole === 'manager' || dashboardRole === 'manager')
    ? (managerBlockedTasks.length
        ? managerBlockedTasks.map((task, index) => ({
            id: task.id || `blocker-${index}`,
            title: task.title || 'Blocked task',
            assignee: task.assignee || { name: 'Team member', email: 'hello.nudgehq@gmail.com' },
            blockedAgo: task.updated_at ? `Blocked ${formatRelativeTime(task.updated_at)}` : 'Blocked status active'
          }))
        : (isSandbox ? managerDemoBlockers : []))
    : [];
  const hrPeopleSignals = [
    ['Low energy check-ins', lowEnergyCount, lowEnergyCount ? 'Review these teams with care.' : 'No low-energy check-ins yet.'],
    ['Recent update quality', averageQuality, averageQuality === '—' ? 'Waiting for scored updates.' : 'Use this for coaching, not pressure.'],
    ['Deep work active', deepWorkTeam?.active?.length || 0, 'Healthy focus signal for the company.']
  ];
  const indiaClock = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false
  });
  const indiaHour = Number.parseInt(indiaClock, 10);
  const dashboardGreeting = indiaHour < 12 ? 'Good morning' : indiaHour < 17 ? 'Good afternoon' : indiaHour < 21 ? 'Good evening' : 'Good night';
  const dashboardDateLabel = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
const dashboardRoleLabel = dashboardRole === 'hr' ? 'HR' : dashboardRole.charAt(0).toUpperCase() + dashboardRole.slice(1);
const signedInEmployeeName = user?.name || user?.email?.split('@')[0] || 'Employee User';
const demoDisplayName = dashboardRole === 'employee'
  ? (isSandbox ? demoProfileName.trim() || 'Kunal' : signedInEmployeeName)
  : user?.name || getDemoUserFromRole(dashboardRole).name || 'Demo User';
const demoDisplayFirstName = demoDisplayName.split(' ').filter(Boolean)[0] || 'there';
const demoEmployeeCanNavigate = dashboardRole === 'employee';
const isLiveManagerWorkspace = !isSandbox && dashboardRole === 'manager';
const isLiveAdminOrHrWorkspace = !isSandbox && ['admin', 'hr'].includes(dashboardRole);
const shouldRenderLegacyDashboard = Boolean(window.__NUDGEHQ_ENABLE_LEGACY_DASHBOARD__) && currentView === 'dashboard' && !isSandbox && !isEmployeeDashboard && !isLiveManagerWorkspace && !isLiveAdminOrHrWorkspace;
const demoDashboardCanNavigate = isSandbox || dashboardRole === 'employee' || isLiveManagerWorkspace || isLiveAdminOrHrWorkspace;
const allowedDashboardSections = DASHBOARD_SECTIONS_BY_ROLE[dashboardRole] || DASHBOARD_SECTIONS_BY_ROLE.employee;
const selectedDemoSection = demoDashboardCanNavigate
  ? (dashboardRole === 'employee' ? demoEmployeeSection : (demoEmployeeSection === 'My Dashboard' ? 'Dashboard' : demoEmployeeSection))
  : 'Dashboard';
const activeDashboardSection = allowedDashboardSections.includes(selectedDemoSection)
  ? selectedDemoSection
  : (dashboardRole === 'employee' ? 'My Dashboard' : 'Dashboard');
const employeeSectionsWithStatCards = ['My Dashboard', 'My Tasks', 'Check-in'];
const shouldShowDemoStatCards = dashboardRole === 'employee'
  ? employeeSectionsWithStatCards.includes(activeDashboardSection)
  : activeDashboardSection !== 'Settings';
const openDemoAiHelper = () => {
  const introText = getNudgeAiHelperIntro(demoDisplayFirstName);
  setDemoAiHelperMessages((messages) => {
    const hasUserMessages = messages.some((message) => message.from === 'user');
    return hasUserMessages ? messages : [{ from: 'assistant', text: introText }];
  });
  setDemoAiHelperOpen(true);
};
  const profileDisplayEmail = isSandbox
    ? demoProfileEmail
    : user?.email || 'Registered email unavailable';
  const demoInitials = demoDisplayName.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'K';

  const leaderDemoSidebarItems = [
    ['Dashboard', LayoutDashboard],
    ['Tasks', CheckCircle2],
    ['Projects', Building2],
    ['People', UsersRound],
    ['NudgeSpace', MessageSquareText],
    ['Reports', LineChartIcon],
    ['Billing', Building2],
    ['NudgeAI', Zap],
    ['Integrations', Workflow],
    ['Settings', Shield],
  ];
const demoSidebarItems = dashboardRole === 'employee'
    ? [
        ['My Dashboard', LayoutDashboard],
        ['My Tasks', CheckCircle2],
        ['Check-in', ClipboardCheck],
        ['My Progress', LineChartIcon],
        ['Growth Portal', Sparkles],
        ['NudgeSpace', MessageSquareText],
        ['NudgeAI', Zap],
        ['Settings', Shield],
      ]
    : leaderDemoSidebarItems.filter(([label]) => {
        if (dashboardRole === 'manager') return !['Billing', 'Integrations'].includes(label);
        if (dashboardRole === 'hr') return label !== 'Billing';
        return true;
      });
  const dashboardShellSubtitle = isSandbox
    ? `${dashboardRoleLabel} command`
    : isLiveManagerWorkspace
      ? 'Manager command'
      : isLiveAdminOrHrWorkspace
        ? `${dashboardRoleLabel} command`
        : 'Employee workspace';
  const sandboxNudgeSpaceSocialPosts = [
    {
      name: demoDisplayName,
      handle: '@' + demoDisplayFirstName.toLowerCase(),
      badge: 'Now',
      time: '2m ago',
      color: '#7F77DD',
      title: 'Locked in on launch polish',
      copy: 'Finishing dashboard polish, tightening the invite flow, and keeping docs crisp before the next demo.',
      tags: ['focus mode', 'ship today'],
      metric: '24 hype',
      action: 'Tap in',
    },
    {
      name: 'Priya Singh',
      handle: '@priya.design',
      badge: 'Win',
      time: '18m ago',
      color: '#1D9E75',
      title: 'CRM blocker cleared',
      copy: 'Resolved the CRM blocker and attached proof so the team can move without another follow-up thread.',
      tags: ['unblocked', 'receipts attached'],
      metric: '39 claps',
      action: 'Celebrate',
    },
    {
      name: 'Aman Verma',
      handle: '@aman.ops',
      badge: 'Need eyes',
      time: '42m ago',
      color: '#F59E0B',
      title: 'Quick peer review request',
      copy: 'Can someone sanity-check the export CSV before evening so I can lock the rollout note?',
      tags: ['peer review', 'before 6pm'],
      metric: '12 replies',
      action: 'Reply',
    }
  ];
  const sandboxNudgeSpaceTodoCards = [
    {
      title: 'Ship manager polish',
      status: 'In flight',
      tone: '#7F77DD',
      detail: 'Tighten spacing, fix CTA rhythm, and keep the demo smooth.',
    },
    {
      title: 'Review employee invite flow',
      status: 'Next up',
      tone: '#1D9E75',
      detail: 'Sanity check sandbox onboarding before the next walkthrough.',
    },
    {
      title: 'Draft launch note',
      status: 'Brain dump',
      tone: '#F59E0B',
      detail: 'Capture the tone, key features, and founder-ready recap.',
    }
  ];
  const nudgeSpaceRoleCopy = {
    admin: {
      title: 'Company-wide NudgeSpace',
      eyebrow: 'Workspace social layer',
      copy: 'Announcements, wins, questions, and async culture signals across the whole company.',
      visibility: 'Admin can see every space, moderate posts, and turn strong updates into leadership notes.'
    },
    hr: {
      title: 'People-first NudgeSpace',
      eyebrow: 'Culture and recognition',
      copy: 'Recognitions, team pulse posts, onboarding notes, and lightweight people moments in one place.',
      visibility: 'HR sees company culture signals without entering day-to-day task management.'
    },
    manager: {
      title: 'Team NudgeSpace',
      eyebrow: 'Department feed',
      copy: 'A focused team feed for daily goals, blocker context, quick wins, and peer help requests.',
      visibility: 'Managers see their department only, so updates stay useful and scoped.'
    },
    employee: {
      title: 'My NudgeSpace',
      eyebrow: 'Peer space',
      copy: 'Share wins, ask for help, post ideas, and keep a personal day board without leaving work.',
      visibility: 'Employees see their workspace feed and their own personal goals.'
    }
  }[dashboardRole] || {
    title: 'NudgeSpace',
    eyebrow: 'Workspace social layer',
    copy: 'A calm internal feed for team updates, goals, wins, and help requests.',
    visibility: 'Every role sees the right scope.'
  };
  const demoStatCards = dashboardRole === 'employee'
    ? [
        ['Total Tasks', isSandbox ? (leaderTaskCount || 6) : leaderTaskCount, ListTodo, '#7F77DD', isSandbox ? '▲ 12% vs yesterday' : 'Synced from assigned tasks', isSandbox ? 'up' : 'flat'],
        ['Completed Today', isSandbox ? (leaderCompletedTasks || 3) : leaderCompletedTasks, CheckCircle2, '#1D9E75', isSandbox ? '▲ 18% vs yesterday' : 'Completed live tasks', isSandbox ? 'up' : 'flat'],
        ['In Progress', isSandbox ? Math.max(leaderOpenTasks - leaderBlockedTasks, 2) : Math.max(leaderOpenTasks - leaderBlockedTasks, 0), Clock3, '#F59E0B', '— No change', 'flat'],
        ['Blocked', isSandbox ? (leaderBlockedTasks || 1) : leaderBlockedTasks, AlertCircle, '#EF4444', leaderBlockedTasks ? '▼ needs attention' : '— Clear', leaderBlockedTasks ? 'down' : 'flat'],
      ]
    : dashboardRole === 'manager'
      ? [
          ['Team Tasks', isSandbox ? (leaderTaskCount || 15) : leaderTaskCount, ListTodo, '#7F77DD', isSandbox ? '▲ 12% vs yesterday' : '— waiting on team activity', isSandbox ? 'up' : 'flat'],
          ['Completion Rate', `${isSandbox ? (leaderCompletionRate || 67) : leaderCompletionRate}%`, CheckCircle2, '#1D9E75', isSandbox ? '▲ 8% vs yesterday' : '— waiting on updates', isSandbox ? 'up' : 'flat'],
          ['Active Blockers', managerBlockerCountForCards, AlertCircle, '#EF4444', managerBlockerCountForCards ? '▼ needs attention' : '▲ all clear', managerBlockerCountForCards ? 'down' : 'up'],
          ['Active Today', managerActiveTodayLabel, UsersRound, '#1D9E75', 'Live check-ins', 'flat'],
        ]
    : [
        ['Total Tasks', isSandbox ? (leaderTaskCount || 42) : leaderTaskCount, ListTodo, '#7F77DD', isSandbox ? '▲ 12% vs yesterday' : 'Real workspace tasks', isSandbox ? 'up' : 'flat'],
        ['Completed', isSandbox ? (leaderCompletedTasks || 28) : leaderCompletedTasks, CheckCircle2, '#1D9E75', isSandbox ? '▲ 18% vs yesterday' : 'Completed live tasks', isSandbox ? 'up' : 'flat'],
        ['In Progress', isSandbox ? Math.max(leaderOpenTasks - leaderBlockedTasks, 9) : Math.max(leaderOpenTasks - leaderBlockedTasks, 0), Clock3, '#F59E0B', '— No change', 'flat'],
        ['Overdue', isSandbox ? (leaderBlockedTasks || 5) : leaderBlockedTasks, AlertCircle, '#EF4444', isSandbox ? '▼ 20% vs yesterday' : 'Live overdue and blocked work', leaderBlockedTasks ? 'down' : 'flat'],
      ];
  const demoProgressRows = [
    ['Aman Verma', 'Landing Page', 100, 'Completed', '#1D9E75'],
    ['Priya Singh', 'Client Deck', 80, 'In Progress', '#7F77DD'],
    ['Rahul Mehta', 'Market Research', 60, 'In Progress', '#F59E0B'],
    ['Neha Gupta', 'Content Strategy', 40, 'In Progress', '#F59E0B'],
    ['Karan Arora', 'Competitor Analysis', 20, 'Overdue', '#EF4444'],
  ];
  const managerSandboxProgressRows = [
    ['Aman Verma', 'Landing Page', 100, 'Completed', '#1D9E75', '2m ago', 'green'],
    ['Priya Singh', 'Client Deck', 80, 'In Progress', '#7F77DD', '1h ago', 'orange'],
    ['Rahul Mehta', 'Market Research', 60, 'Blocked', '#EF4444', '3h+ ago', 'red'],
    ['Neha Gupta', 'Content Strategy', 40, 'In Progress', '#F59E0B', 'No update today', 'redBold'],
    ['Karan Arora', 'Competitor Analysis', 20, 'Overdue', '#EF4444', '3h+ ago', 'red'],
  ];
  const getLatestUpdateForManagerTask = (task) => {
    const assigneeId = task.assignee?.id || task.assignee_id;
    return allUpdates.find((update) => update.tasks?.id === task.id)
      || allUpdates.find((update) => assigneeId && update.user?.id === assigneeId)
      || null;
  };
  const managerLiveProgressRows = empTasks.map((task) => {
    const statusMeta = getTaskStatusMeta(task.status);
    const latestUpdate = getLatestUpdateForManagerTask(task);
    const updateAgeHours = latestUpdate?.created_at
      ? (Date.now() - new Date(latestUpdate.created_at).getTime()) / 3600000
      : null;
    const updateTone = task.status === 'blocked'
      ? 'red'
      : latestUpdate
        ? updateAgeHours > 24 ? 'redBold' : statusMeta.tone
        : 'neutral';
    return [
      task.assignee?.name || 'Unassigned',
      task.title || 'Untitled task',
      statusMeta.progress,
      statusMeta.label,
      statusMeta.color,
      latestUpdate ? formatRelativeTime(latestUpdate.created_at) : 'No update yet',
      updateTone,
      task.id,
      task.status,
      task.assignee?.email || ''
    ];
  });
  const managerProgressRows = managerLiveProgressRows.length
    ? managerLiveProgressRows
    : (isSandbox ? managerSandboxProgressRows : []);
  const baseEmployeeTaskRows = [
    ['Today', 'Verify customer email lists', 88, 'In Progress', '#7F77DD'],
    ['Today', 'Submit progress update', 100, 'Completed', '#1D9E75'],
    ['This Week', 'Share proof sheet', 62, 'In Progress', '#F59E0B'],
    ['Overdue', 'Resolve CRM blocker', 20, 'Blocked', '#EF4444'],
  ];
  const employeeTaskRows = baseEmployeeTaskRows.map(([group, task, progress, status, color]) => {
    const override = demoTaskOverrides[task];
    return override ? [group, task, override.progress, override.status, override.color] : [group, task, progress, status, color];
  });
  const demoTaskBriefs = {
    'Verify customer email lists': 'Manager brief: Open the campaign email sheet named "June Outreach Leads". Remove duplicate rows, verify bounce status for each address, mark invalid emails in red, and upload the cleaned sheet as proof. Final target: bounce risk under 1% before 6 PM.',
    'Submit progress update': 'Write today’s work update with what got completed, what is still in progress, any blocker, and one proof link or screenshot if available.',
    'Share proof sheet': 'Upload the reviewed Google Sheet or PDF export that confirms the verified customer email list. Add the file link in the proof section before marking complete.',
    'Resolve CRM blocker': 'Check why the CRM import is failing for the latest contact batch. Capture the error screen, mention what you tried, and tag the manager if access is needed.',
    'Landing page polish': 'Review the landing page sections, fix visual spacing issues, and attach before/after screenshots for the final UI polish pass.',
    'Verify Supabase auth': 'Test signup, verification, login, and dashboard redirects. Note any failed route, exact error message, and browser screenshot.',
    'Prepare launch checklist': 'Create a short checklist of production readiness items: auth, email, database schema, payments, storage, analytics, and support contact.'
  };
  const openDemoTask = (taskData) => {
    const [group, task, progress, status, color] = taskData;
    setDemoTaskUpdate('');
    setDemoProofLink('');
    setDemoProofFiles([]);
    setSelectedDemoTask({
      group,
      task,
      progress,
      status,
      color,
      owner: user?.name || 'Employee User',
      due: group === 'Overdue' ? 'Yesterday' : group === 'Today' ? 'Today, 6:00 PM' : 'This Friday',
      manager: 'Rahul Sharma',
      description: demoTaskBriefs[task] || 'Complete the assigned work, attach proof if available, and update status so the team dashboard stays live.',
    });
  };
  const demoActivityRows = [
    ['Aman completed', 'Landing Page', '2m ago', CheckCircle2, '#1D9E75'],
    ['Priya updated progress on', 'Client Deck', '15m ago', Activity, '#7F77DD'],
    ['Rahul uploaded', 'Market Research', '32m ago', ClipboardCheck, '#F59E0B'],
    ['Neha added a comment on', 'Content Strategy', '45m ago', MessageSquareText, '#F59E0B'],
    ['Karan missed a deadline on', 'Competitor Analysis', '1h ago', AlertCircle, '#EF4444'],
  ];
  const managerSandboxActivityRows = [
    ['Aman completed', 'Landing Page', '2m ago', CheckCircle2, '#1D9E75', 'Aman moved the landing page QA checklist to done and attached final screenshots.'],
    ['Priya updated progress on', 'Client Deck', '15m ago', Activity, '#7F77DD', 'Priya updated the client deck with stakeholder notes and marked two slides for review.'],
    ['Rahul uploaded', 'Market Research', '32m ago', ClipboardCheck, '#F59E0B', 'Rahul attached research notes but flagged missing CRM export access.'],
    ['Neha added a comment on', 'Content Strategy', '45m ago', MessageSquareText, '#F59E0B', 'Neha added next-step ideas for the content calendar and asked for priority order.'],
    ['Karan missed a deadline on', 'Competitor Analysis', '1h ago', AlertCircle, '#EF4444', 'The competitor report missed the noon cutoff and needs manager follow-up.'],
  ];
  const managerLiveActivityRows = [
    ...managerActiveBlockers.map((blocker) => [
      `${blocker.assignee?.name || 'Team member'} is blocked`,
      blocker.title,
      blocker.blockedAgo,
      AlertCircle,
      '#EF4444',
      'This task is marked blocked. Resolve it after the team has a clear next step.'
    ]),
    ...allUpdates.slice(0, 8).map((update) => [
      `${update.user?.name || 'Team member'} submitted update`,
      update.tasks?.title || 'Daily check-in',
      formatRelativeTime(update.created_at),
      update.proof_link ? FileCheck2 : ClipboardCheck,
      update.quality_score && Number(update.quality_score) >= 8 ? '#1D9E75' : '#7F77DD',
      update.progress_text || 'Progress update submitted.'
    ])
  ].slice(0, 10);
  const managerActivityRows = managerLiveActivityRows.length
    ? managerLiveActivityRows
    : (isSandbox ? managerSandboxActivityRows : []);
  const managerStandupSections = nudgeAiData.standup?.sections || null;
  const managerStandupCards = managerStandupSections
    ? [
        ['Done', managerStandupSections.done?.join(' ') || 'No completed updates in the latest brief.'],
        ['In progress', managerStandupSections.in_progress?.join(' ') || 'No active progress items in the latest brief.'],
        ['Blocked', managerStandupSections.blocked?.join(' ') || 'No blockers found in the latest brief.'],
        ['Manager attention', managerStandupSections.attention?.join(' ') || 'No urgent manager action found.'],
      ]
    : [
        ['Brief', nudgeAiData.standup?.brief || 'Generate a live team brief from recent updates, blockers, and task progress.'],
        ['Tasks', `${leaderTaskCount} team tasks tracked in your department.`],
        ['Blockers', managerBlockerCountForCards ? `${managerBlockerCountForCards} active blocker${managerBlockerCountForCards === 1 ? '' : 's'} need attention.` : 'No active blockers right now.'],
        ['Next action', todayUpdatesCount ? 'Review fresh updates and clear unclear blockers.' : 'Ask the team to submit today’s first update.'],
      ];
  const managerNoUpdateAlerts = (isSandbox
    ? [
        { name: 'Neha Gupta', detail: 'No update today', action: 'Send nudge' },
        { name: 'Karan Arora', detail: 'Deadline missed, no fresh proof', action: 'Escalate' },
      ]
    : managerProgressRows
        .filter(([, , , , , lastUpdate, updateTone]) => updateTone === 'red' || updateTone === 'redBold' || /no update/i.test(String(lastUpdate)))
        .slice(0, 3)
        .map(([name, task, , , , lastUpdate]) => ({ name, detail: `${task} · ${lastUpdate}`, action: 'Send nudge' })));
  const managerProofRequiredTasks = (isSandbox
    ? [
        { title: 'Client deck approval', owner: 'Priya Singh', proof: 'Deck link or PDF export' },
        { title: 'CRM import access issue', owner: 'Rahul Mehta', proof: 'Screenshot or access note' },
      ]
    : empTasks
        .filter((task) => task.requires_proof || task.proof_required || /proof|verify|approval|review/i.test(task.title || ''))
        .slice(0, 3)
        .map((task) => ({
          title: task.title || 'Proof required task',
          owner: task.assignee?.name || 'Team member',
          proof: task.proof_label || 'File, link, or screenshot',
        })));
  const managerQualityScoreCards = [
    ['Avg update quality', averageQuality === '—' ? (isSandbox ? '8.6' : '—') : averageQuality, 'Coach short, specific updates.'],
    ['Needs rewrite', managerNoUpdateAlerts.length || (isSandbox ? 2 : 0), 'Updates missing outcome, blocker, or proof.'],
    ['Strong updates', todayUpdatesCount || (isSandbox ? 11 : 0), 'Clear enough for manager review.'],
  ];
  const managerCompletedCount = managerProgressRows.filter(([, , , status]) => status === 'Completed').length || (isSandbox ? 6 : 0);
  const managerInProgressCount = managerProgressRows.filter(([, , , status]) => status === 'In Progress').length || (isSandbox ? 5 : 0);
  const managerAtRiskCount = managerProgressRows.filter(([, , , status]) => ['Blocked', 'Overdue'].includes(status)).length || (isSandbox ? 3 : 0);
  const managerChartData = [
    { day: 'Mon', completed: Math.max(managerCompletedCount - 3, 1), updates: Math.max(managerActiveToday - 2, 2), blockers: Math.max(managerAtRiskCount - 1, 0) },
    { day: 'Tue', completed: Math.max(managerCompletedCount - 2, 2), updates: Math.max(managerActiveToday - 1, 3), blockers: managerAtRiskCount },
    { day: 'Wed', completed: Math.max(managerCompletedCount - 1, 3), updates: Math.max(managerActiveToday, 4), blockers: Math.max(managerAtRiskCount - 1, 0) },
    { day: 'Thu', completed: managerCompletedCount, updates: Math.max(managerActiveToday + 1, 5), blockers: managerAtRiskCount },
    { day: 'Fri', completed: Math.max(managerCompletedCount + 1, 4), updates: Math.max(managerActiveToday + 2, 6), blockers: Math.max(managerAtRiskCount - 2, 0) },
  ];
  const managerStatusMixData = [
    { label: 'Done', value: managerCompletedCount, fill: '#1D9E75' },
    { label: 'Doing', value: managerInProgressCount, fill: '#3C3489' },
    { label: 'Risk', value: managerAtRiskCount, fill: '#EF4444' },
  ];
  const managerPriorityActions = [
    ['No updates', managerNoUpdateAlerts.length || 0, 'Send team nudge before standup', AlertCircle, '#EF4444'],
    ['Proof needed', managerProofRequiredTasks.length || 0, 'Request link, file, or screenshot', FileCheck2, '#F59E0B'],
    ['Blockers', managerActiveBlockers.length || 0, 'Escalate the highest-risk item', Zap, '#3C3489'],
  ];
  const managerSmartTaskTemplates = [
    ['Proof required follow-up', 'Ask for completed work with link, file, or screenshot proof.'],
    ['Blocker unblock task', 'Assign next action, owner, and escalation path in one click.'],
    ['Weekly win summary', 'Collect outcomes for Friday report and appreciation notes.'],
  ];
  const adminSetupChecklist = [
    ['Company profile', Boolean(user?.organizations?.name), 'Add company name, logo, and workspace basics.'],
    ['Departments', Boolean(user?.department_id) || adminUsers.some((item) => item.department_id), 'Create teams so managers see scoped dashboards.'],
    ['Invite employees', adminUsers.length > 1 || isSandbox, 'Invite team members and assign roles.'],
    ['WhatsApp numbers', adminUsers.some((item) => item.phone_number) || isSandbox, 'Add phone numbers before WhatsApp nudges.'],
    ['First task flow', empTasks.length > 0 || isSandbox, 'Create a proof-ready task and test updates.'],
  ];
  const getManagerLastUpdateClass = (tone) => {
    if (tone === 'green') return 'text-[#1D9E75]';
    if (tone === 'orange') return 'text-[#F59E0B]';
    if (tone === 'redBold') return 'font-black text-[#EF4444]';
    if (tone === 'red') return 'text-[#EF4444]';
    return 'text-[#8A8894]';
  };
  const employeeRecentActivityRows = [
    ['Completed task', 'Verify customer email lists', '2m ago', CheckCircle2, '#1D9E75'],
    ['Progress update submitted', 'Daily check-in', '1h ago', Activity, '#3B82F6'],
    ['Proof uploaded', 'Cleaned email sheet PDF', 'Yesterday', FileCheck2, '#F59E0B'],
    ['Blocker flagged', 'CRM import access issue', 'Yesterday', AlertCircle, '#EF4444'],
  ];
  const demoWorkQueueRows = [
    ['Today', 'Landing page polish', 74, 'In Progress', '#7F77DD'],
    ['Today', 'Verify Supabase auth', 42, 'In Progress', '#7F77DD'],
    ['This Week', 'Prepare launch checklist', 18, 'At risk', '#F59E0B']
  ];
  const demoWeeklyProgressData = [
    { day: 'Mon', tasks: 2 },
    { day: 'Tue', tasks: 4 },
    { day: 'Wed', tasks: 3 },
    { day: 'Thu', tasks: 5 },
    { day: 'Fri', tasks: 4 },
    { day: 'Sat', tasks: 6 },
    { day: 'Sun', tasks: 3 }
  ];
  const weeklyDateKeys = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      day: date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }),
    };
  });
  const actualWeeklyProgressData = weeklyDateKeys.map(({ key, day }) => {
    const dayUpdates = empHistory.filter((item) => {
      const createdAt = item.created_at ? new Date(item.created_at) : null;
      if (!createdAt) return false;
      return createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) === key;
    });
    const completedTasks = dayUpdates.reduce((sum, item) => (
      sum + Number(item.tasks_completed || item.completed_tasks || item.completed_count || 1)
    ), 0);

    return { day, tasks: completedTasks };
  });
  const actualProgressHasSignals = actualWeeklyProgressData.some((item) => item.tasks > 0);
  const realEmployeeTasks = empTasks.map((task) => ({
    ...task,
    normalizedStatus: normalizeTaskStatus(task.status),
  }));
  const realEmployeeTaskTotal = empStats
    ? (empStats.todo || 0) + (empStats.inProgress || 0) + (empStats.completed || 0) + (empStats.blocked || 0)
    : realEmployeeTasks.length;
  const realEmployeeTaskStats = {
    total: realEmployeeTaskTotal,
    completed: empStats?.completed ?? realEmployeeTasks.filter((task) => task.normalizedStatus === 'completed').length,
    inProgress: empStats?.inProgress ?? realEmployeeTasks.filter((task) => task.normalizedStatus === 'in_progress').length,
    blocked: empStats?.blocked ?? realEmployeeTasks.filter((task) => task.normalizedStatus === 'blocked').length,
  };
  const liveWeeklyProgressFallback = weeklyDateKeys.map(({ day }, index) => ({
    day,
    tasks: index === weeklyDateKeys.length - 1 ? realEmployeeTaskStats.completed : 0,
  }));
  const weeklyProgressData = isSandbox
    ? demoWeeklyProgressData
    : (actualProgressHasSignals ? actualWeeklyProgressData : liveWeeklyProgressFallback);
  const realEmployeeStatCards = [
    ['Total Tasks', realEmployeeTaskStats.total, ListTodo, '#7F77DD', realEmployeeTaskStats.total ? '▲ synced from workspace' : '— waiting for tasks', realEmployeeTaskStats.total ? 'up' : 'flat'],
    ['Completed', realEmployeeTaskStats.completed, CheckCircle2, '#1D9E75', realEmployeeTaskStats.completed ? '▲ momentum building' : '— first win pending', realEmployeeTaskStats.completed ? 'up' : 'flat'],
    ['In Progress', realEmployeeTaskStats.inProgress, Clock3, '#F59E0B', realEmployeeTaskStats.inProgress ? '— active focus' : '— no active task', 'flat'],
    ['Blocked', realEmployeeTaskStats.blocked, AlertCircle, '#EF4444', realEmployeeTaskStats.blocked ? '▼ needs attention' : '— all clear', realEmployeeTaskStats.blocked ? 'down' : 'flat'],
  ];
  const realEmployeeProgressForStatus = (status = '') => {
    const normalized = normalizeTaskStatus(status);
    if (normalized === 'completed') return 100;
    if (normalized === 'in_progress') return 62;
    if (normalized === 'blocked') return 24;
    return 8;
  };
  const realEmployeeColorForStatus = (status = '') => {
    const normalized = normalizeTaskStatus(status);
    if (normalized === 'completed') return '#1D9E75';
    if (normalized === 'in_progress') return '#7F77DD';
    if (normalized === 'blocked') return '#EF4444';
    return '#F59E0B';
  };
  const realEmployeeStatusLabel = (status = '') => {
    const normalized = normalizeTaskStatus(status);
    if (normalized === 'in_progress') return 'In Progress';
    if (normalized === 'completed') return 'Completed';
    if (normalized === 'blocked') return 'Blocked';
    return 'Not started';
  };
  const realEmployeeStatusClass = (status = '') => {
    const normalized = normalizeTaskStatus(status);
    if (normalized === 'completed') return 'bg-[#E8F7F1] text-[#1D9E75]';
    if (normalized === 'in_progress') return 'bg-[#EEEDFE] text-[#3C3489]';
    if (normalized === 'blocked') return 'bg-rose-50 text-rose-600';
    return 'bg-amber-50 text-amber-700';
  };
  const realEmployeeTaskRows = realEmployeeTasks.length ? realEmployeeTasks : [];
  const realEmployeeRecentActivity = empHistory.slice(0, 4).map((item, index) => {
    const Icon = index % 4 === 0 ? Activity : index % 4 === 1 ? CheckCircle2 : index % 4 === 2 ? FileCheck2 : AlertCircle;
    const color = index % 4 === 0 ? '#3B82F6' : index % 4 === 1 ? '#1D9E75' : index % 4 === 2 ? '#F59E0B' : '#EF4444';
    return {
      id: item.id || index,
      Icon,
      color,
      title: item.tasks?.title ? `Updated ${item.tasks.title}` : 'Progress update submitted',
      copy: item.progress_text || 'Shared a daily update.',
      when: formatDisplayDate(item.created_at),
    };
  });
  const realEmployeeLocationPills = [
    ['office', 'Office'],
    ['home', 'Home'],
    ['client_site', 'Client site'],
    ['travel', 'Travel'],
  ];
  const employeeDashboardTaskRows = isSandbox
    ? employeeTaskRows
    : realEmployeeTaskRows.map((task) => [
        task.due_date ? formatDisplayDate(task.due_date) : 'Assigned',
        task.title || 'Untitled task',
        realEmployeeProgressForStatus(task.status),
        realEmployeeStatusLabel(task.status),
        realEmployeeColorForStatus(task.status),
      ]);
  const employeeDashboardWorkQueueRows = isSandbox
    ? demoWorkQueueRows
    : realEmployeeTaskRows.map((task) => [
        task.due_date ? formatDisplayDate(task.due_date) : 'Assigned',
        task.title || 'Untitled task',
        realEmployeeProgressForStatus(task.status),
        realEmployeeStatusLabel(task.status),
        realEmployeeColorForStatus(task.status),
      ]);
  const employeeDashboardActivityRows = isSandbox
    ? employeeRecentActivityRows
    : realEmployeeRecentActivity.map(({ Icon, color, title, copy, when }) => [title, copy, when, Icon, color]);
  const employeeDashboardWeeklyProgressData = weeklyProgressData;
  const hasRealEmployeeGrowthSignals = isSandbox || Boolean(growthSummary) || realEmployeeTaskStats.completed > 0 || empHistory.length > 0;
  const realEmployeeCompletionRate = realEmployeeTaskStats.total
    ? Math.round((realEmployeeTaskStats.completed / realEmployeeTaskStats.total) * 100)
    : 0;
  const hasEmployeeProgressSignals = isSandbox || actualProgressHasSignals || realEmployeeTaskStats.total > 0 || empHistory.length > 0;
  const employeeMomentumRows = isSandbox
    ? [
        ['Completion rate', '82%', '▲ 12% this week', '#1D9E75'],
        ['Check-in streak', '9 days', 'Personal best', '#7F77DD'],
        ['Blockers resolved', '4', '2 faster than avg', '#F59E0B']
      ]
    : [
        ['Completion rate', `${realEmployeeCompletionRate}%`, realEmployeeTaskStats.total ? 'Synced from assigned tasks' : 'No assigned tasks yet', realEmployeeTaskStats.total ? '#1D9E75' : '#8A8894'],
        ['Check-ins logged', `${empHistory.length}`, empHistory.length ? 'Building your rhythm' : 'First check-in pending', empHistory.length ? '#7F77DD' : '#8A8894'],
        ['Blockers active', `${realEmployeeTaskStats.blocked}`, realEmployeeTaskStats.blocked ? 'Needs attention' : 'All clear', realEmployeeTaskStats.blocked ? '#EF4444' : '#1D9E75']
      ];
  const employeeGrowthSnapshotRows = isSandbox
    ? [
        ['30 days', 18],
        ['60 days', 39],
        ['90 days', 64]
      ]
    : [
        ['30 days', growthSummary?.completed_tasks ?? realEmployeeTaskStats.completed],
        ['60 days', growthSummary?.completed_tasks ?? realEmployeeTaskStats.completed],
        ['90 days', growthSummary?.completed_tasks ?? realEmployeeTaskStats.completed]
      ];
  const employeePersonalWins = isSandbox
    ? [
        ['Resolved blocker without escalation', Zap, '#FFF3E0', '#F59E0B'],
        ['9-day check-in streak', Trophy, '#FFFDE7', '#D97706'],
        ['Helped teammate unblock', Star, '#EEEDFE', '#7F77DD']
      ]
    : [];
  const renderEmptyState = ({ title, sub, Icon = Sparkles, actionLabel, onAction }) => (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEEDFE] text-[#7F77DD] shadow-sm">
        <Icon className="h-8 w-8" />
      </span>
      <p className="mt-4 max-w-sm text-base font-extrabold text-[#2C2C2A]">{title}</p>
      {sub ? <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-[#8A8894]">{sub}</p> : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7F77DD] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#3C3489]"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
  const renderLatestAiResult = (result) => {
    if (!result) {
      return (
        <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-5">
          <p className="text-sm font-black text-[#2C2C2A]">No AI result yet</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#6E6B78]">Run one AI action and the latest brief, forecast, appreciation draft, or skill signal will appear here in a readable layout.</p>
        </div>
      );
    }

    const sections = result.sections && typeof result.sections === 'object' ? Object.entries(result.sections) : [];
    const formatAiItem = (item) => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return String(item || '');
      return item.title || item.summary || item.recommendation || item.message || item.name || Object.values(item).filter(Boolean).join(' · ');
    };

    return (
      <div className="space-y-4">
        {result.brief ? (
          <div className="rounded-2xl border border-[#EEEDFE] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8A8894]">Brief</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#2C2C2A]">{result.brief}</p>
          </div>
        ) : null}
        {sections.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {sections.map(([label, items]) => (
              <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7F77DD]">{label.replace(/_/g, ' ')}</p>
                <div className="mt-3 space-y-2">
                  {Array.isArray(items) && items.length ? items.map((item, index) => (
                    <p key={`${label}-${index}`} className="rounded-xl bg-[#FCFCFF] px-3 py-2 text-xs font-semibold leading-5 text-[#5F5E5A]">
                      {formatAiItem(item)}
                    </p>
                  )) : (
                    <p className="text-xs font-semibold text-[#8A8894]">No items yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {result.generated_at ? (
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8A8894]">
            Generated {formatDisplayDate(result.generated_at)}
          </p>
        ) : null}
      </div>
    );
  };
  const renderNudgeSpacePostList = ({ emptyTitle, emptySub, emptyIcon = MessageSquareText }) => {
    if (nudgeSpaceLoading) {
      return (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-[#DAD7FB] bg-[#FCFCFF] p-8 text-center">
          <div>
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#7F77DD]" />
            <p className="mt-3 text-sm font-extrabold text-[#5F5E5A]">Loading NudgeSpace...</p>
          </div>
        </div>
      );
    }

    if (!nudgeSpacePosts.length) {
      return renderEmptyState({ title: emptyTitle, sub: emptySub, Icon: emptyIcon });
    }

    return (
      <div className="space-y-4">
        {nudgeSpacePosts.map((post) => {
          const authorName = post.author?.name || post.author?.email || 'NudgeHQ user';
          const initials = authorName.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'N';
          const createdLabel = post.created_at
            ? new Date(post.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Just now';
          const typeLabel = String(post.post_type || 'status').replace(/_/g, ' ');

          return (
            <article key={post.id} className="rounded-[28px] border border-[#E4DEFF] bg-white p-5 shadow-[0_16px_40px_rgba(127,119,221,0.12)]">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#7F77DD] text-sm font-black text-white">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-[#1C1739]">{authorName}</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8894]">{createdLabel}</p>
                    </div>
                    <span className="rounded-full bg-[#F6F4FF] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#6D63D9]">
                      {typeLabel}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#5F5E5A]">{post.content}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#F0ECFF] pt-4">
                    <span className="rounded-full bg-[#F7FFFB] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#1D9E75]">
                      {post.space === 'u_space' ? 'Private U Space' : `${post.visibility_scope || 'company'} scope`}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };
  const activeSessionRole = user?.role || authRole || 'employee';
  const activeSessionName = user?.name || user?.email || 'workspace';

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-[#2C2C2A] font-sans">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed left-1/2 z-[100] flex items-center gap-3 rounded-lg px-5 py-3.5 shadow-lg border text-sm font-semibold max-w-md w-max ${
              statusMessage.type === 'success'
                ? 'bg-[#E8F7F1] border-[#1D9E75]/30 text-[#1D9E75]'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : (
              <Sparkles className="h-5 w-5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {demoAiHelperOpen && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-[#111827]/45 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex h-[min(44rem,88vh)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#111827]/25"
            >
              <div className="flex items-center justify-between gap-4 border-b border-[#EEEDFE] bg-gradient-to-r from-[#3C3489] via-[#7F77DD] to-[#1D9E75] px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-extrabold">NudgeAI Helper</p>
                    <p className="text-xs font-semibold text-white/75">Ask anything without leaving your dashboard</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoAiHelperOpen(false)}
                  className="rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
                  aria-label="Close NudgeAI helper"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-[#FCFCFF] p-5">
                {demoAiHelperMessages.map((message, index) => (
                  <div
                    key={`${message.from}-${index}-${message.text.slice(0, 16)}`}
                    className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-7 shadow-sm ${
                        message.from === 'user'
                          ? 'bg-[#3C3489] text-white'
                          : 'border border-[#EEEDFE] bg-white text-[#2C2C2A]'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {demoAiHelperLoading ? (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-[#EEEDFE] bg-white px-5 py-4 text-sm font-semibold text-[#5F5E5A] shadow-sm">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#7F77DD]" />
                    NudgeAI is thinking...
                  </div>
                ) : null}
              </div>

              <div className="border-t border-[#EEEDFE] bg-white p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {['Solve my coding doubt', 'Draft a status update', 'Plan my next task'].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submitDemoAiHelperQuestion(prompt)}
                      className="rounded-full border border-[#DAD7FB] bg-[#FCFCFF] px-3 py-1.5 text-xs font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitDemoAiHelperQuestion();
                  }}
                  className="flex gap-3"
                >
                  <input
                    value={demoAiHelperInput}
                    onChange={(event) => setDemoAiHelperInput(event.target.value)}
                    className="min-w-0 flex-1 rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none transition focus:border-[#7F77DD]"
                    placeholder="Ask NudgeAI anything..."
                  />
                  <button
                    type="submit"
                    disabled={demoAiHelperLoading || !demoAiHelperInput.trim()}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3C3489] text-white transition hover:bg-[#7F77DD] disabled:opacity-45"
                    aria-label="Send NudgeAI message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SITE HEADER --- */}
      {currentView !== 'dashboard' && (
      <header className={`${currentView === 'landing' ? 'absolute inset-x-0 top-0' : 'sticky inset-x-0 top-0 border-b border-[#EEEDFE] bg-white/95 shadow-sm shadow-[#EEEDFE]/70'} z-50`}>
        <nav className={`${currentView === 'landing'
          ? 'mx-auto mt-6 flex max-w-6xl items-center justify-between rounded-full border border-white/80 bg-white/90 px-6 py-3 shadow-2xl shadow-[#3C3489]/10 backdrop-blur-xl sm:px-7'
          : 'mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8'}`}
        >
          <a
            href="#top"
            onClick={() => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
              }
            }}
            className="flex items-center gap-3"
            aria-label="NudgeHQ home"
          >
            <img src="/brand/nudgehq-icon.svg" alt="" className="h-10 w-10 rounded-lg" />
            <span className="text-lg font-bold text-[#3C3489]">NudgeHQ</span>
          </a>

          {['landing', 'signin', 'signup', 'blog', 'privacy', 'terms', 'contact', 'faq', 'why_nudgehq', 'nudgeai', 'verify_email', 'choose_plan', 'payment', 'onboarding', 'accept_invite', 'join_workspace', 'oauth_callback'].includes(currentView) ? (
            <>
              <div className="hidden items-center gap-8 text-sm font-medium text-[#5F5E5A] md:flex">
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#features">Features</a>
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#pricing">Pricing</a>
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#security">Security</a>
                <a
                  className="transition hover:text-[#3C3489]"
                  href="/blog"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentView('blog');
                  }}
                >
                  Blog
                </a>
                <a
                  className="transition hover:text-[#3C3489]"
                  href="/why-nudgehq"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentView('why_nudgehq');
                  }}
                >
                  Why NudgeHQ?
                </a>
                <a
                  className="hidden items-center gap-2 rounded-full bg-[#E8F7F1] px-3 py-1.5 font-bold text-[#1D9E75] transition hover:bg-[#DDF3EA] lg:inline-flex"
                  href="/contact"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentView('contact');
                  }}
                >
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                  Connect with us
                </a>
                <a
                  className="transition hover:text-[#3C3489]"
                  href="/faq"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentView('faq');
                  }}
                >
                  FAQ
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {token ? (
                  <>
                    <span className="hidden max-w-[180px] truncate rounded-full border border-[#EEEDFE] bg-[#FCFCFF] px-3 py-2 text-xs font-bold text-[#5F5E5A] sm:inline-flex">
                      Signed in as {activeSessionName}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateDashboard(activeSessionRole)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#111827] bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489] sm:px-5"
                      title={`Open ${getDashboardLabel(activeSessionRole)}`}
                    >
                      Go to workspace
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={openSignin}
                      className={`inline-flex items-center rounded-full px-3 py-2.5 text-sm font-semibold transition hover:bg-[#EEEDFE] ${
                        currentView === 'signin' ? 'text-[#7F77DD]' : 'text-[#3C3489]'
                      }`}
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      onClick={openSignup}
                      className="inline-flex items-center rounded-full border border-[#111827] bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489] sm:px-5"
                    >
                      Join Now
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="hidden text-xs font-semibold px-2.5 py-1 rounded bg-[#F4F3FF] border border-[#EEEDFE] sm:inline-flex items-center gap-1.5 text-[#5F5E5A]">
                <Activity className="h-3.5 w-3.5 text-[#1D9E75]" />
                {isSandbox ? 'Sandbox Environment' : `Server Port: ${serverPort}`}
              </span>
              {isSandbox ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4" />
                  Exit Demo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            </div>
          )}
        </nav>
      </header>
      )}

      {/* --- VIEW ROUTER --- */}

      {/* VIEW: LEGAL PAGES */}
      {currentView === 'privacy' && (
        <LegalPage pageKey="privacy" setCurrentView={setCurrentView} />
      )}

      {currentView === 'terms' && (
        <LegalPage pageKey="terms" setCurrentView={setCurrentView} />
      )}

      {currentView === 'faq' && (
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#FCFCFF] px-5 py-16 text-[#2C2C2A] sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,#EEEDFE_0%,transparent_34%),radial-gradient(circle_at_82%_18%,#E8F7F1_0%,transparent_30%),linear-gradient(135deg,#FFFFFF_0%,#F7FAFF_54%,#F3F1FF_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-35" />
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-4 border-b border-[#DAD7FB] pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#1D9E75]">NudgeHQ FAQ</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-[#2C2C2A] sm:text-6xl">
                  Answers without making the landing page endless.
                </h1>
              </div>
              <button
                type="button"
                onClick={openSignup}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#3C3489] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#3C3489]/20 transition hover:bg-[#7F77DD]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
              <aside className="space-y-8">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#3C3489]">Interactive Search</label>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 shadow-sm">
                    <Search className="h-5 w-5 text-[#7F77DD]" />
                    <input
                      value={faqSearch}
                      onChange={(event) => setFaqSearch(event.target.value)}
                      placeholder="Filter inquiries..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#2C2C2A] outline-none placeholder:text-[#9B9A96]"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#3C3489]">Category Directory</p>
                  <div className="mt-4 grid gap-3">
                    {faqCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setFaqCategory(category)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-extrabold transition ${
                          faqCategory === category
                            ? 'border-[#7F77DD] bg-[#EEEDFE] text-[#3C3489] shadow-sm'
                            : 'border-[#EEEDFE] bg-white text-[#5F5E5A] hover:border-[#DAD7FB] hover:text-[#3C3489]'
                        }`}
                      >
                        {category}
                        <Plus className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#DAD7FB] bg-white p-6 shadow-lg shadow-[#3C3489]/8">
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#7F77DD]">Direct Channel</p>
                  <h2 className="mt-5 text-2xl font-extrabold leading-tight text-[#2C2C2A]">Still have a complex question?</h2>
                  <p className="mt-4 text-sm leading-6 text-[#5F5E5A]">
                    Ask us about setup, pricing, teams, NudgeAI, or early access.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('contact')}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em] text-[#1D9E75]"
                  >
                    Connect with us
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </aside>

              <div className="rounded-[2rem] border border-[#DAD7FB] bg-white/90 p-5 shadow-xl shadow-[#3C3489]/10 backdrop-blur md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#7F77DD]">
                    {filteredFaqs.length} inquiries
                  </p>
                  <span className="rounded-full border border-[#DAD7FB] bg-[#EEEDFE] px-3 py-1 text-xs font-bold text-[#3C3489]">
                    {faqCategory}
                  </span>
                </div>

                <div className="divide-y divide-[#EEEDFE]">
                  {filteredFaqs.length ? filteredFaqs.map(({ question, answer, category }, index) => (
                    <motion.details
                      key={question}
                      open={index === 0}
                      {...cardMotion}
                      transition={{ duration: 0.45, delay: index * 0.04, ease: 'easeOut' }}
                      className="group py-7"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                        <span>
                          <span className="block text-xs font-extrabold uppercase tracking-[0.2em] text-[#1D9E75]">{category}</span>
                          <span className="mt-2 block text-2xl font-extrabold leading-tight text-[#2C2C2A]">{question}</span>
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DAD7FB] bg-[#EEEDFE] text-[#3C3489] transition group-open:rotate-45">
                          <Plus className="h-5 w-5" />
                        </span>
                      </summary>
                      <p className="mt-5 max-w-3xl text-base leading-8 text-[#5F5E5A]">{answer}</p>
                    </motion.details>
                  )) : (
                    <div className="rounded-2xl border border-[#DAD7FB] bg-[#FCFCFF] p-6 text-sm font-semibold text-[#5F5E5A]">
                      No FAQ matched that search yet. Try another keyword or connect with us.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </section>
	      )}

      {currentView === 'contact' && (
        <section className="relative isolate overflow-hidden bg-[#F7FAFF] px-5 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#EEF4FF_0%,#FFFFFF_48%,#EAF8F2_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-30" />
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div {...cardMotion}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DAD7FB] bg-white px-4 py-2 text-sm font-extrabold text-[#3C3489] shadow-lg shadow-[#3C3489]/5">
                <MessageSquareText className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
                Connect with NudgeHQ
              </span>
              <h1 className="mt-6 max-w-xl text-5xl font-extrabold leading-tight text-[#1E2737] sm:text-6xl">
                Tell us what you want to build.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#5F5E5A]">
                Share your query, demo request, pricing question, or partnership idea. It lands directly in the official NudgeHQ inbox.
              </p>
              <div className="mt-8 grid gap-3">
                {[
                  ['Official inbox', 'hello.nudgehq@gmail.com', Mail],
                  ['Fast context', 'Add details so we can reply properly', MessageSquareText],
                  ['Startup friendly', 'Demo, support, pricing, and feedback', Sparkles]
                ].map(([title, copy, Icon]) => (
                  <div key={title} className="workspace-card-quiet flex items-center gap-4 rounded-2xl p-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F7F1] text-[#1D9E75]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-extrabold text-[#2C2C2A]">{title}</p>
                      <p className="mt-1 text-sm font-medium text-[#5F5E5A]">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...cardMotion} className="rounded-[2rem] border border-[#DAD7FB] bg-white p-6 shadow-2xl shadow-[#3C3489]/12 sm:p-8">
              <div className="flex items-center gap-3">
                <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-md shadow-[#3C3489]/10" />
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2C2C2A]">Send a query</h2>
                  <p className="text-sm text-[#5F5E5A]">We will reply from the official NudgeHQ email.</p>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="mt-7 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Your name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="mt-2 block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-2 block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Query type</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
                  >
                    <option>Product demo</option>
                    <option>Pricing question</option>
                    <option>Support</option>
                    <option>Partnership</option>
                    <option>Feedback</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Detailed query</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="mt-2 block min-h-36 w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
                    placeholder="Tell us what you need help with..."
                    required
                  />
                </div>

                {contactSuccess ? (
                  <div className="rounded-2xl border border-[#1D9E75]/25 bg-[#E8F7F1] p-4 text-sm font-bold text-[#1D9E75]">
                    Your query was sent. We will reply at your email soon.
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3C3489] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#3C3489]/20 transition hover:bg-[#7F77DD] disabled:opacity-50"
                >
                  {contactLoading ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  Send query
                </button>
              </form>
            </motion.div>
          </div>

          <motion.div {...cardMotion} className="mx-auto mt-10 max-w-6xl overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-[#161238] p-6 text-white shadow-2xl shadow-[#3C3489]/18 sm:p-8">
            <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white/80">
                  <Sparkles className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
                  Need fast answers?
                </span>
                <h2 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
                  Ask NudgeAI before sending a long email.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
                  For quick questions about pricing, features, dashboards, onboarding, employee workflows, or what NudgeHQ can do, use the NudgeAI assistant in the corner.
                </p>
              </div>
              <div className="rounded-3xl border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div className="rounded-2xl bg-white p-5 text-[#2C2C2A]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEEDFE] text-[#3C3489]">
                      <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-extrabold text-[#2C2C2A]">Try asking</p>
                      <p className="text-xs font-semibold text-[#5F5E5A]">NudgeAI answers instantly</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-[#5F5E5A]">
                    <p className="rounded-xl bg-[#F4F3FF] px-4 py-3">What features does NudgeHQ have?</p>
                    <p className="rounded-xl bg-[#E8F7F1] px-4 py-3">How does NudgeAI help HR teams?</p>
                    <p className="rounded-xl bg-[#FCFCFF] px-4 py-3">What is the current pricing?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('nudgeai')}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3C3489] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#7F77DD]"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Ask NudgeAI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {currentView === 'blog' && (
        <section className="relative isolate overflow-hidden bg-[#F7FAFF] px-5 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_12%,rgba(127,119,221,0.18),transparent_32%),radial-gradient(circle_at_84%_16%,rgba(29,158,117,0.16),transparent_28%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-35" />
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Blog"
              title="Stories around founders, product, and building NudgeHQ."
              copy="A small editorial corner for founder journeys, operating insights, and the thinking behind NudgeHQ."
            />

            <motion.article
              {...cardMotion}
              className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/10"
            >
              <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="bg-[linear-gradient(160deg,#17142C_0%,#26224B_55%,#302A62_100%)] p-8 text-white sm:p-10">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/80">
                    Founder feature
                  </span>
                  <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Shaurya Sharma on building NudgeHQ.</h1>
                  <p className="mt-4 text-sm font-semibold leading-7 text-white/75">
                    A founder spotlight covering the NudgeHQ story, why the product exists, and what problem it is trying to solve for modern teams.
                  </p>
                </div>

                <div className="p-8 sm:p-10">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">Latest article</p>
                  <h2 className="mt-3 text-2xl font-black text-[#1C1739]">Shaurya Sharma, NudgeHQ</h2>
                  <p className="mt-3 text-sm font-semibold leading-7 text-[#5F5E5A]">
                    Published by Code Capital Coffee in their founders series. Open the full article to read the interview and founder journey.
                  </p>
                  <div className="mt-6 rounded-[1.4rem] border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                    <p className="text-sm font-black text-[#2C2C2A]">Article link</p>
                    <a
                      href="https://www.codecapitalcoffee.com/founders/shaurya-sharma-nudgehq"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold text-[#3C3489] hover:text-[#7F77DD]"
                    >
                      Open on Code Capital Coffee
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </section>
      )}

      {currentView === 'nudgeai' && (
        <FullPageNudgeAi onAsk={askNudgeAi} setCurrentView={setCurrentView} />
      )}

      {currentView === 'why_nudgehq' && (
        <section className="relative isolate overflow-hidden bg-[#F7FAFF] px-5 py-16 text-[#2C2C2A] sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_14%_8%,#DFECFF_0,transparent_32%),radial-gradient(circle_at_88%_14%,#DCF8EF_0,transparent_30%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_48%,#F7F6FF_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-30" />

          <div className="mx-auto grid max-w-7xl gap-10 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.div {...cardMotion}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DAD7FB] bg-white/90 px-4 py-2 text-sm font-extrabold text-[#3C3489] shadow-lg shadow-[#3C3489]/5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#1D9E75]" />
                Why NudgeHQ?
              </span>
              <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-[-0.04em] text-[#1E2737] sm:text-6xl">
                The daily visibility layer bloated work suites forgot.
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-[#5F5E5A]">
                NudgeHQ is not another giant suite. It solves the painful layer managers hate most: chasing updates, finding blockers late, and rebuilding status reports manually.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Daily signals', 'WhatsApp nudges', 'Manager briefs', 'Proof workflows', 'No-update alerts', 'NudgeAI summaries'].map((signal) => (
                  <span key={signal} className="rounded-full border border-[#DAD7FB] bg-white/82 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#5F5E5A] shadow-sm">
                    {signal}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openSignup}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3C3489] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-xl shadow-[#3C3489]/20 transition hover:bg-[#7F77DD]"
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#comparison-table"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DAD7FB] bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-[#3C3489] transition hover:bg-[#EEEDFE]"
                >
                  See operating model
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            <motion.div {...cardMotion} className="relative overflow-hidden rounded-[2.4rem] border border-[#DAD7FB] bg-white/76 p-6 shadow-2xl shadow-[#3C3489]/12 backdrop-blur-xl">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#EEEDFE] blur-3xl" />
              <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-[#E8F7F1] blur-3xl" />
              <div className="relative rounded-[1.8rem] border border-white/80 bg-[#FCFCFF] p-5 shadow-inner">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7F77DD]">Signal layer</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[#1C1739]">NudgeHQ sits above the noise.</h2>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3C3489] text-white shadow-lg shadow-[#3C3489]/20">
                    <Zap className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ['WhatsApp nudges', 'Employees reply where they already are.', MessageSquareText, '#1D9E75'],
                    ['Role dashboards', 'Admin, HR, manager, employee — each scoped.', ShieldCheck, '#7F77DD'],
                    ['Blocker alerts', 'Risks surface before deadlines break.', AlertCircle, '#EF4444'],
                    ['NudgeAI briefs', 'Raw updates turn into manager-ready summaries.', Sparkles, '#F59E0B'],
                  ].map(([title, copy, Icon, color]) => (
                    <div key={title} className="metric-lift rounded-2xl border border-[#EEEDFE] bg-white p-4 shadow-sm">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}16`, color }}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-sm font-black text-[#2C2C2A]">{title}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mx-auto mt-10 max-w-7xl">
            <SectionHeader
              eyebrow="Better for this job"
              title="Why NudgeHQ feels faster than most solutions"
              copy="Generic tools are good at storing work. NudgeHQ is built to capture daily signals, detect delays, and make leaders act before the week slips."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Adoption first', 'WhatsApp nudges meet employees where they already respond, instead of forcing one more app ritual.', MessageSquareText],
                ['Daily signal, not task bloat', 'NudgeHQ focuses on what changed today: progress, blocker, focus, energy, and proof.', Activity],
                ['Role-scoped clarity', 'HR sees people health, managers see their team, employees see themselves, admin sees everything.', UsersRound],
                ['AI turns noise into action', 'NudgeAI converts check-ins into standups, weekly wins, blocker alerts, and board-ready summaries.', Sparkles],
              ].map(([title, copy, Icon]) => (
                <motion.article key={title} {...cardMotion} className="workspace-card rounded-[1.6rem] p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEEDFE] text-[#3C3489]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-black text-[#1C1739]">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#5F5E5A]">{copy}</p>
                </motion.article>
              ))}
            </div>
          </div>

          <div id="comparison-table" className="mx-auto mt-20 max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1D9E75]">Operating model</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1C1739] sm:text-4xl">The signals NudgeHQ brings into one calm layer.</h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                  The point is not “more software”. The point is daily visibility that helps managers act early and employees stay clear.
                </p>
              </div>
              <span className="w-fit rounded-full bg-[#1C1739] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                Built for daily visibility
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {[
                ['Capture', 'Daily check-ins, WhatsApp nudges, proof uploads, task status, and blockers are captured as clean team signals.', ['Updates', 'Proof', 'Blockers']],
                ['Understand', 'NudgeAI turns raw updates into manager briefs, no-update alerts, quality scores, and weekly team summaries.', ['Briefs', 'Scores', 'Summaries']],
                ['Act', 'Managers escalate blockers, assign proof-required tasks, reuse templates, and keep leadership reports ready.', ['Escalate', 'Assign', 'Report']],
              ].map(([title, copy, tags], index) => (
                <motion.article key={title} {...cardMotion} transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }} className="rounded-[1.6rem] border border-[#DAD7FB] bg-white p-6 shadow-xl shadow-[#3C3489]/8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEEDFE] text-sm font-black text-[#3C3489]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 text-2xl font-black text-[#1C1739]">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#5F5E5A]">{copy}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#F7F6FF] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#3C3489]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-[#DAD7FB] bg-[#FCFCFF] p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ['86%', 'Update completion'],
                  ['12 min', 'Avg blocker response'],
                  ['3 hrs', 'Weekly report time saved'],
                  ['4 roles', 'Scoped dashboards'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-[#EEEDFE]">
                    <p className="text-3xl font-black text-[#3C3489]">{value}</p>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#8A8894]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div {...cardMotion} className="mx-auto mt-20 max-w-7xl overflow-hidden rounded-[2.2rem] border border-[#DAD7FB] bg-[#161238] p-6 text-white shadow-2xl shadow-[#3C3489]/18 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8DE4C3]">Replaces the messy layer</p>
                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Not your whole stack — just the daily chasing chaos.</h2>
                <p className="mt-4 text-base font-semibold leading-7 text-white/72">
                  Keep the tools your team already uses if they work. NudgeHQ becomes the lightweight operating layer that tells leaders what changed, who is blocked, and who needs a nudge.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['WhatsApp follow-up chains', 'Replaced by scheduled nudges'],
                  ['Manual status spreadsheets', 'Replaced by live dashboards'],
                  ['Long standup notes', 'Replaced by NudgeAI briefs'],
                  ['Late blocker discovery', 'Replaced by instant escalation'],
                ].map(([before, after]) => (
                  <div key={before} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Before</p>
                    <p className="mt-2 text-sm font-bold text-white/75 line-through decoration-white/35">{before}</p>
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#8DE4C3]">With NudgeHQ</p>
                    <p className="mt-2 text-sm font-black text-white">{after}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="mx-auto mt-16 max-w-4xl text-center">
            <h2 className="text-4xl font-black tracking-tight text-[#1C1739]">If your managers still chase updates, your tool stack is incomplete.</h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-[#5F5E5A]">
              NudgeHQ gives companies the daily visibility layer most tools forget.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={openSignup} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3C3489] px-7 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-[#7F77DD]">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setCurrentView('contact')} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DAD7FB] bg-white px-7 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-[#3C3489] transition hover:bg-[#EEEDFE]">
                Talk to us
                <MessageSquareText className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* VIEW: EMAIL VERIFICATION */}
      {currentView === 'verify_email' && (
        <VerifyEmailView
          queryParams={queryParams}
          setCurrentView={setCurrentView}
          showToast={showToast}
          verificationEmail={verificationEmail}
          setVerificationEmail={setVerificationEmail}
          setUser={setUser}
          setToken={setToken}
          setAuthRole={setAuthRole}
          routeAfterAuth={routeAfterAuth}
        />
      )}

      {currentView === 'oauth_callback' && (
        <GoogleOAuthCallback
          queryParams={queryParams}
          setUser={setUser}
          setToken={setToken}
          setAuthRole={setAuthRole}
          routeAfterAuth={routeAfterAuth}
          setCurrentView={setCurrentView}
          showToast={showToast}
        />
      )}

      {/* VIEW: FORGOT PASSWORD */}
      {currentView === 'forgot_password' && (
        <ForgotPasswordView setCurrentView={setCurrentView} showToast={showToast} />
      )}

      {/* VIEW: RESET PASSWORD */}
      {currentView === 'reset_password' && (
        <ResetPasswordView queryParams={queryParams} setCurrentView={setCurrentView} showToast={showToast} />
      )}

      {/* VIEW: ACCEPT INVITATION */}
      {currentView === 'accept_invite' && (
        <AcceptInviteView
          queryParams={queryParams}
          setCurrentView={setCurrentView}
          setUser={setUser}
          setToken={setToken}
          setAuthRole={setAuthRole}
          showToast={showToast}
        />
      )}

      {currentView === 'join_workspace' && (
        <JoinWorkspaceView
          setCurrentView={setCurrentView}
          setUser={setUser}
          setToken={setToken}
          setAuthRole={setAuthRole}
          showToast={showToast}
        />
      )}

      {currentView === 'choose_plan' && (
        <section className="relative isolate overflow-hidden bg-[#F7FAFF] px-5 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_14%_10%,#DFECFF_0,transparent_30%),radial-gradient(circle_at_86%_18%,#DCF8EF_0,transparent_28%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)]" />
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Choose plan"
              title="Start with the plan that matches your team."
              copy="INR pricing for Indian teams, USD pricing for global teams. Get started with our 14-day free trial."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-5">
              {[
                ['Free Trial', '₹2 verification', '$1 verification', ['14-day trial', 'Up to 15 employees', 'Daily check-ins', 'NudgeAI basic'], 'Start Free Trial', 'free_trial'],
                ['Starter', '₹2,000/month', '$9/month', ['Up to 20 employees', 'Daily check-ins', 'NudgeAI basic', 'Email support'], 'Choose Starter', 'starter'],
                ['Growth', '₹4,500/month', '$25/month', ['Up to 50 employees', 'WhatsApp nudges', 'NudgeAI summaries', 'Priority support'], 'Contact Us', 'growth'],
                ['Business', '₹8,500/month', '$49/month', ['Up to 100 employees', 'Advanced dashboards', 'Board-ready reports', 'Priority onboarding'], 'Contact Us', 'business'],
                ['Enterprise', 'Custom', 'Custom', ['Custom employee limit from 5+', 'Custom integrations', 'Dedicated manager', 'SLA options'], 'Contact Us', 'enterprise']
              ].map((plan, index) => (
                <motion.article key={plan[0]} {...cardMotion} className={`rounded-2xl border p-7 shadow-xl ${index === 1 ? 'border-[#7F77DD] bg-[#3C3489] text-white shadow-[#3C3489]/20' : 'border-[#DAD7FB] bg-white text-[#2C2C2A] shadow-[#3C3489]/5'}`}>
                  <h2 className="text-2xl font-extrabold">{plan[0]}</h2>
                  <p className={`mt-3 text-3xl font-extrabold ${index === 1 ? 'text-white' : 'text-[#3C3489]'}`}>{plan[1]}</p>
                  <p className={`mt-1 text-sm font-bold ${index === 1 ? 'text-white/72' : 'text-[#5F5E5A]'}`}>Global: {plan[2]}</p>
                  <ul className="mt-7 space-y-3">
                    {plan[3].map((feature) => (
                      <li key={feature} className={`flex gap-3 text-sm font-semibold ${index === 1 ? 'text-white/85' : 'text-[#5F5E5A]'}`}>
                        <Check className={`h-5 w-5 shrink-0 ${index === 1 ? 'text-[#8DE4C3]' : 'text-[#1D9E75]'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan[4] === 'Contact Us' ? (
                    <a href="mailto:hello.nudgehq@gmail.com" className="mt-9 inline-flex w-full justify-center rounded-md bg-[#EEEDFE] px-5 py-3 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#7F77DD] hover:text-white">
                      Contact Us
                    </a>
                  ) : (
                    <button type="button" onClick={() => choosePlan(plan[5])} className={`mt-9 w-full rounded-md px-5 py-3 text-sm font-extrabold transition ${index === 1 ? 'bg-white text-[#3C3489] hover:bg-[#EEEDFE]' : 'bg-[#7F77DD] text-white hover:bg-[#3C3489]'}`}>
                      {plan[4]}
                    </button>
                  )}
                </motion.article>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-2xl rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 text-center text-sm font-bold text-[#92400E]">
              Early-stage launch pricing. Flat monthly plans in INR for India and USD for worldwide teams, with no per-user surprise.
            </p>
          </div>
        </section>
      )}

      {currentView === 'payment' && (
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden px-5 py-16 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_18%,rgba(127,119,221,0.18),transparent_30%),radial-gradient(circle_at_78%_28%,rgba(29,158,117,0.14),transparent_28%),linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_48%,#F1FCF8_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-40" />

          <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-white/90 shadow-2xl shadow-[#3C3489]/10 backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative overflow-hidden bg-[linear-gradient(150deg,#191348_0%,#3C3489_48%,#7F77DD_100%)] p-8 text-white sm:p-10">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-[#1D9E75]/25 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-white/90">
                  <Sparkles className="h-4 w-4 text-[#BFEFDF]" aria-hidden="true" />
                  {selectedPlan === 'free_trial' ? 'Trial Verification' : 'Premium Workspace'}
                </span>
                <h1 className="mt-8 text-4xl font-extrabold leading-tight sm:text-5xl">
                  {selectedPlan === 'free_trial' ? 'Start your real 14-Day Free Trial.' : 'Start your Premium Starter workspace.'}
                </h1>
                <p className="mt-5 max-w-md text-sm font-semibold leading-7 text-white/75">
                  {selectedPlan === 'free_trial'
                    ? 'Invite up to 15 employees, use daily check-ins and NudgeAI. We charge a small ₹2 / $1 verification fee to verify your payment method.'
                    : 'Invite up to 20 employees and use the full Starter workflow, check-ins, tasks, and email support.'}
                </p>
                <div className="mt-10 grid gap-3 text-sm font-bold">
                  {(selectedPlan === 'free_trial'
                    ? ['Refundable verification fee', 'Full Trial pack unlocked', 'Demo stays preview-only']
                    : ['Full Starter pack unlocked', 'Flat monthly billing', 'Demo stays preview-only']
                  ).map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-[#8DE4C3]" aria-hidden="true" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1D9E75]">{selectedPlan === 'free_trial' ? 'Verification Payment' : 'Activate Plan'}</p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#2C2C2A]">
                {selectedPlan === 'free_trial' ? '14-Day Free Trial' : 'Starter Plan'}
              </h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#5F5E5A]">
                {selectedPlan === 'free_trial'
                  ? 'Verify your payment method to begin your 14-day trial. You will be charged ₹2 today.'
                  : 'Start your Starter subscription today. Billing begins immediately.'}
              </p>
              <div className="mt-8 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                <div className="flex items-center justify-between border-b border-[#EEEDFE] pb-4">
                  <span className="font-bold text-[#2C2C2A]">{selectedPlan === 'free_trial' ? '14-Day Trial' : 'Starter Plan'}</span>
                  <span className="text-right">
                    <span className="block font-extrabold text-[#3C3489]">{selectedPlan === 'free_trial' ? '₹2' : '₹2,000/month'}</span>
                    <span className="block text-xs font-bold text-[#8A8894]">Global: {selectedPlan === 'free_trial' ? '$1' : '$9/month'}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#EEEDFE] py-4 text-sm font-bold text-[#1D9E75]">
                  <span>Verification method</span>
                  <span>Razorpay</span>
                </div>
                <div className="flex items-center justify-between pt-4 text-sm font-bold text-[#5F5E5A]">
                  <span>Due today</span>
                  <span className="text-[#2C2C2A]">{selectedPlan === 'free_trial' ? '₹2 / $1' : '₹2,000 / $9'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={activateStarterPlan}
                disabled={paymentLoading}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7F77DD] px-5 py-4 text-sm font-extrabold text-white shadow-xl shadow-[#7F77DD]/20 transition hover:-translate-y-0.5 hover:bg-[#3C3489] disabled:translate-y-0 disabled:opacity-50"
              >
                {paymentLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {paymentLoading ? 'Verifying...' : (selectedPlan === 'free_trial' ? 'Pay ₹2 & Start Trial' : 'Pay & Activate Starter')}
              </button>
              <p className="mt-4 text-center text-xs font-semibold text-[#7A7974]">
                Secured by Razorpay. Cancel anytime. Demo access remains separate.
              </p>
            </div>
          </div>
        </section>
      )}

      {currentView === 'onboarding' && (
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#F7FAFF] px-5 py-12 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(127,119,221,0.18),transparent_34%),radial-gradient(circle_at_84%_20%,rgba(29,158,117,0.16),transparent_28%),linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_46%,#EEFDF7_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-35" />
          <div className="onboarding-motion-bg">
            <span className="onboarding-orb onboarding-orb-purple" />
            <span className="onboarding-orb onboarding-orb-teal" />
            <span className="onboarding-orb onboarding-orb-ink" />
            <span className="onboarding-floating-card onboarding-floating-card-one" />
            <span className="onboarding-floating-card onboarding-floating-card-two" />
          </div>

          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-white/90 p-7 shadow-2xl shadow-[#3C3489]/10 backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-[#EEEDFE] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1D9E75]">Step {onboardingStep} of 3</p>
                <h1 className="mt-2 text-3xl font-extrabold text-[#2C2C2A]">Set up your company workspace</h1>
              </div>
              <div className="h-2 w-full max-w-xs rounded-full bg-[#EEEDFE]">
                <div className="h-2 rounded-full bg-[#7F77DD]" style={{ width: `${(onboardingStep / 3) * 100}%` }} />
              </div>
            </div>

            {onboardingStep === 1 ? (
              <div className="mt-7 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-[1.5rem] border border-[#EEEDFE] bg-[linear-gradient(160deg,#1B164A_0%,#4E45B2_56%,#7F77DD_100%)] p-5 text-white shadow-xl shadow-[#3C3489]/15">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">Logo setup</span>
                    <Sparkles className="h-5 w-5 text-[#BFEFDF]" aria-hidden="true" />
                  </div>
                  <div className="mt-6 rounded-[1.25rem] border border-white/20 bg-white/12 p-5 backdrop-blur">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">Company logo</p>
                    <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-[1.4rem] bg-white text-[#3C3489] shadow-2xl shadow-black/20">
                      {companyDetails.logo_url ? (
                        <img src={companyDetails.logo_url} alt="Company logo preview" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-10 w-10" aria-hidden="true" />
                      )}
                    </div>
                    <p className="mt-5 text-center text-lg font-extrabold">Upload company logo</p>
                    <p className="mt-2 text-center text-sm leading-6 text-white/72">Add a PNG or JPG now. In production this will save to Supabase storage.</p>
                    <label className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Choose logo file
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleCompanyLogoUpload(e.target.files?.[0])} />
                    </label>
                  </div>
                </div>

                <div className="grid gap-5 rounded-[1.5rem] border border-[#EEEDFE] bg-[#FCFCFF]/90 p-5 shadow-sm sm:grid-cols-2">
                  <label className="space-y-2 sm:col-span-2">
                    <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Company name</span>
                    <input className={AUTH_INPUT_CLASS} value={companyDetails.name} onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })} />
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Logo URL optional</span>
                    <input className={AUTH_INPUT_CLASS} value={companyDetails.logo_url?.startsWith('data:') ? '' : companyDetails.logo_url} onChange={(e) => setCompanyDetails({ ...companyDetails, logo_url: e.target.value })} />
                    <span className="block text-xs font-semibold text-[#77756F]">Upload from the purple panel or paste a hosted logo link here.</span>
                  </label>
                  <label className="space-y-2">
                    <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Company type</span>
                    <select className={AUTH_INPUT_CLASS} value={companyDetails.industry} onChange={(e) => setCompanyDetails({ ...companyDetails, industry: e.target.value })}>
                      {['Tech', 'Finance', 'Healthcare', 'Logistics', 'Retail', 'Manufacturing', 'Consulting', 'Education', 'Other'].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Company size</span>
                    <select className={AUTH_INPUT_CLASS} value={companyDetails.size} onChange={(e) => setCompanyDetails({ ...companyDetails, size: e.target.value })}>
                      {['1-10', '11-50', '51-200', '200+'].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  {companyDetails.industry === 'Other' ? (
                    <label className="space-y-2 sm:col-span-2">
                      <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Tell us your company type</span>
                      <input className={AUTH_INPUT_CLASS} value={companyIndustryOther} onChange={(e) => setCompanyIndustryOther(e.target.value)} />
                    </label>
                  ) : null}
                  <label className="space-y-2">
                    <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Country</span>
                    <input className={AUTH_INPUT_CLASS} value={companyDetails.country} onChange={(e) => setCompanyDetails({ ...companyDetails, country: e.target.value })} />
                  </label>
                  <label className="space-y-2">
                    <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">City</span>
                    <input className={AUTH_INPUT_CLASS} value={companyDetails.city} onChange={(e) => setCompanyDetails({ ...companyDetails, city: e.target.value })} />
                  </label>
                  <button type="button" onClick={() => setOnboardingStep(2)} className="rounded-2xl bg-[#7F77DD] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#7F77DD]/20 transition hover:bg-[#3C3489] sm:col-span-2">Continue</button>
                </div>
              </div>
            ) : null}

            {onboardingStep === 2 ? (
              <div className="mt-7 space-y-5">
                <div className="rounded-[1.4rem] border border-[#EEEDFE] bg-[#FCFCFF]/90 p-5 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">Departments</p>
                  <h2 className="mt-2 text-xl font-extrabold text-[#2C2C2A]">Create your team structure</h2>
                  <p className="mt-1 text-sm font-semibold text-[#77756F]">Add departments now, or skip and create them later from Admin settings.</p>
                </div>
                {onboardingDepartments.map((dept, index) => (
                  <div key={`dept-${index}`} className="grid gap-4 rounded-[1.25rem] border border-[#EEEDFE] bg-white p-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Department name</span>
                      <input className={AUTH_INPUT_CLASS} value={dept.name} onChange={(e) => setOnboardingDepartments((items) => items.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
                    </label>
                    <label className="space-y-2">
                      <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Description</span>
                      <input className={AUTH_INPUT_CLASS} value={dept.description} onChange={(e) => setOnboardingDepartments((items) => items.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} />
                    </label>
                  </div>
                ))}
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setOnboardingStep(1)} className="rounded-md border border-[#DAD7FB] bg-white px-4 py-2 text-sm font-bold text-[#3C3489] transition hover:bg-[#F4F3FF]">
                    ← Back
                  </button>
                  <button type="button" disabled={onboardingDepartments.length >= 5} onClick={() => setOnboardingDepartments((items) => [...items, { name: '', description: '' }])} className="rounded-md border border-[#DAD7FB] px-4 py-2 text-sm font-bold text-[#3C3489]">+ Add another department</button>
                  <button type="button" onClick={() => setOnboardingStep(3)} className="rounded-md px-4 py-2 text-sm font-bold text-[#5F5E5A]">Skip for now</button>
                  <button type="button" onClick={() => setOnboardingStep(3)} className="ml-auto rounded-md bg-[#7F77DD] px-5 py-2 text-sm font-bold text-white">Continue</button>
                </div>
              </div>
            ) : null}

            {onboardingStep === 3 ? (
              <div className="mt-7 space-y-7">
                <div className="rounded-[1.4rem] border border-[#DAD7FB] bg-[#FCFCFF] p-5 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">Invite team</p>
                  <h2 className="mt-2 text-xl font-extrabold text-[#2C2C2A]">Bring employees into the workspace</h2>
                  <p className="mt-2 font-bold text-[#2C2C2A]">Your Starter plan allows up to {STARTER_EMPLOYEE_LIMIT} employees</p>
                  <p className="mt-1 text-sm font-semibold text-[#3C3489]">{Math.min(totalInviteCount, STARTER_EMPLOYEE_LIMIT)} of {STARTER_EMPLOYEE_LIMIT} employees added</p>
                  {totalInviteCount >= STARTER_EMPLOYEE_LIMIT ? (
                    <p className="mt-2 inline-flex rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#3C3489]">Employee limit reached</p>
                  ) : null}
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2C2A]">Way 1 - Manual invite</h3>
                  <div className="mt-3 space-y-3">
                    {visibleInviteEmployees.map((employee, index) => (
                      <div key={`emp-${index}`} className="grid gap-4 rounded-[1.25rem] border border-[#EEEDFE] bg-white p-4 lg:grid-cols-5">
                        <label className="space-y-2">
                          <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Employee name</span>
                          <input className={AUTH_INPUT_CLASS} value={employee.name} onChange={(e) => setInviteEmployees((items) => items.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
                        </label>
                        <label className="space-y-2">
                          <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Work email</span>
                          <input className={AUTH_INPUT_CLASS} value={employee.email} onChange={(e) => setInviteEmployees((items) => items.map((item, i) => i === index ? { ...item, email: e.target.value } : item))} />
                        </label>
                        <label className="space-y-2">
                          <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Phone optional</span>
                          <input className={AUTH_INPUT_CLASS} placeholder="+919999999999" value={employee.phone_number || ''} onChange={(e) => setInviteEmployees((items) => items.map((item, i) => i === index ? { ...item, phone_number: e.target.value } : item))} />
                        </label>
                        <label className="space-y-2">
                          <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Department</span>
                          <input className={AUTH_INPUT_CLASS} value={employee.department} onChange={(e) => setInviteEmployees((items) => items.map((item, i) => i === index ? { ...item, department: e.target.value } : item))} />
                        </label>
                        <label className="space-y-2">
                          <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Role</span>
                          <select className={AUTH_INPUT_CLASS} value={employee.role} onChange={(e) => setInviteEmployees((items) => items.map((item, i) => i === index ? { ...item, role: e.target.value } : item))}>
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="hr">HR</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!canAddInviteEmployee}
                    onClick={() => setInviteEmployees((items) => (items.length + csvPreview.length >= STARTER_EMPLOYEE_LIMIT ? items : [...items, { name: '', email: '', phone_number: '', department: '', role: 'employee' }]))}
                    className="mt-3 rounded-md border border-[#DAD7FB] px-4 py-2 text-sm font-bold text-[#3C3489] transition hover:bg-[#EEEDFE] disabled:cursor-not-allowed disabled:border-[#E8E6F7] disabled:text-[#A09F9A] disabled:hover:bg-white"
                  >
                    {canAddInviteEmployee ? '+ Add another employee' : `Max ${STARTER_EMPLOYEE_LIMIT} employees reached`}
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2C2A]">Way 2 - CSV upload</h3>
                  <div className="mt-3 rounded-lg border border-dashed border-[#7F77DD] bg-[#F4F3FF] p-5">
                    <label className="block space-y-2">
                      <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#2C2C2A]">Upload CSV file</span>
                      <span className="block text-sm font-semibold text-[#3C3489]">Expected format: Name, Email, Department, Role, Phone</span>
                      <input type="file" accept=".csv" className="mt-2 text-sm" onChange={(e) => e.target.files?.[0] && parseEmployeeCsv(e.target.files[0])} />
                    </label>
                    <button type="button" onClick={downloadSampleCsv} className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-bold text-[#3C3489]">Download sample CSV</button>
                  </div>
                  {csvPreview.length ? <p className="mt-2 text-sm font-bold text-[#1D9E75]">{csvPreview.length} CSV employees ready to invite.</p> : null}
                </div>
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-4">
                  <h3 className="font-bold text-[#2C2C2A]">Way 3 - Magic invite link</h3>
                  <p className="mt-1 text-sm text-[#5F5E5A]">Auto-generated after setup. Share it in your company WhatsApp or email.</p>
                  {magicInviteLink ? <p className="mt-3 rounded-md bg-[#EEEDFE] p-3 text-sm font-bold text-[#3C3489]">{magicInviteLink}</p> : null}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => setOnboardingStep(2)} className="rounded-md border border-[#DAD7FB] bg-white px-5 py-3.5 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#F4F3FF]">
                    ← Back
                  </button>
                  <button type="button" disabled={onboardingLoading} onClick={finishOnboarding} className="flex-1 rounded-md bg-[#7F77DD] px-5 py-3.5 text-sm font-extrabold text-white hover:bg-[#3C3489] disabled:opacity-50">
                    {onboardingLoading ? 'Finishing setup...' : 'Finish setup'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* VIEW 1: LANDING PAGE */}
      {currentView === 'landing' && (
        <>
          <section id="top" className="relative isolate min-h-[100svh] overflow-hidden bg-[#F7FAFF]">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_10%,#DFECFF_0,transparent_34%),radial-gradient(circle_at_88%_18%,#DCF8EF_0,transparent_28%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)]" />
            <div className="absolute left-1/2 top-20 -z-10 h-80 w-[54rem] -translate-x-1/2 rounded-full bg-[#EEEDFE]/80 blur-3xl" />
            <div className="absolute bottom-8 left-1/2 -z-10 h-52 w-[42rem] -translate-x-1/2 rounded-full bg-[#E8F7F1]/80 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-32 z-0 mx-auto hidden h-[34rem] max-w-7xl lg:block" aria-hidden="true">
              <div className="nudge-3d-stage absolute left-2 top-16 h-72 w-72">
                <span className="nudge-3d-block nudge-3d-block-lg absolute left-8 top-12" style={{ '--block-front': '#7F77DD', '--block-side': '#3C3489', '--block-top': '#B8B2FF', '--block-delay': '0s' }}>
                  N.
                </span>
                <span className="nudge-3d-block nudge-3d-block-sm absolute left-48 top-2" style={{ '--block-front': '#1D9E75', '--block-side': '#0F6E55', '--block-top': '#8DE4C3', '--block-delay': '0.7s' }}>
                  AI
                </span>
                <span className="nudge-3d-slab absolute left-36 top-44" style={{ '--slab-accent': '#3C3489', '--block-delay': '1.1s' }}>
                  Pulse
                </span>
              </div>
              <div className="nudge-3d-stage absolute right-0 top-4 h-80 w-80">
                <span className="nudge-3d-block nudge-3d-block-md absolute right-24 top-4" style={{ '--block-front': '#3C3489', '--block-side': '#211A5B', '--block-top': '#7F77DD', '--block-delay': '0.35s' }}>
                  HR
                </span>
                <span className="nudge-3d-slab nudge-3d-slab-wide absolute right-4 top-40" style={{ '--slab-accent': '#7F77DD', '--block-delay': '0.9s' }}>
                  Manager
                </span>
                <span className="nudge-3d-block nudge-3d-block-sm absolute right-56 top-56" style={{ '--block-front': '#F59E0B', '--block-side': '#B45309', '--block-top': '#FCD34D', '--block-delay': '1.45s' }}>
                  Ops
                </span>
              </div>
            </div>
            <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-5 pb-20 pt-52 text-center sm:px-6 lg:px-8 lg:pt-60">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-semibold text-[#3C3489] shadow-lg shadow-[#3C3489]/5 backdrop-blur"
              >
                <Sparkles className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
                Newly building for modern Indian teams · Now in beta — join early teams
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.08 }}
                className="mt-8 max-w-5xl text-5xl font-medium leading-[1.08] text-[#1E2737] sm:text-6xl lg:text-[5.7rem]"
              >
                Track <span className="font-extrabold text-[#6476FF]">Real</span> Progress.
                <br />
                Act at the <span className="font-extrabold text-[#6476FF]">Right</span> Time.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.18 }}
                className="mt-8 max-w-3xl text-lg leading-8 text-[#718099] sm:text-xl"
              >
                No follow-ups. No missed updates. Just your team, moving forward.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: 0.26 }}
                className="mt-9 w-full max-w-[48rem] rounded-[1.35rem] border border-white/90 bg-white/70 p-4 text-left shadow-2xl shadow-[#7F77DD]/20 backdrop-blur-xl"
              >
                <div className="rounded-[1rem] bg-gradient-to-r from-white via-[#F4F3FF] to-[#E8F7F1] p-5 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7F77DD] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      NudgeAI live draft
                    </span>
                    <p className="mt-4 text-2xl font-extrabold text-[#2C2C2A]">Today&apos;s team summary</p>
                    <p className="mt-1 text-sm font-medium text-[#718099]">12 tasks completed • 2 blockers detected • 3 delayed check-ins</p>
                  </div>
                  <div className="mt-5 flex -space-x-3 sm:mt-0">
                    {['#7F77DD', '#1D9E75', '#3C3489', '#F59E0B'].map((color, index) => (
                      <span
                        key={color}
                        className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-xs font-extrabold text-white shadow-md"
                        style={{ backgroundColor: color }}
                      >
                        {['HR', 'OP', 'SA', 'AI'][index]}
                      </span>
                    ))}
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white text-xs font-extrabold text-[#6476FF] shadow-md">
                      +
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.34 }}
                className="mt-11 flex flex-col justify-center gap-4 sm:flex-row"
              >
                <button
                  type="button"
                  onClick={openSignup}
                  className="inline-flex min-w-56 items-center justify-center gap-3 rounded-full bg-[#7F77DD] px-8 py-5 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-xl shadow-[#7F77DD]/25 transition hover:-translate-y-0.5 hover:bg-[#3C3489]"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('demo_console')}
                  className="inline-flex min-w-56 items-center justify-center gap-3 rounded-full bg-[#111827] px-8 py-5 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-xl shadow-[#111827]/20 transition hover:-translate-y-0.5 hover:bg-[#3C3489]"
                >
                  Take Demo
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </motion.div>
              <motion.button
                type="button"
                onClick={() => setCurrentView('why_nudgehq')}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.42 }}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#DAD7FB] bg-white/82 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#3C3489] shadow-lg shadow-[#3C3489]/5 backdrop-blur transition hover:bg-[#EEEDFE]"
              >
                See why modern teams choose NudgeHQ
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </motion.button>
            </div>
          </section>

          <section className="bg-white px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <SectionHeader
                eyebrow="Visibility snapshot"
                title="A calmer operating rhythm for every team."
                copy="NudgeHQ turns daily work into clear signals, branded metrics, and decision-ready team visibility."
              />
              <div className="mt-12 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                <motion.article {...cardMotion} className="rounded-[2rem] border border-[#DAD7FB] bg-[#FCFCFF] p-6 shadow-xl shadow-[#3C3489]/8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D9E75]">NudgeHQ pulse</p>
                      <h3 className="mt-3 text-2xl font-black tracking-tight text-[#2C2C2A]">Live work signals without manager chasing.</h3>
                      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                        Daily check-ins, blockers, proofs, and team momentum come together in one calm view.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#E8F7F1] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1D9E75]">Live view</span>
                  </div>
                  <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {landingPulseCards.map((card, index) => (
                      <div key={card.label} className="group overflow-hidden rounded-2xl border border-[#EEEDFE] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#3C3489]/10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8A8894]">{card.label}</p>
                            <p className="mt-3 text-3xl font-black" style={{ color: card.accent }}>{card.value}</p>
                          </div>
                          <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]" style={{ backgroundColor: `${card.accent}16`, color: card.accent }}>
                            Live
                          </span>
                        </div>
                        <div className="mt-4 h-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={card.data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`landingPulseGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={card.accent} stopOpacity={0.45} />
                                  <stop offset="100%" stopColor={card.accent} stopOpacity={0.05} />
                                </linearGradient>
                              </defs>
                              <Tooltip cursor={false} contentStyle={{ borderRadius: 14, borderColor: '#EEEDFE', fontSize: 12, fontWeight: 800 }} />
                              <Area type="monotone" dataKey="value" stroke={card.accent} strokeWidth={3} fill={`url(#landingPulseGradient-${index})`} dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-[#F1F2F7] pt-3">
                          <span className="text-xs font-extrabold text-[#5F5E5A]">{card.note}</span>
                          <span className="h-2 w-16 overflow-hidden rounded-full bg-[#F1F2F7]">
                            <span className="block h-full rounded-full transition-all group-hover:w-full" style={{ width: '72%', backgroundColor: card.accent }} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-3 rounded-2xl border border-[#EEEDFE] bg-white/80 p-4 sm:grid-cols-3">
                    {[
                      ['Morning brief', 'Ready in 18 sec'],
                      ['No-update alert', '4 people to nudge'],
                      ['Proof queue', '11 tasks review-ready'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8A8894]">{label}</p>
                        <p className="mt-1 text-sm font-black text-[#2C2C2A]">{value}</p>
                      </div>
                    ))}
                  </div>
                </motion.article>

                <motion.article {...cardMotion} className="rounded-[2rem] border border-[#DAD7FB] bg-white p-6 shadow-xl shadow-[#3C3489]/8">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7F77DD]">Workflow shift</p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight text-[#2C2C2A]">From manual follow-ups to action-ready clarity.</h3>
                  <div className="mt-6 grid gap-3">
                    {[
                      ['Manager brief', 'Morning summary shows missing updates, active blockers, and today’s focus areas.'],
                      ['No-update alerts', 'Teams know who needs a nudge before silence becomes delay.'],
                      ['Proof-backed tasks', 'Important work can require links, files, or screenshots before completion.'],
                      ['Quality score', 'NudgeAI helps employees write cleaner updates managers can use immediately.'],
                    ].map(([title, copy], index) => (
                      <div key={title} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <div className="flex items-start gap-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEEDFE] text-sm font-black text-[#3C3489]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="font-black text-[#2C2C2A]">{title}</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-[#5F5E5A]">{copy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.article>
              </div>
            </div>
          </section>

          <section className="bg-[#FBFAFF] px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-10 flex max-w-5xl flex-wrap justify-center gap-2 rounded-full border border-[#DAD7FB] bg-white p-2 shadow-sm">
                {Object.keys(landingReportTabs).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveLandingReportTab(tab)}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition hover:-translate-y-0.5 ${
                      activeLandingReportTab === tab ? 'bg-[#7F77DD] text-white shadow-lg shadow-[#7F77DD]/25' : 'text-[#6E6B78] hover:bg-[#F4F3FF] hover:text-[#3C3489]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <motion.div {...cardMotion} className="overflow-hidden rounded-[2rem] border border-[#EEEDFE] bg-white shadow-2xl shadow-[#3C3489]/8">
                <div className="grid gap-8 p-6 lg:grid-cols-[0.82fr_1.18fr] lg:p-10">
                  <div className="flex flex-col justify-between gap-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7F77DD]">{activeLandingReport.eyebrow}</p>
                      <motion.h2
                        key={activeLandingReport.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className="mt-4 text-4xl font-black tracking-tight text-[#2C2C2A]"
                      >
                        {activeLandingReport.title}
                      </motion.h2>
                      <div className="mt-8 space-y-5">
                        {activeLandingReport.bullets.map((copy, index) => (
                          <motion.div
                            key={copy}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.24, delay: index * 0.04 }}
                            className="flex gap-4"
                          >
                            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEEDFE]">
                              <span className="h-2 w-2 rounded-full bg-[#7F77DD]" />
                            </span>
                            <p className="text-lg font-semibold leading-7 text-[#5F5E5A]">{copy}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[#EEEDFE] pt-6">
                      <p className="text-3xl font-black text-[#3C3489]">{activeLandingReport.impact}</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">Example metric from the kind of live operating data NudgeHQ is built to surface.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="rounded-[1.6rem] border border-[#DAD7FB] bg-[#FCFCFF] p-4 shadow-xl shadow-[#3C3489]/8">
                      <div className="rounded-[1.2rem] border border-[#EEEDFE] bg-white p-4">
                        <div className="flex flex-wrap items-center gap-2 border-b border-[#EEEDFE] pb-4">
                          <span className="text-xs font-black uppercase tracking-[0.16em] text-[#8A8894]">Filters</span>
                          {activeLandingReport.filters.map((filter) => (
                            <span key={filter} className="rounded-full bg-[#F4F3FF] px-3 py-1.5 text-xs font-black text-[#7F77DD]">{filter}</span>
                          ))}
                          <span className="ml-auto rounded-full bg-[#E8F7F1] px-3 py-1.5 text-xs font-black text-[#1D9E75]">Live</span>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          {activeLandingReport.stats.map(([label, value]) => (
                            <motion.div
                              key={`${activeLandingReportTab}-${label}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4"
                            >
                              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8A8894]">{label}</p>
                              <p className="mt-2 text-2xl font-black text-[#2C2C2A]">{value}</p>
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                          <div className="rounded-xl border border-[#EEEDFE] bg-white p-4">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-[#2C2C2A]">{activeLandingReport.chartTitle}</p>
                              <span className="text-[11px] font-black text-[#8A8894]">{activeLandingReport.chartTag}</span>
                            </div>
                            <div className="mt-5 h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activeLandingReport.chartData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                                  <CartesianGrid vertical={false} stroke="#EEF0F6" />
                                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8A8894', fontSize: 10, fontWeight: 800 }} />
                                  <YAxis hide domain={[0, 100]} />
                                  <Tooltip cursor={{ fill: '#F4F3FF' }} contentStyle={{ borderRadius: 14, borderColor: '#EEEDFE', fontSize: 12, fontWeight: 800 }} />
                                  <Bar dataKey="primary" radius={[10, 10, 4, 4]} fill="#3C3489" />
                                  <Bar dataKey="secondary" radius={[10, 10, 4, 4]} fill="#7F77DD" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="rounded-xl border border-[#EEEDFE] bg-white p-4">
                            <p className="text-xs font-black text-[#2C2C2A]">Manager attention split</p>
                            <div className="mt-6 flex justify-center">
                              <motion.div
                                key={`${activeLandingReportTab}-ring`}
                                initial={{ rotate: -18, scale: 0.94 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="relative h-40 w-40 rounded-full"
                                style={{ background: `conic-gradient(${activeLandingSplitGradient})` }}
                              >
                                <div className="absolute inset-8 rounded-full bg-white" />
                                <div className="absolute inset-0 grid place-items-center text-center">
                                  <span>
                                    <span className="block text-3xl font-black text-[#3C3489]">{activeLandingReport.splitValue}</span>
                                    <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#8A8894]">{activeLandingReport.splitLabel}</span>
                                  </span>
                                </div>
                              </motion.div>
                            </div>
                            <div className="mt-5 grid gap-2 text-xs font-bold text-[#5F5E5A]">
                              {activeLandingReport.split.map(([label,, color]) => (
                                <div key={label} className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                  {label}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -bottom-6 right-4 hidden rounded-2xl border border-[#DAD7FB] bg-white p-5 shadow-2xl shadow-[#3C3489]/12 sm:block">
                      <p className="text-sm font-black text-[#2C2C2A]">Manager brief ready</p>
                      <p className="mt-2 text-xs font-semibold leading-5 text-[#5F5E5A]">{activeLandingReport.callout}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-[#FCFCFF] px-5 py-24 sm:px-6 lg:px-8">
            <div className="soft-grid absolute inset-0 opacity-35" />
            <div className="relative mx-auto max-w-6xl">
              <SectionHeader
                eyebrow="Dashboard preview"
                title="One dashboard. Full visibility."
                copy="Everything your team is working on — live, in one place."
              />
              <motion.div {...cardMotion} className="mt-12 rounded-[2rem] border border-[#DAD7FB] bg-[#111827] p-3 shadow-2xl shadow-[#3C3489]/20 sm:p-5">
                <div className="rounded-[1.45rem] border border-white/10 bg-white p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8A8894]">NudgeHQ admin dashboard</span>
                  </div>
                  <div className="grid overflow-hidden rounded-[1.25rem] border border-[#EEEDFE] bg-[#F7F8FB] lg:grid-cols-[14rem_1fr]">
                    <div className="hidden border-r border-[#EEEDFE] bg-[#161238] p-5 text-white lg:block">
                      <div className="flex items-center gap-3">
                        <img src="/brand/nudgehq-icon.svg" alt="" className="h-10 w-10 rounded-xl" />
                        <span className="font-extrabold">NudgeHQ</span>
                      </div>
                      <div className="mt-8 grid gap-3 text-sm font-bold text-white/70">
                        {['Dashboard', 'Tasks', 'People', 'Reports', 'NudgeAI'].map((item, index) => (
                          <span key={item} className={`rounded-xl px-3 py-2 ${index === 0 ? 'bg-[#7F77DD] text-white' : ''}`}>{item}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-5 sm:p-7">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-2xl font-extrabold text-[#2C2C2A]">Good morning, Rahul!</h3>
                          <p className="mt-1 text-sm font-semibold text-[#5F5E5A]">Here&apos;s what&apos;s happening with your team today.</p>
                        </div>
                        <span className="w-fit rounded-xl border border-[#EEEDFE] bg-white px-3 py-2 text-xs font-extrabold text-[#5F5E5A]">2 Jun · Today</span>
                      </div>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                          ['Total Tasks', '42', '#7F77DD'],
                          ['Completed', '28', '#1D9E75'],
                          ['In Progress', '9', '#F59E0B'],
                          ['Overdue', '5', '#EF4444']
                        ].map(([label, value, color]) => (
                          <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-white p-4 shadow-sm">
                            <p className="text-xs font-extrabold text-[#5F5E5A]">{label}</p>
                            <p className="mt-3 text-3xl font-extrabold text-[#111827]">{value}</p>
                            <p className="mt-2 text-xs font-extrabold" style={{ color }}>▲ Live signal</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-2xl border border-[#EEEDFE] bg-white p-4 shadow-sm">
                          <p className="font-extrabold text-[#2C2C2A]">Team Progress</p>
                          <div className="mt-4 space-y-3">
                            {demoProgressRows.slice(0, 4).map(([name, task, progress, status, color]) => (
                              <div key={name} className="grid gap-2 sm:grid-cols-[1fr_8rem_5rem] sm:items-center">
                                <span>
                                  <span className="block text-sm font-extrabold text-[#2C2C2A]">{name}</span>
                                  <span className="block text-xs font-semibold text-[#8A8894]">{task}</span>
                                </span>
                                <span className="h-2 rounded-full bg-[#EEEFF5]">
                                  <span className="block h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
                                </span>
                                <span className="text-xs font-extrabold text-[#3C3489]">{status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#EEEDFE] bg-white p-4 shadow-sm">
                          <p className="font-extrabold text-[#2C2C2A]">Recent Activity</p>
                          <div className="mt-4 space-y-3">
                            {demoActivityRows.slice(0, 4).map(([action, task, time, Icon, color]) => (
                              <div key={`${action}-${task}`} className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-xs font-extrabold text-[#2C2C2A]">{action}</span>
                                  <span className="block truncate text-xs font-semibold text-[#8A8894]">{task}</span>
                                </span>
                                <span className="text-[11px] font-bold text-[#8A8894]">{time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {showMobileLaunchSection && (
          <section id="mobile-app" className="relative overflow-hidden bg-white px-5 py-24 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(127,119,221,0.18),transparent_32%),radial-gradient(circle_at_82%_70%,rgba(29,158,117,0.18),transparent_34%)]" />
            <div className="absolute inset-0 bg-white/78" />
            <div className="soft-grid absolute inset-0 opacity-45" />
            <div className="mobile-launch-ambient absolute inset-0" aria-hidden="true" />
            <motion.div
              {...cardMotion}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                setMobilePhoneTilt({
                  x: 5 - y * 10,
                  y: -14 + x * 18,
                });
              }}
              onMouseLeave={() => setMobilePhoneTilt({ x: 5, y: -14 })}
              className="mobile-launch-card relative mx-auto grid max-w-6xl gap-12 overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-[#FCFCFF]/84 p-8 shadow-2xl shadow-[#7F77DD]/10 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:p-12"
            >
              <div className="mobile-launch-ribbons absolute inset-0" aria-hidden="true">
                <span className="mobile-launch-ribbon mobile-launch-ribbon-one" />
                <span className="mobile-launch-ribbon mobile-launch-ribbon-two" />
                <span className="mobile-launch-ribbon mobile-launch-ribbon-three" />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.96),rgba(255,255,255,0.68)_48%,rgba(238,237,254,0.62))]" />
              <div className="absolute inset-0 mobile-launch-noise opacity-55" />
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#DAD7FB] bg-white/90 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#3C3489] shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4 text-[#1D9E75]" />
                  Launching soon
                </p>
                <h2 className="mt-5 max-w-xl text-4xl font-extrabold tracking-tight text-[#181625] sm:text-5xl">
                  NudgeHQ mobile app is coming.
                </h2>
                <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-[#5F5E5A]">
                  Check-ins, focus pulse, blockers, recognitions, and NudgeAI nudges from your phone, built for teams that move between office, home, client sites, and the road.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Daily check-ins', 'Submit location, goals, and progress in seconds.'],
                    ['NudgeAI on mobile', 'Ask for update help, blocker wording, or next focus.'],
                    ['Manager visibility', 'Leaders see live team signals without chasing.'],
                    ['Recognition alerts', 'Wins and appreciation land where employees notice them.']
                  ].map(([title, copy]) => (
                    <div key={title} className="rounded-2xl border border-[#EEEDFE] bg-white/88 p-4 shadow-sm backdrop-blur transition hover:shadow-md">
                      <CheckCircle2 className="h-5 w-5 text-[#1D9E75]" />
                      <p className="mt-3 text-sm font-extrabold text-[#2C2C2A]">{title}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex justify-center lg:justify-end">
                <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7F77DD]/20 blur-3xl" />
                <div className="absolute right-8 top-10 h-24 w-24 rounded-3xl bg-[#1D9E75]/20 blur-2xl" />
                <div className="mobile-phone-orbit absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
                <div
                  className="mobile-phone-3d relative z-10 rounded-[2.8rem] border-[10px] border-[#121126] bg-[#121126] p-2 shadow-2xl shadow-[#3C3489]/30"
                  style={{
                    '--phone-tilt-x': `${mobilePhoneTilt.x}deg`,
                    '--phone-tilt-y': `${mobilePhoneTilt.y}deg`,
                  }}
                >
                  {/* Floating 3D parallax UI/UX cards */}
                  <div className="float-card-blocker absolute -left-16 top-16 z-20 w-48 rounded-[22px] border border-[#FDE8E8] bg-white p-4 shadow-xl shadow-[#EF4444]/5 backdrop-blur-xl pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FDF0F0] text-[#EF4444]">
                        <AlertCircle className="h-3 w-3" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#EF4444]">Blocker Alert</span>
                    </div>
                    <p className="mt-2 text-xs font-black text-[#2C2C2A]">CRM database access delayed</p>
                    <p className="mt-1 text-[10px] font-semibold text-[#8A8894]">Escalated to Operations squad</p>
                  </div>

                  <div className="float-card-insight absolute -right-16 top-40 z-20 w-52 rounded-[22px] border border-[#DAD7FB] bg-[#120F24] p-4 text-white shadow-xl shadow-[#7F77DD]/10 backdrop-blur-xl pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[#8DE4C3]">
                        <Sparkles className="h-3 w-3" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8DE4C3]">NudgeAI Profile</span>
                    </div>
                    <p className="mt-2 text-xs font-black">Peak Focus: 9AM – 11AM</p>
                    <p className="mt-1 text-[10px] font-semibold text-white/70">High momentum streak active</p>
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10">
                      <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-[#7F77DD] to-[#8DE4C3]" />
                    </div>
                  </div>

                  <div className="float-card-streak absolute -left-12 bottom-12 z-20 w-48 rounded-[22px] border border-[#E1F6ED] bg-white p-4 shadow-xl shadow-[#1D9E75]/5 backdrop-blur-xl pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAFBF3] text-[#1D9E75]">
                        <Trophy className="h-3 w-3" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#1D9E75]">Daily Streak</span>
                    </div>
                    <p className="mt-2 text-xs font-black text-[#2C2C2A]">6 check-ins completed</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1D9E75] animate-pulse" />
                      <span className="text-[10px] font-semibold text-[#5F5E5A]">Appreciated by HR Lead</span>
                    </div>
                  </div>

                  {/* Interactive Phone Screen */}
                  <div className="relative h-[34rem] w-[17rem] overflow-hidden rounded-[2rem] bg-[#F8F8FF] flex flex-col">
                    <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#121126] z-30" />

                    {activeMobileTab === 'Pulse' && (
                      <div className="flex-1 flex flex-col pb-16">
                        <div className="h-40 bg-gradient-to-br from-[#3C3489] via-[#7F77DD] to-[#1D9E75] px-5 pt-12 text-white">
                          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">NudgeHQ Mobile</p>
                          <h3 className="mt-3 text-2xl font-black leading-tight">Good morning, team.</h3>
                          <p className="mt-2 text-xs font-semibold text-white/75">3 updates due · 1 blocker open</p>
                        </div>
                        <div className="-mt-6 px-4">
                          <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-xl">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-black text-[#2C2C2A]">Today&apos;s check-in</p>
                              <span className="rounded-full bg-[#E8F7F1] px-2 py-1 text-[10px] font-black text-[#1D9E75]">Live</span>
                            </div>
                            <div className="mt-4 space-y-3">
                              {[
                                ['Location', 'Office'],
                                ['Focus', 'Client deck QA'],
                                ['Energy', 'High']
                              ].map(([label, value]) => (
                                <div key={label} className="flex items-center justify-between rounded-xl bg-[#FCFCFF] px-3 py-2">
                                  <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8894]">{label}</span>
                                  <span className="text-xs font-black text-[#3C3489]">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 px-4">
                          <div className="rounded-2xl bg-[#15112E] p-4 text-white shadow-lg">
                            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8DE4C3]">NudgeAI</p>
                            <p className="mt-2 text-[11px] font-bold leading-5">Rahul is blocked on CRM access. Send a quick nudge?</p>
                            <button
                              type="button"
                              onClick={() => showToast("Sent WhatsApp nudge to Rahul.", "success")}
                              className="mt-3 rounded-full bg-white px-4 py-2 text-[10px] font-black text-[#3C3489] hover:bg-[#EEEDFE] transition"
                            >
                              Send nudge
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeMobileTab === 'Tasks' && (
                      <div className="flex-1 flex flex-col pt-12 pb-16 px-4 bg-[#FCFCFF]">
                        <div className="flex items-center justify-between border-b border-[#EEEDFE] pb-2">
                          <p className="text-sm font-black text-[#2C2C2A]">My Daily Tasks</p>
                          <span className="rounded-full bg-[#EEEDFE] px-2.5 py-0.5 text-[10px] font-black text-[#3C3489]">
                            {mobileTasks.filter(t => !t.done).length} left
                          </span>
                        </div>
                        <div className="mt-4 space-y-3 overflow-y-auto max-h-[22rem]">
                          {mobileTasks.map(task => (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => {
                                setMobileTasks(mobileTasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
                              }}
                              className="flex w-full items-center gap-3 rounded-2xl border border-[#EEEDFE] bg-white p-3 text-left shadow-sm transition hover:border-[#DAD7FB]"
                            >
                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${task.done ? 'border-[#1D9E75] bg-[#1D9E75] text-white' : 'border-[#DAD7FB] bg-white'}`}>
                                {task.done && <Check className="h-3 w-3" />}
                              </span>
                              <span className={`text-xs font-bold leading-tight ${task.done ? 'text-[#8A8894] line-through' : 'text-[#2C2C2A]'}`}>{task.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeMobileTab === 'AI' && (
                      <div className="flex-1 flex flex-col pt-12 pb-16 bg-[#120F24] text-white">
                        <div className="flex items-center gap-2 border-b border-white/10 px-4 pb-2">
                          <Sparkles className="h-4 w-4 text-[#8DE4C3]" />
                          <p className="text-sm font-black">NudgeAI Assistant</p>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 max-h-[18rem]">
                          {mobileAiConversations.map((msg, index) => (
                            <div key={index} className={`rounded-2xl p-3 text-xs leading-normal ${msg.sender === 'AI' ? 'bg-white/10 text-white/90 mr-4' : 'bg-[#7F77DD] text-white ml-4 text-right'}`}>
                              {msg.text}
                            </div>
                          ))}
                        </div>
                        <div className="mt-auto px-4 pb-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (mobileAiConversations.length === 1) {
                                  setMobileAiConversations([
                                    ...mobileAiConversations,
                                    { sender: 'User', text: "Yes, nudge him." },
                                    { sender: 'AI', text: "Nudge sent! Rahul notified on WhatsApp and Slack." }
                                  ])
                                }
                              }}
                              disabled={mobileAiConversations.length > 1}
                              className="rounded-xl bg-[#1D9E75] py-2 text-[10px] font-black text-white hover:bg-[#15795C] disabled:opacity-50 transition"
                            >
                              Yes, Nudge
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (mobileAiConversations.length === 1) {
                                  setMobileAiConversations([
                                    ...mobileAiConversations,
                                    { sender: 'User', text: "Draft update" },
                                    { sender: 'AI', text: "Draft check-in: 'Focus: CRM debug, Status: Completed deck, Energy: High.'" }
                                  ])
                                }
                              }}
                              disabled={mobileAiConversations.length > 1}
                              className="rounded-xl bg-white/15 py-2 text-[10px] font-black text-white hover:bg-white/25 disabled:opacity-50 transition"
                            >
                              Draft update
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                      {['Tasks', 'Pulse', 'AI'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setActiveMobileTab(item)}
                          className={`rounded-xl px-3 py-2 text-center text-[10px] font-black shadow-sm transition ${
                            activeMobileTab === item
                              ? 'bg-[#3C3489] text-white'
                              : 'bg-white text-[#5F5E5A] hover:bg-[#F0ECFF]'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
          )}

          <section id="whatsapp-integration" className="relative overflow-hidden bg-[#F4FAF8] px-5 py-24 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(29,158,117,0.15),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(127,119,221,0.12),transparent_30%)]" />
            <div className="absolute inset-0 bg-white/40" />
            <div className="soft-grid absolute inset-0 opacity-30" />
            <motion.div
              {...cardMotion}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                setWhatsappTilt({
                  x: -5 - y * 12,
                  y: 12 + x * 20,
                });
              }}
              onMouseLeave={() => setWhatsappTilt({ x: -5, y: 12 })}
              className="relative mx-auto grid max-w-6xl gap-12 overflow-hidden rounded-[2.5rem] border border-[#CDEFE0] bg-white/72 p-8 shadow-2xl shadow-[#1D9E75]/5 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-12"
            >
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#BDE7D3] bg-[#E8F7F1] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75] shadow-sm">
                  <MessageSquareText className="h-4 w-4 text-[#1D9E75]" />
                  Core WhatsApp workflow
                </p>
                <h2 className="mt-5 max-w-xl text-4xl font-extrabold tracking-tight text-[#11261C] sm:text-5xl">
                  WhatsApp becomes the front door for daily work.
                </h2>
                <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-[#4B5563]">
                  Employees get smart nudges, reply from WhatsApp, and NudgeHQ saves the update automatically. Managers get blocker alerts instantly, and Friday wins arrive without opening another app.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    ['Two-way check-ins', 'Employees reply to the WhatsApp message and the update is saved in NudgeHQ.'],
                    ['Smart personalized nudges', 'NudgeAI changes the message based on streaks, blockers, first use, and yesterday’s work.'],
                    ['Manager blocker alerts', 'When someone is blocked, their manager gets a WhatsApp alert with task context.'],
                    ['Friday weekly wins', 'Employees receive a short NudgeAI summary of tasks, blockers, and streaks.']
                  ].map(([title, detail]) => (
                    <div key={title} className="flex gap-4 rounded-2xl border border-[#E8F7F1] bg-white/60 p-4 transition hover:bg-white">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F7F1] text-[#1D9E75]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-[#11261C]">{title}</p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-4">
                  {whatsAppFeatureSlides.map((slide, index) => (
                    <button
                      key={slide.eyebrow}
                      type="button"
                      onClick={() => setActiveWhatsAppSlide(index)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        activeWhatsAppSlide === index
                          ? 'border-[#1D9E75] bg-[#E8F7F1] shadow-lg shadow-[#1D9E75]/10'
                          : 'border-[#DDEFE6] bg-white/58 hover:bg-white'
                      }`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1D9E75]">{slide.stat}</p>
                      <p className="mt-1 text-xs font-black text-[#11261C]">{slide.eyebrow}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex justify-center">
                <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1D9E75]/10 blur-3xl" />

                <div
                  className="whatsapp-banner-3d relative z-10 rounded-[2.5rem] border-[8px] border-[#0F1E16] bg-[#07130D] p-2 shadow-2xl shadow-[#1D9E75]/20"
                  style={{
                    '--wa-tilt-x': `${whatsappTilt.x}deg`,
                    '--wa-tilt-y': `${whatsappTilt.y}deg`,
                  }}
                >
                  <div className="float-wa-chat-one absolute -left-12 top-10 z-20 w-44 rounded-2xl border border-white/80 bg-white p-3 shadow-lg shadow-[#1D9E75]/8 backdrop-blur pointer-events-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#1D9E75]">{currentWhatsAppSlide.floating[0][0]}</p>
                    <p className="mt-1.5 text-xs font-bold leading-normal text-[#2C2C2A]">&quot;{currentWhatsAppSlide.floating[0][1]}&quot;</p>
                  </div>

                  <div className="float-wa-chat-two absolute -right-12 top-36 z-20 w-48 rounded-2xl border border-white/80 p-3 text-white shadow-lg shadow-[#1D9E75]/12 backdrop-blur pointer-events-auto" style={{ backgroundColor: currentWhatsAppSlide.accent }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/75">{currentWhatsAppSlide.floating[1][0]}</p>
                    <p className="mt-1.5 text-xs font-extrabold leading-normal">&quot;{currentWhatsAppSlide.floating[1][1]}&quot;</p>
                  </div>

                  <div className="float-wa-chat-three absolute -left-10 bottom-10 z-20 w-48 rounded-2xl border border-white/80 bg-white p-3 shadow-lg shadow-[#3C3489]/8 backdrop-blur pointer-events-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EBF3FF] text-[#5B7CFA]">
                        <Sparkles className="h-2.5 w-2.5" />
                      </span>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#5B7CFA]">{currentWhatsAppSlide.floating[2][0]}</p>
                    </div>
                    <p className="mt-2 text-xs font-bold text-[#2C2C2A]">{currentWhatsAppSlide.floating[2][1]}</p>
                    <p className="mt-0.5 text-[10px] font-semibold" style={{ color: currentWhatsAppSlide.accent }}>{currentWhatsAppSlide.title}</p>
                  </div>

                  {/* WhatsApp Chat screen mockup */}
                  <div className="relative h-[30rem] w-[15.5rem] overflow-hidden rounded-[2rem] bg-[#E5DDD5]">
                    {/* Header */}
                    <div className="px-4 pt-10 pb-3 text-white flex items-center gap-3" style={{ backgroundColor: currentWhatsAppSlide.accent === '#EF4444' ? '#8F1D2C' : '#075E54' }}>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px] font-black">{currentWhatsAppSlide.stat.slice(0, 1)}</span>
                      <div>
                        <h4 className="text-xs font-black">{currentWhatsAppSlide.eyebrow}</h4>
                        <p className="text-[9px] font-semibold text-[#87FFD0] flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#87FFD0] animate-pulse" />
                          NudgeAI WhatsApp
                        </p>
                      </div>
                    </div>

                    {/* Chat Bubble Feed */}
                    <div className="p-3 space-y-3">
                      {/* System timestamp */}
                      <div className="text-center">
                        <span className="rounded bg-white/70 px-2 py-0.5 text-[8px] font-black text-[#5F5E5A] uppercase shadow-sm">Today</span>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentWhatsAppSlide.eyebrow}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.28 }}
                          className="space-y-3"
                        >
                          {currentWhatsAppSlide.messages.map(([sender, text, time], index) => (
                            <div key={`${sender}-${index}`} className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`relative max-w-[88%] whitespace-pre-line rounded-lg p-2.5 text-[11px] font-semibold leading-normal text-[#2C2C2A] shadow-sm ${sender === 'user' ? 'bg-[#DCF8C6]' : 'bg-white'}`}>
                                {sender === 'bot' && index > 0 ? (
                                  <div className="mb-1 flex items-center gap-1 border-b border-[#EEEDFE] pb-1">
                                    <Sparkles className="h-3 w-3 text-[#1D9E75]" />
                                    <span className="text-[9px] font-black text-[#1D9E75]">NudgeAI</span>
                                  </div>
                                ) : null}
                                <p>{text}</p>
                                <p className={`mt-1 text-right text-[8px] font-semibold ${sender === 'user' ? 'text-[#5B883D]' : 'text-[#8A8894]'}`}>{time}{sender === 'user' ? ' read' : ''}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {currentWhatsAppSlide.chips.map((chip) => (
                              <span key={chip} className="rounded-full bg-white/70 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#075E54] shadow-sm">
                                {chip}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Bottom message box */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#F4F0EB] p-2 flex items-center gap-2">
                      <div className="flex-1 bg-white rounded-full px-3 py-2 text-[10px] font-semibold text-[#8A8894] shadow-sm">
                        Type a reply...
                      </div>
                      <span className="h-7 w-7 rounded-full bg-[#075E54] flex items-center justify-center text-white shadow-sm text-[10px] font-black">OK</span>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </section>

          <section id="signal-gallery" className="relative overflow-hidden bg-[#0F0B28] px-5 py-24 text-white sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(127,119,221,0.48),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(29,158,117,0.24),transparent_30%)]" />
            <div className="soft-grid absolute inset-0 opacity-10" />
            <div className="relative mx-auto max-w-6xl">
              <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                <motion.div {...cardMotion}>
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#DAD7FB]">
                    <Sparkles className="h-4 w-4 text-[#8DE4C3]" />
                    Live signal gallery
                  </p>
                  <h2 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
                    A dome of every team signal.
                  </h2>
                  <p className="mt-4 max-w-xl text-lg leading-8 text-white/72">
                    Updates, blockers, focus, check-ins, and NudgeAI briefs roll into one visual command wall so leaders can understand the day in seconds.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {['No screenshots', 'Voluntary updates', 'NudgeAI summaries', 'Live team pulse'].map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-extrabold text-white/78">
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.div {...cardMotion} className="relative">
                  <div className="absolute -inset-6 rounded-[3rem] bg-[#7F77DD]/25 blur-3xl" />
                  <div className="nudge-dome-shell relative rounded-[2rem] border border-white/10 bg-[#17113A] p-4 shadow-2xl shadow-[#7F77DD]/20">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8DE4C3]">NudgeHQ signal wall</p>
                        <p className="mt-1 text-sm font-semibold text-white/62">Click-ready product moments</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentView('demo_console')}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                      >
                        Preview demo
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="nudge-dome-stage">
                      <Ferrofluid
                        className="nudge-dome-fluid"
                        colors={['#7F77DD', '#1D9E75', '#EEEDFE']}
                        speed={0.28}
                        scale={1.45}
                        turbulence={0.85}
                        fluidity={0.08}
                        rimWidth={0.22}
                        sharpness={2.3}
                        shimmer={1.35}
                        glow={1.85}
                        flowDirection="down"
                        opacity={0.75}
                        mouseInteraction
                        mouseStrength={0.75}
                        mouseRadius={0.36}
                      />
                      <div className="nudge-dome-grid">
                        {[
                          ['Daily update', 'Kunal submitted progress', '#7F77DD', 'OK'],
                          ['Blocker alert', 'CRM import needs review', '#EF4444', '!'],
                          ['Focus pulse', 'Sales ops verifying leads', '#1D9E75', 'UP'],
                          ['Deep work', '2 hr protected session', '#3C3489', 'DW'],
                          ['NudgeAI brief', 'Standup ready at 9am', '#F59E0B', 'AI'],
                          ['Growth', '9-day check-in streak', '#7F77DD', '9D'],
                          ['Report', 'Weekly summary exported', '#1D9E75', 'PDF'],
                          ['Presence', 'Home · high energy', '#3C3489', 'ON'],
                          ['Forecast', '72% completion likely', '#F59E0B', '72'],
                          ['Recognition', 'Helped teammate unblock', '#7F77DD', 'WIN'],
                          ['Skill gap', 'API error handling', '#EF4444', 'GAP'],
                          ['Admin view', 'All teams synced', '#1D9E75', 'ALL']
                        ].map(([title, copy, color, mark], index) => (
                          <div
                            key={`${title}-${index}`}
                            className="nudge-dome-tile group"
                            style={{ '--tile-color': color, '--tile-delay': `${index * 80}ms` }}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: color }}>
                              {mark}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-extrabold text-white">{title}</span>
                              <span className="mt-1 block truncate text-xs font-semibold text-white/58">{copy}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-xs font-semibold text-white/48">Signals drift live. Hover any card to lift it; in the product, every tile opens the related task, update, blocker, or NudgeAI insight.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-[#161238] px-5 py-24 text-white sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(127,119,221,0.45),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(29,158,117,0.22),transparent_28%)]" />
            <div className="relative mx-auto max-w-6xl">
              <div className="text-center">
                <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#8DE4C3]">NudgeAI highlight</p>
                <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">Meet NudgeAI.</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#DAD7FB]">Your team&apos;s invisible operations layer.</p>
              </div>
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {[
                  ['Care', 'Burnout Predictor', "NudgeAI detects early warning signs of burnout before it affects your team's output."],
                  ['Forecast', 'Sprint Forecast', "Every Monday, NudgeAI predicts your team's completion rate for the week and flags at-risk tasks."],
                  ['Writer', 'Standup Writer', 'NudgeAI reads all updates and writes your morning team brief automatically. No meeting needed.']
                ].map(([icon, title, desc], index) => (
                  <motion.article
                    key={title}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
                    className="rounded-2xl border border-[#7F77DD]/35 bg-white/8 p-6 shadow-xl shadow-black/10 backdrop-blur"
                  >
                    <span className="text-4xl" aria-hidden="true">{icon}</span>
                    <h3 className="mt-6 text-2xl font-extrabold">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/72">{desc}</p>
                    <span className="mt-6 inline-flex rounded-full bg-[#7F77DD]/25 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#DAD7FB]">
                      NudgeAI
                    </span>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <SectionHeader
                eyebrow="Early feedback"
                title="Real words from HR leaders"
                copy="No fake customer cards here. Just honest discovery feedback from people who understand team operations."
              />
              <motion.article
                {...cardMotion}
                className="mt-12 overflow-hidden rounded-[2rem] border border-[#EEEDFE] bg-[#FCFCFF] p-7 shadow-xl shadow-[#3C3489]/8 sm:p-10"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EEEDFE] text-xl font-extrabold text-[#3C3489]">
                    SD
                  </span>
                  <div>
                    <p className="text-6xl font-black leading-none text-[#7F77DD]/25">“</p>
                    <p className="-mt-4 text-2xl font-extrabold leading-9 text-[#2C2C2A]">
                      We don't have anything like this right now, but this sounds good and useful.
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="font-extrabold text-[#2C2C2A]">Swati Dogra</p>
                        <p className="mt-1 text-sm font-semibold text-[#5F5E5A]">Head of HR - South Asia, Omya</p>
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[#1D9E75]">
                        Early discovery feedback
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                <motion.form
                  {...cardMotion}
                  onSubmit={handleFeedbackCommentSubmit}
                  className="rounded-[1.6rem] border border-[#DAD7FB] bg-white p-6 shadow-xl shadow-[#3C3489]/8"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEEDFE] text-[#3C3489]">
                      <MessageSquareText className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xl font-black text-[#1C1739]">Add a comment</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-[#5F5E5A]">
                        Tell us what would make NudgeHQ more useful for your team.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <input
                      value={feedbackCommentName}
                      onChange={(event) => setFeedbackCommentName(event.target.value)}
                      placeholder="Your name or team"
                      className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3 text-sm font-semibold text-[#2C2C2A] outline-none transition focus:border-[#7F77DD] focus:ring-4 focus:ring-[#7F77DD]/10"
                    />
                    <textarea
                      value={feedbackCommentText}
                      onChange={(event) => setFeedbackCommentText(event.target.value)}
                      placeholder="Drop one honest product comment..."
                      rows={4}
                      className="resize-none rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3 text-sm font-semibold leading-6 text-[#2C2C2A] outline-none transition focus:border-[#7F77DD] focus:ring-4 focus:ring-[#7F77DD]/10"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3C3489] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#3C3489]/16 transition hover:bg-[#7F77DD]"
                    >
                      Add comment
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </motion.form>

                <motion.div
                  {...cardMotion}
                  className="rounded-[1.6rem] border border-[#EEEDFE] bg-[#FCFCFF] p-6 shadow-xl shadow-[#3C3489]/8"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xl font-black text-[#1C1739]">Beta comment wall</p>
                    <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#1D9E75]">
                      Local beta
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {feedbackComments.length ? (
                      feedbackComments.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-[#EEEDFE] bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-[#2C2C2A]">{item.name}</p>
                            <span className="text-xs font-bold text-[#8A8894]">{item.time}</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{item.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-white/72 p-5 text-sm font-semibold leading-6 text-[#8A8894]">
                        Your first beta comment will appear here on this laptop.
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section id="faq" className="bg-[#FCFCFF] px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <SectionHeader
                eyebrow="FAQ"
                title="Frequently asked questions"
              />
              <div className="mt-10 divide-y divide-[#EEEDFE] rounded-3xl border border-[#DAD7FB] bg-white p-4 shadow-xl shadow-[#3C3489]/8 sm:p-6">
                {[
                  ['How long does setup take?', 'Under 10 minutes. Add your company details, invite your team, and you are live. No IT team needed.'],
                  ['Is employee data private and secure?', 'Yes. Employees only see their own data. Admins see company-wide data. Everything is encrypted end-to-end.'],
                  ['Can we try before paying?', 'Yes. Companies get the real Starter plan free for 14 days with no payment required. The demo is separate and only previews dashboards/features.'],
                  ['What if an employee forgets to submit an update?', 'NudgeAI automatically detects inactivity and sends a gentle nudge. Admin gets alerted too.'],
                  ['Do you support WhatsApp updates?', 'Yes. NudgeHQ supports WhatsApp nudges, two-way reply check-ins, manager blocker alerts, and Friday weekly win summaries through Twilio.'],
                  ["What's the difference between Employee and Admin access?", 'Employees see only their own tasks and progress. Admins see the full team dashboard, analytics, and NudgeAI insights.']
                ].map(([question, answer], index) => (
                  <details key={question} open={index === 0} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5">
                      <span className="text-lg font-extrabold text-[#2C2C2A]">{question}</span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEEDFE] text-[#3C3489] transition group-open:rotate-45">
                        <Plus className="h-5 w-5" />
                      </span>
                    </summary>
                    <p className="mt-4 max-w-3xl text-base leading-8 text-[#5F5E5A]">{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-[#EEEDFE] bg-white px-5 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <motion.div {...cardMotion}>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">Trust signals</p>
                  <h2 className="mt-3 text-2xl font-bold text-[#2C2C2A] sm:text-3xl">Built for modern Indian teams.</h2>
                  <p className="mt-4 leading-7 text-[#5F5E5A]">
                    Designed for fast-moving HR, operations, and field teams that need clear progress without extra reporting work.
                  </p>
                </motion.div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {trustSignals.map(([signal, Icon], index) => (
                    <motion.div
                      key={signal}
                      {...cardMotion}
                      transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                      className="rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#DAD7FB] hover:shadow-md"
                    >
                      <Icon className="h-5 w-5 text-[#7F77DD]" aria-hidden="true" />
                      <p className="mt-4 font-semibold text-[#2C2C2A]">{signal}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-[#EEEDFE] pt-8">
                {sampleTeams.map((team) => (
                  <span key={team} className="rounded-md border border-[#EEEDFE] bg-white px-4 py-2 text-sm font-semibold text-[#5F5E5A]">
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden bg-white px-5 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">Product scenarios</p>
                <h2 className="mt-4 text-3xl font-bold text-[#2C2C2A] sm:text-4xl">Ways NudgeHQ keeps work moving.</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#5F5E5A]">
                  A rotating look at practical workflows NudgeHQ is being built for, before public customer stories are available.
                </p>
              </div>

              <div className="relative mt-12 overflow-hidden border-y border-[#EEEDFE] py-5">
                <div className="logo-marquee flex w-max items-center gap-4">
                  {[...sampleTeams, ...sampleTeams].map((team, index) => (
                    <span
                      key={`${team}-${index}`}
                      className="min-w-36 rounded-md border border-[#EEEDFE] bg-[#FCFCFF] px-5 py-3 text-center text-sm font-bold text-[#5F5E5A]"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative mt-12">
                <button
                  type="button"
                  onClick={showPreviousStory}
                  className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#DAD7FB] bg-white text-[#3C3489] shadow-md transition hover:bg-[#EEEDFE] lg:flex"
                  aria-label="Show previous story"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="rounded-lg border border-[#DAD7FB] bg-white p-2 shadow-xl shadow-[#3C3489]/10">
                  <AnimatePresence mode="wait">
                    <motion.article
                      key={currentStory.title}
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -28 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="grid overflow-hidden rounded-md border border-[#EEEDFE] bg-[#FCFCFF] lg:grid-cols-[0.9fr_1.1fr]"
                    >
                      <div className="flex min-h-80 flex-col justify-between bg-white p-8 sm:p-10">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: currentStory.accent }}>
                            {currentStory.eyebrow}
                          </p>
                          <h3 className="mt-5 max-w-lg text-3xl font-bold leading-tight text-[#2C2C2A] sm:text-4xl">
                            {currentStory.title}
                          </h3>
                          <p className="mt-5 max-w-xl text-lg leading-8 text-[#5F5E5A]">{currentStory.copy}</p>
                        </div>
                        <button
                          type="button"
                          onClick={openSignup}
                          className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#DAD7FB] px-5 py-3 text-sm font-bold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                        >
                          {currentStory.cta}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="relative overflow-hidden bg-[#F7FAF9] p-6 sm:p-8">
                        <div className="absolute right-8 top-8 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm" style={{ color: currentStory.accent }}>
                          Concept preview
                        </div>
                        <div className="grid min-h-72 gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                          <div className="rounded-lg border border-white bg-white p-6 shadow-sm">
                            <p className="text-5xl font-extrabold text-[#2C2C2A]">{currentStory.metric}</p>
                            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#5F5E5A]">{currentStory.metricLabel}</p>
                            <div className="mt-8 border-t border-[#EEEDFE] pt-5">
                              <p className="text-sm leading-6 text-[#5F5E5A]">&quot;{currentStory.quote}&quot;</p>
                              <p className="mt-5 font-bold text-[#2C2C2A]">{currentStory.author}</p>
                              <p className="text-sm text-[#5F5E5A]">{currentStory.role}</p>
                            </div>
                          </div>

                          <div className="rounded-lg border border-[#DAD7FB] bg-white p-4 shadow-lg shadow-[#3C3489]/10">
                            <div className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-[#3C3489]">{currentStory.visualTitle}</p>
                                  <p className="mt-1 text-xs text-[#5F5E5A]">Updated 4 min ago</p>
                                </div>
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: currentStory.accent }} />
                              </div>
                              <div className="mt-5 space-y-3">
                                {currentStory.visualRows.map((row, index) => (
                                  <div key={row} className="flex items-center gap-3 rounded-md border border-[#EEEDFE] bg-white p-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EEEDFE] text-xs font-bold text-[#3C3489]">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm font-semibold text-[#2C2C2A]">{row}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={showNextStory}
                  className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#DAD7FB] bg-white text-[#3C3489] shadow-md transition hover:bg-[#EEEDFE] lg:flex"
                  aria-label="Show next story"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                {productScenarios.map((story, index) => (
                  <button
                    key={story.title}
                    type="button"
                    onClick={() => setActiveStory(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeStory === index ? 'w-9 bg-[#7F77DD]' : 'w-2.5 bg-[#DAD7FB] hover:bg-[#7F77DD]/70'
                    }`}
                    aria-label={`Show story ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden border-y border-[#EEEDFE] bg-[#FCFCFF] px-5 py-24 sm:px-6 lg:px-8">
            <div className="dot-grid absolute inset-0 opacity-35" />
            <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <motion.div {...cardMotion}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">Why NudgeHQ matters</p>
                <h2 className="mt-4 max-w-2xl text-3xl font-bold text-[#2C2C2A] sm:text-4xl">
                  Companies need one calm place to interact, update, and understand progress.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5F5E5A]">
                  NudgeHQ is important because it reduces the daily noise between employees, HR, managers, and founders. Everyone gets a lightweight way to communicate status, while leaders get clear signals instead of scattered messages.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {whyNudgePoints.map((point) => (
                    <div key={point} className="flex gap-3 rounded-lg border border-[#EEEDFE] bg-white p-4 shadow-sm">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F7F1] text-[#1D9E75]">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <p className="text-sm font-semibold leading-6 text-[#2C2C2A]">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...cardMotion} className="relative mx-auto w-full max-w-lg">
                <NudgeMascot />
                <div className="mt-6 rounded-lg border border-[#DAD7FB] bg-white p-5 shadow-xl shadow-[#3C3489]/10">
                  <div className="flex items-center justify-between border-b border-[#EEEDFE] pb-4">
                    <div>
                      <p className="text-sm font-bold text-[#3C3489]">NudgeHQ interaction loop</p>
                      <p className="mt-1 text-xs text-[#5F5E5A]">Simple updates become company clarity</p>
                    </div>
                    <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-bold text-[#1D9E75]">Live flow</span>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {['Employee shares update', 'NudgeAI catches blockers', 'Admin sees next action'].map((item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-md bg-[#FCFCFF] p-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEEDFE] text-sm font-bold text-[#3C3489]">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-[#2C2C2A]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section features & product descriptions */}
          <section className="border-y border-[#EEEDFE] bg-[#FCFCFF] px-5 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                eyebrow="The problem"
                title="Progress gets messy when every update needs a chase."
                copy="NudgeHQ gives companies a calmer operating rhythm by making workforce progress visible before it becomes a meeting."
              />
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {painPoints.map(({ icon: Icon, title, copy }) => (
                  <motion.article key={title} {...cardMotion} className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#EEEDFE] text-[#3C3489]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-[#2C2C2A]">{title}</h3>
                    <p className="mt-3 leading-7 text-[#5F5E5A]">{copy}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                eyebrow="Features"
                title="One product, four clear workspaces."
                copy="NudgeHQ keeps every role focused on the data they actually need: employees update fast, managers unblock work, HR understands people health, and admins control the full company workspace."
              />
              <div className="mt-14 grid gap-5 lg:grid-cols-4">
                {roleFeatureCards.map(({ role, title, copy, icon: Icon, accent, points }, index) => (
                  <motion.article
                    key={role}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                    className="metric-lift rounded-[1.25rem] border border-[#EEEDFE] bg-white p-6 shadow-lg shadow-[#3C3489]/6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#FCFCFF] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#5F5E5A]">
                        {role}
                      </span>
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg"
                        style={{ backgroundColor: accent }}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-extrabold leading-tight text-[#2C2C2A]">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#5F5E5A]">{copy}</p>
                    <div className="mt-6 grid gap-2">
                      {points.map((point) => (
                        <div key={point} className="flex items-center gap-2 text-sm font-bold text-[#2C2C2A]">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1D9E75]" aria-hidden="true" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-[#DAD7FB] bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F4FF_52%,#EAF8F2_100%)] p-5 shadow-xl shadow-[#3C3489]/8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7F77DD]">Platform layer</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">NudgeAI and workflow tools sit across every dashboard.</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('demo_console')}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-[#3C3489] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#7F77DD]"
                  >
                    Preview dashboards
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {platformFeatureRail.map(([feature, Icon]) => (
                    <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEEDFE] text-[#3C3489]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-bold text-[#2C2C2A]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* AI Features Highlight */}
          <section className="relative overflow-hidden bg-[#FCFCFF] px-5 py-24 sm:px-6 lg:px-8 border-y border-[#EEEDFE]">
            <div className="dot-grid absolute inset-0 opacity-40" />
            <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <motion.div {...cardMotion}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">Killer feature</p>
                <h2 className="mt-4 text-3xl font-bold text-[#2C2C2A] sm:text-4xl">AI Team Summaries that turn updates into decisions.</h2>
                <p className="mt-5 text-lg leading-8 text-[#5F5E5A]">
                  NudgeHQ can roll daily check-ins, blockers, and delayed updates into a manager-ready summary, so leaders see what changed without reading every message.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('demo_console')}
                  className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#3C3489] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7F77DD]"
                >
                  Launch Demo Console
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>
              <motion.div {...cardMotion} className="rounded-lg border border-[#DAD7FB] bg-white p-4 shadow-xl shadow-[#3C3489]/10">
                <div className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#3C3489]">AI Team Summary</p>
                      <p className="mt-1 text-xs text-[#5F5E5A]">Generated from today&apos;s updates</p>
                    </div>
                    <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-semibold text-[#1D9E75]">Live draft</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    {aiSummaryItems.map(([item, label, color]) => (
                      <div key={item} className="flex items-center justify-between gap-4 rounded-md border border-[#EEEDFE] bg-white p-4">
                        <div className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <p className="font-semibold text-[#2C2C2A]">{item}</p>
                        </div>
                        <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-semibold text-[#3C3489]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="bg-[#EEEDFE] px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                eyebrow="How it works"
                title="Three steps from chasing updates to seeing progress."
              />
              <div className="mt-14 grid gap-6 md:grid-cols-3">
                {steps.map(({ step, title, copy }, index) => (
                  <motion.article
                    key={step}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
                    className="rounded-lg border border-white/70 bg-white p-7 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#7F77DD]">{step}</span>
                      <Workflow className="h-5 w-5 text-[#1D9E75]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-8 text-xl font-bold text-[#2C2C2A]">{title}</h3>
                    <p className="mt-3 leading-7 text-[#5F5E5A]">{copy}</p>
                  </motion.article>
                ))}
              </div>
              <div className="mx-auto mt-10 grid max-w-3xl gap-3 rounded-lg border border-white/70 bg-white/70 p-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                {['Employee update', 'AI summary', 'Manager dashboard'].map((item, index) => (
                  <span key={item} className="contents">
                    <motion.span
                      initial={{ opacity: 0.65 }}
                      animate={{ opacity: [0.65, 1, 0.65] }}
                      transition={{ duration: 2.4, delay: index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                      className="rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-[#3C3489]"
                    >
                      {item}
                    </motion.span>
                    {index < 2 ? <ArrowRight className="mx-auto hidden h-5 w-5 text-[#1D9E75] sm:block" aria-hidden="true" /> : null}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section id="pricing" className="px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                eyebrow="Pricing"
                title="Simple flat pricing for early-stage teams."
                copy="No per-user billing shock. Pick a team size, start with a trial, and scale when NudgeHQ becomes company-wide."
              />
              <div className="mt-14 grid gap-5 lg:grid-cols-4">
                {pricing.map(({ name, priceInr, priceUsd, description, features, highlighted, entry, button, contact }, index) => (
                  <motion.article
                    key={name}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                    className={`rounded-lg border p-6 ${
                      highlighted
                        ? 'border-[#7F77DD] bg-[#3C3489] text-white shadow-xl shadow-[#3C3489]/20'
                        : 'border-[#EEEDFE] bg-white text-[#2C2C2A] shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{name}</h3>
                      {highlighted ? (
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">Most Popular</span>
                      ) : entry ? (
                        <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-semibold text-[#1D9E75]">Entry Plan</span>
                      ) : null}
                    </div>
                    <p className={`mt-4 text-3xl font-extrabold ${highlighted ? 'text-white' : 'text-[#3C3489]'}`}>
                      {priceInr}
                    </p>
                    <p className={`mt-1 text-sm font-bold ${highlighted ? 'text-white/72' : 'text-[#5F5E5A]'}`}>
                      Global: {priceUsd}
                    </p>
                    <p className={`mt-3 min-h-14 leading-6 ${highlighted ? 'text-white/75' : 'text-[#5F5E5A]'}`}>
                      {description}
                    </p>
                    <ul className="mt-7 space-y-3">
                      {features.map((feature) => (
                        <li key={feature} className={`flex gap-3 text-sm ${highlighted ? 'text-white/85' : 'text-[#5F5E5A]'}`}>
                          <Check className={`h-5 w-5 shrink-0 ${highlighted ? 'text-[#8DE4C3]' : 'text-[#1D9E75]'}`} aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        if (contact) {
                          window.location.href = 'mailto:hello.nudgehq@gmail.com?subject=NudgeHQ Enterprise Plan';
                          return;
                        }
                        openSignup();
                      }}
                      className={`mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition ${
                        highlighted
                          ? 'bg-white text-[#3C3489] hover:bg-[#EEEDFE]'
                          : 'bg-[#EEEDFE] text-[#3C3489] hover:bg-[#7F77DD] hover:text-white'
                      }`}
                    >
                      {button}
                    </button>
                  </motion.article>
                ))}
              </div>
              <motion.div {...cardMotion} className="mt-8 overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-[linear-gradient(135deg,#FCFCFF_0%,#F4F3FF_52%,#E8F7F1_100%)] p-6 shadow-xl shadow-[#3C3489]/8 md:p-8">
                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#3C3489]">Custom plan</p>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-[#2C2C2A]">Need an exact-fit plan? We can build it around your team.</h3>
                    <p className="mt-4 text-sm font-semibold leading-7 text-[#5F5E5A]">
                      Custom is for teams that do not fit fixed packs. Choose your employee limit from 5 onward, add only the features you need, and ask for workflow changes that match how your company actually runs.
                    </p>
                    <a
                      href="mailto:hello.nudgehq@gmail.com?subject=NudgeHQ Custom Plan"
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3C3489] px-5 py-3 text-sm font-black text-white transition hover:bg-[#7F77DD]"
                    >
                      Discuss custom plan
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Exact employee limit', 'Start from 5 users and scale to the exact headcount your team needs.'],
                      ['Feature add-ons', 'Add WhatsApp, NudgeAI, reports, proof workflows, integrations, or priority onboarding.'],
                      ['Workflow customization', 'Need a special approval flow, reminder logic, or dashboard view? We can shape it.'],
                      ['Flexible pricing', 'We quote based on your team size, required features, and support expectations.'],
                    ].map(([title, copy]) => (
                      <div key={title} className="rounded-2xl border border-white/80 bg-white/88 p-5 shadow-sm">
                        <p className="font-black text-[#2C2C2A]">{title}</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{copy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="px-5 pb-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-[1.75rem] border border-[#DAD7FB] bg-[linear-gradient(135deg,#FCFCFF_0%,#EEEDFE_48%,#FFFFFF_100%)] p-6 shadow-xl shadow-[#3C3489]/8 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#7F77DD]">The Hype</p>
                    <h2 className="mt-3 max-w-2xl text-3xl font-extrabold text-[#2C2C2A]">What makes NudgeHQ feel exciting.</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5F5E5A]">
                      A quick slide-style look at the product energy we are building: AI, roles, team clarity, and startup momentum.
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#3C3489] shadow-sm ring-1 ring-[#EEEDFE]">
                    5 product slides
                  </span>
                </div>

                <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-3">
                  {hypeSlides.map((slide, index) => (
                    <motion.article
                      key={slide.title}
                      {...cardMotion}
                      transition={{ duration: 0.45, delay: index * 0.04, ease: 'easeOut' }}
                      className="metric-lift min-w-[17rem] snap-start rounded-[1.35rem] border border-white/80 bg-white p-5 shadow-lg shadow-[#3C3489]/8 sm:min-w-[20rem]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#5F5E5A]">Slide {index + 1}</span>
                        <span className="rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{ backgroundColor: slide.accent }}>
                          {slide.stat}
                        </span>
                      </div>
                      <div className="mt-8 flex h-24 items-center justify-center rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF]">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-lg" style={{ backgroundColor: slide.accent }}>
                          N.
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-extrabold text-[#2C2C2A]">{slide.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#5F5E5A]">{slide.copy}</p>
                    </motion.article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 pb-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ['Instagram', '@hello.nudgehq', 'Product drops, UI previews, build updates, and behind-the-scenes progress.', 'https://www.instagram.com/hello.nudgehq/?__pwa=1', 'Follow on Instagram'],
                  ['LinkedIn', 'NudgeHQ Web', 'Company updates, launch notes, hiring signals, and B2B product announcements.', 'https://www.linkedin.com/company/nudgehq-web', 'Follow on LinkedIn'],
                ].map(([channel, handle, copy, href, label]) => (
                  <div key={channel} className="grid gap-6 rounded-[1.5rem] border border-[#EEEDFE] bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                    <div className="flex items-center gap-4">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#161238] text-2xl font-extrabold text-white">N.</span>
                      <div>
                        <p className="text-lg font-extrabold text-[#2C2C2A]">{channel}: {handle}</p>
                        <p className="text-sm font-semibold text-[#5F5E5A]">{copy}</p>
                      </div>
                    </div>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3C3489] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#7F77DD]"
                    >
                      {label}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="security" className="border-y border-[#EEEDFE] bg-[#FCFCFF] px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">Data security</p>
                <h2 className="mt-4 text-3xl font-bold text-[#2C2C2A] sm:text-4xl">Workforce data handled with enterprise-grade care.</h2>
                <p className="mt-5 text-lg leading-8 text-[#5F5E5A]">
                  NudgeHQ keeps progress, attendance, and team insights protected with access controls and security-first workflows.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {badges.map(({ title, copy, icon: Icon }, index) => (
                  <motion.div
                    key={title}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                    className="flex items-center gap-4 rounded-lg border border-[#EEEDFE] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#E8F7F1] text-[#1D9E75]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2C2C2A]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#5F5E5A]">{copy}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#7F77DD_0%,#3C3489_100%)] px-6 py-16 text-center text-white shadow-2xl shadow-[#3C3489]/20 sm:px-10">
              <h2 className="text-4xl font-extrabold leading-tight sm:text-6xl">
                Stop chasing updates.
                <br />
                Start knowing.
              </h2>
              <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={openSignup}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-[#3C3489] transition hover:bg-[#EEEDFE]"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('demo_console')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-transparent px-7 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
                >
                  Take Demo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-6 text-sm font-bold text-white/75">Real Starter plan free for 14 days · Demo is preview-only · No card today</p>
            </div>
          </section>

          {/* Footer sections */}
          <footer className="px-5 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 border-t border-[#EEEDFE] pt-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div>
                <a href="#top" className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-9 w-9 rounded-lg" />
                  <span className="font-bold text-[#3C3489]">NudgeHQ</span>
                </a>
                <p className="mt-4 max-w-sm leading-7 text-[#5F5E5A]">
                  Real-time workforce progress tracking for teams that want clarity without constant follow-ups.
                </p>
                <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3C3489] hover:text-[#7F77DD]" href="mailto:hello.nudgehq@gmail.com">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  hello.nudgehq@gmail.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-[#2C2C2A]">Product</p>
                <div className="mt-4 grid gap-3 text-sm font-medium text-[#5F5E5A]">
                  <a className="hover:text-[#3C3489]" href="#features">Features</a>
                  <a
                    className="hover:text-[#3C3489]"
                    href="/why-nudgehq"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentView('why_nudgehq');
                    }}
                  >
                    Why NudgeHQ?
                  </a>
                  <a className="hover:text-[#3C3489]" href="#pricing">Pricing</a>
                  <a className="hover:text-[#3C3489]" href="#security">Security</a>
                  <a
                    className="hover:text-[#3C3489]"
                    href="/blog"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentView('blog');
                    }}
                  >
                    Blog
                  </a>
                  <button type="button" onClick={openSignup} className="w-fit text-left font-medium hover:text-[#3C3489]">
                    Sign Up
                  </button>
                </div>
              </div>
              <div>
                <p className="font-semibold text-[#2C2C2A]">Company</p>
                <div className="mt-4 grid gap-3 text-sm font-medium text-[#5F5E5A]">
                  <a className="hover:text-[#3C3489]" href="mailto:hello.nudgehq@gmail.com">Contact</a>
                  <a
                    className="hover:text-[#3C3489]"
                    href="/blog"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentView('blog');
                    }}
                  >
                    Blog
                  </a>
                  <a
                    className="hover:text-[#3C3489]"
                    href="https://www.instagram.com/hello.nudgehq/?__pwa=1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                  <a
                    className="hover:text-[#3C3489]"
                    href="https://www.linkedin.com/company/nudgehq-web"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                  <a
                    className="hover:text-[#3C3489]"
                    href="/privacy"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentView('privacy');
                    }}
                  >
                    Privacy Policy
                  </a>
                  <a
                    className="hover:text-[#3C3489]"
                    href="/terms"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentView('terms');
                    }}
                  >
                    Terms
                  </a>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-10 max-w-7xl border-t border-[#EEEDFE] pt-6">
              <div className="flex flex-col gap-2 text-sm text-[#5F5E5A] sm:flex-row sm:items-center sm:justify-between">
                <p>(c) 2026 NudgeHQ. All rights reserved.</p>
                <p className="font-semibold text-[#3C3489]">Proudly made in India.</p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* VIEW 2: SIGN IN */}
      {currentView === 'signin' && (
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#F7FAFF] px-5 py-12 text-[#2C2C2A] sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#EEF4FF_0%,#FFFFFF_42%,#EAF8F2_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-35" />
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/12 lg:grid-cols-[0.96fr_1.04fr]">
            <motion.div {...cardMotion} className="relative overflow-hidden bg-[linear-gradient(180deg,#FEFEFF_0%,#F8F7FF_100%)] p-6 text-[#2C2C2A] sm:p-8 lg:p-10">
              <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#EEEDFE] blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#E8F7F1] blur-3xl" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-md shadow-[#3C3489]/10" />
                  <div>
                    <p className="text-lg font-extrabold text-[#2C2C2A]">NudgeHQ</p>
                    <p className="text-xs font-semibold text-[#5F5E5A]">Workforce progress OS</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#3C3489]">Secure</span>
              </div>

              <div className="relative mt-8 rounded-full border border-white/70 bg-white/80 p-1 shadow-[0_16px_40px_rgba(60,52,137,0.08)] backdrop-blur">
                <div className="grid grid-cols-2 gap-1">
                  <button type="button" className="rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#2C2C2A] shadow-sm ring-1 ring-[#EEEDFE]">
                    Sign In
                  </button>
                  <button type="button" onClick={openSignup} className="rounded-full px-4 py-2.5 text-sm font-bold text-[#8A8984] transition hover:text-[#3C3489]">
                    Sign Up
                  </button>
                </div>
              </div>

              <div className="relative mt-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#1D9E75]">Fast access</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#1E2737]">Welcome back</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5F5E5A]">Log in to open tasks, blockers, reports, and NudgeAI insights in one focused workspace.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ['1 tap', 'Back to the HQ'],
                    ['Live', 'Updates & blockers'],
                    ['AI', 'Summaries on demand'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-white/90 p-4 shadow-sm">
                      <p className="text-2xl font-extrabold text-[#3C3489]">{value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8984]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="relative mt-8 grid gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Email address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className={`mt-2 ${AUTH_INPUT_CLASS}`}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <PasswordField
                  label="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="auth-password-field"
                />
                <div className="flex justify-end">
                  <button type="button" onClick={() => setCurrentView('forgot_password')} className="text-xs font-bold text-[#3C3489] hover:text-[#7F77DD]">
                    Forgot password?
                  </button>
                </div>

                {loginError ? (
                  <p className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-600">{loginError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E2737] px-5 py-4 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(30,39,55,0.22)] transition hover:bg-[#3C3489] disabled:opacity-50"
                >
                  {loginLoading ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  Open workspace
                </button>

                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#A09F9A]">
                  <span className="h-px flex-1 bg-[#EEEDFE]" />
                  or
                  <span className="h-px flex-1 bg-[#EEEDFE]" />
                </div>

                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-[#E5E4F8] bg-white px-5 py-3.5 text-sm font-extrabold text-[#A09F9A] opacity-75"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-[#EEEDFE] bg-white text-base font-black text-[#4285F4]">G</span>
                  Continue with Google - Coming soon
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#5F5E5A]">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={openSignup} className="font-extrabold text-[#3C3489] hover:text-[#7F77DD]">
                  Start free trial
                </button>
              </p>
            </motion.div>

            <motion.div {...cardMotion} className="relative min-h-[36rem] overflow-hidden bg-[linear-gradient(145deg,#3C3489_0%,#5B7CFA_48%,#EAF8F2_112%)] p-8 text-white">
              <div className="absolute inset-0 soft-grid opacity-20" />
              <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-white/12 blur-3xl" />
              <div className="absolute bottom-8 right-8 h-44 w-44 rounded-full bg-[#1D9E75]/20 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                    NudgeAI ready
                  </span>
                  <button type="button" onClick={() => setCurrentView('demo_console')} className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                    Demo Console
                  </button>
                </div>
                <div className="mx-auto w-full max-w-md rounded-[1.8rem] border border-white/35 bg-white/16 p-4 shadow-2xl shadow-[#16215E]/30 backdrop-blur">
                  <div className="rounded-[1.4rem] bg-white p-5 text-[#2C2C2A] shadow-[0_18px_50px_rgba(30,39,55,0.12)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-extrabold text-[#3C3489]">Today at a glance</p>
                        <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">NudgeHQ workspace pulse</p>
                      </div>
                      <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-extrabold text-[#1D9E75]">Live</span>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {[
                        ['82%', 'Tasks on track', '#7F77DD'],
                        ['3', 'Blockers need review', '#F43F5E'],
                        ['30 hrs', 'Saved from follow-ups', '#1D9E75']
                      ].map(([value, label, color]) => (
                        <div key={label} className="flex items-center justify-between rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3">
                          <div>
                            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
                            <p className="text-xs font-semibold text-[#5F5E5A]">{label}</p>
                          </div>
                          <CheckCircle2 className="h-5 w-5" style={{ color }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="max-w-md text-3xl font-extrabold leading-tight text-white">
                  One login. Every team signal in focus.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* VIEW 3: SIGN UP */}
      {currentView === 'signup' && (
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#F7FAFF] px-5 py-12 text-[#2C2C2A] sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#EEF4FF_0%,#FFFFFF_42%,#EAF8F2_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-35" />
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/12 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div {...cardMotion} className="relative overflow-hidden bg-[linear-gradient(180deg,#FEFEFF_0%,#F8F7FF_100%)] p-6 text-[#2C2C2A] sm:p-8 lg:p-10">
              <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#E8F7F1] blur-3xl" />
              <div className="absolute right-0 top-20 h-40 w-40 rounded-full bg-[#EEEDFE] blur-3xl" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-md shadow-[#3C3489]/10" />
                  <div>
                    <p className="text-lg font-extrabold text-[#2C2C2A]">NudgeHQ</p>
                    <p className="text-xs font-semibold text-[#5F5E5A]">Create your workspace</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1D9E75]">14-day trial</span>
              </div>

              <div className="relative mt-8 rounded-full border border-white/70 bg-white/80 p-1 shadow-[0_16px_40px_rgba(60,52,137,0.08)] backdrop-blur">
                <div className="grid grid-cols-2 gap-1">
                  <button type="button" className="rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#2C2C2A] shadow-sm ring-1 ring-[#EEEDFE]">
                    Sign Up
                  </button>
                  <button type="button" onClick={openSignin} className="rounded-full px-4 py-2.5 text-sm font-bold text-[#8A8984] transition hover:text-[#3C3489]">
                    Sign In
                  </button>
                </div>
              </div>

              <div className="relative mt-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#1D9E75]">Join now</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#1E2737]">Create an account</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5F5E5A]">Set up your company HQ, verify email, and move into onboarding with a workspace that already feels organized.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ['14 days', 'Starter free'],
                    ['4 roles', 'Ready on day one'],
                    ['No card', 'Fast start'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-white/90 p-4 shadow-sm">
                      <p className="text-2xl font-extrabold text-[#3C3489]">{value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8984]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignupSubmit} className="relative mt-8 grid gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Company name</label>
                  <input
                    type="text"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    className={`mt-2 ${AUTH_INPUT_CLASS}`}
                    placeholder="Acme Operations"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Your name</label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className={`mt-2 ${AUTH_INPUT_CLASS}`}
                      placeholder="Kunal Sharma"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Work email</label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={`mt-2 ${AUTH_INPUT_CLASS}`}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <PasswordField
                    label="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Choose password"
                    className="auth-password-field"
                  />
                  <PasswordField
                    label="Confirm password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="auth-password-field"
                  />
                </div>

                <div className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#3C3489]">
                    <span>Step {signupPreviewStep} of 3</span>
                    <span>{signupStepCopy}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div className="h-full rounded-full bg-[#7F77DD] transition-all duration-500" style={{ width: `${(signupPreviewStep / 3) * 100}%` }} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fillDemoSignupCredentials}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#DAD7FB] bg-white px-5 py-3 text-sm font-extrabold text-[#3C3489] shadow-sm transition hover:border-[#7F77DD] hover:bg-[#F4F3FF]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Use preview credentials
                </button>

                <label className="flex items-start gap-3 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-3 text-sm text-[#5F5E5A]">
                  <input
                    type="checkbox"
                    checked={signupAgree}
                    onChange={(e) => setSignupAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#7F77DD]"
                    required
                  />
                  <span>
                    I agree to the NudgeHQ{' '}
                    <button type="button" onClick={() => setCurrentView('terms')} className="font-bold text-[#3C3489] hover:text-[#7F77DD]">
                      Terms & Conditions
                    </button>
                    .
                  </span>
                </label>

                {signupError ? (
                  <p className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-600">{signupError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E2737] px-5 py-4 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(30,39,55,0.22)] transition hover:bg-[#3C3489] disabled:opacity-50"
                >
                  {signupLoading ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Building2 className="h-4 w-4" aria-hidden="true" />}
                  Create workspace
                </button>

                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#A09F9A]">
                  <span className="h-px flex-1 bg-[#EEEDFE]" />
                  or
                  <span className="h-px flex-1 bg-[#EEEDFE]" />
                </div>

                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-[#E5E4F8] bg-white px-5 py-3.5 text-sm font-extrabold text-[#A09F9A] opacity-75"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-[#EEEDFE] bg-white text-base font-black text-[#4285F4]">G</span>
                  Continue with Google - Coming soon
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#5F5E5A]">
                Already have an account?{' '}
                <button type="button" onClick={openSignin} className="font-extrabold text-[#3C3489] hover:text-[#7F77DD]">
                  Sign in
                </button>
              </p>
            </motion.div>

            <motion.div {...cardMotion} className="relative min-h-[42rem] overflow-hidden bg-[linear-gradient(145deg,#3C3489_0%,#7F77DD_46%,#E8F7F1_112%)] p-8 text-white">
              <div className="absolute inset-0 soft-grid opacity-20" />
              <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-white/12 blur-3xl" />
              <div className="absolute bottom-8 left-8 h-44 w-44 rounded-full bg-[#1D9E75]/18 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/14 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur">
                    <Building2 className="h-4 w-4" />
                    Setup preview
                  </span>
                  <span className="rounded-full bg-[#111827] px-4 py-2 text-xs font-extrabold text-white">No credit card</span>
                </div>
                <div className="mx-auto w-full max-w-md rounded-[1.8rem] border border-white/35 bg-white/16 p-4 shadow-2xl shadow-[#3C3489]/25 backdrop-blur">
                  <div className="rounded-[1.4rem] bg-white p-5 text-[#2C2C2A] shadow-[0_18px_50px_rgba(30,39,55,0.12)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-extrabold text-[#3C3489]">Workspace setup</p>
                        <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">From signup to first team invite</p>
                      </div>
                      <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">Step {signupPreviewStep}</span>
                    </div>
                    <div className="mt-5 space-y-3">
                      {signupPreviewSteps.map(([label, helper], index) => {
                        const isComplete = index < signupPreviewStep;
                        const isCurrent = index === signupPreviewStep;
                        return (
                          <div key={label} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${isComplete ? 'border-[#1D9E75]/30 bg-[#E8F7F1]' : isCurrent ? 'border-[#7F77DD]/40 bg-[#F4F3FF]' : 'border-[#EEEDFE] bg-[#FCFCFF]'}`}>
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isComplete ? 'bg-[#1D9E75] text-white' : isCurrent ? 'bg-[#7F77DD] text-white' : 'bg-[#EEEDFE] text-[#7F77DD]'}`}>
                              {isComplete ? <Check className="h-4 w-4" /> : <span className="text-xs font-extrabold">{index + 1}</span>}
                            </span>
                            <span>
                              <span className="block text-sm font-extrabold">{label}</span>
                              <span className="mt-0.5 block text-[11px] font-semibold text-[#5F5E5A]">{helper}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className="max-w-md text-3xl font-extrabold leading-tight text-white">
                  Build a workspace your team can actually follow.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* VIEW 4: DEMO LOGIN CONSOLE */}
      {currentView === 'demo_console' && (
        <section className="relative isolate overflow-hidden px-5 py-12 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#EEF4FF_0%,#FFFFFF_42%,#E8F7F1_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-35" />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/12 lg:grid-cols-[0.92fr_1.08fr]"
          >
            <div className="bg-[#FBFBFF] p-6 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-12 w-12 rounded-xl shadow-lg shadow-[#3C3489]/10" />
                  <div>
                    <p className="text-xl font-extrabold text-[#2C2C2A]">NudgeHQ</p>
                    <p className="text-xs font-semibold text-[#5F5E5A]">Preview-only role studio</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E8F7F1] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1D9E75]">
                  Preview-only
                </span>
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3C3489] shadow-sm ring-1 ring-[#EEEDFE]">
                  <Zap className="h-4 w-4 text-[#F59E0B]" />
                  Demo preview console
                </span>
                <h2 className="mt-5 text-4xl font-extrabold leading-tight text-[#1E2737] sm:text-5xl">
                  Choose a role. Enter the HQ.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5F5E5A]">
                  Preview Employee, Manager, HR, and Admin dashboards without creating a real company account or touching customer data.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ['employee', User, '#3C3489', '#F4F3FF', 'Employee'],
                  ['manager', ListTodo, '#1D9E75', '#E8F7F1', 'Manager'],
                  ['hr', ShieldCheck, '#F59E0B', '#FFFBEB', 'HR'],
                  ['admin', Shield, '#7F77DD', '#F4F3FF', 'Admin']
                ].map(([role, Icon, color, bg, label]) => {
                  const isSelected = emailInput === getDemoUserFromRole(role).email;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleDemoSignIn(role)}
                      className={`metric-lift rounded-2xl border p-4 text-left transition ${isSelected ? 'border-[#7F77DD] shadow-lg shadow-[#3C3489]/10' : 'border-[#EEEDFE]'}`}
                      style={{ backgroundColor: bg }}
                    >
                      <Icon className="h-5 w-5" style={{ color }} />
                      <span className="mt-3 block text-sm font-extrabold" style={{ color }}>{label}</span>
                      <span className="mt-1 block text-[11px] font-semibold text-[#5F5E5A]">Open {label} view</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-7 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-[0.24em] text-[#5F5E5A]">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
                    required
                  />
                </div>

                <PasswordField
                  label="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  labelClassName="block text-xs font-extrabold uppercase tracking-[0.24em] text-[#5F5E5A]"
                  className="auth-password-field"
                />

                {loginError && (
                  <div className="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-600 ring-1 ring-rose-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                    {isBackendConnectionError(loginError) ? (
                      <button
                        type="button"
                        onClick={enterSandboxDashboard}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-extrabold text-[#3C3489] ring-1 ring-[#DAD7FB] transition hover:bg-[#EEEDFE]"
                      >
                        Continue in Sandbox Mode
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3C3489] py-4 text-sm font-extrabold text-white shadow-xl shadow-[#3C3489]/18 transition hover:bg-[#7F77DD] disabled:opacity-50"
                >
                  {loginLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Open demo workspace
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setCurrentView('landing')}
                  className="text-xs font-semibold text-[#5F5E5A] underline hover:text-[#3C3489]"
                >
                  Back to landing page
                </button>
              </div>
            </div>

            <div className="demo-cinematic-panel relative isolate min-h-[34rem] overflow-hidden bg-[linear-gradient(145deg,#7F77DD_0%,#5B7CFA_48%,#DDE8FF_100%)] p-8 text-white sm:p-10">
              <div className="soft-grid absolute inset-0 -z-10 opacity-18" />
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-white/18 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-white">
                  NudgeAI ready
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#3C3489]">
                  4 roles
                </span>
              </div>

              <div className="demo-logo-stage mx-auto mt-16 flex h-64 max-w-md items-center justify-center rounded-[2rem] border border-white/30 bg-white/12 shadow-2xl shadow-[#1C164D]/20 backdrop-blur">
                <div className="demo-logo-cube relative flex h-36 w-36 items-center justify-center rounded-[2rem] bg-[#19113D] shadow-2xl shadow-[#1C164D]/40">
                  <img src="/brand/nudgehq-icon.svg" alt="NudgeHQ" className="h-24 w-24 rounded-2xl" />
                </div>
              </div>

              <div className="mx-auto mt-8 max-w-md rounded-[1.75rem] border border-white/30 bg-white p-5 text-[#2C2C2A] shadow-2xl shadow-[#1C164D]/18">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-[#3C3489]">Demo workspace pulse</p>
                    <p className="text-xs font-semibold text-[#5F5E5A]">Every role opens a different lens</p>
                  </div>
                  <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-extrabold text-[#1D9E75]">Live</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    ['Employee', 'Own tasks + growth'],
                    ['Manager', 'Team blockers + work'],
                    ['HR', 'People health + reports'],
                    ['Admin', 'Everything + billing']
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3">
                      <span className="text-sm font-extrabold text-[#2C2C2A]">{label}</span>
                      <span className="text-xs font-bold text-[#5F5E5A]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="absolute bottom-8 left-8 right-8 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                One sandbox. Every NudgeHQ role in motion.
              </p>
            </div>
          </motion.div>
        </section>
      )}

      {/* VIEW 3: LIVE DASHBOARD AREA */}
      {currentView === 'dashboard' && (isSandbox || (!isSandbox && (isEmployeeDashboard || isLiveManagerWorkspace || isLiveAdminOrHrWorkspace))) && (
        <section className="dashboard-showcase-bg relative min-h-screen">
          <div className="dashboard-glass-shell grid min-h-screen overflow-hidden border-0 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="dashboard-sidebar-premium flex border-b border-white/70 p-5 lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r lg:border-white/70">
              <div className="flex w-full items-center justify-between gap-4 lg:block">
                <div className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-lg shadow-[#3C3489]/12" />
                  <div>
                    <p className="text-lg font-extrabold tracking-tight text-[#1C1739]">NudgeHQ</p>
                    <p className="text-xs font-bold text-[#8A8894]">{dashboardShellSubtitle}</p>
                  </div>
                </div>
                {isSandbox ? (
                  <button
                    type="button"
                    onClick={() => setCurrentView('demo_console')}
                    className="rounded-xl border border-[#FECACA] px-3 py-2 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50 lg:hidden"
                  >
                    Exit
                  </button>
                ) : token ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50 lg:hidden"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : null}
              </div>

              <nav className="mt-7 hidden flex-1 space-y-2 lg:block">
                {demoSidebarItems.map(([label, Icon], index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleDashboardSectionSelect(label)}
                    className={`flex w-full items-center gap-3 rounded-xl border-l-[3px] px-4 py-3 text-sm font-extrabold transition ${
                      (demoDashboardCanNavigate ? activeDashboardSection === label : index === 0)
                        ? 'border-l-[#7F77DD] bg-[#1C1739] text-white shadow-lg shadow-[#3C3489]/18'
                        : 'border-l-transparent text-[#6E6B78] hover:bg-white/90 hover:text-[#3C3489] hover:shadow-sm'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto hidden rounded-2xl border border-white/80 bg-white/72 p-4 shadow-xl shadow-[#3C3489]/8 backdrop-blur lg:block">
                <div className="flex items-center gap-3">
                  <span className="dashboard-orbit-node flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#3C3489] text-sm font-extrabold text-white">
                    {isSandbox && demoProfileAvatar && dashboardRole === 'employee' ? (
                      <img src={demoProfileAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      demoInitials
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#2C2C2A]">{demoDisplayName}</p>
                    <p className="text-xs font-bold capitalize text-[#8A8894]">{dashboardRoleLabel}</p>
                  </div>
                </div>
                {isSandbox ? (
                  <button
                    type="button"
                    onClick={() => setCurrentView('demo_console')}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#FECACA] px-3 py-2 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Exit demo
                  </button>
                ) : token ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : null}
              </div>
            </aside>

            <div className="dashboard-main-premium min-w-0 p-5 sm:p-7 lg:max-h-screen lg:overflow-y-auto">
              <header className="dashboard-hero-strip rounded-[28px] p-5 md:flex md:items-start md:justify-between md:gap-4">
                <div>
                  {dashboardRole === 'manager' ? (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {['Daily Signals', 'Blockers', 'NudgeAI', 'WhatsApp'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => activateManagerFocusTab(chip)}
                          className={`rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] shadow-sm transition ${
                            activeManagerFocusTab === chip
                              ? 'border-[#3C3489] bg-[#1C1739] text-white'
                              : 'border-white/80 bg-white/72 text-[#6D63D9] hover:border-[#B9B4FF] hover:bg-white'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <h1 className="relative z-10 text-3xl font-extrabold tracking-tight text-[#1C1739] sm:text-4xl">
                    {dashboardGreeting}, {demoDisplayName.split(' ')[0] || 'there'}!
                  </h1>
                  <p className="relative z-10 mt-2 text-sm font-semibold text-[#6E6B78]">
                    {dashboardRole === 'employee'
                      ? "Here's your focus for today."
                      : dashboardRole === 'admin'
                        ? "Here's what is happening across your workspace today."
                        : dashboardRole === 'hr'
                          ? "Here's your people rhythm and team health snapshot."
                          : "Here's what's happening with your team today."}
                  </p>
                </div>
                <div className="relative z-10 mt-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-bold text-[#5F5E5A] shadow-lg shadow-[#3C3489]/8 md:mt-0">
                  <Clock3 className="h-4 w-4 text-[#7F77DD]" />
                  {dashboardDateLabel} · Today
                </div>
              </header>

              {isTrialWorkspace ? (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#F2D8A7] bg-[#FAEEDA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black text-[#8A3A0A]">
                    Your free trial ends in {trialDaysRemaining} days
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('choose_plan')}
                    className="rounded-xl bg-[#1C1739] px-4 py-2 text-sm font-black text-white"
                  >
                    Upgrade Now
                  </button>
                </div>
              ) : null}

              {dashboardRole === 'manager' && selectedDemoSection === 'Dashboard' && (
                <section id="manager-demo-brief-section" className="mt-7 overflow-hidden rounded-[28px] border border-[#D7E2F0] bg-[#F8FAFC] shadow-[0_18px_50px_rgba(28,23,57,0.10)]">
                  <div className="grid gap-0 xl:grid-cols-[1.05fr_1.2fr_0.75fr]">
                    <div className="bg-[#151326] p-6 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase text-[#8EF0CD]">
                            <Zap className="h-4 w-4" />
                            Manager Morning Brief
                          </p>
                          <h2 className="mt-4 text-3xl font-black text-white">Today needs 3 manager moves.</h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('NudgeAI brief regenerated for your team.', 'success')}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                          aria-label="Regenerate manager brief"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-6 space-y-3">
                        {[
                          ['Done', 'Landing polish and client deck edits are closed.'],
                          ['At risk', 'CRM access and competitor analysis need manager follow-up.'],
                          ['Next', 'Nudge inactive members before afternoon standup.']
                        ].map(([label, text]) => (
                          <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                            <p className="text-xs font-black uppercase text-white/50">{label}</p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-white/82">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase text-[#64748B]">Team signal graph</p>
                          <h3 className="mt-2 text-2xl font-black text-[#1C1739]">Updates, output, and blockers</h3>
                        </div>
                        <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-black text-[#047857]">Live demo</span>
                      </div>
                      <div className="mt-5 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={managerChartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                            <defs>
                              <linearGradient id="managerUpdates" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3C3489" stopOpacity={0.28} />
                                <stop offset="95%" stopColor="#3C3489" stopOpacity={0.02} />
                              </linearGradient>
                              <linearGradient id="managerCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.26} />
                                <stop offset="95%" stopColor="#1D9E75" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#EEF2F7" vertical={false} />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 800 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} />
                            <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #E2E8F0', fontWeight: 700 }} />
                            <Area type="monotone" dataKey="updates" stroke="#3C3489" strokeWidth={3} fill="url(#managerUpdates)" />
                            <Area type="monotone" dataKey="completed" stroke="#1D9E75" strokeWidth={3} fill="url(#managerCompleted)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {managerStatusMixData.map((item) => (
                          <div key={item.label} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                            <p className="text-xs font-black uppercase text-[#64748B]">{item.label}</p>
                            <p className="mt-2 text-2xl font-black" style={{ color: item.fill }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-6 xl:border-l xl:border-t-0">
                      <p className="text-xs font-black uppercase text-[#64748B]">Action queue</p>
                      <div className="mt-4 space-y-3">
                        {managerPriorityActions.map(([label, value, copy, Icon, color]) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => handleManagerPriorityAction(label)}
                            className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#CBD5E1]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18`, color }}>
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="text-2xl font-black text-[#1C1739]">{value}</span>
                            </div>
                            <p className="mt-3 text-sm font-black text-[#1C1739]">{label}</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">{copy}</p>
                          </button>
                        ))}
                      </div>
                      <div className="mt-5 grid gap-2">
                        <button type="button" onClick={() => setDemoEmployeeSection('Tasks')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1739] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#2D266B]">
                          <Plus className="h-4 w-4" />
                          Assign Task
                        </button>
                        <button type="button" onClick={() => showToast('Manager report export prepared.', 'success')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm font-extrabold text-[#1C1739] transition hover:bg-[#F1F5F9]">
                          <Download className="h-4 w-4" />
                          Export Report
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {shouldShowDemoStatCards && (
                <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {((!isSandbox && isEmployeeDashboard) ? realEmployeeStatCards : isLiveAdminOrHrWorkspace ? liveLeaderStatCards : demoStatCards).map(([title, value, Icon, color, trend, trendType]) => (
                    <article key={title} className="dashboard-metric-card rounded-[22px] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-extrabold text-[#5F5E5A]">{title}</p>
                          <p className="mt-4 text-4xl font-extrabold tracking-tight text-[#1C1739]">{value}</p>
                        </div>
                        <span className="dashboard-orbit-node flex h-11 w-11 items-center justify-center rounded-2xl bg-white" style={{ color }}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      </div>
                      <p className={`mt-4 text-xs font-extrabold ${trendType === 'up' ? 'text-[#1D9E75]' : trendType === 'down' ? 'text-[#EF4444]' : 'text-[#8A8894]'}`}>
                        {trend}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              {isLiveAdminOrHrWorkspace && (
                <section className="mt-6 space-y-6">
                  {activeDashboardSection === 'Dashboard' && (
                    <>
                      {dashboardRole === 'admin' ? (
                        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                          <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#151326_0%,#3C3489_54%,#7F77DD_100%)] p-6 text-white shadow-[0_24px_70px_rgba(28,23,57,0.24)]">
                            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/14 blur-3xl" />
                            <div className="relative">
                              <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/85">
                                <ShieldCheck className="h-4 w-4" />
                                Admin command cockpit
                              </p>
                              <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                                Set up the workspace without demo noise.
                              </h2>
                              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/72">
                                Everything below is powered by real workspace data: invited people, departments, tasks, updates, billing, and reports.
                              </p>
                              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {[
                                  ['People invited', adminUsers.length, UsersRound],
                                  ['Departments', departments.length, Building2],
                                  ['Tasks created', empTasks.length, ListTodo],
                                  ['Updates today', todayUpdatesCount, Activity],
                                ].map(([label, value, Icon]) => (
                                  <div key={label} className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                                    <Icon className="h-5 w-5 text-[#8EF0CD]" />
                                    <p className="mt-3 text-3xl font-black text-white">{value}</p>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/55">{label}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="dashboard-panel rounded-[32px] p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7F77DD]">Launch setup</p>
                                <h2 className="mt-2 text-2xl font-black text-[#1C1739]">Admin checklist</h2>
                              </div>
                              <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-black text-[#3C3489]">
                                {adminSetupChecklist.filter(([, done]) => done).length}/{adminSetupChecklist.length} done
                              </span>
                            </div>
                            <div className="mt-5 space-y-3">
                              {adminSetupChecklist.map(([label, done, helper]) => (
                                <div key={label} className="flex items-start gap-3 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#E8F7F1] text-[#1D9E75]' : 'bg-[#FFF7ED] text-[#F59E0B]'}`}>
                                    {done ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                                  </span>
                                  <div>
                                    <p className="text-sm font-black text-[#2C2C2A]">{label}</p>
                                    <p className="mt-1 text-xs font-semibold leading-5 text-[#6E6B78]">{helper}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
                      ) : (
                        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                          <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#24130A_0%,#8A3A0A_58%,#F59E0B_120%)] p-6 text-white shadow-[0_24px_70px_rgba(138,58,10,0.18)]">
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/85">
                              <ShieldCheck className="h-4 w-4" />
                              HR people cockpit
                            </p>
                            <h2 className="mt-5 max-w-xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                              Understand people health without fake activity.
                            </h2>
                            <p className="mt-3 text-sm font-semibold leading-6 text-white/72">
                              HR sees real check-ins, energy signals, update quality, and team rhythm. New workspaces stay intentionally empty.
                            </p>
                          </div>

                          <div className="dashboard-panel rounded-[32px] p-5">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F59E0B]">People signals</p>
                            <h2 className="mt-2 text-2xl font-black text-[#1C1739]">Today’s HR snapshot</h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              {hrPeopleSignals.map(([label, value, helper]) => (
                                <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8A8894]">{label}</p>
                                  <p className="mt-2 text-3xl font-black text-[#1C1739]">{value}</p>
                                  <p className="mt-2 text-xs font-semibold leading-5 text-[#6E6B78]">{helper}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
                      )}

                      <section className="rounded-[28px] border border-[#DAD7FB] bg-[linear-gradient(135deg,#F4F3FF_0%,#FFFFFF_58%,#EEF4FF_100%)] p-5 shadow-[0_18px_50px_rgba(60,52,137,0.10)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#7F77DD]">
                              <Zap className="h-4 w-4" />
                              NudgeAI Morning Brief
                            </p>
                            <h2 className="mt-3 text-2xl font-black text-[#1C1739]">Start with what needs attention.</h2>
                            <p className="mt-2 text-sm font-semibold text-[#6E6B78]">Generated at 9:00 AM when team data is available.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => runNudgeAiFeature('standup', true)}
                            disabled={nudgeAiLoading.standup}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1739] px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                          >
                            <RefreshCw className={`h-4 w-4 ${nudgeAiLoading.standup ? 'animate-spin' : ''}`} />
                            {nudgeAiData.standup ? 'Regenerate' : "Generate Today's Brief"}
                          </button>
                        </div>
                        <div className="mt-5 rounded-2xl border border-white/80 bg-white/80 p-4">
                          {nudgeAiData.standup?.brief ? (
                            <p className="text-sm font-semibold leading-6 text-[#2C2C2A]">{nudgeAiData.standup.brief}</p>
                          ) : (
                            <p className="text-sm font-semibold leading-6 text-[#6E6B78]">No brief generated yet. Generate it after employees start adding real updates, tasks, and blockers.</p>
                          )}
                        </div>
                      </section>

                      {empTasks.some((task) => normalizeTaskStatus(task.status) === 'blocked') ? (
                        <section className="rounded-2xl border border-rose-100 border-l-[3px] border-l-[#EF4444] bg-[#FFF5F5] p-5">
                          <h2 className="text-lg font-black text-[#B91C1C]">Active Blockers</h2>
                          <div className="mt-4 space-y-3">
                            {empTasks.filter((task) => normalizeTaskStatus(task.status) === 'blocked').map((task) => (
                              <div key={task.id || task.title} className="grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-black text-rose-600">
                                    {(task.assignee?.name || 'TM').split(' ').map((part) => part[0]).join('').slice(0, 2)}
                                  </span>
                                  <p className="text-sm font-black text-[#2C2C2A]">{task.assignee?.name || 'Team member'}</p>
                                </div>
                                <p className="text-sm font-bold text-[#2C2C2A]">{task.title || 'Blocked task'}</p>
                                <button type="button" onClick={() => updateTaskStatusApi(task.id, 'in_progress', null)} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-black text-white">
                                  Resolve
                                </button>
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <section className="dashboard-panel rounded-[28px] p-5">
                          <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-black text-[#2C2C2A]">Team Progress</h2>
                            <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-black text-[#3C3489]">{dashboardRoleLabel}</span>
                          </div>
                          <div className="mt-5 space-y-3">
                            {empTasks.length ? empTasks.slice(0, 6).map((task) => {
                              const progress = realEmployeeProgressForStatus(task.status);
                              const color = realEmployeeColorForStatus(task.status);
                              return (
                                <div key={task.id || task.title} className="grid gap-3 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 sm:grid-cols-[1fr_0.8fr_auto] sm:items-center">
                                  <div>
                                    <p className="text-sm font-black text-[#2C2C2A]">{task.assignee?.name || 'Unassigned'}</p>
                                    <p className="mt-1 text-xs font-semibold text-[#8A8894]">{task.title || 'Untitled task'}</p>
                                  </div>
                                  <div className="h-2.5 overflow-hidden rounded-full bg-[#EEEFF5]">
                                    <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
                                  </div>
                                  <span className={`rounded-full px-3 py-1 text-xs font-black ${realEmployeeStatusClass(task.status)}`}>{realEmployeeStatusLabel(task.status)}</span>
                                </div>
                              );
                            }) : renderEmptyState({
                              title: 'No live tasks yet',
                              sub: 'Create the first real task from the Tasks page. This dashboard will stay empty until real work exists.',
                              Icon: ListTodo,
                              actionLabel: 'Create task',
                              onAction: () => setDemoEmployeeSection('Tasks')
                            })}
                          </div>
                        </section>

                        <section className="dashboard-panel rounded-[28px] p-5">
                          <h2 className="text-xl font-black text-[#2C2C2A]">Recent Activity</h2>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {['All', 'Updates', 'Blockers', 'Overdue'].map((tab) => (
                              <span key={tab} className="rounded-full border border-[#DAD7FB] bg-white px-3 py-1 text-[11px] font-black text-[#3C3489]">{tab}</span>
                            ))}
                          </div>
                          <div className="mt-5 space-y-3">
                            {allUpdates.length ? allUpdates.slice(0, 5).map((update) => (
                              <div key={update.id || update.created_at} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                                <p className="text-sm font-black text-[#2C2C2A]">{update.user?.name || 'Team member'} submitted an update</p>
                                <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[#6E6B78]">{update.progress_text || 'Progress update received.'}</p>
                              </div>
                            )) : renderEmptyState({
                              title: 'No activity yet',
                              sub: 'Real updates, blockers, and task changes will appear here after your team starts using NudgeHQ.',
                              Icon: Activity
                            })}
                          </div>
                        </section>
                      </div>

                      <section className="dashboard-panel rounded-[28px] p-5">
                        <h2 className="text-xl font-black text-[#2C2C2A]">Department Stats</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                          {departments.length ? departments.map((dept) => {
                            const employeeCount = adminUsers.filter((item) => item.department_id === dept.id || item.departments?.id === dept.id || item.departments?.name === dept.name).length;
                            const completion = employeeCount ? leaderCompletionRate : 0;
                            const barColor = completion > 70 ? '#1D9E75' : completion >= 50 ? '#F59E0B' : '#EF4444';
                            return (
                              <div key={dept.id || dept.name} className="rounded-2xl border border-[#EEEDFE] bg-white p-4">
                                <p className="text-sm font-black text-[#2C2C2A]">{dept.name}</p>
                                <p className="mt-1 text-xs font-semibold text-[#8A8894]">{employeeCount} employees</p>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEEFF5]">
                                  <div className="h-full rounded-full" style={{ width: `${completion}%`, backgroundColor: barColor }} />
                                </div>
                                <p className="mt-2 text-xs font-black" style={{ color: barColor }}>{completion}% completion</p>
                              </div>
                            );
                          }) : renderEmptyState({
                            title: 'No departments yet',
                            sub: 'Create departments from People so Admin and HR can read clean team-level signals.',
                            Icon: Building2,
                            actionLabel: 'Open People',
                            onAction: () => setDemoEmployeeSection('People')
                          })}
                        </div>
                      </section>
                    </>
                  )}

                  {activeDashboardSection === 'People' && (
                    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                      <div className="dashboard-panel rounded-[28px] p-5">
                        <h2 className="text-2xl font-black text-[#2C2C2A]">People Directory</h2>
                        <p className="mt-2 text-sm font-semibold text-[#6E6B78]">Real employees invited to this workspace appear here.</p>
                        <div className="mt-5 space-y-3">
                          {adminUsers.length ? adminUsers.map((member) => (
                            <div key={member.id || member.email} className="flex items-center justify-between gap-3 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3C3489] text-sm font-black text-white">
                                  {(member.name || member.email || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black text-[#2C2C2A]">{member.name || 'Unnamed employee'}</p>
                                  <p className="truncate text-xs font-semibold text-[#8A8894]">{member.email}</p>
                                </div>
                              </div>
                              <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-black capitalize text-[#3C3489]">{member.role || 'employee'}</span>
                            </div>
                          )) : renderEmptyState({
                            title: 'No employees invited yet',
                            sub: 'Invite real employees here. Demo names will not be shown in the original workspace.',
                            Icon: UsersRound
                          })}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <form onSubmit={handleInviteEmployee} className="dashboard-panel rounded-[28px] p-5">
                          <h2 className="text-xl font-black text-[#2C2C2A]">Invite employee</h2>
                          <div className="mt-4 grid gap-3">
                            <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Employee name" className="rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" required />
                            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Work email" type="email" className="rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" required />
                            <input value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} placeholder="Phone number optional" className="rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" />
                            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]">
                              {['employee', 'manager', 'hr', 'admin'].map((role) => <option key={role} value={role}>{role}</option>)}
                            </select>
                            <button disabled={inviteLoading} className="rounded-2xl bg-[#1C1739] px-4 py-3 text-sm font-black text-white disabled:opacity-60">{inviteLoading ? 'Sending invite...' : 'Send invite'}</button>
                          </div>
                          {inviteResult ? <p className="mt-3 rounded-xl bg-[#E8F7F1] p-3 text-xs font-bold text-[#1D9E75]">Invite ready for {inviteResult.email}</p> : null}
                        </form>

                        <form onSubmit={handleCreateDepartment} className="dashboard-panel rounded-[28px] p-5">
                          <h2 className="text-xl font-black text-[#2C2C2A]">Create department</h2>
                          <div className="mt-4 grid gap-3">
                            <input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Department name" className="rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" required />
                            <textarea value={newDeptDesc} onChange={(e) => setNewDeptDesc(e.target.value)} placeholder="Department description" className="min-h-24 rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" />
                            <button className="rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-black text-[#3C3489]">Create department</button>
                          </div>
                        </form>
                      </div>
                    </section>
                  )}

                  {activeDashboardSection === 'Tasks' && (
                    <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                      <div className="dashboard-panel rounded-[28px] p-5">
                        <h2 className="text-2xl font-black text-[#2C2C2A]">Tasks</h2>
                        <div className="mt-5 space-y-3">
                          {empTasks.length ? empTasks.map((task) => (
                            <div key={task.id || task.title} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-black text-[#2C2C2A]">{task.title || 'Untitled task'}</p>
                                  <p className="mt-1 text-xs font-semibold text-[#8A8894]">{task.assignee?.name || 'Unassigned'}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-black ${realEmployeeStatusClass(task.status)}`}>{realEmployeeStatusLabel(task.status)}</span>
                              </div>
                            </div>
                          )) : renderEmptyState({
                            title: 'No tasks created yet',
                            sub: 'Create a real task from the form. We are not showing demo task data in original dashboards.',
                            Icon: ListTodo
                          })}
                        </div>
                      </div>
                      <form onSubmit={handleCreateTask} className="dashboard-panel rounded-[28px] p-5">
                        <h2 className="text-xl font-black text-[#2C2C2A]">Create task</h2>
                        <div className="mt-4 grid gap-3">
                          <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Task title" className="rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" required />
                          <textarea value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder="Task description" className="min-h-24 rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" />
                          <select value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)} className="rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]">
                            <option value="">Unassigned</option>
                            {adminUsers.map((member) => <option key={member.id} value={member.id}>{member.name || member.email}</option>)}
                          </select>
                          <button className="rounded-2xl bg-[#1C1739] px-4 py-3 text-sm font-black text-white">Create task</button>
                        </div>
                      </form>
                    </section>
                  )}

                  {activeDashboardSection === 'NudgeSpace' && (
                    <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                      <div className="dashboard-panel rounded-[28px] p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-2xl font-black text-[#2C2C2A]">NudgeSpace</h2>
                            <p className="mt-2 text-sm font-semibold text-[#6E6B78]">
                              Social is for workspace posts. U Space is your private todo and focus board.
                            </p>
                          </div>
                          <div className="flex rounded-full border border-[#DAD7FB] bg-white p-1">
                            {['Social', 'U Space'].map((view) => (
                              <button
                                key={view}
                                type="button"
                                onClick={() => handleNudgeSpaceViewChange(view)}
                                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                                  demoNudgeSpaceView === view ? 'bg-[#1C1739] text-white shadow-sm' : 'text-[#6E6B78] hover:text-[#1C1739]'
                                }`}
                              >
                                {view}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-5 rounded-2xl border border-[#DAD7FB] bg-[#FCFCFF] p-4">
                          <textarea
                            value={nudgeSpaceDraft}
                            onChange={(e) => setNudgeSpaceDraft(e.target.value)}
                            placeholder={demoNudgeSpaceView === 'U Space' ? 'Add a private goal, reminder, or focus note...' : 'Write a real announcement, win, question, or idea...'}
                            className="min-h-28 w-full resize-none rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                          />
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <select value={nudgeSpacePostType} onChange={(e) => setNudgeSpacePostType(e.target.value)} className="rounded-xl border border-[#DAD7FB] bg-white px-3 py-2 text-xs font-bold text-[#3C3489]">
                              {(demoNudgeSpaceView === 'U Space' ? ['goal', 'reminder', 'focus'] : ['status', 'announcement', 'win', 'question', 'idea']).map((type) => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <button type="button" onClick={submitNudgeSpacePost} disabled={nudgeSpaceSaving} className="rounded-xl bg-[#1D9E75] px-4 py-2 text-sm font-black text-white disabled:opacity-60">
                              {nudgeSpaceSaving ? 'Saving...' : demoNudgeSpaceView === 'U Space' ? 'Save to U Space' : 'Post to Social'}
                            </button>
                          </div>
                        </div>
                        <div className="mt-5">
                          {renderNudgeSpacePostList({
                            emptyTitle: demoNudgeSpaceView === 'U Space' ? 'No private U Space items yet' : 'No real Social posts yet',
                            emptySub: demoNudgeSpaceView === 'U Space'
                              ? 'Private goals, reminders, and focus notes you save will appear here.'
                              : 'Posts will appear only after someone in this workspace publishes them.',
                            emptyIcon: demoNudgeSpaceView === 'U Space' ? ListTodo : MessageSquareText
                          })}
                        </div>
                      </div>
                      <div className="dashboard-panel rounded-[28px] p-5">
                        <h2 className="text-xl font-black text-[#2C2C2A]">{demoNudgeSpaceView === 'U Space' ? 'Private U Space' : 'Social rules'}</h2>
                        <div className="mt-4 space-y-3">
                          {(demoNudgeSpaceView === 'U Space'
                            ? [
                                ['Visibility', 'Only you can see private U Space posts.'],
                                ['Best for', 'Goals, reminders, focus notes, and personal todo planning.'],
                                ['Storage', 'Saved to the live workspace backend, not demo data.'],
                              ]
                            : [
                                ['Visibility', dashboardRole === 'manager' ? 'Scoped to your department.' : 'Visible to the workspace audience for your role.'],
                                ['Best for', 'Announcements, wins, questions, blockers, and ideas.'],
                                ['Storage', 'Only real posts from this organization appear here.'],
                              ]).map(([label, copy]) => (
                              <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8A8894]">{label}</p>
                                <p className="mt-2 text-sm font-bold leading-5 text-[#2C2C2A]">{copy}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {activeDashboardSection === 'Reports' && (
                    <section className="dashboard-panel rounded-[28px] p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-[#2C2C2A]">Reports</h2>
                          <p className="mt-2 text-sm font-semibold text-[#6E6B78]">Generate reports from real workspace activity only.</p>
                        </div>
                        <button type="button" onClick={generateBoardPack} disabled={boardPackLoading} className="rounded-xl bg-[#1C1739] px-4 py-3 text-sm font-black text-white disabled:opacity-60">
                          {boardPackLoading ? 'Generating...' : 'Generate Board Pack PDF'}
                        </button>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {[
                          ['Updates today', todayUpdatesCount],
                          ['Tasks tracked', empTasks.length],
                          ['People invited', adminUsers.length],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8A8894]">{label}</p>
                            <p className="mt-2 text-3xl font-black text-[#1C1739]">{value}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeDashboardSection === 'Billing' && dashboardRole === 'admin' && (
                    <section className="dashboard-panel rounded-[28px] p-5">
                      <h2 className="text-2xl font-black text-[#2C2C2A]">Billing</h2>
                      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8A8894]">Current plan</p>
                          <p className="mt-2 text-3xl font-black capitalize text-[#1C1739]">{user?.organizations?.plan || 'free_trial'}</p>
                          {user?.organizations?.plan === 'free_trial' ? <p className="mt-2 text-sm font-bold text-[#8A3A0A]">Trial active. Upgrade when ready.</p> : null}
                          <button type="button" onClick={() => setCurrentView('choose_plan')} className="mt-5 rounded-xl bg-[#1C1739] px-4 py-3 text-sm font-black text-white">Upgrade Plan</button>
                        </div>
                        <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-white p-5">
                          <p className="text-sm font-black text-[#2C2C2A]">Payment history</p>
                          <p className="mt-2 text-sm font-semibold text-[#8A8894]">No payments yet. Successful Razorpay payments will be listed here for this workspace.</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeDashboardSection === 'Projects' && (
                    <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
                      <section className="dashboard-panel rounded-[28px] p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7F77DD]">Workspace projects</p>
                            <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Track projects from one clean board.</h2>
                            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                              {dashboardRole === 'admin'
                                ? 'Admins can create and edit company-wide projects from here.'
                                : 'HR can track people-ops projects and internal rollout work from here.'}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">
                            {managerProjects.length} live projects
                          </span>
                        </div>

                        <div className="mt-5 space-y-4">
                          {managerProjects.length ? managerProjects.map((project) => (
                            <article key={project.id} className="rounded-[24px] border border-[#EEEDFE] bg-[#FCFCFF] p-4 shadow-sm">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-[#1C1739] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">
                                      {project.priority} priority
                                    </span>
                                    <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                                      project.status === 'Done' ? 'bg-[#E8F7F1] text-[#1D9E75]' :
                                      project.status === 'Blocked' ? 'bg-rose-50 text-rose-600' :
                                      project.status === 'Review' ? 'bg-amber-50 text-amber-700' :
                                      'bg-[#EEEDFE] text-[#3C3489]'
                                    }`}>
                                      {project.status}
                                    </span>
                                  </div>
                                  <h3 className="mt-3 text-xl font-black text-[#2C2C2A]">{project.name}</h3>
                                  <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{project.summary}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditManagerProject(project)}
                                    className="rounded-xl border border-[#DAD7FB] bg-white px-4 py-2 text-xs font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteManagerProject(project.id)}
                                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-[#EEEDFE]">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8894]">Owner</p>
                                      <p className="mt-1 text-sm font-black text-[#2C2C2A]">{project.owner}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8894]">Due</p>
                                      <p className="mt-1 text-sm font-black text-[#2C2C2A]">{project.due}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-[#EEEDFE]">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8894]">Progress</p>
                                    <p className="text-sm font-black text-[#3C3489]">{project.progress}%</p>
                                  </div>
                                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#EEEFF5]">
                                    <div className={`h-full rounded-full ${
                                      project.status === 'Blocked' ? 'bg-[#EF4444]' :
                                      project.status === 'Done' ? 'bg-[#1D9E75]' :
                                      'bg-[#7F77DD]'
                                    }`} style={{ width: `${project.progress}%` }} />
                                  </div>
                                </div>
                              </div>
                            </article>
                          )) : renderEmptyState({
                            title: 'No projects yet',
                            sub: `${dashboardRoleLabel} workspace is ready for real projects only. Create the first one from the editor panel.`,
                            Icon: Building2
                          })}
                        </div>
                      </section>

                      <section className="dashboard-panel rounded-[28px] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">
                              {editingManagerProjectId ? 'Edit project' : 'New project'}
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">
                              {editingManagerProjectId ? `Update ${projectEditorRoleLabel} project` : `Create a ${projectEditorRoleLabel} project`}
                            </h2>
                          </div>
                          <Building2 className="h-6 w-6 text-[#1D9E75]" />
                        </div>

                        <form onSubmit={handleSaveManagerProject} className="mt-5 space-y-3">
                          <input
                            type="text"
                            placeholder="Project name *"
                            value={managerProjectDraft.name}
                            onChange={(e) => handleManagerProjectDraftChange('name', e.target.value)}
                            className="block w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                            required
                          />
                          <textarea
                            placeholder="Short project summary"
                            value={managerProjectDraft.summary}
                            onChange={(e) => handleManagerProjectDraftChange('summary', e.target.value)}
                            className="block min-h-24 w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              type="text"
                              placeholder="Owner"
                              value={managerProjectDraft.owner}
                              onChange={(e) => handleManagerProjectDraftChange('owner', e.target.value)}
                              className="block w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                            />
                            <input
                              type="text"
                              placeholder="Due date"
                              value={managerProjectDraft.due}
                              onChange={(e) => handleManagerProjectDraftChange('due', e.target.value)}
                              className="block w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <select
                              value={managerProjectDraft.status}
                              onChange={(e) => handleManagerProjectDraftChange('status', e.target.value)}
                              className="block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                            >
                              {['Planned', 'In Progress', 'Review', 'Done', 'Blocked'].map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <select
                              value={managerProjectDraft.priority}
                              onChange={(e) => handleManagerProjectDraftChange('priority', e.target.value)}
                              className="block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                            >
                              {['Low', 'Medium', 'High'].map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <div className="rounded-2xl border border-[#DAD7FB] bg-[#FCFCFF] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8894]">Progress</p>
                              <span className="text-sm font-black text-[#3C3489]">{managerProjectDraft.progress}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={managerProjectDraft.progress}
                              onChange={(e) => handleManagerProjectDraftChange('progress', e.target.value)}
                              className="mt-3 w-full accent-[#7F77DD]"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button type="submit" className="flex-1 rounded-2xl bg-[#1C1739] px-4 py-3 text-sm font-black text-white">
                              {editingManagerProjectId ? 'Save changes' : 'Create project'}
                            </button>
                            <button type="button" onClick={resetManagerProjectDraft} className="rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-black text-[#3C3489]">
                              Clear
                            </button>
                          </div>
                        </form>
                      </section>
                    </section>
                  )}

                  {activeDashboardSection === 'NudgeAI' && (
                    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                      <div className="rounded-[28px] bg-[#151326] p-6 text-white">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8EF0CD]">NudgeAI desk</p>
                        <h2 className="mt-3 text-3xl font-black">AI copilots for real team signals.</h2>
                        <p className="mt-3 text-sm font-semibold leading-6 text-white/70">Generate summaries only from the live workspace. No demo snippets here.</p>
                        <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/55">What this should feel like</p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-white/80">
                            Clean outputs, readable briefs, and next actions your team can use immediately without reading raw JSON.
                          </p>
                        </div>
                      </div>
                      <div className="dashboard-panel rounded-[28px] p-5">
                        <h2 className="text-xl font-black text-[#2C2C2A]">Run AI actions</h2>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {[
                            ['standup', 'Morning brief'],
                            ['forecast', 'Sprint forecast'],
                            ['appreciation', 'Appreciation draft'],
                            ['skillGap', 'Skill gaps'],
                          ].map(([type, label]) => (
                            <button key={type} type="button" onClick={() => runNudgeAiFeature(type, true)} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-left text-sm font-black text-[#1C1739] hover:border-[#7F77DD]">
                              {nudgeAiLoading[type] ? 'Generating...' : label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-5 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <p className="text-sm font-black text-[#2C2C2A]">Readable AI result</p>
                          <div className="mt-3">
                            {renderLatestAiResult(latestAiResult)}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeDashboardSection === 'Integrations' && (
                    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                      <div className="dashboard-panel rounded-[28px] p-5">
                        <h2 className="text-2xl font-black text-[#2C2C2A]">Integrations</h2>
                        <p className="mt-2 text-sm font-semibold text-[#6E6B78]">Track what is available now and request the next tools your team needs.</p>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                          {[
                            ['WhatsApp nudges', 'V2 build phase', 'Templates and manager nudges are planned for the next communication release.'],
                            ['HRMS tools', 'Custom pack', 'Attendance, timetable, leave, payroll, and HR workflows can be requested here.'],
                            ['Razorpay', 'Connected', 'Checkout and trial activation use the live billing flow.'],
                          ].map(([title, status, copy]) => (
                            <div key={title} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-black text-[#2C2C2A]">{title}</p>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#3C3489]">{status}</span>
                              </div>
                              <p className="mt-2 text-xs font-semibold leading-5 text-[#6E6B78]">{copy}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 rounded-2xl border border-[#EEEDFE] bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-[#2C2C2A]">Saved requests</p>
                            <span className="rounded-full bg-[#F6F4FF] px-3 py-1 text-xs font-black text-[#3C3489]">{integrationRequests.length}</span>
                          </div>
                          <div className="mt-3 space-y-3">
                            {integrationRequests.length ? integrationRequests.slice(0, 5).map((request) => (
                              <article key={request.id} className="rounded-2xl border border-[#F0ECFF] bg-[#FCFCFF] p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-black text-[#1C1739]">{request.title}</p>
                                  <span className="rounded-full bg-[#E8F7F1] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#1D9E75]">{request.status}</span>
                                </div>
                                <p className="mt-1 text-xs font-semibold leading-5 text-[#6E6B78]">{request.details}</p>
                              </article>
                            )) : (
                              <p className="rounded-2xl border border-dashed border-[#DAD7FB] p-4 text-sm font-semibold text-[#8A8894]">
                                No integration requests yet. Add one from the form and it will stay saved on this device.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleIntegrationRequestSubmit} className="dashboard-panel rounded-[28px] p-5">
                        <h2 className="text-xl font-black text-[#2C2C2A]">Request an integration</h2>
                        <p className="mt-2 text-sm font-semibold text-[#6E6B78]">Tell us what your team wants next and we will review it for the roadmap.</p>
                        <div className="mt-5 grid gap-3">
                          <input
                            value={integrationRequestTitle}
                            onChange={(e) => setIntegrationRequestTitle(e.target.value)}
                            placeholder="Integration name e.g. Slack, Zoho HRMS, Attendance tool"
                            className="rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                          />
                          <textarea
                            value={integrationRequestDetails}
                            onChange={(e) => setIntegrationRequestDetails(e.target.value)}
                            placeholder="What should it do for your team?"
                            className="min-h-28 rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                          />
                          <button className="rounded-2xl bg-[#1C1739] px-4 py-3 text-sm font-black text-white">
                            Save request
                          </button>
                        </div>
                      </form>
                    </section>
                  )}

                  {activeDashboardSection === 'Settings' && (
                    <section className="dashboard-panel rounded-[28px] p-5">
                      <h2 className="text-2xl font-black text-[#2C2C2A]">Settings</h2>
                      <p className="mt-2 text-sm font-semibold text-[#6E6B78]">Basic profile settings for the original workspace.</p>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8A8894]">Name</span>
                          <input value={user?.name || ''} onChange={(e) => setUser((current) => ({ ...(current || {}), name: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8A8894]">Email</span>
                          <input value={user?.email || ''} onChange={(e) => setUser((current) => ({ ...(current || {}), email: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" />
                        </label>
                      </div>
                      <button type="button" onClick={handleLogout} className="mt-5 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-black text-rose-600">Logout</button>
                    </section>
                  )}
                </section>
              )}

              {dashboardRole === 'manager' && selectedDemoSection === 'Dashboard' && managerActiveBlockers.length > 0 && (
                <section id="manager-demo-blockers-section" className="mt-6 rounded-2xl border border-rose-100 border-l-[3px] border-l-[#EF4444] bg-[#FFF5F5] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <h2 className="text-lg font-black text-[#B91C1C]">Active Blockers — Needs Attention</h2>
                  <div className="mt-4 space-y-3">
                    {managerActiveBlockers.map((blocker) => (
                      <div key={blocker.id} className="grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-[minmax(11rem,1fr)_minmax(10rem,1fr)_9rem_auto] sm:items-center">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-black text-rose-600">
                            {(blocker.assignee?.name || 'TM').split(' ').map((part) => part[0]).join('').slice(0, 2)}
                          </span>
                          <div>
                            <p className="text-sm font-black text-[#2C2C2A]">{blocker.assignee?.name || 'Team member'}</p>
                            <p className="text-xs font-bold text-[#8A8894]">Team member</p>
                          </div>
                        </div>
                        <p className="text-sm font-extrabold text-[#2C2C2A]">{blocker.title}</p>
                        <p className="text-xs font-black text-rose-600">{blocker.blockedAgo}</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => updateTaskStatusApi(blocker.id, 'in_progress', null)} className="rounded-lg bg-[#1D9E75] px-3 py-2 text-xs font-black text-white">
                            Resolve
                          </button>
                          <button type="button" onClick={() => { window.location.href = `mailto:${blocker.assignee?.email || 'hello.nudgehq@gmail.com'}?subject=NudgeHQ blocker follow-up`; }} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-black text-rose-600">
                            Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {((dashboardRole === 'employee' && selectedDemoSection === 'My Dashboard') || (dashboardRole === 'manager' && selectedDemoSection === 'Dashboard')) && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-extrabold text-[#2C2C2A]">{dashboardRole === 'employee' ? 'My Tasks' : 'Team Progress'}</h2>
                      <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">
                        {dashboardRoleLabel}
                      </span>
                    </div>
                    <div className="mt-5 space-y-4">
                            {dashboardRole === 'employee' && !employeeDashboardTaskRows.length ? renderEmptyState({
                        title: 'No tasks assigned yet',
                        sub: 'Your manager will assign tasks soon. Check back here!',
                        Icon: ListTodo
                      }) : null}
                      {(dashboardRole === 'employee' ? employeeDashboardTaskRows : dashboardRole === 'manager' ? managerProgressRows : demoProgressRows).map(([name, task, progress, status, color, lastUpdate, updateTone], index) => (
                        <button
                          key={`${name}-${task}`}
                          type="button"
                          onClick={() => {
                            if (dashboardRole === 'employee') openDemoTask([name, task, progress, status, color]);
                          }}
                          className={`grid w-full gap-3 rounded-xl border border-[#F0EFFA] bg-[#FCFCFF] p-3 text-left transition hover:border-[#7F77DD] hover:bg-[#F7F6FF] ${dashboardRole === 'manager' ? 'sm:grid-cols-[minmax(10rem,1fr)_minmax(8rem,0.7fr)_4rem_7rem_7rem]' : 'sm:grid-cols-[minmax(10rem,1fr)_minmax(9rem,0.7fr)_4rem_7rem]'} sm:items-center`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ backgroundColor: ['#7F77DD', '#1D9E75', '#3C3489', '#F59E0B', '#EF4444'][index % 5] }}>
                              {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-[#2C2C2A]">{name}</p>
                              <p className="truncate text-xs font-semibold text-[#8A8894]">{task}</p>
                            </div>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-[#EEEFF5]">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: color }} />
                          </div>
                          <p className="text-sm font-extrabold text-[#2C2C2A]">{progress}%</p>
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${
                            status === 'Completed' ? 'bg-[#E8F7F1] text-[#1D9E75]' :
                            status === 'Overdue' || status === 'Blocked' ? 'bg-rose-50 text-rose-600' :
                            'bg-[#EEEDFE] text-[#3C3489]'
                          }`}>
                            {status}
                          </span>
                          {dashboardRole === 'manager' ? (
                            <span className={`text-xs font-extrabold ${getManagerLastUpdateClass(updateTone)}`}>
                              {lastUpdate}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setDemoEmployeeSection(dashboardRole === 'manager' ? 'Tasks' : 'My Tasks')} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#DAD7FB] px-4 py-2 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                      View all tasks
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </section>

                  <section className="dashboard-panel rounded-[28px] p-5">
                    <h2 className="text-xl font-extrabold text-[#2C2C2A]">
                      {dashboardRole === 'employee' ? "Today's Check-in" : 'Recent Activity'}
                    </h2>
                    {dashboardRole === 'employee' ? (
                      <div className="mt-5 space-y-5">
                        <div className="rounded-xl border border-[#DAD7FB] bg-[#F7F6FF] p-5">
                          <p className="text-sm font-extrabold text-[#3C3489]">Submit today's update</p>
                          <p className="mt-2 text-sm leading-6 text-[#5F5E5A]">Share progress, blocker status, and your main focus in under a minute.</p>
                          <button type="button" onClick={() => setDemoEmployeeSection('Check-in')} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#7F77DD] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#3C3489]">
                            Open check-in
                          </button>
                          <div className="mt-4 rounded-xl bg-white p-4 text-xs font-semibold leading-6 text-[#5F5E5A]">
                            <span className="font-extrabold text-[#3C3489]">NudgeAI tip:</span> Mention what changed, where it lives, and what is blocked.
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#EEEDFE] bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base font-extrabold text-[#2C2C2A]">Recent Activity</h3>
                            <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-[11px] font-extrabold text-[#3C3489]">Last 4</span>
                          </div>
                          <div className="mt-4 space-y-3">
                            {employeeDashboardActivityRows.length ? employeeDashboardActivityRows.map(([action, detail, time, Icon, color]) => (
                              <div key={`${action}-${detail}`} className="flex items-start gap-3 rounded-xl bg-[#FCFCFF] p-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}16`, color }}>
                                  <Icon className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-extrabold text-[#2C2C2A]">{action}</p>
                                  <p className="truncate text-xs font-semibold text-[#8A8894]">{detail}</p>
                                </div>
                                <span className="shrink-0 text-xs font-bold text-[#8A8894]">{time}</span>
                              </div>
                            )) : (
                              <p className="rounded-xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-4 text-center text-sm font-semibold text-[#8A8894]">
                                No activity yet — submit your first check-in to get started!
                              </p>
                            )}
                          </div>
                          <button type="button" onClick={() => setDemoEmployeeSection('My Progress')} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#DAD7FB] px-4 py-2 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                            View all activity
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {(dashboardRole === 'manager' ? managerActivityRows : demoActivityRows).map(([action, task, time, Icon, color, preview]) => {
                          const activityKey = `${action}-${task}`;
                          const isDeadlineMissed = action.includes('Karan missed');
                          const isExpanded = expandedManagerActivity === activityKey;
                          return (
                          <button
                            key={activityKey}
                            type="button"
                            onClick={() => {
                              if (dashboardRole === 'manager') setExpandedManagerActivity(isExpanded ? null : activityKey);
                            }}
                            className={`w-full rounded-xl p-3 text-left transition hover:bg-[#FCFCFF] ${isDeadlineMissed ? 'border-l-4 border-rose-500 bg-rose-50 text-rose-600' : ''}`}
                          >
                          <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}16`, color }}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-extrabold ${isDeadlineMissed ? 'text-rose-600' : 'text-[#2C2C2A]'}`}>{action}</p>
                              <p className="text-xs font-semibold text-[#8A8894]">{task}</p>
                            </div>
                            <span className="text-xs font-bold text-[#8A8894]">{time}</span>
                          </div>
                          {dashboardRole === 'manager' && isExpanded ? (
                            <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold leading-5 text-[#5F5E5A]">{preview}</p>
                          ) : null}
                          </button>
                        )})}
                        <button type="button" onClick={() => {
                          if (dashboardRole === 'manager') {
                            window.history.pushState({}, '', '/manager/activity');
                            setDemoEmployeeSection('Activity');
                          }
                        }} className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#DAD7FB] px-4 py-2 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                          View all activity
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {dashboardRole === 'manager' && selectedDemoSection === 'Projects' && (
                <section className="mt-6 grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7F77DD]">Manager projects</p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Edit delivery projects from one clean board.</h2>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                          Track owners, progress, due dates, and risk level without leaving the manager workspace.
                        </p>
                      </div>
                      <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">
                        {managerProjects.length} live projects
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">
                      {managerProjects.length ? managerProjects.map((project) => (
                        <article key={project.id} className="rounded-[24px] border border-[#EEEDFE] bg-[#FCFCFF] p-4 shadow-sm">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#1C1739] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">
                                  {project.priority} priority
                                </span>
                                <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                                  project.status === 'Done' ? 'bg-[#E8F7F1] text-[#1D9E75]' :
                                  project.status === 'Blocked' ? 'bg-rose-50 text-rose-600' :
                                  project.status === 'Review' ? 'bg-amber-50 text-amber-700' :
                                  'bg-[#EEEDFE] text-[#3C3489]'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                              <h3 className="mt-3 text-xl font-black text-[#2C2C2A]">{project.name}</h3>
                              <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{project.summary}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditManagerProject(project)}
                                className="rounded-xl border border-[#DAD7FB] bg-white px-4 py-2 text-xs font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteManagerProject(project.id)}
                                className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
                            <div className="rounded-2xl bg-white p-4 ring-1 ring-[#EEEDFE]">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8894]">Owner</p>
                                  <p className="mt-1 text-sm font-black text-[#2C2C2A]">{project.owner}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8894]">Due</p>
                                  <p className="mt-1 text-sm font-black text-[#2C2C2A]">{project.due}</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 ring-1 ring-[#EEEDFE]">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8894]">Progress</p>
                                <p className="text-sm font-black text-[#3C3489]">{project.progress}%</p>
                              </div>
                              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#EEEFF5]">
                                <div className={`h-full rounded-full ${
                                  project.status === 'Blocked' ? 'bg-[#EF4444]' :
                                  project.status === 'Done' ? 'bg-[#1D9E75]' :
                                  'bg-[#7F77DD]'
                                }`} style={{ width: `${project.progress}%` }} />
                              </div>
                            </div>
                          </div>
                        </article>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-6 text-center">
                          <Building2 className="mx-auto h-8 w-8 text-[#7F77DD]" />
                          <p className="mt-3 text-sm font-black text-[#2C2C2A]">No projects yet</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">Create your first manager project from the editor panel.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">
                          {editingManagerProjectId ? 'Edit project' : 'New project'}
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">
                          {editingManagerProjectId ? 'Update manager project' : 'Create a manager project'}
                        </h2>
                      </div>
                      <Building2 className="h-6 w-6 text-[#1D9E75]" />
                    </div>

                    <form onSubmit={handleSaveManagerProject} className="mt-5 space-y-3">
                      <input
                        type="text"
                        placeholder="Project name *"
                        value={managerProjectDraft.name}
                        onChange={(e) => handleManagerProjectDraftChange('name', e.target.value)}
                        className="block w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                        required
                      />
                      <textarea
                        placeholder="Short project summary"
                        value={managerProjectDraft.summary}
                        onChange={(e) => handleManagerProjectDraftChange('summary', e.target.value)}
                        className="block min-h-24 w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Owner"
                          value={managerProjectDraft.owner}
                          onChange={(e) => handleManagerProjectDraftChange('owner', e.target.value)}
                          className="block w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                        />
                        <input
                          type="text"
                          placeholder="Due date"
                          value={managerProjectDraft.due}
                          onChange={(e) => handleManagerProjectDraftChange('due', e.target.value)}
                          className="block w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <select
                          value={managerProjectDraft.status}
                          onChange={(e) => handleManagerProjectDraftChange('status', e.target.value)}
                          className="block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                        >
                          {['Planned', 'In Progress', 'Review', 'Blocked', 'Done'].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <select
                          value={managerProjectDraft.priority}
                          onChange={(e) => handleManagerProjectDraftChange('priority', e.target.value)}
                          className="block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                        >
                          {['Low', 'Medium', 'High'].map((priority) => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                      </div>
                      <label className="block rounded-2xl border border-[#DAD7FB] bg-[#FCFCFF] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8A8894]">Progress</span>
                          <span className="text-sm font-black text-[#3C3489]">{managerProjectDraft.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={managerProjectDraft.progress}
                          onChange={(e) => handleManagerProjectDraftChange('progress', e.target.value)}
                          className="mt-3 w-full accent-[#7F77DD]"
                        />
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1C1739] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#2D266B]"
                        >
                          <Plus className="h-4 w-4" />
                          {editingManagerProjectId ? 'Save changes' : 'Create project'}
                        </button>
                        <button
                          type="button"
                          onClick={resetManagerProjectDraft}
                          className="rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                        >
                          Clear
                        </button>
                      </div>
                    </form>
                  </section>
                </section>
              )}

              {dashboardRole === 'manager' && selectedDemoSection === 'Activity' && (
                <section className="mt-6 rounded-2xl border border-[#EEEDFE] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7F77DD]">Manager activity log</p>
                      <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Every team signal in one timeline</h2>
                    </div>
                    <button type="button" onClick={() => setDemoEmployeeSection('Dashboard')} className="rounded-xl border border-[#DAD7FB] px-4 py-2 text-sm font-black text-[#3C3489] hover:bg-[#EEEDFE]">
                      Back to dashboard
                    </button>
                  </div>
                  <div className="mt-6 space-y-3">
                    {managerActivityRows.map(([action, task, time, Icon, color, preview]) => (
                      <div key={`${action}-${task}-full`} className={`rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 ${action.includes('Karan missed') ? 'border-l-4 border-l-rose-500 bg-rose-50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}16`, color }}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className={`text-sm font-black ${action.includes('Karan missed') ? 'text-rose-600' : 'text-[#2C2C2A]'}`}>{action}</p>
                              <span className="text-xs font-bold text-[#8A8894]">{time}</span>
                            </div>
                            <p className="mt-1 text-xs font-bold text-[#8A8894]">{task}</p>
                            <p className="mt-3 text-sm font-semibold leading-6 text-[#5F5E5A]">{preview}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {dashboardRole === 'manager' && selectedDemoSection === 'Tasks' && (
                <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7F77DD]">Manager tasks</p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Assign, review, and unblock your team.</h2>
                      </div>
                      <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">
                        {managerProgressRows.length} live items
                      </span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {managerProgressRows.length ? managerProgressRows.map(([name, task, progress, status, color, lastUpdate, updateTone]) => (
                        <div key={`${name}-${task}-manager-task`} className="grid gap-3 rounded-2xl border border-[#F0EFFA] bg-[#FCFCFF] p-4 sm:grid-cols-[minmax(10rem,1fr)_minmax(9rem,0.7fr)_4rem_7rem_7rem] sm:items-center">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ backgroundColor: color }}>
                              {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-[#2C2C2A]">{name}</p>
                              <p className="truncate text-xs font-semibold text-[#8A8894]">{task}</p>
                            </div>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-[#EEEFF5]">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: color }} />
                          </div>
                          <p className="text-sm font-extrabold text-[#2C2C2A]">{progress}%</p>
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${
                            status === 'Completed' ? 'bg-[#E8F7F1] text-[#1D9E75]' :
                            status === 'Overdue' || status === 'Blocked' ? 'bg-rose-50 text-rose-600' :
                            'bg-[#EEEDFE] text-[#3C3489]'
                          }`}>
                            {status}
                          </span>
                          <span className={`text-xs font-extrabold ${getManagerLastUpdateClass(updateTone)}`}>
                            {lastUpdate}
                          </span>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-6 text-center">
                          <ClipboardCheck className="mx-auto h-8 w-8 text-[#7F77DD]" />
                          <p className="mt-3 text-sm font-black text-[#2C2C2A]">No department tasks yet</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">Create the first task below to start your manager board.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section id="manager-create-task" className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7F77DD]">Quick assign</p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Create & assign tasks</h2>
                      </div>
                      <Plus className="h-6 w-6 text-[#7F77DD]" />
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">Manager mode keeps assignees scoped to your team.</p>
                    <form onSubmit={handleCreateTask} className="mt-5 space-y-3">
                      <input
                        type="text"
                        placeholder="Task Title *"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="block w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                        required
                      />
                      <textarea
                        placeholder="Task Description"
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        className="block min-h-24 w-full rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                      />
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                      >
                        <option value="">Unassigned</option>
                        {adminUsers.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1C1739] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#2D266B]"
                      >
                        <Plus className="h-4 w-4" />
                        Create task
                      </button>
                    </form>
                  </section>
                </section>
              )}

              {dashboardRole === 'manager' && selectedDemoSection === 'People' && (
                <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">People signals</p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Who needs attention right now.</h2>
                      </div>
                      <UsersRound className="h-6 w-6 text-[#1D9E75]" />
                    </div>
                    <div className="mt-5 grid gap-3">
                      {managerNoUpdateAlerts.length ? managerNoUpdateAlerts.map((alert) => (
                        <div key={`${alert.name}-${alert.detail}-people`} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-[#2C2C2A]">{alert.name}</p>
                            <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-extrabold text-rose-600">No update</span>
                          </div>
                          <p className="mt-2 text-xs font-semibold leading-5 text-[#5F5E5A]">{alert.detail}</p>
                          <button type="button" onClick={openWhatsAppNudgePreview} className="mt-4 rounded-full bg-[#1C1739] px-3 py-2 text-[11px] font-black text-white">
                            Send nudge
                          </button>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-5 text-sm font-semibold text-[#5F5E5A]">
                          Everyone on your team is updated today.
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F59E0B]">Quality + proof</p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Proof requests and update coaching.</h2>
                      </div>
                      <FileCheck2 className="h-6 w-6 text-[#F59E0B]" />
                    </div>
                    <div className="mt-5 grid gap-3">
                      {managerProofRequiredTasks.map((task) => (
                        <div key={`${task.title}-${task.owner}-people`} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <p className="text-sm font-black text-[#2C2C2A]">{task.title}</p>
                          <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">{task.owner} · {task.proof}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {managerQualityScoreCards.map(([label, value, helper]) => (
                        <div key={`${label}-people`} className="rounded-2xl border border-[#EEEDFE] bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8A8894]">{label}</p>
                          <p className="mt-2 text-xl font-black text-[#3C3489]">{value}</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">{helper}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </section>
              )}

              {dashboardRole === 'manager' && selectedDemoSection === 'Reports' && (
                <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7F77DD]">Reports</p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Live team signal graph</h2>
                      </div>
                      <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-extrabold text-[#1D9E75]">Live</span>
                    </div>
                    <div className="mt-5 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={managerChartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                          <defs>
                            <linearGradient id="managerReportsUpdates" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3C3489" stopOpacity={0.28} />
                              <stop offset="95%" stopColor="#3C3489" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="managerReportsCompleted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.26} />
                              <stop offset="95%" stopColor="#1D9E75" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#EEF2F7" vertical={false} />
                          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 800 }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} />
                          <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #E2E8F0', fontWeight: 700 }} />
                          <Area type="monotone" dataKey="updates" stroke="#3C3489" strokeWidth={3} fill="url(#managerReportsUpdates)" />
                          <Area type="monotone" dataKey="completed" stroke="#1D9E75" strokeWidth={3} fill="url(#managerReportsCompleted)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {managerStatusMixData.map((item) => (
                        <div key={`${item.label}-report`} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                          <p className="text-xs font-black uppercase text-[#64748B]">{item.label}</p>
                          <p className="mt-2 text-2xl font-black" style={{ color: item.fill }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7F77DD]">Audit feed</p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Recent team updates</h2>
                      </div>
                      <button type="button" onClick={generateBoardPack} disabled={boardPackLoading} className="rounded-full border border-[#DAD7FB] px-4 py-2 text-xs font-extrabold text-[#3C3489] disabled:opacity-60">
                        {boardPackLoading ? 'Preparing...' : 'Export'}
                      </button>
                    </div>
                    <div className="mt-5 space-y-3">
                      {allUpdates.length ? allUpdates.slice(0, 6).map((u) => (
                        <div key={`${u.id}-report`} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#8A8894]">
                            <span className="text-[#3C3489]">{u.user?.name || 'Employee'}</span>
                            <span>{formatDisplayDate(u.created_at)}</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{u.progress_text}</p>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-5 text-sm font-semibold text-[#5F5E5A]">
                          No updates available yet for the report feed.
                        </div>
                      )}
                    </div>
                  </section>
                </section>
              )}

              {dashboardRole === 'manager' && selectedDemoSection === 'NudgeAI' && (
                <section className="mt-6 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
                  <section className="rounded-[28px] bg-[linear-gradient(160deg,_#17142C_0%,_#26224B_55%,_#302A62_100%)] p-6 text-white shadow-[0_18px_50px_rgba(23,20,44,0.28)]">
                    <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8EF0CD]">
                      <Zap className="h-4 w-4" />
                      NudgeAI Desk
                    </p>
                    <h2 className="mt-4 text-3xl font-black">Manager copilots for briefs, blockers, and nudges.</h2>
                    <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
                      Generate summaries, escalate issues faster, and coach update quality without opening six different tools.
                    </p>
                    <div className="mt-5 space-y-3">
                      {managerStandupCards.slice(0, 4).map(([label, copy]) => (
                        <div key={`${label}-nudgeai`} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                          <p className="text-xs font-black uppercase text-white/50">{label}</p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-white/82">{copy}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="dashboard-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7F77DD]">Manager actions</p>
                        <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Run the next best action.</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => runNudgeAiFeature('standup', true)}
                        disabled={nudgeAiLoading.standup}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1C1739] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                      >
                        <RefreshCw className={`h-4 w-4 ${nudgeAiLoading.standup ? 'animate-spin' : ''}`} />
                        Refresh brief
                      </button>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <button type="button" onClick={() => runNudgeAiFeature('forecast', true)} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-left transition hover:border-[#7F77DD]">
                        <p className="text-sm font-black text-[#2C2C2A]">Sprint Forecast</p>
                        <p className="mt-2 text-xs font-semibold leading-5 text-[#5F5E5A]">See delivery risk before the day derails.</p>
                      </button>
                      <button type="button" onClick={() => runNudgeAiFeature('appreciation', true)} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-left transition hover:border-[#7F77DD]">
                        <p className="text-sm font-black text-[#2C2C2A]">Appreciation Draft</p>
                        <p className="mt-2 text-xs font-semibold leading-5 text-[#5F5E5A]">Turn team wins into a polished shoutout.</p>
                      </button>
                      <button type="button" onClick={() => openWhatsAppNudgePreview()} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-left transition hover:border-[#7F77DD]">
                        <p className="text-sm font-black text-[#2C2C2A]">WhatsApp Nudge</p>
                        <p className="mt-2 text-xs font-semibold leading-5 text-[#5F5E5A]">Ping silent teammates from one manager queue.</p>
                      </button>
                      <button type="button" onClick={() => setDemoEmployeeSection('Reports')} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-left transition hover:border-[#7F77DD]">
                        <p className="text-sm font-black text-[#2C2C2A]">Open Reports</p>
                        <p className="mt-2 text-xs font-semibold leading-5 text-[#5F5E5A]">Review the latest audit graph and update trail.</p>
                      </button>
                    </div>
                  </section>
                </section>
              )}

              {dashboardRole === 'manager' && selectedDemoSection === 'Settings' && (
                <section className="mt-6 rounded-2xl border border-[#EEEDFE] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEEDFE] text-[#3C3489]">
                    <Shield className="h-7 w-7" />
                  </div>
                  <h2 className="mt-4 text-2xl font-black text-[#2C2C2A]">Manager settings stay intentionally light.</h2>
                  <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                    Billing, org setup, and company-wide controls stay with admins. Managers only get the tools needed to run their own team cleanly.
                  </p>
                </section>
              )}

              {!demoEmployeeCanNavigate && selectedDemoSection === 'NudgeSpace' && (
                <section className="mt-7 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.5rem] border border-[#E6E3FF] bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: roleTheme.soft, color: roleAccent }}
                        >
                          <MessageSquareText className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: roleAccent }}>
                            {nudgeSpaceRoleCopy.eyebrow}
                          </p>
                          <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">{nudgeSpaceRoleCopy.title}</h2>
                          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A]">{nudgeSpaceRoleCopy.copy}</p>
                        </div>
                      </div>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">
                        <ShieldCheck className="h-4 w-4" />
                        Scoped to {dashboardRoleLabel}
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#DAD7FB] bg-[#FCFCFF] p-4">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {['Announcement', 'Win', 'Question', 'Idea'].map((type, index) => (
                          <span
                            key={type}
                            className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                              index === 0 ? 'text-white' : 'border border-[#DAD7FB] bg-white text-[#5F5E5A]'
                            }`}
                            style={index === 0 ? { backgroundColor: roleAccent } : undefined}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                      <textarea
                        rows={4}
                        value={nudgeSpaceDraft}
                        onChange={(event) => setNudgeSpaceDraft(event.target.value)}
                        className="w-full resize-none rounded-2xl border border-[#DAD7FB] bg-white p-4 text-sm font-semibold text-[#2C2C2A] outline-none transition focus:border-[#7F77DD] focus:ring-4 focus:ring-[#EEEDFE]"
                        placeholder="Draft a workspace post, recognition, blocker note, or quick team question..."
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-[#8A8894]">Posts save to the live NudgeSpace backend.</p>
                        <button
                          type="button"
                          onClick={submitNudgeSpacePost}
                          disabled={nudgeSpaceSaving}
                          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90"
                          style={{ backgroundColor: roleAccent }}
                        >
                          {nudgeSpaceSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          {nudgeSpaceSaving ? 'Posting...' : 'Post to NudgeSpace'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        [
                          demoDisplayName,
                          dashboardRole === 'manager' ? 'posted a team nudge' : dashboardRole === 'hr' ? 'shared a culture pulse' : 'shared an announcement',
                          dashboardRole === 'manager'
                            ? 'Sales team, drop blockers here before 4 PM so tomorrow stays clean.'
                            : dashboardRole === 'hr'
                              ? 'Friday recognition thread is open. Tag one teammate who helped you this week.'
                              : 'Mobile app launch banner is ready for review before the next product push.',
                          'Just now',
                          roleAccent
                        ],
                        ['Priya Singh', 'shared a win', 'Resolved the CRM blocker and attached the proof link for review.', '18m ago', '#1D9E75'],
                        ['Aman Verma', 'asked for help', 'Can someone review the weekly report export before today evening?', '42m ago', '#F59E0B']
                      ].map(([name, action, copy, time, color]) => (
                        <article key={`${name}-${action}`} className="rounded-2xl border border-[#EEEDFE] bg-white p-4 transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                          <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ backgroundColor: color }}>
                              {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-extrabold text-[#2C2C2A]">
                                  {name} <span className="font-bold text-[#5F5E5A]">{action}</span>
                                </p>
                                <span className="text-xs font-bold text-[#8A8894]">{time}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-[#5F5E5A]">{copy}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <aside className="space-y-5">
                    <section className="rounded-[1.5rem] border border-[#E6E3FF] bg-white p-5 shadow-sm">
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: roleAccent }}>Visibility</p>
                      <h3 className="mt-2 text-xl font-black text-[#2C2C2A]">Right audience, no noise.</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{nudgeSpaceRoleCopy.visibility}</p>
                      <div className="mt-5 grid gap-3">
                        {[
                          ['Post scope', dashboardRole === 'admin' ? 'Company-wide' : dashboardRole === 'hr' ? 'People + culture' : 'Department only'],
                          ['Moderation', dashboardRole === 'admin' ? 'Full control' : dashboardRole === 'hr' ? 'People posts' : 'Team feed'],
                          ['NudgeAI assist', 'Turn posts into summaries']
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-4 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3">
                            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8A8894]">{label}</span>
                            <span className="text-sm font-extrabold text-[#2C2C2A]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-[1.5rem] border border-[#DAD7FB] bg-gradient-to-br from-[#3C3489] via-[#7F77DD] to-[#1D9E75] p-5 text-white shadow-sm">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
                        <Sparkles className="h-4 w-4" />
                        NudgeAI + Space
                      </span>
                      <h3 className="mt-5 text-2xl font-black">Convert chatter into signals.</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white/80">
                        Summarize open questions, spot repeated blockers, and turn raw posts into manager-ready next actions.
                      </p>
                      <button
                        type="button"
                        onClick={openDemoAiHelper}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                      >
                        Ask NudgeAI
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </section>
                  </aside>
                </section>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'My Tasks' && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1D9E75]">Today</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">Your work queue</h2>
                    <p className="mt-2 text-sm leading-6 text-[#5F5E5A]">Everything here is only visible to you and your assigned manager.</p>
                    <div className="mt-5 grid gap-3">
                      {!employeeDashboardWorkQueueRows.length ? renderEmptyState({
                        title: 'No tasks assigned yet',
                        sub: 'Your manager will assign tasks soon. Check back here!',
                        Icon: ListTodo
                      }) : null}
                      {employeeDashboardWorkQueueRows.map(([group, task, progress, status, color]) => (
                        <button
                          key={task}
                          type="button"
                          onClick={() => openDemoTask([group, task, progress, status, color])}
                          className="flex items-center justify-between rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-left transition hover:border-[#7F77DD] hover:bg-[#F7F6FF]"
                        >
                          <span>
                            <span className="block text-sm font-extrabold text-[#2C2C2A]">{task}</span>
                            <span className="mt-1 block text-xs font-semibold text-[#8A8894]">{group === 'Today' ? 'Due today' : 'This week'}</span>
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${status === 'At risk' ? 'bg-[#FFF7ED] text-[#F59E0B]' : 'bg-[#EEEDFE] text-[#3C3489]'}`}>
                            {status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-[#2C2C2A]">Task progress</h2>
                      <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-extrabold text-[#1D9E75]">Live</span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {!employeeDashboardTaskRows.length ? renderEmptyState({
                        title: 'No tasks assigned yet',
                        sub: 'Your manager will assign tasks soon. Check back here!',
                        Icon: ListTodo
                      }) : null}
                      {employeeDashboardTaskRows.map(([name, task, progress, status, color]) => (
                        <div key={task} className="rounded-xl border border-[#F0EFFA] bg-[#FCFCFF] p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-extrabold text-[#2C2C2A]">{task}</p>
                              <p className="text-xs font-semibold text-[#8A8894]">{name}</p>
                            </div>
                            <span className="w-fit rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">{status}</span>
                          </div>
                          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#EEEFF5]">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: color }} />
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" onClick={() => openDemoTask([name, task, progress, status, color])} className="rounded-xl bg-[#3C3489] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#7F77DD]">
                              View details
                            </button>
                            {['Start', 'Complete', 'Report blocker'].map((action) => (
                              <button key={action} type="button" onClick={() => openDemoTask([name, task, progress, action === 'Complete' ? 'Completed' : action === 'Report blocker' ? 'Blocked' : 'In Progress', action === 'Complete' ? '#1D9E75' : action === 'Report blocker' ? '#EF4444' : '#7F77DD'])} className="rounded-xl border border-[#DAD7FB] px-3 py-2 text-xs font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'Check-in' && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7F77DD]">Daily check-in</p>
                      <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#3C3489]">
                        Sample demo form
                      </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">Tell the workspace what changed</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#8A8894]">
                      These are example prompts only. In the real employee dashboard, today&apos;s check-in starts blank.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {[
                        ['Office', 'Office'],
                        ['Home', 'Home'],
                        ['Client site', 'Client site'],
                        ['Travel', 'Travel']
                      ].map(([location, label]) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => setDemoCheckinLocation(location)}
                          className={`rounded-full border px-4 py-2.5 text-sm font-extrabold transition ${
                            demoCheckinLocation === location
                              ? 'border-transparent bg-[#7F77DD] text-white shadow-lg shadow-[#7F77DD]/20'
                              : 'border-[#D3D1C7] bg-white text-[#5F5E5A] hover:bg-[#F7F6FF] hover:text-[#3C3489]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-4">
                      {[
                        ['Goal 1', 'Example: finish dashboard polish'],
                        ['Goal 2', 'Example: test onboarding flow'],
                        ['Main focus', 'Example: NudgeAI employee experience']
                      ].map(([label, placeholder]) => (
                        <div key={label} className="rounded-xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7F77DD]">{label}</p>
                          <p className="mt-1 text-sm font-semibold text-[#8A8894]">{placeholder}</p>
                        </div>
                      ))}
                      <div className="min-h-28 rounded-xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7F77DD]">Progress update</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-[#8A8894]">
                          Example: Completed the first visual pass and found two blockers around auth redirects.
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => showToast('Demo sample check-in previewed. Real employees submit from blank fields.', 'info')} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7F77DD] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#3C3489]">
                      <Send className="h-4 w-4" />
                      Preview sample check-in
                    </button>
                  </section>
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <h2 className="text-xl font-extrabold text-[#2C2C2A]">NudgeAI quality preview</h2>
                    <div className="mt-5 rounded-2xl bg-[#3C3489] p-5 text-white">
                      <p className="text-5xl font-extrabold">8.6</p>
                      <p className="mt-2 text-sm font-bold text-white/75">Update clarity score</p>
                      <p className="mt-5 text-sm leading-6 text-white/80">Strong update. Add the proof link or file location and it becomes manager-ready.</p>
                    </div>
                    <div className="mt-4 rounded-xl border border-[#DAD7FB] bg-[#F7F6FF] p-4 text-sm font-semibold leading-6 text-[#5F5E5A]">
                      <span className="font-extrabold text-[#3C3489]">Gentle nudge:</span> mention outcome, blocker, and next action in one tight paragraph.
                    </div>
                  </section>
                </div>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'My Progress' && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <h2 className="text-xl font-extrabold text-[#2C2C2A]">Your momentum</h2>
                    {hasEmployeeProgressSignals ? (
                      <div className="mt-5 grid gap-3">
                        {employeeMomentumRows.map(([label, value, trend, color]) => (
                        <div key={label} className="rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8A8894]">{label}</p>
                          <p className="mt-2 text-3xl font-extrabold text-[#2C2C2A]">{value}</p>
                          <p className="mt-1 text-xs font-extrabold" style={{ color }}>{trend}</p>
                        </div>
                        ))}
                      </div>
                    ) : renderEmptyState({
                      title: 'Your progress curve starts here',
                      sub: 'Complete your first check-in to see your weekly momentum.',
                      Icon: LineChartIcon,
                      actionLabel: 'Go to Check-in',
                      onAction: () => setDemoEmployeeSection('Check-in')
                    })}
                  </section>
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-[#2C2C2A]">Weekly progress curve</h2>
                        <p className="mt-1 text-sm font-semibold text-[#8A8894]">Tasks completed per day · last 7 days</p>
                      </div>
                      {isSandbox ? (
                        <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">Demo data</span>
                      ) : null}
                    </div>
                    {employeeDashboardWeeklyProgressData.length ? (
                      <div className="mt-6 h-64 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={employeeDashboardWeeklyProgressData} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
                            <CartesianGrid stroke="#ECEAFB" strokeDasharray="4 4" vertical={false} />
                            <XAxis dataKey="day" tick={{ fill: '#8A8894', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: '#8A8894', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ border: '1px solid #DAD7FB', borderRadius: 12, boxShadow: '0 12px 30px rgba(60,52,137,0.14)' }}
                              labelStyle={{ color: '#3C3489', fontWeight: 800 }}
                              formatter={(value) => [`${value} tasks completed`, '']}
                            />
                            <Line
                              type="monotone"
                              dataKey="tasks"
                              name="Tasks completed"
                              stroke="#7F77DD"
                              strokeWidth={4}
                              dot={{ r: 5, fill: '#FFFFFF', stroke: '#7F77DD', strokeWidth: 3 }}
                              activeDot={{ r: 7, fill: '#7F77DD', stroke: '#FFFFFF', strokeWidth: 3 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : renderEmptyState({
                      title: 'Your progress curve starts here',
                      sub: 'Complete your first check-in to see your weekly momentum.',
                      Icon: LineChartIcon,
                      actionLabel: 'Go to Check-in',
                      onAction: () => setDemoEmployeeSection('Check-in')
                    })}
                  </section>
                </div>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'Growth Portal' && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-[#2C2C2A]">Growth snapshot</h2>
                      {hasRealEmployeeGrowthSignals ? (
                        <button
                          type="button"
                          onClick={downloadDemoGrowthPdf}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#3C3489] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#7F77DD]"
                        >
                          <Download className="h-4 w-4" />
                          90-day PDF
                        </button>
                      ) : null}
                    </div>
                    {hasRealEmployeeGrowthSignals ? (
                      <>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          {employeeGrowthSnapshotRows.map(([period, count]) => (
                        <div key={period} className="rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <p className="text-sm font-extrabold text-[#3C3489]">{period}</p>
                          <p className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">{count}</p>
                          <p className="mt-1 text-xs font-semibold text-[#8A8894]">tasks completed</p>
                        </div>
                          ))}
                        </div>
                        <div className="mt-5 rounded-xl bg-[#F7F6FF] p-4 text-sm font-semibold leading-6 text-[#5F5E5A]">
                          <span className="font-extrabold text-[#3C3489]">NudgeAI career summary:</span> {isSandbox
                            ? 'You are strongest on focused execution days and your most productive pattern is Tuesday morning deep work.'
                            : growthSummary?.summary || 'Your growth summary will appear after more real check-ins and completed tasks.'}
                        </div>
                      </>
                    ) : (
                      <div className="mt-5">
                        {renderEmptyState({
                          title: 'Your story is just beginning',
                          sub: 'Keep checking in daily and NudgeAI will start building your growth snapshot.',
                          Icon: Sparkles
                        })}
                      </div>
                    )}
                  </section>
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <h2 className="text-xl font-extrabold text-[#2C2C2A]">Personal wins</h2>
                    {employeePersonalWins.length ? (
                      <div className="mt-5 space-y-3">
                        {employeePersonalWins.map(([win, Icon, bg, color]) => (
                        <div key={win} className="flex items-center gap-3 rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: bg, color }}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <p className="text-sm font-extrabold text-[#2C2C2A]">{win}</p>
                        </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5">
                        {renderEmptyState({
                          title: 'Your story is just beginning',
                          sub: 'Recognition and personal wins will show here once your team starts using NudgeHQ.',
                          Icon: Star
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'NudgeSpace' && isSandbox && (
                <div className="mt-6 space-y-6">
                  <section className="overflow-hidden rounded-[32px] border border-[#D9D6FF] bg-[linear-gradient(135deg,_#ffffff_0%,_#f8f6ff_48%,_#f3fff8_100%)] p-6 shadow-[0_24px_80px_rgba(60,52,137,0.14)]">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                      <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#1C1739] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white">
                          <Sparkles className="h-3.5 w-3.5" />
                          Demo-only upgrade
                        </span>
                        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#1C1739] sm:text-4xl">
                          NudgeSpace is now Social + U Space.
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A] sm:text-base">
                          Social feels like your internal Insta/Twitter/FB mashup. U Space is your private todo and focus zone. This version only shows in the demo account.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {['Social', 'U Space'].map((view) => (
                          <button
                            key={view}
                            type="button"
                            onClick={() => handleNudgeSpaceViewChange(view)}
                            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition ${
                              demoNudgeSpaceView === view
                                ? 'bg-[#1C1739] text-white shadow-[0_14px_30px_rgba(28,23,57,0.28)]'
                                : 'border border-[#D9D6FF] bg-white text-[#5F5E5A] hover:border-[#BEB7FF] hover:text-[#1C1739]'
                            }`}
                          >
                            {view === 'Social' ? <MessageSquareText className="h-4 w-4" /> : <ListTodo className="h-4 w-4" />}
                            {view}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {demoNudgeSpaceView === 'Social' ? (
                    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                      <section className="space-y-5">
                        <div className="rounded-[28px] bg-[linear-gradient(145deg,_#140F29,_#2E255E)] p-5 text-white shadow-[0_18px_50px_rgba(20,15,41,0.35)]">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#8EF0CD]">Social feed</p>
                              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">Work updates, but with actual energy</h3>
                              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/75">
                                Post wins, asks, ideas, and momentum without making the workspace feel dead.
                              </p>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                              {[
                                ['96', 'sparks'],
                                ['14', 'fresh drops'],
                                ['7', 'need replies']
                              ].map(([value, label]) => (
                                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-4">
                                  <p className="text-xl font-black">{value}</p>
                                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">{label}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                            <div className="mb-3 flex flex-wrap gap-2">
                              {['Status', 'Win', 'Question', 'Idea'].map((type, index) => (
                                <span
                                  key={type}
                                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${index === 0 ? 'bg-white text-[#120F24]' : 'border border-white/10 bg-white/10 text-white/75'}`}
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                            <textarea
                              rows={4}
                              className="w-full resize-none rounded-[22px] border border-white/10 bg-white p-4 text-sm font-semibold text-[#1C1739] outline-none transition focus:border-[#8EF0CD] focus:ring-4 focus:ring-[#8EF0CD]/20"
                              placeholder="Drop a sharp update, celebration, or help request..."
                            />
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs font-bold text-white/65">Internal only. Demo posting for vibe check.</p>
                              <button
                                type="button"
                                onClick={() => showToast('Demo Social post drafted in sandbox.', 'success')}
                                className="inline-flex items-center gap-2 rounded-full bg-[#8EF0CD] px-5 py-3 text-sm font-extrabold text-[#10211C] transition hover:bg-[#B5F6DE]"
                              >
                                <Send className="h-4 w-4" />
                                Post to Social
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {sandboxNudgeSpaceSocialPosts.map((post) => (
                            <article key={`${post.name}-${post.title}`} className="rounded-[28px] border border-[#E4DEFF] bg-white p-5 shadow-[0_16px_40px_rgba(127,119,221,0.12)]">
                              <div className="flex items-start gap-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-sm font-black text-white" style={{ backgroundColor: post.color }}>
                                  {post.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-black text-[#1C1739]">{post.name}</p>
                                      <p className="mt-1 text-xs font-bold text-[#8A8894]">{post.handle} • {post.time}</p>
                                    </div>
                                    <span className="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ backgroundColor: `${post.color}18`, color: post.color }}>
                                      {post.badge}
                                    </span>
                                  </div>
                                  <h4 className="mt-4 text-xl font-black tracking-[-0.03em] text-[#1C1739]">{post.title}</h4>
                                  <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{post.copy}</p>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                      <span key={tag} className="rounded-full bg-[#F6F4FF] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#6D63D9]">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECFF] pt-4">
                                    <div className="flex flex-wrap gap-2">
                                      {['Hype', 'Comment', 'Boost'].map((label) => (
                                        <button
                                          key={label}
                                          type="button"
                                          onClick={() => showToast(`${label} reaction added in demo.`, 'success')}
                                          className="inline-flex items-center gap-2 rounded-full border border-[#E4DEFF] px-4 py-2 text-xs font-extrabold text-[#1C1739] transition hover:border-[#BEB7FF] hover:bg-[#F7F4FF]"
                                        >
                                          {label}
                                        </button>
                                      ))}
                                    </div>
                                    <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8A8894]">{post.metric}</span>
                                  </div>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>

                      <aside className="space-y-5">
                        <section className="rounded-[28px] border border-[#D9D6FF] bg-white p-5 shadow-[0_16px_40px_rgba(29,158,117,0.12)]">
                          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">Trending inside</p>
                          <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#1C1739]">What the team is vibing with</h3>
                          <div className="mt-5 space-y-3">
                            {[
                              ['Launch polish', '12 people talking'],
                              ['Customer win reel', '8 reactions waiting'],
                              ['Friday demo prep', '4 asks for backup']
                            ].map(([title, stat], index) => (
                              <div key={title} className="rounded-2xl bg-[#F7FFFB] p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-black text-[#1C1739]">{title}</p>
                                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#1D9E75]">0{index + 1}</span>
                                </div>
                                <p className="mt-2 text-xs font-semibold text-[#6B7280]">{stat}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="rounded-[28px] bg-[linear-gradient(145deg,_#1C1739,_#12795C)] p-5 text-white shadow-[0_18px_45px_rgba(28,23,57,0.28)]">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/75">
                            <Zap className="h-4 w-4" />
                            NudgeAI x Social
                          </span>
                          <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">Turn messy thoughts into a post people actually read.</h3>
                          <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
                            Draft a cleaner update, blocker post, or celebration in one tap.
                          </p>
                          <button
                            type="button"
                            onClick={openDemoAiHelper}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#1C1739] transition hover:bg-[#EEEDFE]"
                          >
                            Ask NudgeAI
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </section>
                      </aside>
                    </div>
                  ) : (
                    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                      <section className="rounded-[28px] border border-[#D9D6FF] bg-white p-5 shadow-[0_20px_48px_rgba(127,119,221,0.14)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6D63D9]">U Space</p>
                            <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#1C1739]">Your private focus playground</h3>
                            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                              A personal board for what you are shipping, what is next, and what deserves protected attention today.
                            </p>
                          </div>
                          <div className="rounded-[24px] bg-[linear-gradient(135deg,_#f4f0ff,_#ecfff8)] px-5 py-4 text-right">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6D63D9]">Current streak</p>
                            <p className="mt-1 text-3xl font-black text-[#1C1739]">6 days</p>
                            <p className="mt-1 text-xs font-bold text-[#6B7280]">Showing up with clean updates</p>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                          {[
                            ['2', 'shipping now'],
                            ['3', 'queued next'],
                            ['1', 'needs unblock']
                          ].map(([value, label]) => (
                            <div key={label} className="rounded-[24px] border border-[#ECE8FF] bg-[#FBFAFF] p-4">
                              <p className="text-3xl font-black text-[#1C1739]">{value}</p>
                              <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#8A8894]">{label}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 space-y-4">
                          {sandboxNudgeSpaceTodoCards.map((card, index) => (
                            <div key={card.title} className="rounded-[26px] border border-[#ECE8FF] bg-[linear-gradient(135deg,_#ffffff,_#faf9ff)] p-5">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-4">
                                  <label className="mt-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2" style={{ borderColor: card.tone }}>
                                    <input type="checkbox" defaultChecked={index === 0} className="h-4 w-4 accent-[#7F77DD]" />
                                  </label>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="text-lg font-black tracking-[-0.03em] text-[#1C1739]">{card.title}</h4>
                                      <span className="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ backgroundColor: `${card.tone}18`, color: card.tone }}>
                                        {card.status}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{card.detail}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => showToast(`${card.title} opened in demo view.`, 'success')}
                                  className="inline-flex items-center gap-2 rounded-full border border-[#D9D6FF] px-4 py-2 text-xs font-extrabold text-[#1C1739] transition hover:border-[#BEB7FF] hover:bg-[#F7F4FF]"
                                >
                                  Open card
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <aside className="space-y-5">
                        <section className="rounded-[28px] bg-[#120F24] p-5 text-white shadow-[0_18px_55px_rgba(18,15,36,0.35)]">
                          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#8EF0CD]">Today map</p>
                          <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">Protect the hours that matter</h3>
                          <div className="mt-5 space-y-3">
                            {[
                              ['09:30 - 11:00', 'Deep work sprint', 'Dashboard polish + testing'],
                              ['11:30 - 12:00', 'Quick sync', 'Invite flow review'],
                              ['16:00 - 16:45', 'Write mode', 'Launch note first draft']
                            ].map(([time, title, detail]) => (
                              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8EF0CD]">{time}</p>
                                <p className="mt-2 text-sm font-black">{title}</p>
                                <p className="mt-1 text-xs font-semibold text-white/70">{detail}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="rounded-[28px] border border-[#D9D6FF] bg-[linear-gradient(160deg,_#ffffff_0%,_#f7fff9_100%)] p-5 shadow-[0_16px_40px_rgba(29,158,117,0.1)]">
                          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">Quick adds</p>
                          <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#1C1739]">Keep your space moving</h3>
                          <div className="mt-5 grid gap-3">
                            {[
                              ['Add a goal', 'Personal goal added in demo. Live goals will save in NudgeSpace.'],
                              ['Create a focus block', 'Deep work block queued in demo.'],
                              ['Drop a reminder', 'Reminder added to U Space in demo.']
                            ].map(([label, toast]) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => showToast(toast, 'success')}
                                className="flex items-center justify-between rounded-2xl border border-[#E4F7EE] bg-white px-4 py-4 text-left transition hover:border-[#B7E9D2] hover:bg-[#F7FFFB]"
                              >
                                <span className="text-sm font-black text-[#1C1739]">{label}</span>
                                <ArrowRight className="h-4 w-4 text-[#1D9E75]" />
                              </button>
                            ))}
                          </div>
                        </section>

                        <section className="rounded-[28px] bg-[linear-gradient(160deg,_#3C3489_0%,_#7F77DD_60%,_#1D9E75_120%)] p-5 text-white shadow-[0_18px_45px_rgba(60,52,137,0.28)]">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">
                            <Sparkles className="h-4 w-4" />
                            NudgeAI for U Space
                          </span>
                          <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">Need a sharper plan for the rest of the day?</h3>
                          <p className="mt-2 text-sm font-semibold leading-6 text-white/80">Use NudgeAI to turn loose thoughts into a focused plan, priority list, or update draft.</p>
                          <button
                            type="button"
                            onClick={openDemoAiHelper}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                          >
                            Ask NudgeAI
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </section>
                      </aside>
                    </div>
                  )}
                </div>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'NudgeSpace' && !isSandbox && (
                <div className="mt-6 space-y-6">
                  <section className="overflow-hidden rounded-[32px] border border-[#D9D6FF] bg-[linear-gradient(135deg,_#ffffff_0%,_#f8f6ff_48%,_#f3fff8_100%)] p-6 shadow-[0_24px_80px_rgba(60,52,137,0.14)]">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                      <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#1C1739] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white">
                          <MessageSquareText className="h-3.5 w-3.5" />
                          NudgeSpace
                        </span>
                        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#1C1739] sm:text-4xl">
                          Social + U Space
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A] sm:text-base">
                          Share workspace updates in Social and keep your private goals, focus blocks, and reminders in U Space.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {['Social', 'U Space'].map((view) => (
                          <button
                            key={view}
                            type="button"
                            onClick={() => handleNudgeSpaceViewChange(view)}
                            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition ${
                              demoNudgeSpaceView === view
                                ? 'bg-[#1C1739] text-white shadow-[0_14px_30px_rgba(28,23,57,0.28)]'
                                : 'border border-[#D9D6FF] bg-white text-[#5F5E5A] hover:border-[#BEB7FF] hover:text-[#1C1739]'
                            }`}
                          >
                            {view === 'Social' ? <MessageSquareText className="h-4 w-4" /> : <ListTodo className="h-4 w-4" />}
                            {view}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {demoNudgeSpaceView === 'Social' ? (
                    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                      <section className="space-y-5">
                        <div className="rounded-[28px] bg-[linear-gradient(145deg,_#140F29,_#2E255E)] p-5 text-white shadow-[0_18px_50px_rgba(20,15,41,0.35)]">
                          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#8EF0CD]">Social feed</p>
                          <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">Post updates without another chat thread</h3>
                          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/75">
                            Wins, asks, blockers, and ideas stay visible inside your company workspace.
                          </p>

                          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                            <div className="mb-3 flex flex-wrap gap-2">
                              {['status', 'win', 'question', 'idea'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setNudgeSpacePostType(type)}
                                  className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${nudgeSpacePostType === type ? 'bg-white text-[#120F24]' : 'border border-white/10 bg-white/10 text-white/75'}`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows={4}
                              value={nudgeSpaceDraft}
                              onChange={(event) => setNudgeSpaceDraft(event.target.value)}
                              className="w-full resize-none rounded-[22px] border border-white/10 bg-white p-4 text-sm font-semibold text-[#1C1739] outline-none transition focus:border-[#8EF0CD] focus:ring-4 focus:ring-[#8EF0CD]/20"
                              placeholder="Share a win, ask for help, or post today's focus..."
                            />
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs font-bold text-white/65">Posts stay inside your company workspace.</p>
                              <button
                                type="button"
                                onClick={submitNudgeSpacePost}
                                disabled={nudgeSpaceSaving}
                                className="inline-flex items-center gap-2 rounded-full bg-[#8EF0CD] px-5 py-3 text-sm font-extrabold text-[#10211C] transition hover:bg-[#B5F6DE] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {nudgeSpaceSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                {nudgeSpaceSaving ? 'Posting...' : 'Post to Social'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {renderNudgeSpacePostList({
                          emptyTitle: 'No Social posts yet',
                          emptySub: 'Your company feed will appear here once someone posts from an OG account.',
                          emptyIcon: MessageSquareText
                        })}
                      </section>

                      <aside className="space-y-5">
                        <section className="rounded-[28px] border border-[#D9D6FF] bg-white p-5 shadow-[0_16px_40px_rgba(29,158,117,0.12)]">
                          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">Workspace pulse</p>
                          <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#1C1739]">No trends yet</h3>
                          <p className="mt-3 text-sm font-semibold leading-6 text-[#5F5E5A]">
                            Trending topics will appear after your team starts posting in Social.
                          </p>
                        </section>

                        <section className="rounded-[28px] bg-[linear-gradient(145deg,_#1C1739,_#12795C)] p-5 text-white shadow-[0_18px_45px_rgba(28,23,57,0.28)]">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/75">
                            <Zap className="h-4 w-4" />
                            NudgeAI x Social
                          </span>
                          <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">Draft a clearer workspace post.</h3>
                          <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
                            Turn a rough update, blocker, or celebration into a sharper post.
                          </p>
                          <button
                            type="button"
                            onClick={openDemoAiHelper}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#1C1739] transition hover:bg-[#EEEDFE]"
                          >
                            Ask NudgeAI
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </section>
                      </aside>
                    </div>
                  ) : (
                    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                      <section className="rounded-[28px] border border-[#D9D6FF] bg-white p-5 shadow-[0_20px_48px_rgba(127,119,221,0.14)]">
                        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6D63D9]">U Space</p>
                        <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#1C1739]">Your private focus board</h3>
                        <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                          Keep personal goals, reminders, and protected focus blocks separate from the public workspace feed.
                        </p>
                        <div className="mt-6 rounded-[24px] border border-[#ECE8FF] bg-[#FBFAFF] p-4">
                          <div className="mb-3 flex flex-wrap gap-2">
                            {['goal', 'reminder', 'focus'].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setNudgeSpacePostType(type)}
                                className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${nudgeSpacePostType === type ? 'bg-[#1C1739] text-white' : 'border border-[#DAD7FB] bg-white text-[#6E6B78]'}`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                          <textarea
                            rows={4}
                            value={nudgeSpaceDraft}
                            onChange={(event) => setNudgeSpaceDraft(event.target.value)}
                            className="w-full resize-none rounded-[22px] border border-[#DAD7FB] bg-white p-4 text-sm font-semibold text-[#1C1739] outline-none transition focus:border-[#7F77DD] focus:ring-4 focus:ring-[#EEEDFE]"
                            placeholder="Add a private goal, reminder, or focus note..."
                          />
                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={submitNudgeSpacePost}
                              disabled={nudgeSpaceSaving}
                              className="inline-flex items-center gap-2 rounded-full bg-[#1C1739] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#3C3489] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {nudgeSpaceSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                              {nudgeSpaceSaving ? 'Saving...' : 'Save to U Space'}
                            </button>
                          </div>
                        </div>
                        <div className="mt-6">
                          {renderNudgeSpacePostList({
                            emptyTitle: 'No private goals yet',
                            emptySub: 'Your saved U Space goals and focus blocks will appear here.',
                            emptyIcon: ListTodo
                          })}
                        </div>
                      </section>

                      <aside className="space-y-5">
                        <section className="rounded-[28px] bg-[#120F24] p-5 text-white shadow-[0_18px_55px_rgba(18,15,36,0.35)]">
                          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#8EF0CD]">Today map</p>
                          <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">Focus blocks will appear here</h3>
                          <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
                            Your saved goals, reminders, and focus notes stay private and sync from the live workspace backend.
                          </p>
                        </section>

                        <section className="rounded-[28px] bg-[linear-gradient(160deg,_#3C3489_0%,_#7F77DD_60%,_#1D9E75_120%)] p-5 text-white shadow-[0_18px_45px_rgba(60,52,137,0.28)]">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">
                            <Sparkles className="h-4 w-4" />
                            NudgeAI for U Space
                          </span>
                          <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">Need a sharper plan for the rest of the day?</h3>
                          <p className="mt-2 text-sm font-semibold leading-6 text-white/80">Use NudgeAI to turn loose thoughts into a focused plan, priority list, or update draft.</p>
                          <button
                            type="button"
                            onClick={openDemoAiHelper}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                          >
                            Ask NudgeAI
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </section>
                      </aside>
                    </div>
                  )}
                </div>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'NudgeAI' && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <section className="relative overflow-hidden rounded-xl border border-[#DAD7FB] bg-[#3C3489] p-6 text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <div className="absolute right-[-4rem] top-[-4rem] h-56 w-56 rounded-full bg-[#7F77DD]/40 blur-3xl" />
                    <div className="relative">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
                        <Zap className="h-4 w-4" />
                        NudgeAI
                      </span>
                      <h2 className="mt-5 text-3xl font-extrabold tracking-tight">Ask NudgeAI about your work</h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">A private employee helper for check-ins, blockers, task clarity, and what to update next.</p>
                      <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-sm font-bold text-white/70">Try asking</p>
                        <div className="mt-2 min-h-[3.5rem]">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={DEMO_AI_QUESTIONS[demoAiQuestionIndex]}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              className="text-lg font-extrabold"
                            >
                              "{DEMO_AI_QUESTIONS[demoAiQuestionIndex]}"
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={openDemoAiHelper}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                      >
                        Open NudgeAI helper
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </section>
                  <section className="grid gap-4">
                    {[
                      ['Focus suggestion', 'Finish the dashboard UI pass before touching backend polish.', '#7F77DD'],
                      ['Blocker coaching', 'Write the blocker with expected outcome, what you tried, and who can unblock it.', '#F59E0B'],
                      ['Quality score', 'Your last update scored 8.6/10 for clarity.', '#1D9E75'],
                      ['Next best action', 'Attach a screenshot or link so your manager can review faster.', '#3C3489']
                    ].map(([title, copy, color]) => (
                      <div key={title} className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                            <Sparkles className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-extrabold text-[#2C2C2A]">{title}</p>
                            <p className="mt-1 text-sm leading-6 text-[#5F5E5A]">{copy}</p>
                            <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8A8894]">Powered by NudgeAI</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>
                </div>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'Settings' && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-[#2C2C2A]">Profile</h2>
                        <p className="mt-1 text-sm font-semibold text-[#8A8894]">
                          {isSandbox ? 'Update your demo identity and workspace avatar.' : 'Update your display name and workspace avatar.'}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-extrabold text-[#1D9E75]">
                        {isSandbox ? 'Editable demo' : 'Email locked'}
                      </span>
                    </div>
                    <div className="mt-5 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#3C3489] to-[#7F77DD] text-white shadow-lg shadow-[#7F77DD]/25">
                          {demoProfileAvatar ? (
                            <img src={demoProfileAvatar} alt="Profile preview" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-2xl font-extrabold">{demoInitials}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3C3489] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#7F77DD]">
                            <Download className="h-4 w-4" />
                            Upload profile pic
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                setDemoProfileAvatar(URL.createObjectURL(file));
                                showToast('Profile picture updated in demo.', 'success');
                              }}
                            />
                          </label>
                          <p className="mt-2 text-xs font-semibold text-[#8A8894]">PNG or JPG preview. In the real app this will save to Supabase storage.</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8A8894]">Display name</span>
                          <input
                            value={demoDisplayName}
                            onChange={(event) => {
                              if (isSandbox) {
                                setDemoProfileName(event.target.value);
                                return;
                              }
                              setUser((current) => current ? { ...current, name: event.target.value } : current);
                            }}
                            className="mt-2 w-full rounded-xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-bold text-[#2C2C2A] outline-none transition focus:border-[#7F77DD]"
                            placeholder="Kunal"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8A8894]">Work email</span>
                          <input
                            value={profileDisplayEmail}
                            onChange={(event) => {
                              if (isSandbox) setDemoProfileEmail(event.target.value);
                            }}
                            disabled={!isSandbox}
                            className={`mt-2 w-full rounded-xl border border-[#DAD7FB] px-4 py-3 text-sm font-bold text-[#2C2C2A] outline-none transition focus:border-[#7F77DD] ${isSandbox ? 'bg-white' : 'cursor-not-allowed bg-[#F7F7FB] text-[#5F5E5A]'}`}
                            placeholder="employee@nudgehq.com"
                          />
                          {!isSandbox && (
                            <p className="mt-2 text-xs font-semibold text-[#8A8894]">
                              This is your registered login email. Ask HR or Admin to change it.
                            </p>
                          )}
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isSandbox && user) window.localStorage.setItem('nudgehq_auth_user', JSON.stringify(user));
                          showToast(isSandbox ? 'Profile changes saved in demo.' : 'Profile changes saved.', 'success');
                        }}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7F77DD] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#3C3489]"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Save profile
                      </button>
                    </div>
                  </section>
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <h2 className="text-xl font-extrabold text-[#2C2C2A]">Preferences</h2>
                    <div className="mt-5 space-y-3">
                      {['Daily check-in reminders', 'Recognition notifications', 'NudgeAI tips'].map((item, index) => (
                        <div key={item} className="flex items-center justify-between rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <span className="text-sm font-extrabold text-[#2C2C2A]">{item}</span>
                          <span className={`h-7 w-12 rounded-full p-1 ${index === 1 ? 'bg-[#DAD7FB]' : 'bg-[#7F77DD]'}`}>
                            <span className={`block h-5 w-5 rounded-full bg-white shadow ${index === 1 ? '' : 'ml-5'}`} />
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 overflow-hidden rounded-2xl border border-[#DAD7FB] bg-gradient-to-br from-[#3C3489] via-[#7F77DD] to-[#1D9E75] p-5 text-white shadow-lg shadow-[#7F77DD]/20">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/80">
                        <Sparkles className="h-4 w-4" />
                        NudgeAI always on
                      </span>
                      <h3 className="mt-4 text-2xl font-extrabold">Stuck anywhere?</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white/80">
                        Use NudgeAI for task clarity, code doubts, update writing, blockers, or quick planning.
                      </p>
                      <button
                        type="button"
                        onClick={openDemoAiHelper}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                      >
                        Ask NudgeAI
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    {!isSandbox && (
                      <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-sm font-extrabold text-rose-700">Sign out of this workspace</h3>
                            <p className="mt-1 text-xs font-semibold leading-5 text-rose-500">
                              You will stay signed in on refresh. Use this only when you want to end your session.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-extrabold text-rose-600 transition hover:bg-rose-100"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {!isSandbox && (
                <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                  <div className="dashboard-panel rounded-[28px] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7F77DD]">Help us improve</p>
                    <h2 className="mt-2 text-2xl font-black text-[#2C2C2A]">Leave a review or tell us what to improve.</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#6E6B78]">
                      Your feedback directly shapes the OG dashboards. Tell us what feels slow, confusing, missing, or extra useful.
                    </p>
                    <form onSubmit={handleFeedbackCommentSubmit} className="mt-5 grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={feedbackCommentName}
                          onChange={(e) => setFeedbackCommentName(e.target.value)}
                          placeholder="Your name"
                          className="rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                        />
                        <select
                          value={feedbackCategory}
                          onChange={(e) => setFeedbackCategory(e.target.value)}
                          className="rounded-2xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                        >
                          {['Product feedback', 'Bug report', 'Improvement idea', 'Review'].map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={feedbackCommentText}
                        onChange={(e) => setFeedbackCommentText(e.target.value)}
                        placeholder="What should we improve in this dashboard?"
                        className="min-h-28 rounded-2xl border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]"
                      />
                      <button className="rounded-2xl bg-[#1C1739] px-4 py-3 text-sm font-black text-white">
                        Save feedback
                      </button>
                    </form>
                  </div>

                  <div className="dashboard-panel rounded-[28px] p-5">
                    <h2 className="text-xl font-black text-[#2C2C2A]">Recent workspace feedback</h2>
                    <div className="mt-5 space-y-3">
                      {feedbackComments.length ? feedbackComments.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-[#2C2C2A]">{item.name}</p>
                            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8A8894]">{item.time}</span>
                          </div>
                          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#7F77DD]">{item.category || 'Feedback'}</p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{item.comment}</p>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-5 text-sm font-semibold text-[#8A8894]">
                          No feedback yet. First review from this workspace will appear here.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <AnimatePresence>
                {selectedDemoTask && (
                  <motion.div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111827]/45 px-4 py-6 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={() => setSelectedDemoTask(null)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 24, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 24, scale: 0.96 }}
                      onMouseDown={(event) => event.stopPropagation()}
                      className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#E7E5F8] bg-white p-5 shadow-2xl shadow-[#3C3489]/20 sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">
                            {selectedDemoTask.group}
                          </span>
                          <h2 className="mt-3 text-2xl font-extrabold text-[#2C2C2A]">{selectedDemoTask.task}</h2>
                          <p className="mt-2 text-sm leading-6 text-[#5F5E5A]">Review the manager brief, update status, and attach proof before submitting.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDemoTask(null)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EEEDFE] text-[#5F5E5A] transition hover:bg-[#F7F6FF] hover:text-[#3C3489]"
                          aria-label="Close task details"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {[
                          ['Assigned to', selectedDemoTask.owner],
                          ['Due', selectedDemoTask.due],
                          ['Manager', selectedDemoTask.manager]
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8A8894]">{label}</p>
                            <p className="mt-2 text-sm font-extrabold text-[#2C2C2A]">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-xl border border-[#DAD7FB] bg-[#F7F6FF] p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3C3489]">
                            <ClipboardCheck className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3C3489]">Task description from manager</p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">{selectedDemoTask.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-extrabold text-[#2C2C2A]">Progress</p>
                          <p className="text-sm font-extrabold" style={{ color: selectedDemoTask.color }}>{selectedDemoTask.progress}%</p>
                        </div>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#EEEFF5]">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selectedDemoTask.progress}%`, backgroundColor: selectedDemoTask.color }} />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#5F5E5A]">Change status</label>
                          <div className="mt-2 grid gap-2">
                            {['Not started', 'In Progress', 'Blocked', 'Completed'].map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setSelectedDemoTask((task) => task ? {
                                  ...task,
                                  status,
                                  progress: status === 'Completed' ? 100 : status === 'Blocked' ? Math.min(task.progress, 35) : status === 'Not started' ? 0 : Math.max(task.progress, 45),
                                  color: status === 'Completed' ? '#1D9E75' : status === 'Blocked' ? '#EF4444' : status === 'Not started' ? '#8A8894' : '#7F77DD'
                                } : task)}
                                className={`rounded-xl border px-4 py-3 text-left text-sm font-extrabold transition ${
                                  selectedDemoTask.status === status
                                    ? 'border-[#7F77DD] bg-[#EEEDFE] text-[#3C3489]'
                                    : 'border-[#EEEDFE] text-[#5F5E5A] hover:bg-[#FCFCFF]'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#5F5E5A]">Submit update</label>
                          <textarea
                            value={demoTaskUpdate}
                            onChange={(event) => setDemoTaskUpdate(event.target.value)}
                            placeholder="Write what you completed, what changed, blockers, and what proof you attached..."
                            className="mt-2 min-h-36 w-full resize-none rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-sm font-semibold leading-6 text-[#2C2C2A] outline-none transition placeholder:text-[#A7A4AF] focus:border-[#7F77DD] focus:bg-white focus:ring-4 focus:ring-[#EEEDFE]"
                          />
                          <div className="mt-3 grid gap-2">
                            <label
                              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-[#C9C5F6] bg-white px-4 py-3 text-left transition hover:border-[#7F77DD] hover:bg-[#F7F6FF]"
                            >
                              <span className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEDFE] text-[#3C3489]">
                                  <FileCheck2 className="h-5 w-5" />
                                </span>
                                <span>
                                  <span className="block text-sm font-extrabold text-[#2C2C2A]">Upload PDF proof</span>
                                  <span className="block text-xs font-semibold text-[#8A8894]">Report, invoice, doc, or export file</span>
                                </span>
                              </span>
                              <Plus className="h-4 w-4 text-[#7F77DD]" />
                              <input
                                type="file"
                                accept="application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                                className="hidden"
                                onChange={(event) => {
                                  const files = Array.from(event.target.files || []);
                                  setDemoProofFiles((current) => [...current, ...files.map((file) => ({ name: file.name, type: 'PDF/File proof' }))]);
                                  event.target.value = '';
                                }}
                              />
                            </label>
                            <label
                              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-[#C9C5F6] bg-white px-4 py-3 text-left transition hover:border-[#7F77DD] hover:bg-[#F7F6FF]"
                            >
                              <span className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F1] text-[#1D9E75]">
                                  <ClipboardCheck className="h-5 w-5" />
                                </span>
                                <span>
                                  <span className="block text-sm font-extrabold text-[#2C2C2A]">Upload screenshot</span>
                                  <span className="block text-xs font-semibold text-[#8A8894]">Design proof, error screen, or completed work</span>
                                </span>
                              </span>
                              <Plus className="h-4 w-4 text-[#1D9E75]" />
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
                                className="hidden"
                                onChange={(event) => {
                                  const files = Array.from(event.target.files || []);
                                  setDemoProofFiles((current) => [...current, ...files.map((file) => ({ name: file.name, type: 'Screenshot proof' }))]);
                                  event.target.value = '';
                                }}
                              />
                            </label>
                            <input
                              type="url"
                              value={demoProofLink}
                              onChange={(event) => setDemoProofLink(event.target.value)}
                              placeholder="Paste proof link: Google Drive, GitHub, Figma, Notion, sheet..."
                              className="rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3 text-sm font-semibold text-[#2C2C2A] outline-none transition placeholder:text-[#A7A4AF] focus:border-[#7F77DD] focus:bg-white focus:ring-4 focus:ring-[#EEEDFE]"
                            />
                            {demoProofFiles.length || demoProofLink ? (
                              <div className="rounded-xl border border-[#E8F7F1] bg-[#F3FBF8] p-3">
                                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1D9E75]">Attached proof</p>
                                <div className="mt-2 space-y-1">
                                  {demoProofFiles.map((file, index) => (
                                    <p key={`${file.name}-${index}`} className="text-xs font-semibold text-[#2C2C2A]">
                                      {file.type}: {file.name}
                                    </p>
                                  ))}
                                  {demoProofLink ? (
                                    <p className="break-all text-xs font-semibold text-[#2C2C2A]">Proof link: {demoProofLink}</p>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className="mt-3 rounded-xl border border-[#DAD7FB] bg-[#F7F6FF] p-3 text-xs font-semibold leading-5 text-[#5F5E5A]">
                            <span className="font-extrabold text-[#3C3489]">NudgeAI:</span> Nice. Attach a PDF, screenshot, or proof link so your manager can review without chasing.
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => {
                            const proofCount = demoProofFiles.length + (demoProofLink ? 1 : 0);
                            setDemoTaskOverrides((current) => ({
                              ...current,
                              [selectedDemoTask.task]: {
                                status: selectedDemoTask.status,
                                progress: selectedDemoTask.progress,
                                color: selectedDemoTask.color,
                              }
                            }));
                            showToast(`${isSandbox ? 'Demo task' : 'Task'} update submitted${proofCount ? ` with ${proofCount} proof item${proofCount > 1 ? 's' : ''}` : ''}.`, 'success');
                            setSelectedDemoTask(null);
                          }}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7F77DD] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#3C3489]"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Submit update
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDemoTask((task) => task ? { ...task, status: 'Blocked', color: '#EF4444', progress: Math.min(task.progress, 35) } : task)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-600 transition hover:bg-rose-100"
                        >
                          <AlertCircle className="h-4 w-4" />
                          Mark blocker
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-2 rounded-2xl border border-[#EEEDFE] bg-white/95 p-2 shadow-2xl shadow-[#3C3489]/12 backdrop-blur lg:hidden">
                {demoSidebarItems.slice(0, 4).map(([label, Icon], index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleDashboardSectionSelect(label)}
                    className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-extrabold ${(demoDashboardCanNavigate ? activeDashboardSection === label : index === 0) ? 'bg-[#7F77DD] text-white' : 'text-[#6E6B78]'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label.replace('My ', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {shouldRenderLegacyDashboard && (
        <section
          className={`workspace-surface workspace-surface-${dashboardRole} relative min-h-screen overflow-hidden px-5 py-8 sm:px-6 lg:px-8`}
          style={{
            '--role-accent': roleTheme.accent,
            '--role-strong': roleTheme.strong,
            '--role-soft': roleTheme.soft,
            '--role-glow': roleTheme.glow
          }}
        >
          <div className="soft-grid absolute inset-x-0 top-0 -z-10 h-[34rem] opacity-45" />

          {/* Top Header Navigation */}
          <div className="mb-8 flex items-center justify-between border-b border-[#EEEDFE]/80 pb-5">
            <div className="flex items-center gap-3">
              <img src="/brand/nudgehq-icon.svg" alt="" className="h-10 w-10 rounded-xl shadow-md" />
              <div>
                <span className="text-base font-extrabold tracking-tight text-[#1C1739]">NudgeHQ</span>
                <span className="ml-2.5 rounded bg-[#FCFCFF] border border-[#EEEDFE] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3C3489]">Live Workspace</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>

          {authRole === 'admin' && user?.organizations?.plan === 'free_trial' ? (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-extrabold text-[#92400E]">
                Your free trial ends in {Math.max(0, Math.ceil((new Date(user.organizations.trial_ends_at).getTime() - Date.now()) / 86400000)) || 14} days - Upgrade to keep access
              </p>
              <button type="button" onClick={() => setCurrentView('choose_plan')} className="rounded-md bg-[#3C3489] px-4 py-2 text-sm font-bold text-white hover:bg-[#7F77DD]">
                Upgrade now
              </button>
            </div>
          ) : null}
          
          {authRole === 'manager' ? (
            <section className="mb-8 rounded-[30px] border border-[#D7E2F0] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#f5f0ff_100%)] p-6 shadow-[0_18px_50px_rgba(28,23,57,0.08)] sm:p-7">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#1C1739] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white">
                    <Zap className="h-3.5 w-3.5" />
                    Manager Team HQ
                  </span>
                  <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#1C1739] sm:text-4xl">
                    Run your team from live signals, not scattered follow-ups.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A] sm:text-base">
                    Morning brief, blockers, proof checks, NudgeAI coaching, and WhatsApp nudges now sit in one focused manager flow.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#5F5E5A]">
                    <span className="rounded-full border border-[#DAD7FB] bg-white px-3 py-1.5 font-semibold">{user?.name || 'Manager User'}</span>
                    <span className="rounded-full border border-[#DAD7FB] bg-white px-3 py-1.5 font-semibold">{user?.email}</span>
                    <span className="rounded-full border border-[#DAD7FB] bg-white px-3 py-1.5 font-semibold capitalize">{authRole || 'manager'}</span>
                    <span className="rounded-full border border-[#DAD7FB] bg-white px-3 py-1.5 font-semibold">{roleTheme.badge}</span>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  {['Daily Signals', 'Blockers', 'NudgeAI', 'WhatsApp'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => activateManagerFocusTab(tab)}
                      className={`rounded-full px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] transition ${
                        activeManagerFocusTab === tab
                          ? 'bg-[#1C1739] text-white shadow-[0_14px_28px_rgba(28,23,57,0.22)]'
                          : 'border border-[#DAD7FB] bg-white text-[#3C3489] hover:border-[#BEB7FF] hover:bg-[#F8F6FF]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* Welcome User Header */}
              <div className={`command-surface command-surface-${dashboardRole} relative overflow-hidden rounded-[1.75rem] p-6 text-white shadow-2xl sm:p-8`}>
                <div className="soft-grid absolute inset-0 opacity-10" />
                <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: roleAccent }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                        {getDashboardLabel(authRole)}
                      </span>
                    </div>
                    <h2 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-5xl">
                      {getDashboardHeadline(authRole)}
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">
                      {getDashboardCopy(authRole)}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/78">
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-semibold">{user?.name || 'Demo User'}</span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-semibold">{user?.email}</span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-semibold capitalize">{authRole || 'employee'}</span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-semibold">{roleTheme.badge}</span>
                      {user?.organizations?.name ? (
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-semibold">{user.organizations.name}</span>
                      ) : null}
                    </div>
                    {user?.role === 'admin' || getDemoUserFromEmail(user?.email || '').role === 'admin' ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {['admin', 'hr', 'manager', 'employee'].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => navigateDashboard(role)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-extrabold capitalize transition ${authRole === role ? 'border-white bg-white text-[#3C3489]' : 'border-white/15 bg-white/10 text-white/75 hover:bg-white/20'}`}
                          >
                            Preview {role}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="role-glow-card rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl shadow-black/10 backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Live Command View</p>
                        <p className="mt-2 text-2xl font-extrabold text-white">{getDashboardHubName(authRole)}</p>
                      </div>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg" style={{ color: roleAccent }}>
                        <Sparkles className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {[
                        ['NudgeAI', 'Live'],
                        [isLeaderDashboard ? 'People' : 'Tasks', isLeaderDashboard ? `${adminUsers.length || analytics?.summary?.totalEmployees || 0}` : `${empTasks.length}`],
                        ['Sync', 'Ready']
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-white/10 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">{label}</p>
                          <p className="mt-1 text-sm font-extrabold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3">
                      {roleSignals.map(([label, value]) => (
                        <div key={label} className="role-signal-card flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-white/60">{label}</span>
                          <span className="max-w-[11rem] truncate text-right text-sm font-extrabold text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={refreshDashboardData}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Workspace
                    </button>
                  </div>
                </div>

                <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {roleMetricCards.map(([title, copy, Icon, color]) => (
                    <div key={title} className="metric-lift role-metric-card rounded-2xl border border-white/15 bg-white/10 p-5 shadow-sm backdrop-blur">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color }}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-base font-extrabold text-white">{title}</p>
                          <p className="mt-1 text-xs leading-5 text-white/70">{copy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="role-scope-card mt-7 grid gap-4 rounded-[1.5rem] p-4 sm:p-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-white/70 bg-white/82 p-5 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em]" style={{ color: roleAccent }}>
                    Role Access Map
                  </p>
                  <h3 className="mt-3 text-2xl font-extrabold text-[#2C2C2A]">
                    {getDashboardLabel(authRole)} gets a focused workspace.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5F5E5A]">
                    Each dashboard now opens with only the controls that role should naturally use, so the product feels cleaner and more professional as the company grows.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {roleScopeCards.map(([title, copy, Icon]) => (
                    <div key={title} className="metric-lift rounded-2xl border border-[#E6E3FF] bg-white p-4 shadow-sm">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: roleTheme.soft, color: roleAccent }}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-sm font-extrabold text-[#2C2C2A]">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-[#5F5E5A]">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!demoEmployeeCanNavigate && selectedDemoSection === 'NudgeSpace' && (
            <section className="mt-7 space-y-6">
              <div className="overflow-hidden rounded-[32px] border border-[#D9D6FF] bg-[linear-gradient(135deg,_#ffffff_0%,_#f8f6ff_48%,_#f3fff8_100%)] p-6 shadow-[0_24px_80px_rgba(60,52,137,0.14)]">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-3xl">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#1C1739] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Scoped to {dashboardRoleLabel}
                    </span>
                    <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#1C1739] sm:text-4xl">
                      {nudgeSpaceRoleCopy.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A] sm:text-base">
                      {nudgeSpaceRoleCopy.copy}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['Social', 'U Space'].map((view) => (
                      <button
                        key={view}
                        type="button"
                          onClick={() => handleNudgeSpaceViewChange(view)}
                        className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition ${
                          demoNudgeSpaceView === view
                            ? 'bg-[#1C1739] text-white shadow-[0_14px_30px_rgba(28,23,57,0.28)]'
                            : 'border border-[#D9D6FF] bg-white text-[#5F5E5A] hover:border-[#BEB7FF] hover:text-[#1C1739]'
                        }`}
                      >
                        {view === 'Social' ? <MessageSquareText className="h-4 w-4" /> : <ListTodo className="h-4 w-4" />}
                        {view}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {demoNudgeSpaceView === 'Social' ? (
                <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                  <section className="space-y-5">
                    <div className="rounded-[28px] bg-[linear-gradient(145deg,_#140F29,_#2E255E)] p-5 text-white shadow-[0_18px_50px_rgba(20,15,41,0.35)]">
                      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#8EF0CD]">Social feed</p>
                      <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">Post updates for the right audience</h3>
                      <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/75">
                        Announcements, recognitions, blockers, questions, and ideas stay scoped to this dashboard.
                      </p>

                      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                        <div className="mb-3 flex flex-wrap gap-2">
                          {['announcement', 'win', 'question', 'idea'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setNudgeSpacePostType(type)}
                              className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${nudgeSpacePostType === type ? 'bg-white text-[#120F24]' : 'border border-white/10 bg-white/10 text-white/75'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={4}
                          value={nudgeSpaceDraft}
                          onChange={(event) => setNudgeSpaceDraft(event.target.value)}
                          className="w-full resize-none rounded-[22px] border border-white/10 bg-white p-4 text-sm font-semibold text-[#1C1739] outline-none transition focus:border-[#8EF0CD] focus:ring-4 focus:ring-[#8EF0CD]/20"
                          placeholder="Draft a workspace post, recognition, blocker note, or quick team question..."
                        />
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs font-bold text-white/65">{nudgeSpaceRoleCopy.visibility}</p>
                          <button
                            type="button"
                            onClick={submitNudgeSpacePost}
                            disabled={nudgeSpaceSaving}
                            className="inline-flex items-center gap-2 rounded-full bg-[#8EF0CD] px-5 py-3 text-sm font-extrabold text-[#10211C] transition hover:bg-[#B5F6DE] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {nudgeSpaceSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {nudgeSpaceSaving ? 'Posting...' : 'Post to Social'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {renderNudgeSpacePostList({
                      emptyTitle: 'No Social posts yet',
                      emptySub: 'Scoped workspace posts will appear here once someone posts from an OG account.',
                      emptyIcon: MessageSquareText
                    })}
                  </section>

                  <aside className="space-y-5">
                    <section className="rounded-[28px] border border-[#D9D6FF] bg-white p-5 shadow-[0_16px_40px_rgba(29,158,117,0.12)]">
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1D9E75]">Visibility</p>
                      <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#1C1739]">Right audience, no noise.</h3>
                      <div className="mt-5 grid gap-3">
                        {[
                          ['Post scope', dashboardRole === 'admin' ? 'Company-wide' : dashboardRole === 'hr' ? 'People + culture' : 'Department only'],
                          ['Moderation', dashboardRole === 'admin' ? 'Full control' : dashboardRole === 'hr' ? 'People posts' : 'Team feed'],
                          ['NudgeAI assist', 'Turn posts into summaries']
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-4 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3">
                            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8A8894]">{label}</span>
                            <span className="text-sm font-extrabold text-[#2C2C2A]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[28px] bg-[linear-gradient(145deg,_#1C1739,_#12795C)] p-5 text-white shadow-[0_18px_45px_rgba(28,23,57,0.28)]">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/75">
                        <Zap className="h-4 w-4" />
                        NudgeAI x Social
                      </span>
                      <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">Convert posts into signals.</h3>
                      <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
                        Summarize open questions, repeated blockers, and useful next actions.
                      </p>
                      <button
                        type="button"
                        onClick={openDemoAiHelper}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#1C1739] transition hover:bg-[#EEEDFE]"
                      >
                        Ask NudgeAI
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </section>
                  </aside>
                </div>
              ) : (
                <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                  <section className="rounded-[28px] border border-[#D9D6FF] bg-white p-5 shadow-[0_20px_48px_rgba(127,119,221,0.14)]">
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6D63D9]">U Space</p>
                    <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#1C1739]">Private planning for this role</h3>
                    <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                      Keep private goals, follow-ups, reminders, and focus blocks separate from the shared Social feed.
                    </p>
                    <div className="mt-6 rounded-[24px] border border-[#ECE8FF] bg-[#FBFAFF] p-4">
                      <textarea
                        rows={4}
                        value={nudgeSpaceDraft}
                        onChange={(event) => setNudgeSpaceDraft(event.target.value)}
                        className="w-full resize-none rounded-[22px] border border-[#DAD7FB] bg-white p-4 text-sm font-semibold text-[#1C1739] outline-none transition focus:border-[#7F77DD] focus:ring-4 focus:ring-[#EEEDFE]"
                        placeholder="Add a private goal, reminder, or focus note..."
                      />
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={submitNudgeSpacePost}
                          disabled={nudgeSpaceSaving}
                          className="inline-flex items-center gap-2 rounded-full bg-[#1C1739] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#3C3489] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {nudgeSpaceSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          {nudgeSpaceSaving ? 'Saving...' : 'Save to U Space'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-6">
                      {renderNudgeSpacePostList({
                        emptyTitle: 'No private goals yet',
                        emptySub: 'Role-specific goals and focus blocks saved from this OG account will appear here.',
                        emptyIcon: ListTodo
                      })}
                    </div>
                  </section>

                  <aside className="space-y-5">
                    <section className="rounded-[28px] bg-[#120F24] p-5 text-white shadow-[0_18px_55px_rgba(18,15,36,0.35)]">
                      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#8EF0CD]">Today map</p>
                      <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">Focus blocks will appear here</h3>
                      <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
                        Saved private planning, reminders, and focus notes sync from live U Space.
                      </p>
                    </section>

                    <section className="rounded-[28px] bg-[linear-gradient(160deg,_#3C3489_0%,_#7F77DD_60%,_#1D9E75_120%)] p-5 text-white shadow-[0_18px_45px_rgba(60,52,137,0.28)]">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">
                        <Sparkles className="h-4 w-4" />
                        NudgeAI for U Space
                      </span>
                      <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">Need a sharper plan?</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white/80">Use NudgeAI to turn loose thoughts into a focused priority list or post draft.</p>
                      <button
                        type="button"
                        onClick={openDemoAiHelper}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                      >
                        Ask NudgeAI
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </section>
                  </aside>
                </div>
              )}
            </section>
          )}

          {/* --- SUBVIEW: EMPLOYEE WORKSPACE --- */}
          {isEmployeeDashboard && (
            <div className="mt-8 space-y-7">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {realEmployeeStatCards.map(([label, value, Icon, color, trend, trendType]) => (
                  <div key={label} className="workspace-card metric-lift rounded-2xl p-5 transition hover:shadow-lg hover:shadow-[#3C3489]/10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-extrabold text-[#5F5E5A]">{label}</p>
                        <p className="mt-3 text-4xl font-black text-[#111827]">{value}</p>
                      </div>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}14`, color }}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className={`mt-3 text-xs font-extrabold ${trendType === 'up' ? 'text-[#1D9E75]' : trendType === 'down' ? 'text-rose-500' : 'text-[#8A8894]'}`}>
                      {trend}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(26rem,0.85fr)]">
                <div className="workspace-card rounded-2xl p-6 transition hover:shadow-lg hover:shadow-[#3C3489]/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-[#2C2C2A]">My Tasks</h3>
                      <p className="mt-1 text-sm font-semibold text-[#8A8894]">Only work assigned to you appears here.</p>
                    </div>
                    <span className="w-fit rounded-full bg-[#EEEDFE] px-4 py-2 text-xs font-black text-[#3C3489]">
                      {realEmployeeTaskRows.length || 0} active signals
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {!realEmployeeTaskRows.length ? renderEmptyState({
                      title: 'No tasks assigned yet',
                      sub: 'Your manager will assign tasks soon. Check back here!',
                      Icon: ClipboardCheck
                    }) : realEmployeeTaskRows.map((task) => {
                      const progress = realEmployeeProgressForStatus(task.status);
                      const color = realEmployeeColorForStatus(task.status);
                      return (
                        <div key={task.id} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#3C3489]/8">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ backgroundColor: color }}>
                                {(task.title || 'T').slice(0, 1).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-base font-black text-[#2C2C2A]">{task.title || 'Untitled task'}</p>
                                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-[#8A8894]">
                                  {task.description || 'Manager description will appear here once added.'}
                                </p>
                              </div>
                            </div>
                            <div className="min-w-[14rem]">
                              <div className="flex items-center gap-3">
                                <div className="h-2 flex-1 rounded-full bg-[#ECEAF8]">
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: color }} />
                                </div>
                                <span className="w-10 text-right text-sm font-black text-[#2C2C2A]">{progress}%</span>
                              </div>
                              <div className="mt-3 flex flex-wrap justify-end gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-black ${realEmployeeStatusClass(task.status)}`}>
                                  {realEmployeeStatusLabel(task.status)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EEEDFE] pt-4">
                            {[
                              ['todo', 'Not started'],
                              ['in_progress', 'Start'],
                              ['completed', 'Mark done'],
                              ['blocked', 'Flag blocker'],
                            ].map(([status, label]) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleUpdateStatusClick(task, status)}
                                disabled={normalizeTaskStatus(task.status) === status}
                                className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                                  normalizeTaskStatus(task.status) === status
                                    ? 'border-[#7F77DD] bg-[#7F77DD] text-white'
                                    : 'border-[#DAD7FB] bg-white text-[#3C3489] hover:bg-[#EEEDFE]'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="workspace-card rounded-2xl p-6 transition hover:shadow-lg hover:shadow-[#3C3489]/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-black text-[#2C2C2A]">Today&apos;s Check-in</h3>
                      <p className="mt-1 text-sm font-semibold text-[#8A8894]">Blank daily form for today&apos;s location, energy, and goals.</p>
                    </div>
                    <Sparkles className="h-6 w-6 text-[#7F77DD]" />
                  </div>

                  <form onSubmit={handleCheckinSubmit} className="mt-5 space-y-4 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#7F77DD]">Where are you working today?</p>
                      <div className="flex flex-wrap gap-2">
                        {realEmployeeLocationPills.map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setWorkLocation(value)}
                            className={`rounded-full px-4 py-2 text-xs font-black transition ${
                              workLocation === value
                                ? 'bg-[#7F77DD] text-white shadow-lg shadow-[#7F77DD]/20'
                                : 'border border-[#D3D1C7] bg-white text-[#5F5E5A] hover:bg-[#EEEDFE]'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#7F77DD]">Energy level</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['high', 'medium', 'low'].map((level) => (
                          <button key={level} type="button" onClick={() => setEnergyLevel(level)} className={`rounded-xl border px-3 py-2 text-xs font-black capitalize ${energyLevel === level ? 'border-[#7F77DD] bg-[#EEEDFE] text-[#3C3489]' : 'border-[#E8E6F8] bg-white text-[#5F5E5A]'}`}>
                            {level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      {goals.map((goal, index) => (
                        <input
                          key={index}
                          value={goal}
                          onChange={(e) => setGoals(goals.map((item, i) => i === index ? e.target.value : item))}
                          placeholder={`Goal ${index + 1}`}
                          className="rounded-xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#7F77DD]"
                        />
                      ))}
                    </div>
                    <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3C3489] px-5 py-3 text-sm font-black text-white transition hover:bg-[#7F77DD]">
                      <CheckCircle2 className="h-4 w-4" />
                      Save daily check-in
                    </button>
                  </form>

                  <form onSubmit={handleProgressSubmit} className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7F77DD]">Progress update</p>
                      <p className="mt-1 text-xs font-semibold text-[#8A8894]">This is what feeds manager visibility, activity, and your progress curve.</p>
                    </div>
                    <select
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="block w-full rounded-xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#7F77DD]"
                    >
                      <option value="">General update / no task link</option>
                      {realEmployeeTasks.map((task) => (
                        <option key={task.id} value={task.id}>{task.title} ({realEmployeeStatusLabel(task.status)})</option>
                      ))}
                    </select>
                    <textarea
                      value={progressText}
                      onChange={(e) => setProgressText(e.target.value)}
                      placeholder="Write what changed, what got done, and what is blocked..."
                      className="block min-h-28 w-full rounded-xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#7F77DD]"
                      required
                    />
                    <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                      <input
                        type="text"
                        value={focusText}
                        onChange={(e) => setFocusText(e.target.value)}
                        placeholder="Main focus right now"
                        className="rounded-xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#7F77DD]"
                      />
                      <select value={focusEta} onChange={(e) => setFocusEta(e.target.value)} className="rounded-xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-semibold outline-none">
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this_week">This Week</option>
                      </select>
                    </div>
                    <input
                      type="url"
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      placeholder="Proof link: docs, drive, github, screenshot URL..."
                      className="block w-full rounded-xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#7F77DD]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingUpdate}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7F77DD] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#7F77DD]/20 transition hover:bg-[#3C3489] disabled:opacity-50"
                    >
                      {isSubmittingUpdate ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Submit progress update
                    </button>
                    {qualityTip ? (
                      <div className="rounded-xl border border-[#DAD7FB] bg-[#F4F3FF] p-3 text-xs font-bold leading-6 text-[#3C3489]">
                        <span className="font-black">NudgeAI tip:</span> {qualityTip}
                      </div>
                    ) : null}
                  </form>
                </div>
              </div>

              <div className="grid gap-7 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="workspace-card rounded-2xl p-6 transition hover:shadow-lg hover:shadow-[#3C3489]/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-black text-[#2C2C2A]">My Progress</h3>
                      <p className="mt-1 text-sm font-semibold text-[#8A8894]">Your weekly completion curve.</p>
                    </div>
                    <LineChartIcon className="h-6 w-6 text-[#7F77DD]" />
                  </div>
                  <div className="mt-5 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={weeklyProgressData} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke="#EEEDFE" strokeDasharray="4 4" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#8A8894', fontSize: 12, fontWeight: 700 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#8A8894', fontSize: 12, fontWeight: 700 }} />
                        <Tooltip formatter={(value) => [`${value} tasks completed`, 'Progress']} contentStyle={{ borderRadius: 14, borderColor: '#DAD7FB' }} />
                        <Line type="monotone" dataKey="tasks" stroke="#7F77DD" strokeWidth={4} dot={{ r: 5, fill: '#7F77DD', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 7 }} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="workspace-card rounded-2xl p-6 transition hover:shadow-lg hover:shadow-[#3C3489]/10">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-black text-[#2C2C2A]">Recent Activity</h3>
                    <Activity className="h-6 w-6 text-[#7F77DD]" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {!realEmployeeRecentActivity.length ? (
                      <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-6 text-center text-sm font-bold text-[#8A8894]">
                        No activity yet - submit your first check-in to get started!
                      </div>
                    ) : realEmployeeRecentActivity.map(({ id, Icon, color, title, copy, when }) => (
                      <div key={id} className="flex items-start gap-3 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}14`, color }}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-black text-[#2C2C2A]">{title}</p>
                            <span className="shrink-0 text-[11px] font-bold text-[#8A8894]">{when}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[#8A8894]">{copy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-7 xl:grid-cols-3">
                <div className="workspace-card rounded-2xl p-6 transition hover:shadow-lg hover:shadow-[#3C3489]/10">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-[#2C2C2A]">Growth Portal</h3>
                    <PoweredByNudgeAi />
                  </div>
                  <button type="button" onClick={loadGrowthSummary} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#DAD7FB] px-4 py-2.5 text-xs font-black text-[#3C3489] transition hover:bg-[#EEEDFE]">
                    <Sparkles className="h-4 w-4" />
                    {growthLoading ? 'Building summary...' : 'Generate 90-day summary'}
                  </button>
                  {growthSummary ? (
                    <div className="mt-4 space-y-3 text-sm">
                      <p className="rounded-xl bg-[#FCFCFF] p-4 font-semibold leading-6 text-[#2C2C2A]">{growthSummary.summary}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <span className="rounded-xl bg-[#E8F7F1] p-3 text-xs font-black text-[#1D9E75]">{growthSummary.completed_tasks} tasks</span>
                        <span className="rounded-xl bg-[#F4F3FF] p-3 text-xs font-black text-[#3C3489]">{growthSummary.completion_rate}%</span>
                        <span className="rounded-xl bg-amber-50 p-3 text-xs font-black text-amber-700">{growthSummary.streak_days?.length || 0} streak</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl bg-[#FCFCFF] p-4 text-sm font-semibold leading-6 text-[#8A8894]">
                      Your story is just beginning. Keep checking in daily and NudgeAI will start building your growth snapshot.
                    </p>
                  )}
                </div>

                <div className="workspace-card rounded-2xl p-6 transition hover:shadow-lg hover:shadow-[#3C3489]/10">
                  <h3 className="flex items-center gap-2 text-xl font-black text-[#2C2C2A]">
                    <Clock3 className="h-5 w-5 text-[#7F77DD]" />
                    Deep Work
                  </h3>
                  {activeDeepWork ? (
                    <div className="mt-4 rounded-2xl bg-[#F4F3FF] p-4">
                      <p className="text-sm font-black text-[#3C3489]">In Deep Work until {formatDisplayDate(activeDeepWork.end_time)}</p>
                      <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">{activeDeepWork.focus_declared}</p>
                      <textarea
                        value={deepWorkOutput}
                        onChange={(e) => setDeepWorkOutput(e.target.value)}
                        placeholder="What did you accomplish?"
                        className="mt-4 block min-h-24 w-full rounded-xl border border-[#DAD7FB] px-3 py-2 text-sm font-semibold outline-none"
                      />
                      <button type="button" onClick={endDeepWorkSession} className="mt-3 rounded-xl bg-[#3C3489] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#7F77DD]">
                        Log output
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={startDeepWorkSession} className="mt-4 grid gap-3">
                      <input value={deepWorkFocus} onChange={(e) => setDeepWorkFocus(e.target.value)} placeholder="What will you work on?" className="rounded-xl border border-[#DAD7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#7F77DD]" />
                      <select value={deepWorkDuration} onChange={(e) => setDeepWorkDuration(e.target.value)} className="rounded-xl border border-[#DAD7FB] bg-white px-4 py-3 text-sm font-semibold outline-none">
                        <option value={60}>1 hr</option>
                        <option value={120}>2 hr</option>
                        <option value={180}>3 hr</option>
                        <option value={45}>Custom: 45 min</option>
                      </select>
                      <button type="submit" className="rounded-xl bg-[#7F77DD] px-4 py-3 text-xs font-black text-white transition hover:bg-[#3C3489]">
                        Start Deep Work
                      </button>
                    </form>
                  )}
                </div>

                <div className="workspace-card rounded-2xl p-6 transition hover:shadow-lg hover:shadow-[#3C3489]/10">
                  <h3 className="flex items-center gap-2 text-xl font-black text-[#2C2C2A]">
                    <Trophy className="h-5 w-5 text-[#F59E0B]" />
                    Recognition
                  </h3>
                  <div className="mt-4 space-y-3">
                    {notifications.length ? notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <p className="text-sm font-bold leading-6 text-[#2C2C2A]">{notification.message}</p>
                        <p className="mt-2 text-[11px] font-bold text-[#8A8894]">{formatDisplayDate(notification.created_at)}</p>
                      </div>
                    )) : (
                      <p className="rounded-2xl bg-[#FCFCFF] p-4 text-sm font-semibold leading-6 text-[#8A8894]">
                        Recognition from your manager or HR will appear here.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openDemoAiHelper}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#15112E] px-4 py-3 text-sm font-black text-white transition hover:bg-[#3C3489]"
                  >
                    Stuck anywhere? Use NudgeAI
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {activeBlockTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1035]/45 px-5 py-8 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-black text-rose-600">Declare Task Blocker</h4>
                        <p className="mt-2 text-sm font-semibold text-[#5F5E5A]">
                          Task: <strong>{activeBlockTask.title}</strong>
                        </p>
                      </div>
                      <button onClick={() => setActiveBlockTask(null)} className="rounded-full p-2 text-[#5F5E5A] hover:bg-[#F4F3FF] hover:text-[#2C2C2A]">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <textarea
                      value={blockerTextVal}
                      onChange={(e) => setBlockerTextVal(e.target.value)}
                      placeholder="What is blocking this task? Mention what you tried and who can unblock it."
                      className="mt-5 block min-h-28 w-full rounded-xl border border-[#DAD7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-rose-500"
                      required
                    />
                    <div className="mt-5 flex justify-end gap-3">
                      <button type="button" onClick={() => setActiveBlockTask(null)} className="rounded-xl border border-[#DAD7FB] px-4 py-2.5 text-xs font-black text-[#5F5E5A] hover:bg-[#EEEDFE]">
                        Cancel
                      </button>
                      <button type="button" onClick={() => updateTaskStatusApi(activeBlockTask.id, 'blocked', blockerTextVal)} disabled={!blockerTextVal.trim()} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-700 disabled:opacity-50">
                        Submit Blocker
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {whatsappPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1035]/45 px-5 py-8 backdrop-blur-sm">
                  <div className="max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                    <div className="flex items-start justify-between border-b border-[#EEEDFE] p-6">
                      <div>
                        <h4 className="text-2xl font-black text-[#2C2C2A]">Send WhatsApp Nudge</h4>
                        <p className="mt-2 text-sm font-semibold text-[#5F5E5A]">Choose employees who should receive today&apos;s reminder.</p>
                      </div>
                      <button type="button" onClick={() => setWhatsappPreviewOpen(false)} className="rounded-full p-2 text-[#5F5E5A] hover:bg-[#F4F3FF] hover:text-[#2C2C2A]">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="max-h-[52vh] overflow-y-auto p-6">
                      {whatsappPreviewEmployees.length ? (
                        <div className="space-y-3">
                          {whatsappPreviewEmployees.map((employee) => {
                            const disabled = employee.submitted_today || employee.already_nudged_today || !employee.phone_number;
                            const checked = selectedWhatsAppEmployees.includes(employee.id);
                            return (
                              <label key={employee.id} className={`flex items-center gap-4 rounded-2xl border p-4 ${disabled ? 'border-[#EEEDFE] bg-[#F7F7FA] opacity-60' : 'border-[#DAD7FB] bg-white'}`}>
                                <input
                                  type="checkbox"
                                  disabled={disabled}
                                  checked={checked}
                                  onChange={(event) => {
                                    setSelectedWhatsAppEmployees((items) => event.target.checked
                                      ? [...items, employee.id]
                                      : items.filter((id) => id !== employee.id)
                                    );
                                  }}
                                  className="h-4 w-4 accent-[#7F77DD]"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-black text-[#2C2C2A]">{employee.name || employee.email}</p>
                                  <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">
                                    {employee.last_seen_label || 'Never submitted'}{employee.phone_number ? ` • ${employee.phone_number}` : ' • No phone number'}
                                  </p>
                                </div>
                                {employee.submitted_today ? <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-[11px] font-black text-[#1D9E75]">Submitted</span> : null}
                                {employee.already_nudged_today ? <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-[11px] font-black text-[#D97706]">Nudged</span> : null}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        renderEmptyState({
                          title: 'No employees found',
                          sub: 'Invite employees with phone numbers before sending WhatsApp nudges.',
                          Icon: UsersRound
                        })
                      )}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#EEEDFE] p-6 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-extrabold text-[#5F5E5A]">{selectedWhatsAppEmployees.length} selected</p>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setWhatsappPreviewOpen(false)} className="rounded-xl border border-[#DAD7FB] px-4 py-2.5 text-xs font-black text-[#5F5E5A] hover:bg-[#EEEDFE]">
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={sendWhatsAppNudges}
                          disabled={!selectedWhatsAppEmployees.length || whatsappNudgeLoading}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#7F77DD] px-5 py-2.5 text-xs font-black text-white hover:bg-[#3C3489] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {whatsappNudgeLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
                          Send to selected ({selectedWhatsAppEmployees.length})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- SUBVIEW: LEADER WORKSPACE --- */}
          {isLeaderDashboard && (
            <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.18fr)_minmax(22rem,0.82fr)]">
              
              {/* Admin Left Column */}
              <div className="space-y-7">
                {authRole === 'manager' ? (
                  <section id="manager-live-brief-section" className="overflow-hidden rounded-[28px] border border-[#D7E2F0] bg-white shadow-[0_18px_50px_rgba(28,23,57,0.10)]">
                    <div className="grid gap-0 xl:grid-cols-[1fr_1.05fr]">
                      <div className="bg-[#151326] p-6 text-white">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase text-[#8EF0CD]">
                              <Zap className="h-4 w-4" />
                              Manager Morning Brief
                            </p>
                            <h3 className="mt-3 text-3xl font-black text-white">Run today from signal, not status calls.</h3>
                            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
                              {nudgeAiData.standup?.generated_at ? `Generated ${formatDisplayDate(nudgeAiData.standup.generated_at)}` : 'Generate from live team signals'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => runNudgeAiFeature('standup', true)}
                            disabled={nudgeAiLoading.standup}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/15 disabled:opacity-60"
                          >
                            <RefreshCw className={`h-4 w-4 ${nudgeAiLoading.standup ? 'animate-spin' : ''}`} />
                            {nudgeAiLoading.standup ? 'Generating...' : 'Regenerate'}
                          </button>
                        </div>
                        <div className="mt-5 grid gap-3">
                          {managerStandupCards.slice(0, 4).map(([label, copy]) => (
                            <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                              <p className="text-xs font-black uppercase text-white/50">{label}</p>
                              <p className="mt-2 text-sm font-semibold leading-6 text-white/82">{copy}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase text-[#64748B]">Department graph</p>
                            <h3 className="mt-2 text-2xl font-black text-[#1C1739]">Output and update pulse</h3>
                          </div>
                          <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-black text-[#047857]">{managerActiveTodayLabel}</span>
                        </div>
                        <div className="mt-5 h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={managerChartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                              <CartesianGrid stroke="#EEF2F7" vertical={false} />
                              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 800 }} />
                              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} />
                              <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #E2E8F0', fontWeight: 700 }} />
                              <Bar dataKey="completed" fill="#1D9E75" radius={[8, 8, 0, 0]} />
                              <Bar dataKey="updates" fill="#3C3489" radius={[8, 8, 0, 0]} />
                              <Bar dataKey="blockers" fill="#EF4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {managerStatusMixData.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                              <p className="text-xs font-black uppercase text-[#64748B]">{item.label}</p>
                              <p className="mt-2 text-2xl font-black" style={{ color: item.fill }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                ) : (
                  <NudgeAiStandupCard
                    data={nudgeAiData.standup}
                    loading={nudgeAiLoading.standup}
                    onRegenerate={() => runNudgeAiFeature('standup', true)}
                  />
                )}

                {authRole === 'manager' ? (
                  <section id="manager-action-queue-section" className="rounded-[24px] border border-[#D7E2F0] bg-[#F8FAFC] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase text-[#64748B]">Manager action queue</p>
                        <h3 className="mt-2 text-xl font-black text-[#1C1739]">Convert risk into one-click actions.</h3>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <button
                          type="button"
                          onClick={() => document.getElementById('manager-create-task')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1739] px-4 py-3 text-sm font-extrabold text-white"
                        >
                          <Plus className="h-4 w-4" />
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={generateBoardPack}
                          disabled={boardPackLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm font-extrabold text-[#1C1739] disabled:opacity-60"
                        >
                          {boardPackLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          Export
                        </button>
                        <button
                          type="button"
                          onClick={openWhatsAppNudgePreview}
                          disabled={whatsappNudgeLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm font-extrabold text-[#1C1739] disabled:opacity-60"
                        >
                          {whatsappNudgeLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                          Nudge
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {managerPriorityActions.map(([label, value, copy, Icon, color]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleManagerPriorityAction(label)}
                          className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#CBD5E1] hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18`, color }}>
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="text-2xl font-black text-[#1C1739]">{value}</span>
                          </div>
                          <p className="mt-3 text-sm font-black text-[#1C1739]">{label}</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">{copy}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                {authRole === 'manager' ? (
                  <section className="workspace-card rounded-2xl p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7F77DD]">Manager action layer</p>
                        <h3 className="mt-2 text-2xl font-black text-[#2C2C2A]">Less chasing. More next actions.</h3>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                          These cards turn missing updates, blockers, proof requirements, and low-quality updates into manager actions.
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-[#E8F7F1] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1D9E75]">Live manager tools</span>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-3">
                      <div id="manager-no-updates-section" className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#EF4444]">No Update Alert</p>
                            <h4 className="mt-2 text-lg font-black text-[#2C2C2A]">{managerNoUpdateAlerts.length || 0} people need follow-up</h4>
                          </div>
                          <AlertCircle className="h-6 w-6 text-[#EF4444]" />
                        </div>
                        <div className="mt-4 space-y-3">
                          {managerNoUpdateAlerts.length ? managerNoUpdateAlerts.map((alert) => (
                            <div key={`${alert.name}-${alert.detail}`} className="rounded-xl bg-white p-3 ring-1 ring-[#EEEDFE]">
                              <p className="text-sm font-black text-[#2C2C2A]">{alert.name}</p>
                              <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">{alert.detail}</p>
                              <button type="button" onClick={openWhatsAppNudgePreview} className="mt-3 rounded-full bg-[#3C3489] px-3 py-1.5 text-[11px] font-black text-white">
                                {alert.action}
                              </button>
                            </div>
                          )) : (
                            <p className="rounded-xl border border-dashed border-[#DAD7FB] bg-white p-4 text-sm font-semibold text-[#5F5E5A]">
                              No missing updates found right now.
                            </p>
                          )}
                        </div>
                      </div>

                      <div id="manager-proof-required-section" className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F59E0B]">Proof Required Tasks</p>
                            <h4 className="mt-2 text-lg font-black text-[#2C2C2A]">{managerProofRequiredTasks.length || 0} proof checkpoints</h4>
                          </div>
                          <FileCheck2 className="h-6 w-6 text-[#F59E0B]" />
                        </div>
                        <div className="mt-4 space-y-3">
                          {managerProofRequiredTasks.length ? managerProofRequiredTasks.map((task) => (
                            <div key={`${task.title}-${task.owner}`} className="rounded-xl bg-white p-3 ring-1 ring-[#EEEDFE]">
                              <p className="text-sm font-black text-[#2C2C2A]">{task.title}</p>
                              <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">{task.owner} · {task.proof}</p>
                            </div>
                          )) : (
                            <p className="rounded-xl border border-dashed border-[#DAD7FB] bg-white p-4 text-sm font-semibold text-[#5F5E5A]">
                              No proof-required tasks yet. Use templates to create one.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7F77DD]">Update Quality Score</p>
                            <h4 className="mt-2 text-lg font-black text-[#2C2C2A]">NudgeAI coaching signals</h4>
                          </div>
                          <Sparkles className="h-6 w-6 text-[#7F77DD]" />
                        </div>
                        <div className="mt-4 grid gap-3">
                          {managerQualityScoreCards.map(([label, value, helper]) => (
                            <div key={label} className="rounded-xl bg-white p-3 ring-1 ring-[#EEEDFE]">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8A8894]">{label}</p>
                                <span className="text-lg font-black text-[#3C3489]">{value}</span>
                              </div>
                              <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">{helper}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#DAD7FB] bg-white p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#3C3489]">Smart Task Templates</p>
                          <h4 className="mt-2 text-lg font-black text-[#2C2C2A]">Create common manager tasks faster.</h4>
                        </div>
                        <button type="button" onClick={() => document.getElementById('manager-create-task')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="rounded-full bg-[#3C3489] px-4 py-2 text-xs font-black text-white">
                          Create from template
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {managerSmartTaskTemplates.map(([title, copy]) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => applyManagerTaskTemplate(title)}
                            className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-left transition hover:border-[#7F77DD] hover:bg-white"
                          >
                            <p className="text-sm font-black text-[#2C2C2A]">{title}</p>
                            <p className="mt-2 text-xs font-semibold leading-5 text-[#5F5E5A]">{copy}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null}

                {isPeopleDashboard ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={openWhatsAppNudgePreview}
                      disabled={whatsappNudgeLoading}
                      className="workspace-card-quiet metric-lift inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-extrabold text-[#1D9E75] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {whatsappNudgeLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
                      {whatsappNudgeLoading ? 'Sending WhatsApp Nudges...' : 'Send WhatsApp Nudge'}
                    </button>
                    <div className="workspace-card-quiet rounded-2xl px-4 py-4 text-xs font-semibold leading-5 text-[#5F5E5A]">
                      Sends reminders only to employees with a saved phone number and no update/check-in today.
                    </div>
                  </div>
                ) : null}

                {authRole === 'admin' ? (
                  <section className="workspace-card rounded-2xl p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1D9E75]">Admin Setup Checklist</p>
                        <h3 className="mt-2 text-2xl font-black text-[#2C2C2A]">Get the workspace launch-ready.</h3>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#5F5E5A]">
                          A simple setup guide for admins before inviting the full company or starting a paid rollout.
                        </p>
                      </div>
                      <span className="rounded-full bg-[#E8F7F1] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1D9E75]">
                        {adminSetupChecklist.filter(([, done]) => done).length}/{adminSetupChecklist.length} done
                      </span>
                    </div>
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {adminSetupChecklist.map(([title, done, helper]) => (
                        <div key={title} className="flex items-start gap-3 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-[#E8F7F1] text-[#1D9E75]' : 'bg-[#EEEDFE] text-[#3C3489]'}`}>
                            {done ? <Check className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                          </span>
                          <div>
                            <p className="text-sm font-black text-[#2C2C2A]">{title}</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">{helper}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
                
                {/* Role-specific command stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {leaderSummaryCards.map(([label, val, Icon, helper]) => (
                    <div key={label} className="workspace-card-quiet metric-lift rounded-2xl p-5">
                      <div className="flex items-center justify-between text-[#5F5E5A]">
                        <span className="text-xs font-semibold">{label}</span>
                        <Icon className="h-4 w-4" style={{ color: roleAccent }} />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-[#2C2C2A]">{val}</p>
                      <p className="mt-1 text-[11px] font-semibold text-[#5F5E5A]">{helper}</p>
                    </div>
                  ))}
                </div>

                {authRole === 'manager' ? (
                  <div className="space-y-5">
                    {managerActiveBlockers.length > 0 ? (
                      <section id="manager-live-blockers-section" className="rounded-2xl border border-rose-100 border-l-[3px] border-l-[#EF4444] bg-[#FFF5F5] p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-[#B91C1C]">
                          <AlertCircle className="h-5 w-5" />
                          <h3 className="text-lg font-black">Active Blockers — Needs Attention</h3>
                        </div>
                        <div className="mt-4 space-y-3">
                          {managerActiveBlockers.map((blocker) => (
                            <div key={blocker.id} className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEE2E2] text-sm font-black text-[#B91C1C]">
                                  {(blocker.assignee?.name || 'T').slice(0, 1)}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-[#2C2C2A]">{blocker.assignee?.name || 'Team member'}</p>
                                  <p className="text-xs font-semibold text-[#5F5E5A]">{blocker.title}</p>
                                  <p className="mt-1 text-xs font-extrabold text-[#EF4444]">{blocker.blockedAgo}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => updateTaskStatusApi(blocker.id, 'in_progress', null)} className="rounded-full bg-[#1D9E75] px-4 py-2 text-xs font-extrabold text-white">
                                  Resolve
                                </button>
                                <button type="button" onClick={() => window.location.href = `mailto:${blocker.assignee?.email || 'hello.nudgehq@gmail.com'}?subject=NudgeHQ blocker follow-up`} className="rounded-full border border-[#EF4444]/30 bg-white px-4 py-2 text-xs font-extrabold text-[#B91C1C]">
                                  Message
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                      <section className="workspace-card rounded-2xl p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#3C3489]">Team Progress</p>
                            <h3 className="mt-2 text-xl font-extrabold text-[#2C2C2A]">Only your department’s work.</h3>
                          </div>
                          <button type="button" onClick={() => document.getElementById('manager-create-task')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="rounded-full border border-[#DAD7FB] px-4 py-2 text-xs font-extrabold text-[#3C3489]">
                            Assign task
                          </button>
                        </div>
                        <div className="mt-5 overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase tracking-[0.14em] text-[#8A8882]">
                              <tr>
                                <th className="pb-3 pr-4">Member</th>
                                <th className="pb-3 pr-4">Task</th>
                                <th className="pb-3 pr-4">Progress</th>
                                <th className="pb-3 pr-4">Status</th>
                                <th className="pb-3">Last update</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EEEDFE]">
                              {managerProgressRows.length ? managerProgressRows.map(([name, task, progress, status, color, lastUpdate, updateTone]) => (
                                <tr key={`${name}-${task}`}>
                                  <td className="py-4 pr-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: color }}>
                                        {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                                      </div>
                                      <span className="font-extrabold text-[#2C2C2A]">{name}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 pr-4 font-semibold text-[#5F5E5A]">{task}</td>
                                  <td className="py-4 pr-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-2 w-28 rounded-full bg-[#EEEDFE]">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
                                      </div>
                                      <span className="text-xs font-black text-[#2C2C2A]">{progress}%</span>
                                    </div>
                                  </td>
                                  <td className="py-4 pr-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${status === 'Completed' ? 'bg-[#E8F7F1] text-[#1D9E75]' : status === 'Blocked' || status === 'Overdue' ? 'bg-rose-50 text-rose-600' : 'bg-[#EEEDFE] text-[#3C3489]'}`}>
                                      {status}
                                    </span>
                                  </td>
                                  <td className={`py-4 text-xs font-extrabold ${getManagerLastUpdateClass(updateTone)}`}>{lastUpdate}</td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={5} className="py-10 text-center">
                                    <div className="mx-auto flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-6">
                                      <ClipboardCheck className="h-8 w-8 text-[#7F77DD]" />
                                      <p className="mt-3 text-sm font-black text-[#2C2C2A]">No team tasks yet</p>
                                      <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">Assign the first task to start tracking your department.</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section className="workspace-card rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-extrabold text-[#2C2C2A]">Recent Activity</h3>
                          <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">Live</span>
                        </div>
                        <div className="mt-5 space-y-3">
                          {managerActivityRows.length ? managerActivityRows.map(([action, task, time, Icon, color, preview]) => {
                            const isCritical = color === '#EF4444';
                            const isExpanded = expandedManagerActivity === `${action}-${task}`;
                            return (
                              <button
                                key={`${action}-${task}`}
                                type="button"
                                onClick={() => setExpandedManagerActivity(isExpanded ? null : `${action}-${task}`)}
                                className={`w-full rounded-2xl border bg-white p-4 text-left transition hover:shadow-md ${isCritical ? 'border-rose-100 border-l-[3px] border-l-[#EF4444]' : 'border-[#EEEDFE]'}`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                                      <Icon className="h-4 w-4" />
                                    </span>
                                    <div>
                                      <p className={`text-sm font-black ${isCritical ? 'text-[#EF4444]' : 'text-[#2C2C2A]'}`}>{action}</p>
                                      <p className="text-xs font-semibold text-[#5F5E5A]">{task}</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-extrabold text-[#8A8882]">{time}</span>
                                </div>
                                {isExpanded ? <p className="mt-3 rounded-xl bg-[#FCFCFF] p-3 text-xs font-semibold leading-5 text-[#5F5E5A]">{preview}</p> : null}
                              </button>
                            );
                          }) : (
                            <div className="rounded-2xl border border-dashed border-[#DAD7FB] bg-[#FCFCFF] p-6 text-center">
                              <Activity className="mx-auto h-8 w-8 text-[#7F77DD]" />
                              <p className="mt-3 text-sm font-black text-[#2C2C2A]">No activity yet</p>
                              <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">Team updates and blockers will appear here in real time.</p>
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={() => scrollToWorkspaceSection('manager-audit-feed-section')} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#DAD7FB] px-4 py-2 text-sm font-extrabold text-[#3C3489]">
                          View all activity
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </section>
                    </div>

                    <div className="workspace-card rounded-2xl p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7F77DD]">Projects</p>
                          <h3 className="mt-2 text-xl font-extrabold text-[#2C2C2A]">Project workspace is coming soon.</h3>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#5F5E5A]">
                            Managers will soon group tasks into projects, track owners, and see NudgeAI delivery risk by project. For now, use Team Progress and Tasks.
                          </p>
                        </div>
                        <Building2 className="h-10 w-10 text-[#7F77DD]" />
                      </div>
                    </div>
                  </div>
                ) : null}

                {authRole === 'hr' ? (
                  <div className="workspace-card rounded-2xl p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#F59E0B]">HR People Signals</p>
                        <h3 className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">Company health without daily task noise.</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F5E5A]">
                          HR sees patterns, risk signals, and coaching context. Manager task controls stay out of this view.
                        </p>
                      </div>
                      <ShieldCheck className="h-10 w-10 text-[#F59E0B]" />
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {hrPeopleSignals.map(([label, value, helper]) => (
                        <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#5F5E5A]">{label}</p>
                          <p className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">{value}</p>
                          <p className="mt-1 text-xs leading-5 text-[#5F5E5A]">{helper}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="workspace-card-quiet metric-lift rounded-2xl p-5">
                    <h3 className="text-base font-extrabold text-[#2C2C2A]">Team Focus Feed</h3>
                    <p className="mt-1 text-xs text-[#5F5E5A]">Trust-first voluntary focus. No screenshots. No screen recording.</p>
                    <div className="mt-4 space-y-3">
                      {teamFocus.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-md bg-[#FCFCFF] p-3">
                          <p className="text-xs font-bold text-[#3C3489]">{item.user?.name || 'Employee'} · {item.status}</p>
                          <p className="mt-1 text-sm text-[#2C2C2A]">{item.focus_text}</p>
                          <p className="mt-1 text-[11px] text-[#5F5E5A]">ETA: {item.eta?.replace('_', ' ')}</p>
                        </div>
                      ))}
                    </div>
                    {focusInsight ? <p className="mt-4 rounded-md bg-[#F4F3FF] p-3 text-xs font-semibold text-[#3C3489]">Powered by NudgeAI: {focusInsight}</p> : null}
                  </div>

                  <div className="workspace-card-quiet metric-lift rounded-2xl p-5">
                    <h3 className="text-base font-extrabold text-[#2C2C2A]">Team Presence Overview</h3>
                    <div className="mt-4 space-y-3">
                      {teamPresence.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-md bg-[#FCFCFF] p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#3C3489]">{item.user?.name || 'Employee'}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.energy_level === 'high' ? 'bg-[#E8F7F1] text-[#1D9E75]' : item.energy_level === 'low' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{item.energy_level}</span>
                          </div>
                          <p className="mt-1 text-xs text-[#5F5E5A]">{item.location?.replace('_', ' ')}</p>
                          <p className="mt-1 text-xs text-[#2C2C2A]">{(item.goals_json || []).join(', ')}</p>
                        </div>
                      ))}
                    </div>
                    {presenceInsight ? <p className="mt-4 rounded-md bg-[#F4F3FF] p-3 text-xs font-semibold text-[#3C3489]">Powered by NudgeAI: {presenceInsight}</p> : null}
                  </div>

                  <div className="workspace-card-quiet metric-lift rounded-2xl p-5">
                    <h3 className="text-base font-extrabold text-[#2C2C2A]">Deep Work Tracker</h3>
                    <div className="mt-4 space-y-3">
                      {deepWorkTeam?.active?.length ? deepWorkTeam.active.map((session) => (
                        <div key={session.id} className="rounded-md bg-[#F4F3FF] p-3">
                          <p className="text-xs font-bold text-[#3C3489]">{session.user?.name} is in Deep Work</p>
                          <p className="mt-1 text-xs text-[#5F5E5A]">Until {formatDisplayDate(session.end_time)}</p>
                        </div>
                      )) : <p className="text-xs text-[#5F5E5A]">No active deep work sessions right now.</p>}
                      {deepWorkTeam?.top_users?.map((user) => (
                        <p key={user.name} className="text-xs font-semibold text-[#2C2C2A]">{user.name}: {user.hours} hrs this month</p>
                      ))}
                    </div>
                    {deepWorkTeam?.insight ? <p className="mt-4 rounded-md bg-[#F4F3FF] p-3 text-xs font-semibold text-[#3C3489]">{deepWorkTeam.insight}</p> : null}
                  </div>
                </div>

                {/* NudgeAI Control Panel */}
                <div id="manager-nudgeai-desk-section" className="workspace-card rounded-2xl p-7">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#F59E0B]" />
                    <h3 className="text-lg font-bold text-[#2C2C2A]">NudgeAI Operations Desk</h3>
                  </div>
                  <p className="mt-1 text-xs text-[#5F5E5A]">Turns active workforce data into summaries, delay signals, and suggested nudges.</p>
                  
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {isOpsDashboard && <button
                      onClick={() => triggerAiReport('summary')}
                      className="metric-lift rounded-2xl border border-[#DAD7FB] bg-[#F4F3FF] p-4 text-center transition hover:border-[#7F77DD]"
                    >
                      <Sparkles className="mx-auto h-5 w-5 text-[#7F77DD]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">NudgeAI Daily Summary</span>
                    </button>}
                    {isOpsDashboard && <button
                      onClick={() => triggerAiReport('delays')}
                      className="metric-lift rounded-2xl border border-[#DAD7FB] bg-rose-50 p-4 text-center transition hover:border-rose-400"
                    >
                      <Clock3 className="mx-auto h-5 w-5 text-rose-500" />
                      <span className="mt-2 block text-xs font-bold text-rose-700">Audit Delayed Tasks</span>
                    </button>}
                    {isPeopleDashboard && <button
                      onClick={() => triggerAiReport('inactivity')}
                      className="metric-lift rounded-2xl border border-[#DAD7FB] bg-amber-50 p-4 text-center transition hover:border-amber-400"
                    >
                      <UserCheck className="mx-auto h-5 w-5 text-amber-500" />
                      <span className="mt-2 block text-xs font-bold text-amber-700">Check Inactivity</span>
                    </button>}
                    {isOpsDashboard && <button
                      onClick={() => runNudgeAiFeature('forecast', true)}
                      className="metric-lift rounded-2xl border border-[#DAD7FB] bg-[#E8F7F1] p-4 text-center transition hover:border-[#1D9E75]"
                    >
                      <LineChartIcon className="mx-auto h-5 w-5 text-[#1D9E75]" />
                      <span className="mt-2 block text-xs font-bold text-[#1D9E75]">Sprint Forecast</span>
                    </button>}
                    {isPeopleDashboard && <button
                      onClick={() => runNudgeAiFeature('burnout', true)}
                      className="metric-lift rounded-2xl border border-[#DAD7FB] bg-white p-4 text-center transition hover:border-[#7F77DD]"
                    >
                      <ShieldCheck className="mx-auto h-5 w-5 text-[#3C3489]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">Burnout Predictor</span>
                    </button>}
                    {isPeopleDashboard && <button
                      onClick={() => runNudgeAiFeature('anomaly', true)}
                      className="metric-lift rounded-2xl border border-[#DAD7FB] bg-amber-50 p-4 text-center transition hover:border-amber-400"
                    >
                      <Activity className="mx-auto h-5 w-5 text-amber-600" />
                      <span className="mt-2 block text-xs font-bold text-amber-700">Care Alerts</span>
                    </button>}
                    {isOpsDashboard && <button
                      onClick={() => runNudgeAiFeature('appreciation', true)}
                      className="metric-lift rounded-2xl border border-[#DAD7FB] bg-[#F4F3FF] p-4 text-center transition hover:border-[#7F77DD]"
                    >
                      <Sparkles className="mx-auto h-5 w-5 text-[#7F77DD]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">Appreciation</span>
                    </button>}
                    {isPeopleDashboard && <button
                      onClick={() => runNudgeAiFeature('skillGap', true)}
                      className="metric-lift rounded-2xl border border-[#DAD7FB] bg-white p-4 text-center transition hover:border-[#3C3489]"
                    >
                      <Workflow className="mx-auto h-5 w-5 text-[#3C3489]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">Skill Gaps</span>
                    </button>}
                  </div>

                  <div className="mt-5 grid gap-4">
                    {isOpsDashboard && <NudgeAiForecastCard data={nudgeAiData.forecast} loading={nudgeAiLoading.forecast} onRegenerate={() => runNudgeAiFeature('forecast', true)} />}
                    {isPeopleDashboard && <NudgeAiBurnoutCard data={nudgeAiData.burnout} loading={nudgeAiLoading.burnout} />}
                    {isPeopleDashboard && <NudgeAiAnomalyCard data={nudgeAiData.anomaly} loading={nudgeAiLoading.anomaly} />}
                    {isOpsDashboard && <NudgeAiAppreciationCard data={nudgeAiData.appreciation} loading={nudgeAiLoading.appreciation} onSend={sendAppreciation} />}
                    {isPeopleDashboard && <NudgeAiSkillGapCard data={nudgeAiData.skillGap} loading={nudgeAiLoading.skillGap} />}
                  </div>

                  {/* AI Results Output Container */}
                  <AnimatePresence>
                    {(aiLoading || aiReportContent) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-5 overflow-hidden"
                      >
                        {aiLoading ? (
                          <div className="flex flex-col items-center justify-center py-6 text-[#5F5E5A] gap-3">
                            <RefreshCw className="h-6 w-6 animate-spin text-[#3C3489]" />
                            <span className="text-xs font-semibold">Querying NudgeAI intelligence engine...</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between border-b border-[#EEEDFE] pb-3 mb-4">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#3C3489]">
                                {aiReportType === 'summary' ? 'Daily Briefing Report' : aiReportType === 'delays' ? 'Overdue Risk Assessments' : 'Inactivity Report'}
                              </span>
                              <button onClick={() => setAiReportContent(null)} className="text-[#5F5E5A] hover:text-[#2C2C2A]">
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Report Rendering templates */}
                            {aiReportType === 'summary' && (
                              <div className="space-y-4 text-sm">
                                <p className="leading-relaxed text-[#2C2C2A] font-medium">{aiReportContent.summary}</p>
                                
                                {aiReportContent.achievements && aiReportContent.achievements.length > 0 && (
                                  <div>
                                    <span className="text-xs font-bold text-[#1D9E75] block uppercase tracking-wider">Major Achievements:</span>
                                    <ul className="list-disc list-inside mt-1.5 text-xs space-y-1 text-[#5F5E5A]">
                                      {aiReportContent.achievements.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                  </div>
                                )}

                                {aiReportContent.blockers && aiReportContent.blockers.length > 0 && (
                                  <div>
                                    <span className="text-xs font-bold text-rose-600 block uppercase tracking-wider">Identified Blockers:</span>
                                    <ul className="list-disc list-inside mt-1.5 text-xs space-y-1 text-rose-700">
                                      {aiReportContent.blockers.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {aiReportType === 'delays' && (
                              <div className="space-y-3">
                                {aiReportContent.assessments?.map((a, i) => (
                                  <div key={i} className="rounded border border-[#EEEDFE] bg-white p-4">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-xs font-bold text-[#2C2C2A]">{a.task_title}</h5>
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                        a.risk_level === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                      }`}>{a.risk_level} Risk</span>
                                    </div>
                                    <p className="mt-2 text-xs text-[#5F5E5A] leading-relaxed"><strong>Suggested remedy:</strong> {a.remedy}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {aiReportType === 'inactivity' && (
                              <div className="space-y-3">
                                {aiReportContent.inactive_employees?.length === 0 ? (
                                  <p className="text-xs text-[#5F5E5A]">All employee updates are up to date within 3 days.</p>
                                ) : (
                                  aiReportContent.inactive_employees?.map((e, i) => (
                                    <div key={i} className="rounded border border-[#EEEDFE] bg-white p-4">
                                      <div className="flex justify-between text-xs font-bold text-[#2C2C2A]">
                                        <span>{e.name} ({e.department})</span>
                                        <span className="text-[#5F5E5A]">{e.email}</span>
                                      </div>
                                      <div className="mt-3 bg-amber-50/50 border border-amber-200/50 rounded p-3 text-xs text-amber-900 italic">
                                        &ldquo;{e.checkin_nudge}&rdquo;
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Audit All Employee Updates feed */}
                <div id="manager-audit-feed-section" className="workspace-card rounded-2xl p-7">
                  <h3 className="text-lg font-bold text-[#2C2C2A]">Auditing Employee Update Feed</h3>
                  <div className="mt-5 divide-y divide-[#EEEDFE] max-h-96 overflow-y-auto pr-2">
                    {allUpdates.length === 0 ? (
                      <p className="text-sm text-[#5F5E5A] py-4">No recent employee check-ins found in query.</p>
                    ) : (
                      allUpdates.map(u => (
                        <div key={u.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex justify-between text-xs text-[#5F5E5A]">
                            <span className="font-bold text-[#3C3489]">
                              {u.user?.name} ({u.user?.departments?.name || 'Unassigned'})
                              {u.quality_score ? (
                                <span className="ml-2 rounded-full bg-[#F4F3FF] px-2 py-0.5 text-[10px] text-[#3C3489]">Quality {u.quality_score}/10</span>
                              ) : null}
                            </span>
                            <span>{formatDisplayDate(u.created_at)}</span>
                          </div>
                          <p className="mt-2 text-sm text-[#2C2C2A] leading-relaxed">{u.progress_text}</p>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-[#5F5E5A]">
                            <span>Task link: <strong>{u.tasks?.title || 'General Update'}</strong></span>
                            {u.proof_link && (
                              <a href={u.proof_link} target="_blank" rel="noreferrer" className="text-[#7F77DD] hover:underline flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> Proof Link
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Admin Right Column */}
              <div className="space-y-7">
                
                {/* Export Reports Ready Card */}
                {isPeopleDashboard && <div className="workspace-card-quiet rounded-2xl p-7">
                  <h4 className="text-base font-extrabold text-[#2C2C2A]">Export Operational Datasets</h4>
                  <p className="text-xs text-[#5F5E5A] mt-1">Download flat JSON metrics mapping active task assignees and blockers.</p>
                  
                  <a
                    href={isSandbox ? '#' : `http://localhost:${serverPort}/api/admin/reports/export`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      if (isSandbox) {
                        e.preventDefault();
                        showToast("Sandbox export preview is available in demo reports.", "info");
                      }
                    }}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#3C3489] py-3 text-xs font-semibold text-white shadow hover:bg-[#7F77DD] transition"
                  >
                    <Download className="h-4 w-4" />
                    Compile & Export Report
                  </a>
                  <button
                    type="button"
                    onClick={generateBoardPack}
                    disabled={boardPackLoading}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-md border border-[#DAD7FB] bg-white py-3 text-xs font-semibold text-[#3C3489] transition hover:bg-[#EEEDFE] disabled:opacity-50"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    {boardPackLoading ? 'Generating Board Pack...' : 'Generate Board Pack PDF'}
                  </button>
                </div>}

                {/* Invite Employees */}
                {isPeopleDashboard && <div className="workspace-card rounded-2xl p-7">
                  <h3 className="text-base font-extrabold text-[#2C2C2A]">Invite Team Member</h3>
                  <p className="mt-1 text-xs text-[#5F5E5A]">Create a login, choose their role, and assign their department.</p>

                  <form onSubmit={handleInviteEmployee} className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Employee name *"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Employee email *"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp phone optional (+919999999999)"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="block w-full rounded-md border border-[#DAD7FB] bg-white px-2 py-2 text-xs outline-none focus:border-[#7F77DD]"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                    </select>
                    <select
                      value={inviteDepartmentId}
                      onChange={(e) => setInviteDepartmentId(e.target.value)}
                      className="block w-full rounded-md border border-[#DAD7FB] bg-white px-2 py-2 text-xs outline-none focus:border-[#7F77DD]"
                    >
                      <option value="">No department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#7F77DD] py-2.5 text-xs font-semibold text-white hover:bg-[#3C3489] transition disabled:opacity-50"
                    >
                      {inviteLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                      Invite Team Member
                    </button>
                  </form>

                  {inviteResult ? (
                    <div className="mt-4 rounded-md border border-[#E8F7F1] bg-[#E8F7F1] p-3 text-xs text-[#1D9E75]">
                      <p className="font-bold">Invite ready for {inviteResult.email}</p>
                      <p className="mt-1">Temporary password: <span className="font-mono font-bold">{inviteResult.temporary_password}</span></p>
                    </div>
                  ) : null}
                </div>}

                {/* Create & Assign Tasks */}
                {isOpsDashboard && <div id="manager-create-task" className="workspace-card rounded-2xl p-7">
                  <h3 className="text-base font-extrabold text-[#2C2C2A]">Create & Assign Tasks</h3>
                  {authRole === 'manager' ? (
                    <p className="mt-1 text-xs text-[#5F5E5A]">Manager mode: assignees are limited to your department.</p>
                  ) : null}
                  <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Task Title *"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Task Description"
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        className="block min-h-16 w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">Assignee</label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="block w-full rounded-md border border-[#DAD7FB] bg-white px-2 py-2 text-xs outline-none"
                      >
                        <option value="">Unassigned</option>
                        {adminUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#7F77DD] py-2.5 text-xs font-semibold text-white hover:bg-[#3C3489] transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create Task
                    </button>
                  </form>
                </div>}

                {/* Manage Departments */}
                {isPeopleDashboard && <div className="workspace-card rounded-2xl p-7">
                  <h3 className="text-base font-extrabold text-[#2C2C2A]">Manage Departments</h3>
                  
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {departments.map(dept => (
                      <div key={dept.id} className="flex items-center justify-between p-2.5 rounded border border-[#EEEDFE] bg-[#FCFCFF] text-xs">
                        <div>
                          <strong className="text-[#2C2C2A]">{dept.name}</strong>
                          {dept.description && <p className="text-[10px] text-[#5F5E5A] mt-0.5">{dept.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleCreateDepartment} className="mt-4 border-t border-[#EEEDFE]/60 pt-4 space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Department Name *"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Description (Optional)"
                        value={newDeptDesc}
                        onChange={(e) => setNewDeptDesc(e.target.value)}
                        className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#7F77DD] py-2.5 text-xs font-semibold text-white hover:bg-[#3C3489] transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Department
                    </button>
                  </form>
                </div>}

              </div>

            </div>
          )}

        </section>
      )}

      {['landing', 'signin', 'signup', 'blog', 'privacy', 'terms', 'contact', 'why_nudgehq', 'dashboard'].includes(currentView) ? (
        <NudgeAssistant
          context={currentView === 'dashboard' ? 'dashboard' : 'public'}
          role={authRole || 'visitor'}
          page={currentView}
          dashboardSnapshot={assistantSnapshot}
          onAsk={askNudgeAi}
        />
      ) : null}

      <AnimatePresence>
        {!cookieConsent && ['landing', 'blog', 'privacy', 'terms', 'contact', 'why_nudgehq'].includes(currentView) ? (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-1/2 z-[120] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-[1.35rem] border border-[#DAD7FB] bg-white/94 p-4 shadow-2xl shadow-[#3C3489]/14 backdrop-blur sm:p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEEDFE] text-[#3C3489]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#2C2C2A]">Cookie notice</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#5F5E5A]">
                    We use essential cookies for login/session and may use lightweight analytics to improve NudgeHQ. No selling personal data.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => acceptCookieConsent('essential')}
                  className="rounded-full border border-[#DAD7FB] px-4 py-2 text-xs font-black text-[#3C3489] transition hover:bg-[#EEEDFE]"
                >
                  Essential only
                </button>
                <button
                  type="button"
                  onClick={() => acceptCookieConsent('accepted')}
                  className="rounded-full bg-[#3C3489] px-4 py-2 text-xs font-black text-white transition hover:bg-[#7F77DD]"
                >
                  Accept
                </button>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </main>
  )
}

function NudgeMascot() {
  return (
    <div className="relative mx-auto flex aspect-square max-w-sm items-center justify-center rounded-[2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/10">
      <div className="absolute inset-6 rounded-[1.5rem] bg-[#EEEDFE]" />
      <svg className="dashboard-float relative z-10 h-72 w-72" viewBox="0 0 280 280" role="img" aria-label="NudgeHQ mascot character">
        <rect x="64" y="56" width="152" height="156" rx="38" fill="#3C3489" />
        <rect x="82" y="74" width="116" height="116" rx="28" fill="#7F77DD" />
        <path d="M112 156V100h15l30 36v-36h18v56h-15l-30-36v36h-18Z" fill="#FFFFFF" />
        <circle cx="116" cy="130" r="8" fill="#FFFFFF" />
        <circle cx="166" cy="130" r="8" fill="#FFFFFF" />
        <path d="M122 162c12 12 29 12 41 0" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M65 128H35c-12 0-20 8-20 20s8 20 20 20h30" stroke="#1D9E75" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M215 128h30c12 0 20 8 20 20s-8 20-20 20h-30" stroke="#1D9E75" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M92 213l-16 30" stroke="#3C3489" strokeWidth="12" strokeLinecap="round" />
        <path d="M188 213l16 30" stroke="#3C3489" strokeWidth="12" strokeLinecap="round" />
        <circle cx="218" cy="66" r="26" fill="#E8F7F1" />
        <path d="m207 66 8 8 15-18" stroke="#1D9E75" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

function PoweredByNudgeAi() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F3FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#3C3489]">
      <Zap className="h-3 w-3 text-[#F59E0B]" aria-hidden="true" />
      Powered by NudgeAI
    </span>
  )
}

function NudgeAiLoader() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-4 text-xs font-semibold text-[#5F5E5A]">
      <RefreshCw className="h-4 w-4 animate-spin text-[#3C3489]" aria-hidden="true" />
      NudgeAI is thinking...
    </div>
  )
}

function NudgeAiStandupCard({ data, loading, onRegenerate }) {
  const copyBrief = async () => {
    if (data?.brief) await navigator.clipboard?.writeText(data.brief);
  };

  return (
    <div className="workspace-card rounded-2xl p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#F59E0B]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[#2C2C2A]">Today&apos;s NudgeAI Standup Brief</h3>
          </div>
          <p className="mt-1 text-xs text-[#5F5E5A]">Generated from updates since yesterday 9am.</p>
        </div>
        <PoweredByNudgeAi />
      </div>
      <div className="mt-5">
        {loading ? <NudgeAiLoader /> : (
          <p className="rounded-md bg-[#FCFCFF] p-4 text-sm font-medium leading-7 text-[#2C2C2A]">
            {data?.brief || 'Generate a standup brief to summarize team momentum for today.'}
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onRegenerate} className="rounded-md bg-[#7F77DD] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#3C3489]">
          Regenerate Brief
        </button>
        <button type="button" onClick={copyBrief} disabled={!data?.brief} className="rounded-md border border-[#DAD7FB] px-4 py-2 text-xs font-bold text-[#3C3489] transition hover:bg-[#EEEDFE] disabled:opacity-50">
          Copy
        </button>
        {data?.generated_at ? <span className="text-xs text-[#5F5E5A]">Generated {formatDisplayDate(data.generated_at)}</span> : null}
      </div>
    </div>
  )
}

function NudgeAiForecastCard({ data, loading, onRegenerate }) {
  if (!data && !loading) return null;

  return (
    <div className="rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-[#2C2C2A]">NudgeAI Sprint Forecast</h4>
        <PoweredByNudgeAi />
      </div>
      {loading ? <div className="mt-4"><NudgeAiLoader /></div> : (
        <div className="mt-4 space-y-4">
          <p className="text-2xl font-extrabold text-[#3C3489]">This week forecast: {data.forecast_percent}% completion likely</p>
          <details className="rounded-md border border-[#EEEDFE] bg-white p-4">
            <summary className="cursor-pointer text-sm font-bold text-[#2C2C2A]">{data.tasks_at_risk?.length || 0} tasks at risk</summary>
            <div className="mt-3 space-y-2">
              {data.tasks_at_risk?.map((task, index) => (
                <p key={`${task.title}-${index}`} className="text-xs leading-6 text-[#5F5E5A]"><strong>{task.title}</strong>: {task.reason}</p>
              ))}
            </div>
          </details>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1D9E75]">Recommended actions</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#5F5E5A]">
              {data.recommended_actions?.map((action) => <li key={action}>{action}</li>)}
            </ul>
          </div>
          <button type="button" onClick={onRegenerate} className="rounded-md border border-[#DAD7FB] px-4 py-2 text-xs font-bold text-[#3C3489] hover:bg-[#EEEDFE]">Regenerate Forecast</button>
        </div>
      )}
    </div>
  )
}

function NudgeAiBurnoutCard({ data, loading }) {
  if (!data && !loading) return null;
  const colorClass = {
    green: 'bg-[#E8F7F1] text-[#1D9E75]',
    yellow: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="rounded-lg border border-[#EEEDFE] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-[#2C2C2A]">NudgeAI Burnout Predictor</h4>
        <PoweredByNudgeAi />
      </div>
      <p className="mt-1 text-xs text-[#5F5E5A]">Private admin/HR care signals. Never shown to employees.</p>
      {loading ? <div className="mt-4"><NudgeAiLoader /></div> : (
        <div className="mt-4 grid gap-3">
          {data.burnout_risks?.map((risk) => (
            <div key={risk.employee_id} className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#2C2C2A]">{risk.employee_name}</p>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${colorClass[risk.color] || colorClass.green}`}>{risk.risk_level}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#5F5E5A]">{risk.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NudgeAiAnomalyCard({ data, loading }) {
  if (!data && !loading) return null;

  return (
    <div className="rounded-lg border border-[#EEEDFE] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-[#2C2C2A]">NudgeAI Anomaly Alerts</h4>
        <PoweredByNudgeAi />
      </div>
      <p className="mt-1 text-xs text-[#5F5E5A]">Framed as a care system, not a surveillance system.</p>
      {loading ? <div className="mt-4"><NudgeAiLoader /></div> : (
        <div className="mt-4 space-y-3">
          {data.alerts?.length ? data.alerts.map((alert, index) => (
            <div key={`${alert.employee_name}-${index}`} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900">
              <strong>{alert.employee_name}</strong>: {alert.suggested_admin_action}
            </div>
          )) : <p className="text-xs text-[#5F5E5A]">No unusual care signals detected.</p>}
        </div>
      )}
    </div>
  )
}

function NudgeAiAppreciationCard({ data, loading, onSend }) {
  if (!data && !loading) return null;

  return (
    <div className="rounded-lg border border-[#EEEDFE] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-[#2C2C2A]">NudgeAI Appreciation Suggestions</h4>
        <PoweredByNudgeAi />
      </div>
      {loading ? <div className="mt-4"><NudgeAiLoader /></div> : (
        <div className="mt-4 space-y-3">
          {data.suggestions?.map((suggestion) => (
            <div key={suggestion.employee_id} className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-3">
              <p className="text-xs font-bold text-[#3C3489]">{suggestion.employee_name}</p>
              <p className="mt-2 text-sm leading-6 text-[#2C2C2A]">&ldquo;{suggestion.message}&rdquo;</p>
              <button type="button" onClick={() => onSend(suggestion)} className="mt-3 rounded-md bg-[#7F77DD] px-3 py-2 text-xs font-bold text-white hover:bg-[#3C3489]">
                Send with 1 click
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NudgeAiSkillGapCard({ data, loading }) {
  if (!data && !loading) return null;

  return (
    <div className="rounded-lg border border-[#EEEDFE] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-[#2C2C2A]">Team Skill Gaps</h4>
        <PoweredByNudgeAi />
      </div>
      {loading ? <div className="mt-4"><NudgeAiLoader /></div> : (
        <div className="mt-4 space-y-3">
          {data.gaps?.map((gap) => (
            <div key={gap.gap_name} className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#2C2C2A]">{gap.gap_name}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  gap.urgency === 'high' ? 'bg-rose-50 text-rose-700' : gap.urgency === 'low' ? 'bg-[#E8F7F1] text-[#1D9E75]' : 'bg-amber-50 text-amber-700'
                }`}>{gap.urgency}</span>
              </div>
              <p className="mt-1 text-xs text-[#5F5E5A]">{gap.frequency} blockers this month</p>
              <p className="mt-2 text-xs font-semibold text-[#3C3489]">Suggest: {gap.suggested_learning_area}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold text-[#2C2C2A] sm:text-4xl">{title}</h2>
      {copy ? <p className="mt-4 text-lg leading-8 text-[#5F5E5A]">{copy}</p> : null}
    </div>
  )
}

function VerifyEmailView({ queryParams, setCurrentView, showToast, verificationEmail, setVerificationEmail, setUser, setToken, setAuthRole, routeAfterAuth }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = queryParams.get('token');
      if (!token) {
        setError(null);
        setLoading(false);
        return;
      }

      window.__nudgehqVerifyingTokens = window.__nudgehqVerifyingTokens || new Set();
      window.__nudgehqVerifiedTokens = window.__nudgehqVerifiedTokens || new Set();

      if (window.__nudgehqVerifiedTokens.has(token) || window.__nudgehqVerifyingTokens.has(token)) {
        setSuccess(true);
        setLoading(false);
        return;
      }

      window.__nudgehqVerifyingTokens.add(token);
      try {
        const { data } = await fetchApi(`/auth/verify-email?token=${token}`, { method: 'GET' });
        if (data.token && data.user) {
          setUser(data.user);
          setToken(data.token);
          setAuthRole(data.user.role);
          routeAfterAuth(data.user);
        } else {
          setCurrentView('choose_plan');
        }
        window.__nudgehqVerifiedTokens.add(token);
        setSuccess(true);
        showToast(data.message || 'Email verified successfully!', 'success');
      } catch (err) {
        if (window.__nudgehqVerifiedTokens.has(token)) {
          setSuccess(true);
        } else {
          setError(err.message || 'Failed to verify email address.');
        }
      } finally {
        window.__nudgehqVerifyingTokens.delete(token);
        setLoading(false);
      }
    };
    verify();
  }, [queryParams]);

  const resend = async () => {
    if (!verificationEmail) return;
    try {
      const { data } = await fetchApi('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: verificationEmail })
      });
      showToast(data.message || 'Verification email sent.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not resend verification email.', 'error');
    }
  };

  if (!queryParams.get('token')) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 sm:py-32">
        <div className="rounded-2xl border border-[#EEEDFE] bg-white p-8 text-center shadow-xl">
          <Mail className="mx-auto h-14 w-14 text-[#7F77DD]" />
          <h3 className="mt-4 text-2xl font-extrabold text-[#2C2C2A]">Check your inbox</h3>
          <p className="mt-3 text-sm leading-6 text-[#5F5E5A]">
            We sent a NudgeHQ verification link to <strong>{verificationEmail || 'your work email'}</strong>.
          </p>
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm leading-6 text-amber-800">
            Can&apos;t find it? Please check <strong>Spam</strong> or <strong>Promotions</strong>, then mark the email as <strong>Not spam</strong> so future NudgeHQ emails reach your inbox.
          </div>
          <div className="mt-7 grid gap-3">
            <button type="button" onClick={resend} className="rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white hover:bg-[#3C3489]">
              Resend verification email
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationEmail('');
                window.localStorage.removeItem('nudgehq_pending_email');
                setCurrentView('signup');
              }}
              className="text-sm font-bold text-[#3C3489] hover:text-[#7F77DD]"
            >
              Wrong email? Go back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24 sm:py-32">
      <div className="rounded-2xl border border-[#EEEDFE] bg-white p-8 shadow-xl text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <RefreshCw className="h-12 w-12 text-[#7F77DD] animate-spin mb-4" />
            <h3 className="text-lg font-bold text-[#2C2C2A]">Verifying your email...</h3>
            <p className="mt-2 text-sm text-[#5F5E5A]">Please wait while we activate your NudgeHQ account.</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="h-16 w-16 text-[#1D9E75] mb-4" />
            <h3 className="text-xl font-bold text-[#2C2C2A]">Email Verified!</h3>
            <p className="mt-2 text-sm text-[#5F5E5A] mb-8">Your account has been verified successfully. Choose a plan to continue.</p>
            <button
              onClick={() => setCurrentView('choose_plan')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3C3489]"
            >
              Choose Plan
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-16 w-16 text-rose-500 mb-4" />
            <h3 className="text-xl font-bold text-rose-600">Verification Failed</h3>
            <p className="mt-2 text-sm text-[#5F5E5A] mb-8">{error}</p>
            <button
              onClick={() => setCurrentView('signin')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3C3489]"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleOAuthCallback({ queryParams, setUser, setToken, setAuthRole, routeAfterAuth, setCurrentView, showToast }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const completeGoogleAuth = async () => {
      const code = queryParams.get('code');
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const oauthError = queryParams.get('error_description') || hashParams.get('error_description');

      if (!code && !accessToken) {
        setError(oauthError || 'Google did not return a valid sign-in response.');
        return;
      }

      try {
        const companyName = window.localStorage.getItem('nudgehq_google_signup_company') || '';
        const { data } = await fetchApi('/auth/oauth/google/callback', {
          method: 'POST',
          body: JSON.stringify({ code, access_token: accessToken, company_name: companyName })
        });

        window.history.replaceState({}, '', '/oauth/callback');
        window.localStorage.removeItem('nudgehq_google_signup_company');
        setUser(data.user);
        setToken(data.token);
        setAuthRole(data.user.role);
        routeAfterAuth(data.user, companyName);
        showToast('Google sign-in successful.', 'success');
      } catch (err) {
        setError(err.message || 'Could not complete Google sign-in.');
      }
    };

    completeGoogleAuth();
  }, [queryParams]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 sm:py-32">
      <div className="rounded-2xl border border-[#EEEDFE] bg-white p-8 text-center shadow-xl">
        {error ? (
          <>
            <AlertCircle className="mx-auto h-14 w-14 text-rose-500" />
            <h3 className="mt-4 text-xl font-extrabold text-rose-600">Google sign-in failed</h3>
            <p className="mt-3 text-sm leading-6 text-[#5F5E5A]">{error}</p>
            <button type="button" onClick={() => setCurrentView('signin')} className="mt-6 w-full rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white hover:bg-[#3C3489]">
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-[#7F77DD]" />
            <h3 className="mt-4 text-xl font-extrabold text-[#2C2C2A]">Connecting Google account...</h3>
            <p className="mt-3 text-sm leading-6 text-[#5F5E5A]">Please wait while NudgeHQ prepares your workspace.</p>
          </>
        )}
      </div>
    </div>
  );
}

function ForgotPasswordView({ setCurrentView, showToast }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      showToast(data.message, 'success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-24 sm:py-32">
      <div className="rounded-2xl border border-[#EEEDFE] bg-white p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-[#2C2C2A] text-center">Forgot Password</h3>
        <p className="mt-2 text-sm text-[#5F5E5A] text-center mb-8">Enter your registered email address and we'll send you a password reset link.</p>

        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-[#1D9E75] mx-auto mb-4" />
            <p className="text-sm font-semibold text-[#2C2C2A] mb-8">Password reset link sent! Check your inbox for further instructions.</p>
            <button
              onClick={() => setCurrentView('signin')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3C3489]"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none transition focus:border-[#7F77DD]"
                placeholder="you@company.com"
                required
              />
            </div>

            {error && (
              <p className="rounded-md border border-rose-100 bg-rose-50 p-3 text-sm font-medium text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3C3489] disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Send Reset Link
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setCurrentView('signin')}
                className="text-sm font-bold text-[#3C3489] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ResetPasswordView({ queryParams, setCurrentView, showToast }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      setSuccess(true);
      showToast(data.message || 'Password reset successfully!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-24 sm:py-32">
      <div className="rounded-2xl border border-[#EEEDFE] bg-white p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-[#2C2C2A] text-center">Reset Password</h3>
        <p className="mt-2 text-sm text-[#5F5E5A] text-center mb-8">Enter your new secure password below to access your account.</p>

        {!token ? (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <p className="text-sm font-semibold text-rose-600 mb-8">No password reset token provided. Please request a new link.</p>
            <button
              onClick={() => setCurrentView('signin')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3C3489]"
            >
              Back to Sign In
            </button>
          </div>
        ) : success ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-[#1D9E75] mx-auto mb-4" />
            <p className="text-sm font-semibold text-[#2C2C2A] mb-8">Password reset successful! You can now log in using your new credentials.</p>
            <button
              onClick={() => setCurrentView('signin')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3C3489]"
            >
              Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />

            {error && (
              <p className="rounded-md border border-rose-100 bg-rose-50 p-3 text-sm font-medium text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3C3489] disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function AcceptInviteView({ queryParams, setCurrentView, setUser, setToken, setAuthRole, showToast }) {
  const [invitation, setInvitation] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const token = queryParams.get('token');

  useEffect(() => {
    const checkInvite = async () => {
      if (!token) {
        setError('No invitation token provided in URL.');
        setChecking(false);
        return;
      }
      try {
        const { data } = await fetchApi(`/auth/invite-status?token=${token}`, { method: 'GET' });
        setInvitation(data.invitation);
        if (data.invitation?.name) setName(data.invitation.name);
      } catch (err) {
        setError(err.message || 'Invitation is invalid or has expired.');
      } finally {
        setChecking(false);
      }
    };
    checkInvite();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await fetchApi('/auth/accept-invite', {
        method: 'POST',
        body: JSON.stringify({ token, name, password }),
      });
      setUser(data.user);
      setToken(data.token);
      setAuthRole(data.user.role);
      window.history.pushState({}, '', getDashboardPath(data.user.role));
      setCurrentView('dashboard');
      showToast(`Welcome to NudgeHQ, ${data.user.name}!`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to accept invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 sm:py-32">
        <div className="rounded-2xl border border-[#EEEDFE] bg-white p-8 shadow-xl text-center">
          <RefreshCw className="h-12 w-12 text-[#7F77DD] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#2C2C2A]">Checking invitation details...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24 sm:py-32">
      <div className="rounded-2xl border border-[#EEEDFE] bg-white p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-[#2C2C2A] text-center">Accept Invitation</h3>
        {invitation ? (
          <p className="mt-2 text-sm text-[#5F5E5A] text-center mb-8">
            You've been invited to join <strong>{invitation.organizations?.name || 'your company'}</strong>. Set up your employee profile below.
          </p>
        ) : null}

        {error ? (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <p className="text-sm font-semibold text-rose-600 mb-8">{error}</p>
            <button
              onClick={() => setCurrentView('signin')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3C3489]"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Email Address</label>
              <input
                type="email"
                value={invitation?.email || ''}
                disabled
                className="mt-2 block w-full rounded-md border border-[#DAD7FB] bg-[#F7F7FD] px-4 py-3 text-sm text-[#5F5E5A] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none transition focus:border-[#7F77DD]"
                placeholder="John Doe"
                required
              />
            </div>

            <PasswordField
              label="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
            />

            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3C3489] disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Activate Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function JoinWorkspaceView({ setCurrentView, setUser, setToken, setAuthRole, showToast }) {
  const [invite, setInvite] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const code = window.location.pathname.split('/join/')[1] || '';

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const { data } = await fetchApi(`/auth/join-status?code=${encodeURIComponent(code)}`, { method: 'GET' });
        setInvite(data.invite);
      } catch (err) {
        setError(err.message || 'This invite link has expired. Ask your admin for a new one.');
      } finally {
        setChecking(false);
      }
    };
    loadInvite();
  }, [code]);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await fetchApi('/auth/join', {
        method: 'POST',
        body: JSON.stringify({ code, name, email, password })
      });
      setUser(data.user);
      setToken(data.token);
      setAuthRole(data.user.role);
      window.history.pushState({}, '', '/dashboard/employee');
      setCurrentView('dashboard');
      showToast(`Welcome to ${invite?.organizations?.name || 'NudgeHQ'}!`, 'success');
    } catch (err) {
      setError(err.message || 'Could not join workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[#7F77DD]" />
        <p className="mt-4 font-bold text-[#2C2C2A]">Checking invite link...</p>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto h-14 w-14 text-rose-500" />
          <h1 className="mt-4 text-2xl font-extrabold text-[#2C2C2A]">Invite expired</h1>
          <p className="mt-3 text-sm text-[#5F5E5A]">This invite link has expired. Ask your admin for a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#F7FAFF] px-5 py-12 text-[#2C2C2A] sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#EEF4FF_0%,#FFFFFF_40%,#EAF8F2_100%)]" />
      <div className="soft-grid absolute inset-0 -z-10 opacity-30" />
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/12 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#FEFEFF_0%,#F8F7FF_100%)] p-6 sm:p-8 lg:p-10">
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[#E8F7F1] blur-3xl" />
          <div className="absolute right-0 top-20 h-44 w-44 rounded-full bg-[#EEEDFE] blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {invite?.organizations?.logo_url ? <img src={invite.organizations.logo_url} alt="" className="h-12 w-12 rounded-2xl object-cover shadow-md shadow-[#3C3489]/10" /> : <img src="/brand/nudgehq-icon.svg" alt="" className="h-12 w-12 rounded-2xl shadow-md shadow-[#3C3489]/10" />}
              <div>
                <p className="text-lg font-extrabold text-[#2C2C2A]">NudgeHQ</p>
                <p className="text-xs font-semibold text-[#5F5E5A]">Invite-based workspace access</p>
              </div>
            </div>
            <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1D9E75]">Private invite</span>
          </div>

          <div className="relative mt-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#1D9E75]">Join now</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#1E2737]">Join {invite?.organizations?.name || 'Company'} on NudgeHQ</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5F5E5A]">Finish setup once and get a workspace that already knows your team, role, and invite context.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Invite', 'Pre-approved access'],
                ['Fast setup', 'Name, email, password'],
                ['Role aware', 'Ready for the right workspace'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-[#EEEDFE] bg-white/90 p-4 shadow-sm">
                  <p className="text-2xl font-extrabold text-[#3C3489]">{value}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8984]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-[#EEEDFE] bg-white/90 p-5 shadow-[0_18px_50px_rgba(60,52,137,0.08)]">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F4F3FF] text-[#3C3489]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#2C2C2A]">Secure invite onboarding</p>
                <p className="text-xs font-semibold text-[#5F5E5A]">Your invite stays scoped to this workspace.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[linear-gradient(145deg,#3C3489_0%,#5B7CFA_46%,#E8F7F1_112%)] p-6 text-white sm:p-8 lg:p-10">
          <div className="absolute inset-0 soft-grid opacity-18" />
          <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-white/12 blur-3xl" />
          <div className="absolute bottom-8 left-8 h-44 w-44 rounded-full bg-[#1D9E75]/18 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/14 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur">
                <UsersRound className="h-4 w-4" />
                Team-ready setup
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#3C3489]">Invite only</span>
            </div>

            <div className="mx-auto w-full max-w-md rounded-[1.8rem] border border-white/35 bg-white/16 p-4 shadow-2xl shadow-[#3C3489]/25 backdrop-blur">
              <div className="rounded-[1.4rem] bg-white p-5 text-[#2C2C2A] shadow-[0_18px_50px_rgba(30,39,55,0.12)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-[#3C3489]">Your workspace card</p>
                    <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">What happens after you join</p>
                  </div>
                  <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-extrabold text-[#1D9E75]">Live</span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ['1', 'Confirm your details'],
                    ['2', 'Access your team space'],
                    ['3', 'Start check-ins and tasks'],
                  ].map(([step, label]) => (
                    <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#7F77DD] text-sm font-extrabold text-white">{step}</span>
                      <span className="text-sm font-semibold text-[#2C2C2A]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="max-w-md text-3xl font-extrabold leading-tight text-white">
              Join once, then move straight into the team rhythm.
            </p>

            <div className="rounded-[1.75rem] border border-white/20 bg-white/12 p-4 backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/70">Workspace</p>
                  <p className="mt-1 text-sm font-semibold text-white">{invite?.organizations?.name || 'Your company'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/70">Invite status</p>
                  <p className="mt-1 text-sm font-semibold text-white">Ready to join</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[42rem] rounded-[2rem] border border-[#DAD7FB] bg-white p-6 shadow-2xl shadow-[#3C3489]/10 sm:p-8">
        <form onSubmit={submit} className="space-y-4">
          <input className={AUTH_INPUT_CLASS} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className={AUTH_INPUT_CLASS} placeholder="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} inputClassName="pr-12" />
          <PasswordField label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" inputClassName="pr-12" />
          {error ? <p className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-600">{error}</p> : null}
          <button disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E2737] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(30,39,55,0.18)] transition hover:bg-[#3C3489] disabled:opacity-50">
            {submitting ? 'Joining...' : 'Join workspace'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default App
