import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

const getDashboardLabel = (role) => ({
  admin: 'Admin Command Center',
  hr: 'HR People HQ',
  manager: 'Manager Team HQ',
  employee: 'Employee Workspace',
}[role] || 'Employee Workspace')

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
    name: 'Free Trial',
    price: 'Rs. 0',
    description: '14 days · Up to 20 employees',
    features: ['Full platform access', 'NudgeAI basic summary', 'Daily check-ins', 'Task tracking', 'Admin dashboard'],
    button: 'Start Free Trial',
  },
  {
    name: 'Starter',
    price: 'Rs. 2,000/month',
    description: 'Entry plan · Up to 15 employees',
    features: ['Everything in Free Trial', 'Unlimited check-ins', 'NudgeAI daily summary', 'Blocker detection', 'Weekly reports', 'Email support'],
    button: 'Get Started',
    entry: true,
  },
  {
    name: 'Growth',
    price: 'Rs. 6,000/month',
    description: 'Most Popular · Up to 45 employees',
    features: ['Everything in Starter', 'NudgeAI full suite', 'Burnout predictor', 'Sprint forecast', 'Department analytics', 'WhatsApp notifications', 'Priority support'],
    button: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Unlimited employees',
    features: ['Everything in Growth', 'Custom AI models', 'SSO login', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
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
    answer: 'No. Pricing is currently temporary while NudgeHQ is being built and tested. Plans may change as the product grows.',
  },
  {
    category: 'Support',
    question: 'How can I contact NudgeHQ?',
    answer: 'You can email hello.nudgehq@gmail.com or connect with us on Instagram at @hello.nudgehq.',
  },
]

const faqCategories = ['All Inquiries', 'Basics', 'NudgeAI', 'Roles', 'Pricing', 'Support']

function PasswordField({ label, value, onChange, placeholder = 'Enter password', className = '', labelClassName = '', required = true }) {
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
          className="block w-full rounded-md border border-[#DAD7FB] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#7F77DD]"
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
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pageKey]);

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

const formatDisplayDate = (value) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

const cardMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

let activeServerPort = null;

const isBackendConnectionError = (message = '') => (
  /fetch failed|aborted|timed out|connection refused|supabase/i.test(message)
)

const getInitialView = () => {
  const path = window.location.pathname;
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  if (path === '/contact') return 'contact';
  if (path === '/faq') return 'faq';
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
  if (path === '/dashboard' || Object.values(DASHBOARD_PATHS).includes(path)) return 'signin';
  if (path === '/demo') return 'demo_console';
  return 'landing';
}

// --- API UTILITY (Auto-probe ports 5000 and 5001) ---
const fetchApi = async (endpoint, options = {}, token = null) => {
  const ports = activeServerPort ? [activeServerPort] : [5000, 5001];
  let lastError = null;

  for (const port of ports) {
    try {
      const url = `http://localhost:${port}/api${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(id);

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'API request failed.');
      }
      return { data, port };
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError?.name === 'AbortError') {
    throw new Error('Backend request timed out. Supabase may be unreachable or not configured yet.');
  }

  if (lastError?.message === 'Failed to authenticate user.' || lastError?.message?.includes('fetch failed')) {
    throw new Error('Backend is running, but Supabase is not reachable or the Supabase credentials are incomplete.');
  }

  throw lastError || new Error('Connection refused on ports 5000/5001');
}

// --- MAIN APPLICATION ---
function App() {
  const [currentView, setCurrentView] = useState(getInitialView)
  const [queryParams, setQueryParams] = useState(new URLSearchParams(window.location.search))
  const [authRole, setAuthRole] = useState(null) // 'admin' | 'hr' | 'manager' | 'employee'
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  
  // Active Connection Metadata
  const [serverPort, setServerPort] = useState(null)
  const [isSandbox, setIsSandbox] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)
  const [demoEmployeeSection, setDemoEmployeeSection] = useState('My Dashboard')
  const [selectedDemoTask, setSelectedDemoTask] = useState(null)
  const [demoTaskUpdate, setDemoTaskUpdate] = useState('')
  const [demoProofLink, setDemoProofLink] = useState('')
  const [demoProofFiles, setDemoProofFiles] = useState([])
  const [demoTaskOverrides, setDemoTaskOverrides] = useState({})
  const [demoCheckinLocation, setDemoCheckinLocation] = useState('Office')
  const [demoAiQuestionIndex, setDemoAiQuestionIndex] = useState(0)

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
  const [faqSearch, setFaqSearch] = useState('')
  const [faqCategory, setFaqCategory] = useState('All Inquiries')
  const [verificationEmail, setVerificationEmail] = useState(() => window.localStorage.getItem('nudgehq_pending_email') || '')
  const [selectedPlan, setSelectedPlan] = useState(() => window.localStorage.getItem('nudgehq_selected_plan') || '')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [companyDetails, setCompanyDetails] = useState({ name: '', logo_url: '', industry: 'Tech', size: '1-10', country: 'India', city: '' })
  const [onboardingDepartments, setOnboardingDepartments] = useState([{ name: '', description: '' }])
  const [inviteEmployees, setInviteEmployees] = useState([{ name: '', email: '', department: '', role: 'employee' }])
  const [csvPreview, setCsvPreview] = useState([])
  const [magicInviteLink, setMagicInviteLink] = useState('')
  const [onboardingLoading, setOnboardingLoading] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDemoAiQuestionIndex((index) => (index + 1) % DEMO_AI_QUESTIONS.length)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

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
  const [workLocation, setWorkLocation] = useState('home')
  const [goals, setGoals] = useState(['', '', ''])
  const [energyLevel, setEnergyLevel] = useState('medium')
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
              activeServerPort = port;
              setServerPort(port);
              setIsSandbox(false);
              console.log(`Connected to NudgeHQ backend on port ${port}`);
              return;
            }
          }
        } catch {
          // ignore error and check next port
        }
      }
      console.warn('Backend server not detected. Running Demo Console in Sandbox Mode.');
      setIsSandbox(true);
      setServerPort(null);
      // Set mock data
      setMockData();
    };
    probeServer();
  }, []);

  // URL routing synchronization (listening to back/forward and initial path)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      setQueryParams(params);
      
      if (path === '/privacy') {
        setCurrentView('privacy');
      } else if (path === '/terms') {
        setCurrentView('terms');
      } else if (path === '/contact') {
        setCurrentView('contact');
      } else if (path === '/faq') {
        setCurrentView('faq');
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
    else if (currentView === 'privacy') targetPath = '/privacy';
    else if (currentView === 'terms') targetPath = '/terms';
    else if (currentView === 'contact') targetPath = '/contact';
    else if (currentView === 'faq') targetPath = '/faq';
    else if (currentView === 'nudgeai') targetPath = '/nudgeai';
    else if (currentView === 'signin') targetPath = '/login';
    else if (currentView === 'signup') targetPath = '/signup';
    else if (currentView === 'choose_plan') targetPath = '/choose-plan';
    else if (currentView === 'payment') targetPath = '/payment';
    else if (currentView === 'onboarding') targetPath = '/onboarding';
    else if (currentView === 'join_workspace') targetPath = currentPath.startsWith('/join/') ? currentPath : '/join';
    else if (currentView === 'demo_console') targetPath = '/demo';
    else if (currentView === 'dashboard') targetPath = getDashboardPath(authRole);
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

    const timer = window.setInterval(() => {
      setActiveStory((story) => (story + 1) % productScenarios.length);
    }, 5200);

    return () => window.clearInterval(timer);
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
    try {
      if (authRole === 'employee') {
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
      } else if (LEADER_ROLES.includes(authRole)) {
        const departmentScope = authRole === 'manager' && user?.department_id ? `?department_id=${user.department_id}` : '';

        if (authRole !== 'manager') {
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

        runNudgeAiFeature('standup', false);
        if (authRole !== 'manager') runNudgeAiFeature('skillGap', false);
      }
    } catch (err) {
      showToast('Error syncing live dashboard values: ' + err.message, 'error');
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

    if (isSandbox) {
      // Sandbox Authentication Bypass
      const simulatedUser = getDemoUserFromEmail(emailInput);

      setUser(simulatedUser);
      setToken('sandbox-token-jwt');
      setAuthRole(simulatedUser.role);
      navigateDashboard(simulatedUser.role);
      showToast(`Welcome! Logged into Sandbox Mode as ${simulatedUser.name}`, 'info');
      setLoginLoading(false);
      return;
    }

    try {
      const { data } = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

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

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setAuthRole(null);
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
        role: inviteRole,
        department_id: inviteDepartmentId || null
      };
      setAdminUsers([...adminUsers, invited]);
      setInviteResult({ email: inviteEmail, temporary_password: 'nudgehq123', sandbox: true });
      setInviteName('');
      setInviteEmail('');
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
          role: inviteRole,
          department_id: inviteDepartmentId || null
        })
      }, token);

      setAdminUsers([...adminUsers, data.employee]);
      setInviteResult({ email: data.employee.email, temporary_password: data.temporary_password, sandbox: false });
      setInviteName('');
      setInviteEmail('');
      setInviteRole('employee');
      setInviteDepartmentId('');
      showToast('Employee invite created successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to invite employee.', 'error');
    } finally {
      setInviteLoading(false);
    }
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
    if (isSandbox) {
      showToast('Smart Presence check-in saved in sandbox.', 'success');
      return;
    }

    try {
      await fetchApi('/checkin/daily', {
        method: 'POST',
        body: JSON.stringify({ location: workLocation, goals, energy_level: energyLevel })
      }, token);
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
      const port = activeServerPort || serverPort || 5001;
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

  const chooseStarterPlan = () => {
    if (!token) {
      showToast('Please verify your email and log in before activating Starter.', 'info');
      setCurrentView('signin');
      return;
    }
    setSelectedPlan('starter');
    window.localStorage.setItem('nudgehq_selected_plan', 'starter');
    setCurrentView('payment');
  }

  const activateStarterPlan = async () => {
    setPaymentLoading(true);
    try {
      await fetchApi('/payment/create-order', { method: 'POST', body: JSON.stringify({ plan: 'starter' }) }, token);
      const { data } = await fetchApi('/payment/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: `order_test_${Date.now()}`,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_signature'
        })
      }, token);
      showToast(data.message || 'Starter plan activated.', 'success');
      setCurrentView('onboarding');
    } catch (error) {
      showToast(error.message || 'Payment could not be completed.', 'error');
    } finally {
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
          const [name, email, department, role] = row.split(',').map((cell) => cell?.trim() || '');
          return { name, email, department, role: role || 'employee' };
        })
        .filter((row) => row.email);
      setCsvPreview(rows);
    };
    reader.readAsText(file);
  }

  const downloadSampleCsv = () => {
    const sample = 'Name,Email,Department,Role\nKunal Sharma,kunal@company.com,Sales Operations,employee\nPriya Mehta,priya@company.com,Engineering,employee\n';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nudgehq-employee-invite-sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const finishOnboarding = async () => {
    setOnboardingLoading(true);
    try {
      const employees = [...inviteEmployees, ...csvPreview]
        .filter((employee) => employee.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email));
      const { data } = await fetchApi('/auth/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({
          company: companyDetails,
          departments: onboardingDepartments.filter((dept) => dept.name),
          employees,
          generate_invite_link: true
        })
      }, token);
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

  const navigateDashboard = (role = authRole) => {
    const path = getDashboardPath(role);
    window.history.pushState({}, '', path);
    setAuthRole(role || 'employee');
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
      if (/price|pricing|cost/i.test(payload.message)) {
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
  const isLeaderDashboard = LEADER_ROLES.includes(authRole);
  const isPeopleDashboard = PEOPLE_ROLES.includes(authRole);
  const isOpsDashboard = OPS_ROLES.includes(authRole);
  const isEmployeeDashboard = authRole === 'employee';
  const dashboardRole = authRole || 'employee';
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
  const roleMetricCards = authRole === 'admin'
    ? [
        ['NudgeAI Desk', 'Forecasts, standups, risks, and skill gaps.', Sparkles, '#7F77DD'],
        ['Team Focus Feed', 'See what people are focused on right now.', Activity, '#1D9E75'],
        ['Employee Ops', 'Invite people, create tasks, and manage teams.', UsersRound, '#3C3489'],
        ['Board Pack', 'Generate clean monthly leadership reports.', FileCheck2, '#F59E0B']
      ]
    : authRole === 'hr'
      ? [
          ['People Health', 'Burnout, energy, attendance, and trend signals.', ShieldCheck, '#7F77DD'],
          ['Skill Gaps', 'NudgeAI groups recurring blocker themes.', Workflow, '#1D9E75'],
          ['Growth Views', 'Review employee growth and performance patterns.', LineChartIcon, '#3C3489'],
          ['HR Reports', 'Export board packs and people summaries.', FileCheck2, '#F59E0B']
        ]
      : authRole === 'manager'
        ? [
            ['Team Tasks', 'Assign and track only your department work.', ListTodo, '#7F77DD'],
            ['Blocker Alerts', 'See risks for your team before they drag.', AlertCircle, '#F59E0B'],
            ['Standup Brief', 'NudgeAI summarizes your team only.', Sparkles, '#3C3489'],
            ['Appreciation', 'Send recognition to your team members.', UserCheck, '#1D9E75']
          ]
        : [
            ['Daily Check-in', 'Share work location, energy, and top goals.', Activity, '#1D9E75'],
            ['Progress Update', 'Log work, proof links, blockers, and focus.', Send, '#7F77DD'],
            ['Deep Work', 'Declare focused time without noisy nudges.', Clock3, '#3C3489'],
            ['Growth Portal', 'Build your personal performance summary.', LineChartIcon, '#F59E0B']
          ];
  const leaderTaskCount = empTasks.length;
  const leaderCompletedTasks = empTasks.filter((task) => task.status === 'completed').length;
  const leaderBlockedTasks = empTasks.filter((task) => task.status === 'blocked').length;
  const leaderOpenTasks = empTasks.filter((task) => task.status !== 'completed').length;
  const leaderCompletionRate = leaderTaskCount ? Math.round((leaderCompletedTasks / leaderTaskCount) * 100) : analytics?.summary?.completionRate || 0;
  const todayIsoDate = new Date().toDateString();
  const todayUpdatesCount = allUpdates.filter((update) => new Date(update.created_at).toDateString() === todayIsoDate).length;
  const lowEnergyCount = teamPresence.filter((item) => item.energy_level === 'low').length;
  const averageQuality = (() => {
    const scores = allUpdates.map((update) => Number(update.quality_score)).filter(Boolean);
    if (!scores.length) return '—';
    return `${Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)}/10`;
  })();
  const leaderSummaryCards = authRole === 'manager'
    ? [
        ['Team Members', adminUsers.length, UsersRound, 'People in your department'],
        ['Open Tasks', leaderOpenTasks, ListTodo, 'Only your team scope'],
        ['Blocked Work', leaderBlockedTasks, AlertCircle, 'Needs manager action'],
        ['Completion', `${leaderCompletionRate}%`, CheckCircle2, 'Department task rate']
      ]
    : authRole === 'hr'
      ? [
          ['People Tracked', analytics?.summary?.totalEmployees ?? adminUsers.length, UsersRound, 'Across the company'],
          ['Low Energy Today', lowEnergyCount, Activity, 'Check-in health signal'],
          ['Avg Update Quality', averageQuality, Sparkles, 'Clarity trend'],
          ['Today Updates', todayUpdatesCount || analytics?.summary?.checkinRate || 0, ClipboardCheck, 'Fresh people signals']
        ]
      : authRole === 'admin'
        ? [
            ['Total Staff', analytics?.summary?.totalEmployees ?? adminUsers.length, UsersRound, 'All roles in workspace'],
            ['Completion Rate', `${analytics?.summary?.completionRate ?? leaderCompletionRate}%`, CheckCircle2, 'Company task rate'],
            ['Active Blockers', analytics?.summary?.blockersCount ?? leaderBlockedTasks, AlertCircle, 'Company-wide risks'],
            ['Today Updates', `${analytics?.summary?.checkinRate ?? todayUpdatesCount}${analytics?.summary?.checkinRate ? '%' : ''}`, Sparkles, 'Live workforce pulse']
          ]
        : [];
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = faqCategory === 'All Inquiries' || faq.category === faqCategory;
    const searchText = `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase();
    return matchesCategory && searchText.includes(faqSearch.trim().toLowerCase());
  });
  const managerBlockedTasks = empTasks.filter((task) => task.status === 'blocked').slice(0, 4);
  const managerUnassignedTasks = empTasks.filter((task) => !task.assignee).slice(0, 4);
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
  const demoSidebarItems = dashboardRole === 'employee'
    ? [
        ['My Dashboard', LayoutDashboard],
        ['My Tasks', CheckCircle2],
        ['Check-in', ClipboardCheck],
        ['My Progress', LineChartIcon],
        ['Growth Portal', Sparkles],
        ['NudgeAI', Zap],
        ['Settings', Shield],
      ]
    : [
        ['Dashboard', LayoutDashboard],
        ['Tasks', CheckCircle2],
        ['Projects', Building2],
        ['People', UsersRound],
        ['Reports', LineChartIcon],
        ['NudgeAI', Zap],
        ['Integrations', Workflow],
        ['Settings', Shield],
      ];
  const demoStatCards = dashboardRole === 'employee'
    ? [
        ['Total Tasks', leaderTaskCount || 6, ListTodo, '#7F77DD', '▲ 12% vs yesterday', 'up'],
        ['Completed Today', leaderCompletedTasks || 3, CheckCircle2, '#1D9E75', '▲ 18% vs yesterday', 'up'],
        ['In Progress', Math.max(leaderOpenTasks - leaderBlockedTasks, 2), Clock3, '#F59E0B', '— No change', 'flat'],
        ['Blocked', leaderBlockedTasks || 1, AlertCircle, '#EF4444', leaderBlockedTasks ? '▼ needs attention' : '— Clear', leaderBlockedTasks ? 'down' : 'flat'],
      ]
    : [
        ['Total Tasks', leaderTaskCount || 42, ListTodo, '#7F77DD', '▲ 12% vs yesterday', 'up'],
        ['Completed', leaderCompletedTasks || 28, CheckCircle2, '#1D9E75', '▲ 18% vs yesterday', 'up'],
        ['In Progress', Math.max(leaderOpenTasks - leaderBlockedTasks, 9), Clock3, '#F59E0B', '— No change', 'flat'],
        ['Overdue', leaderBlockedTasks || 5, AlertCircle, '#EF4444', '▼ 20% vs yesterday', 'down'],
      ];
  const demoProgressRows = [
    ['Aman Verma', 'Landing Page', 100, 'Completed', '#1D9E75'],
    ['Priya Singh', 'Client Deck', 80, 'In Progress', '#7F77DD'],
    ['Rahul Mehta', 'Market Research', 60, 'In Progress', '#F59E0B'],
    ['Neha Gupta', 'Content Strategy', 40, 'In Progress', '#F59E0B'],
    ['Karan Arora', 'Competitor Analysis', 20, 'Overdue', '#EF4444'],
  ];
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
  const employeeRecentActivityRows = [
    ['Completed task', 'Verify customer email lists', '2m ago', CheckCircle2, '#1D9E75'],
    ['Progress update submitted', 'Daily check-in', '1h ago', Activity, '#3B82F6'],
    ['Proof uploaded', 'Cleaned email sheet PDF', 'Yesterday', FileCheck2, '#F59E0B'],
    ['Blocker flagged', 'CRM import access issue', 'Yesterday', AlertCircle, '#EF4444'],
  ];
  const demoEmployeeCanNavigate = dashboardRole === 'employee';
  const selectedDemoSection = demoEmployeeCanNavigate ? demoEmployeeSection : 'Dashboard';
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
  const actualWeeklyProgressData = empHistory
    .slice(0, 7)
    .map((item, index) => ({
      day: new Date(item.created_at || Date.now() - (6 - index) * 86400000).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }),
      tasks: Number(item.tasks_completed || item.completed_tasks || item.completed_count || 1)
    }))
    .reverse();
  const weeklyProgressData = actualWeeklyProgressData.length ? actualWeeklyProgressData : demoWeeklyProgressData;
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

      {/* --- SITE HEADER --- */}
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

          {['landing', 'signin', 'signup', 'privacy', 'terms', 'contact', 'faq', 'nudgeai', 'verify_email', 'choose_plan', 'payment', 'onboarding', 'accept_invite', 'join_workspace', 'oauth_callback'].includes(currentView) ? (
            <>
              <div className="hidden items-center gap-8 text-sm font-medium text-[#5F5E5A] md:flex">
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#features">Features</a>
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#pricing">Pricing</a>
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#security">Security</a>
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
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="hidden text-xs font-semibold px-2.5 py-1 rounded bg-[#F4F3FF] border border-[#EEEDFE] sm:inline-flex items-center gap-1.5 text-[#5F5E5A]">
                <Activity className="h-3.5 w-3.5 text-[#1D9E75]" />
                {isSandbox ? 'Sandbox Environment' : `Server Port: ${serverPort}`}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                <LogOut className="h-4 w-4" />
                Exit Demo
              </button>
            </div>
          )}
        </nav>
      </header>

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

      {currentView === 'nudgeai' && (
        <FullPageNudgeAi onAsk={askNudgeAi} setCurrentView={setCurrentView} />
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
              copy="14-day free trial included with Starter. No credit card needed to start."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {[
                ['Starter', 'Rs. 2,000/month', ['Up to 15 employees', 'All V1 features', 'NudgeAI basic', 'Email support'], 'Choose Starter'],
                ['Custom', 'Contact us', ['15+ employees', 'Everything in Starter', 'Price based on team size', 'Priority support'], 'Contact Us'],
                ['Enterprise', 'Custom contract', ['Unlimited employees', 'Full V2 features', 'Dedicated manager'], 'Contact Us']
              ].map((plan, index) => (
                <motion.article key={plan[0]} {...cardMotion} className={`rounded-2xl border p-7 shadow-xl ${index === 0 ? 'border-[#7F77DD] bg-[#3C3489] text-white shadow-[#3C3489]/20' : 'border-[#DAD7FB] bg-white text-[#2C2C2A] shadow-[#3C3489]/5'}`}>
                  <h2 className="text-2xl font-extrabold">{plan[0]}</h2>
                  <p className={`mt-3 text-3xl font-extrabold ${index === 0 ? 'text-white' : 'text-[#3C3489]'}`}>{plan[1]}</p>
                  <ul className="mt-7 space-y-3">
                    {plan[2].map((feature) => (
                      <li key={feature} className={`flex gap-3 text-sm font-semibold ${index === 0 ? 'text-white/85' : 'text-[#5F5E5A]'}`}>
                        <Check className={`h-5 w-5 shrink-0 ${index === 0 ? 'text-[#8DE4C3]' : 'text-[#1D9E75]'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {index === 0 ? (
                    <button type="button" onClick={chooseStarterPlan} className="mt-9 w-full rounded-md bg-white px-5 py-3 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                      Choose Starter
                    </button>
                  ) : (
                    <a href="mailto:hello.nudgehq@gmail.com" className="mt-9 inline-flex w-full justify-center rounded-md bg-[#EEEDFE] px-5 py-3 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#7F77DD] hover:text-white">
                      Contact Us
                    </a>
                  )}
                </motion.article>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-2xl rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 text-center text-sm font-bold text-[#92400E]">
              14-day free trial included with Starter. No credit card needed to start.
            </p>
          </div>
        </section>
      )}

      {currentView === 'payment' && (
        <section className="mx-auto max-w-2xl px-5 py-20">
          <div className="rounded-2xl border border-[#DAD7FB] bg-white p-8 shadow-2xl shadow-[#3C3489]/10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1D9E75]">Payment</p>
            <h1 className="mt-3 text-3xl font-extrabold text-[#2C2C2A]">{selectedPlan === 'starter' ? 'Starter Plan' : 'Starter Plan'} - Rs. 2,000/month</h1>
            <div className="mt-8 rounded-lg bg-[#FCFCFF] p-5">
              <div className="flex items-center justify-between border-b border-[#EEEDFE] pb-4">
                <span className="font-bold text-[#2C2C2A]">Starter Plan</span>
                <span className="font-extrabold text-[#3C3489]">Rs. 2,000/month</span>
              </div>
              <div className="flex items-center justify-between pt-4 text-sm font-bold text-[#1D9E75]">
                <span>First 14 days</span>
                <span>Free</span>
              </div>
            </div>
            <button
              type="button"
              onClick={activateStarterPlan}
              disabled={paymentLoading}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#3C3489] disabled:opacity-50"
            >
              {paymentLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Pay with Razorpay Test
            </button>
          </div>
        </section>
      )}

      {currentView === 'onboarding' && (
        <section className="relative isolate overflow-hidden bg-[#F7FAFF] px-5 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#DAD7FB] bg-white p-7 shadow-2xl shadow-[#3C3489]/10">
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
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <input className="rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD] sm:col-span-2" placeholder="Company name" value={companyDetails.name} onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })} />
                <input className="rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" placeholder="Company logo URL (optional)" value={companyDetails.logo_url} onChange={(e) => setCompanyDetails({ ...companyDetails, logo_url: e.target.value })} />
                <select className="rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none" value={companyDetails.industry} onChange={(e) => setCompanyDetails({ ...companyDetails, industry: e.target.value })}>
                  {['Tech', 'Finance', 'Healthcare', 'Logistics', 'Retail', 'Manufacturing', 'Consulting', 'Education', 'Other'].map((item) => <option key={item}>{item}</option>)}
                </select>
                <select className="rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none" value={companyDetails.size} onChange={(e) => setCompanyDetails({ ...companyDetails, size: e.target.value })}>
                  {['1-10', '11-50', '51-200', '200+'].map((item) => <option key={item}>{item}</option>)}
                </select>
                <input className="rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" placeholder="Country" value={companyDetails.country} onChange={(e) => setCompanyDetails({ ...companyDetails, country: e.target.value })} />
                <input className="rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD] sm:col-span-2" placeholder="City" value={companyDetails.city} onChange={(e) => setCompanyDetails({ ...companyDetails, city: e.target.value })} />
                <button type="button" onClick={() => setOnboardingStep(2)} className="rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-bold text-white sm:col-span-2">Continue</button>
              </div>
            ) : null}

            {onboardingStep === 2 ? (
              <div className="mt-7 space-y-4">
                {onboardingDepartments.map((dept, index) => (
                  <div key={`dept-${index}`} className="grid gap-3 sm:grid-cols-2">
                    <input className="rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" placeholder="Department name" value={dept.name} onChange={(e) => setOnboardingDepartments((items) => items.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
                    <input className="rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" placeholder="Description" value={dept.description} onChange={(e) => setOnboardingDepartments((items) => items.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} />
                  </div>
                ))}
                <div className="flex flex-wrap gap-3">
                  <button type="button" disabled={onboardingDepartments.length >= 5} onClick={() => setOnboardingDepartments((items) => [...items, { name: '', description: '' }])} className="rounded-md border border-[#DAD7FB] px-4 py-2 text-sm font-bold text-[#3C3489]">+ Add another department</button>
                  <button type="button" onClick={() => setOnboardingStep(3)} className="rounded-md px-4 py-2 text-sm font-bold text-[#5F5E5A]">Skip for now</button>
                  <button type="button" onClick={() => setOnboardingStep(3)} className="ml-auto rounded-md bg-[#7F77DD] px-5 py-2 text-sm font-bold text-white">Continue</button>
                </div>
              </div>
            ) : null}

            {onboardingStep === 3 ? (
              <div className="mt-7 space-y-7">
                <div className="rounded-lg border border-[#DAD7FB] bg-[#FCFCFF] p-4">
                  <p className="font-bold text-[#2C2C2A]">Your Starter plan allows up to 15 employees</p>
                  <p className="mt-1 text-sm font-semibold text-[#3C3489]">{inviteEmployees.filter((employee) => employee.email).length + csvPreview.length} of 15 employees added</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2C2A]">Way 1 - Manual invite</h3>
                  <div className="mt-3 space-y-3">
                    {inviteEmployees.map((employee, index) => (
                      <div key={`emp-${index}`} className="grid gap-2 lg:grid-cols-4">
                        {['name', 'email', 'department', 'role'].map((field) => (
                          <input key={field} className="rounded-md border border-[#DAD7FB] px-3 py-2 text-sm outline-none focus:border-[#7F77DD]" placeholder={field === 'email' ? 'Email' : field[0].toUpperCase() + field.slice(1)} value={employee[field]} onChange={(e) => setInviteEmployees((items) => items.map((item, i) => i === index ? { ...item, [field]: e.target.value } : item))} />
                        ))}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setInviteEmployees((items) => [...items, { name: '', email: '', department: '', role: 'employee' }])} className="mt-3 rounded-md border border-[#DAD7FB] px-4 py-2 text-sm font-bold text-[#3C3489]">+ Add another employee</button>
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2C2A]">Way 2 - CSV upload</h3>
                  <div className="mt-3 rounded-lg border border-dashed border-[#7F77DD] bg-[#F4F3FF] p-5">
                    <p className="text-sm font-semibold text-[#3C3489]">Expected format: Name, Email, Department, Role</p>
                    <input type="file" accept=".csv" className="mt-3 text-sm" onChange={(e) => e.target.files?.[0] && parseEmployeeCsv(e.target.files[0])} />
                    <button type="button" onClick={downloadSampleCsv} className="ml-0 mt-3 rounded-md bg-white px-3 py-2 text-xs font-bold text-[#3C3489] sm:ml-3">Download sample CSV</button>
                  </div>
                  {csvPreview.length ? <p className="mt-2 text-sm font-bold text-[#1D9E75]">{csvPreview.length} CSV employees ready to invite.</p> : null}
                </div>
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-4">
                  <h3 className="font-bold text-[#2C2C2A]">Way 3 - Magic invite link</h3>
                  <p className="mt-1 text-sm text-[#5F5E5A]">Auto-generated after setup. Share it in your company WhatsApp or email.</p>
                  {magicInviteLink ? <p className="mt-3 rounded-md bg-[#EEEDFE] p-3 text-sm font-bold text-[#3C3489]">{magicInviteLink}</p> : null}
                </div>
                <button type="button" disabled={onboardingLoading} onClick={finishOnboarding} className="w-full rounded-md bg-[#7F77DD] px-5 py-3.5 text-sm font-extrabold text-white hover:bg-[#3C3489] disabled:opacity-50">
                  {onboardingLoading ? 'Finishing setup...' : 'Finish setup'}
                </button>
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
                Newly building for modern Indian teams · ✦ Now in beta — join early teams
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
            </div>
          </section>

          <section className="border-y border-[#EEEDFE] bg-white px-5 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl text-center">
              <p className="text-sm font-bold text-[#5F5E5A]">Trusted by early teams across India 🇮🇳</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[#8A8894]">
                {['Techflow', 'Nexus Labs', 'Brightwork', 'Crevo', 'Opstree'].map((company) => (
                  <span key={company}>{company}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <SectionHeader
                eyebrow="Before vs after"
                title="Your team, before and after NudgeHQ"
                copy="The product is built around one promise: less chasing, more knowing."
              />
              <div className="mt-12 grid gap-5">
                {[
                  [
                    'Manager sends 5 WhatsApp messages asking for updates every morning',
                    "Manager opens NudgeHQ and sees every team member's status instantly"
                  ],
                  [
                    'HR spends 3 hours every Monday building weekly reports manually',
                    'NudgeAI generates the full team report automatically at 9am'
                  ],
                  [
                    'Blockers go unnoticed for days and delay entire projects',
                    'NudgeHQ alerts the admin within minutes of a blocker being flagged'
                  ]
                ].map(([before, after], index) => (
                  <motion.div
                    key={before}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <div className="rounded-2xl border border-rose-100 bg-[#FFF5F5] p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
                          <X className="h-5 w-5" />
                        </span>
                        <p className="text-base font-extrabold leading-7 text-[#2C2C2A]">{before}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-[#F0FFF4] p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1D9E75] shadow-sm">
                          <Check className="h-5 w-5" />
                        </span>
                        <p className="text-base font-extrabold leading-7 text-[#2C2C2A]">{after}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                  ['🔥', 'Burnout Predictor', "NudgeAI detects early warning signs of burnout before it affects your team's output."],
                  ['📊', 'Sprint Forecast', "Every Monday, NudgeAI predicts your team's completion rate for the week and flags at-risk tasks."],
                  ['✍️', 'Standup Writer', 'NudgeAI reads all updates and writes your morning team brief automatically. No meeting needed.']
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
            <div className="mx-auto max-w-6xl">
              <SectionHeader
                eyebrow="Early feedback"
                title="What early teams are saying"
                copy="Sample early-user stories that show the kind of workflow NudgeHQ is built to unlock."
              />
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {[
                  ['RM', 'Our Monday morning meetings went from 45 minutes to 10 minutes.', 'Ravi M., HR Manager', 'Techflow, Bangalore · 40 employees'],
                  ['SK', 'I finally know what my team did this week without asking anyone.', 'Sneha K., Founder', 'Crevo, Mumbai · 22 employees'],
                  ['AP', 'NudgeAI flagged a burnout risk before we even noticed the signs.', 'Arjun P., Operations Lead', 'Nexus Labs, Pune · 55 employees']
                ].map(([initials, quote, name, meta], index) => (
                  <motion.article
                    key={quote}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
                    className="rounded-2xl border border-[#EEEDFE] bg-white p-6 shadow-lg shadow-[#3C3489]/7"
                  >
                    <p className="text-sm tracking-[0.12em] text-[#F59E0B]">★★★★★</p>
                    <p className="mt-5 text-5xl font-extrabold leading-none text-[#7F77DD]">“</p>
                    <p className="-mt-3 text-lg font-extrabold leading-8 text-[#2C2C2A]">{quote}</p>
                    <div className="mt-8 flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEEDFE] text-sm font-extrabold text-[#3C3489]">{initials}</span>
                      <span>
                        <span className="block text-sm font-extrabold text-[#2C2C2A]">{name}</span>
                        <span className="block text-xs font-semibold text-[#8A8894]">{meta}</span>
                      </span>
                    </div>
                  </motion.article>
                ))}
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
                  ['Can we try before paying?', 'Yes. Full 14-day free trial with no credit card required. Cancel anytime.'],
                  ['What if an employee forgets to submit an update?', 'NudgeAI automatically detects inactivity and sends a gentle nudge. Admin gets alerted too.'],
                  ['Do you support WhatsApp updates?', 'WhatsApp integration is coming in V2. For now updates are submitted through the web app.'],
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
                title="Start simple. Scale when visibility becomes company-wide."
                copy="Simple pricing. No hidden costs. Cancel anytime."
              />
              <div className="mx-auto mt-7 max-w-3xl rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 text-center shadow-sm">
                <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#92400E]">Temporary pricing</p>
                <p className="mt-2 text-base font-bold leading-7 text-[#2C2C2A]">
                  Pricing is not fixed yet. These plans are early estimates and may change as NudgeHQ grows, adds features, and moves into future releases.
                </p>
              </div>
              <div className="mt-14 grid gap-5 lg:grid-cols-4">
                {pricing.map(({ name, price, description, features, highlighted, entry, button, contact }, index) => (
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
                      {price}
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
              <div className="grid gap-6 rounded-[1.5rem] border border-[#EEEDFE] bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#161238] text-2xl font-extrabold text-white">N.</span>
                  <div>
                    <p className="text-lg font-extrabold text-[#2C2C2A]">Instagram: @hello.nudgehq</p>
                    <p className="text-sm font-semibold text-[#5F5E5A]">Follow product drops, UI previews, and build updates separately here.</p>
                  </div>
                </div>
                <a
                  href="https://www.instagram.com/hello.nudgehq/?__pwa=1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3C3489] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#7F77DD]"
                >
                  Connect on Instagram
                  <ArrowRight className="h-4 w-4" />
                </a>
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
              <p className="mt-6 text-sm font-bold text-white/75">14-day free trial · No credit card required · Cancel anytime</p>
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
                  <a className="hover:text-[#3C3489]" href="#pricing">Pricing</a>
                  <a className="hover:text-[#3C3489]" href="#security">Security</a>
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
                    href="https://www.instagram.com/hello.nudgehq/?__pwa=1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-bold text-[#3C3489]">
                    LinkedIn
                    <span className="text-[#5F5E5A]">Coming soon</span>
                  </span>
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
              <p className="text-sm text-[#5F5E5A]">(c) 2026 NudgeHQ. All rights reserved.</p>
            </div>
          </footer>
        </>
      )}

      {/* VIEW 2: SIGN IN */}
      {currentView === 'signin' && (
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#F7FAFF] px-5 py-12 text-[#2C2C2A] sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#EEF4FF_0%,#FFFFFF_46%,#EAF8F2_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-35" />
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/12 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div {...cardMotion} className="bg-[#FBFBFF] p-6 text-[#2C2C2A] sm:p-8 lg:p-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-md shadow-[#3C3489]/10" />
                  <div>
                    <p className="text-lg font-extrabold text-[#2C2C2A]">NudgeHQ</p>
                    <p className="text-xs font-semibold text-[#5F5E5A]">Workforce progress OS</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#3C3489]">Secure</span>
              </div>

              <div className="mt-8 rounded-full bg-[#F1F2F7] p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button type="button" className="rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#2C2C2A] shadow-sm">
                    Sign In
                  </button>
                  <button type="button" onClick={openSignup} className="rounded-full px-4 py-2.5 text-sm font-bold text-[#8A8984] transition hover:text-[#3C3489]">
                    Sign Up
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h1 className="text-3xl font-extrabold tracking-normal text-[#1E2737]">Welcome back</h1>
                <p className="mt-2 text-sm leading-6 text-[#5F5E5A]">Log in to open tasks, blockers, reports, and NudgeAI insights.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-7 grid gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Email address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
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
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3C3489] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#3C3489]/20 transition hover:bg-[#7F77DD] disabled:opacity-50"
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

            <motion.div {...cardMotion} className="relative min-h-[34rem] overflow-hidden bg-[linear-gradient(135deg,#7F77DD_0%,#3657D6_48%,#DDEBFF_100%)] p-8">
              <div className="absolute inset-0 soft-grid opacity-20" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/16 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                    NudgeAI ready
                  </span>
                  <button type="button" onClick={() => setCurrentView('demo_console')} className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                    Demo Console
                  </button>
                </div>
                <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-white/35 bg-white/18 p-4 shadow-2xl shadow-[#16215E]/30 backdrop-blur">
                  <div className="rounded-[1.35rem] bg-white p-5 text-[#2C2C2A]">
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
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#EEF4FF_0%,#FFFFFF_46%,#EAF8F2_100%)]" />
          <div className="soft-grid absolute inset-0 -z-10 opacity-35" />
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-[#DAD7FB] bg-white shadow-2xl shadow-[#3C3489]/12 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div {...cardMotion} className="bg-[#FBFBFF] p-6 text-[#2C2C2A] sm:p-8 lg:p-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-md shadow-[#3C3489]/10" />
                  <div>
                    <p className="text-lg font-extrabold text-[#2C2C2A]">NudgeHQ</p>
                    <p className="text-xs font-semibold text-[#5F5E5A]">Create your workspace</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1D9E75]">14-day trial</span>
              </div>

              <div className="mt-8 rounded-full bg-[#F1F2F7] p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button type="button" className="rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#2C2C2A] shadow-sm">
                    Sign Up
                  </button>
                  <button type="button" onClick={openSignin} className="rounded-full px-4 py-2.5 text-sm font-bold text-[#8A8984] transition hover:text-[#3C3489]">
                    Sign In
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h1 className="text-3xl font-extrabold tracking-normal text-[#1E2737]">Create an account</h1>
                <p className="mt-2 text-sm leading-6 text-[#5F5E5A]">Set up your company HQ, verify email, then continue into onboarding.</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="mt-7 grid gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Company name</label>
                  <input
                    type="text"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
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
                      className="mt-2 block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
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
                      className="mt-2 block w-full rounded-2xl border border-[#DAD7FB] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#7F77DD] focus:shadow-[0_0_0_4px_rgba(127,119,221,0.12)]"
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
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3C3489] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#3C3489]/20 transition hover:bg-[#7F77DD] disabled:opacity-50"
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

            <motion.div {...cardMotion} className="relative min-h-[42rem] overflow-hidden bg-[linear-gradient(135deg,#EEEDFE_0%,#7F77DD_46%,#DDEBFF_100%)] p-8">
              <div className="absolute inset-0 soft-grid opacity-20" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#3C3489] backdrop-blur">
                    <Building2 className="h-4 w-4" />
                    Setup preview
                  </span>
                  <span className="rounded-full bg-[#111827] px-4 py-2 text-xs font-extrabold text-white">No credit card</span>
                </div>
                <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-white/60 bg-white/30 p-4 shadow-2xl shadow-[#3C3489]/25 backdrop-blur">
                  <div className="rounded-[1.35rem] bg-white p-5 text-[#2C2C2A]">
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
                    <p className="text-xs font-semibold text-[#5F5E5A]">Sandbox role studio</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E8F7F1] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1D9E75]">
                  Safe demo
                </span>
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3C3489] shadow-sm ring-1 ring-[#EEEDFE]">
                  <Zap className="h-4 w-4 text-[#F59E0B]" />
                  Developer demo console
                </span>
                <h2 className="mt-5 text-4xl font-extrabold leading-tight text-[#1E2737] sm:text-5xl">
                  Choose a role. Enter the HQ.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5F5E5A]">
                  Preview Employee, Manager, HR, and Admin dashboards without touching real customer data.
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
      {currentView === 'dashboard' && isSandbox && (
        <section className="min-h-screen bg-[#F7F8FB] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[92rem] overflow-hidden rounded-[28px] border border-[#E7E5F8] bg-white shadow-2xl shadow-[#3C3489]/10 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="flex border-b border-[#EEEDFE] bg-white p-5 lg:min-h-[calc(100vh-3rem)] lg:flex-col lg:border-b-0 lg:border-r">
              <div className="flex w-full items-center justify-between gap-4 lg:block">
                <div className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-sm" />
                  <div>
                    <p className="text-lg font-extrabold text-[#3C3489]">NudgeHQ</p>
                    <p className="text-xs font-bold text-[#8A8894]">{dashboardRoleLabel} demo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('demo_console')}
                  className="rounded-xl border border-[#FECACA] px-3 py-2 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50 lg:hidden"
                >
                  Exit
                </button>
              </div>

              <nav className="mt-7 hidden flex-1 space-y-2 lg:block">
                {demoSidebarItems.map(([label, Icon], index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (demoEmployeeCanNavigate) setDemoEmployeeSection(label);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border-l-[3px] px-4 py-3 text-sm font-extrabold transition ${
                      (demoEmployeeCanNavigate ? selectedDemoSection === label : index === 0)
                        ? 'border-l-[#7F77DD] bg-[#7F77DD] text-white shadow-lg shadow-[#7F77DD]/22'
                        : 'border-l-transparent text-[#6E6B78] hover:bg-[#EEEDFE] hover:text-[#3C3489]'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto hidden rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4 lg:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3C3489] text-sm font-extrabold text-white">
                    {(user?.name || 'Demo User').split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#2C2C2A]">{user?.name || 'Demo User'}</p>
                    <p className="text-xs font-bold capitalize text-[#8A8894]">{dashboardRoleLabel}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('demo_console')}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#FECACA] px-3 py-2 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Exit demo
                </button>
              </div>
            </aside>

            <div className="min-w-0 bg-[#FAFAFD] p-5 sm:p-7">
              <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-[#2C2C2A] sm:text-4xl">
                    {dashboardGreeting}, {user?.name?.split(' ')[0] || 'Rahul'}! 👋
                  </h1>
                  <p className="mt-2 text-sm font-medium text-[#6E6B78]">
                    {dashboardRole === 'employee' ? "Here's your focus for today." : "Here's what's happening with your team today."}
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#EEEDFE] bg-white px-4 py-3 text-sm font-bold text-[#5F5E5A] shadow-sm">
                  <Clock3 className="h-4 w-4 text-[#7F77DD]" />
                  {dashboardDateLabel} · Today
                </div>
              </header>

              <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {demoStatCards.map(([title, value, Icon, color, trend, trendType]) => (
                  <article key={title} className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-extrabold text-[#5F5E5A]">{title}</p>
                        <p className="mt-4 text-4xl font-extrabold tracking-tight text-[#111827]">{value}</p>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <p className={`mt-4 text-xs font-extrabold ${trendType === 'up' ? 'text-[#1D9E75]' : trendType === 'down' ? 'text-[#EF4444]' : 'text-[#8A8894]'}`}>
                      {trend}
                    </p>
                  </article>
                ))}
              </div>

              {(!demoEmployeeCanNavigate || selectedDemoSection === 'My Dashboard') && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-extrabold text-[#2C2C2A]">{dashboardRole === 'employee' ? 'My Tasks' : 'Team Progress'}</h2>
                      <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">
                        {dashboardRoleLabel}
                      </span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {dashboardRole === 'employee' && !employeeTaskRows.length ? renderEmptyState({
                        title: 'No tasks assigned yet',
                        sub: 'Your manager will assign tasks soon. Check back here!',
                        Icon: ListTodo
                      }) : null}
                      {(dashboardRole === 'employee' ? employeeTaskRows : demoProgressRows).map(([name, task, progress, status, color], index) => (
                        <button
                          key={`${name}-${task}`}
                          type="button"
                          onClick={() => {
                            if (dashboardRole === 'employee') openDemoTask([name, task, progress, status, color]);
                          }}
                          className="grid w-full gap-3 rounded-xl border border-[#F0EFFA] bg-[#FCFCFF] p-3 text-left transition hover:border-[#7F77DD] hover:bg-[#F7F6FF] sm:grid-cols-[minmax(10rem,1fr)_minmax(9rem,0.7fr)_4rem_7rem] sm:items-center"
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
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setDemoEmployeeSection('My Tasks')} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#DAD7FB] px-4 py-2 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                      View all tasks
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </section>

                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
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
                            {employeeRecentActivityRows.length ? employeeRecentActivityRows.map(([action, detail, time, Icon, color]) => (
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
                        {demoActivityRows.map(([action, task, time, Icon, color]) => (
                          <div key={`${action}-${task}`} className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}16`, color }}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-extrabold text-[#2C2C2A]">{action}</p>
                              <p className="text-xs font-semibold text-[#8A8894]">{task}</p>
                            </div>
                            <span className="text-xs font-bold text-[#8A8894]">{time}</span>
                          </div>
                        ))}
                        <button type="button" className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#DAD7FB] px-4 py-2 text-sm font-extrabold text-[#3C3489] transition hover:bg-[#EEEDFE]">
                          View all activity
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {demoEmployeeCanNavigate && selectedDemoSection === 'My Tasks' && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1D9E75]">Today</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">Your work queue</h2>
                    <p className="mt-2 text-sm leading-6 text-[#5F5E5A]">Everything here is only visible to you and your assigned manager.</p>
                    <div className="mt-5 grid gap-3">
                      {!demoWorkQueueRows.length ? renderEmptyState({
                        title: 'No tasks assigned yet',
                        sub: 'Your manager will assign tasks soon. Check back here!',
                        Icon: ListTodo
                      }) : null}
                      {demoWorkQueueRows.map(([group, task, progress, status, color]) => (
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
                      {!employeeTaskRows.length ? renderEmptyState({
                        title: 'No tasks assigned yet',
                        sub: 'Your manager will assign tasks soon. Check back here!',
                        Icon: ListTodo
                      }) : null}
                      {employeeTaskRows.map(([name, task, progress, status, color]) => (
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
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7F77DD]">Daily check-in</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">Tell the workspace what changed</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {[
                        ['Office', '🏢 Office'],
                        ['Home', '🏠 Home'],
                        ['Client site', '🤝 Client site'],
                        ['Travel', '✈️ Travel']
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
                      {['Goal 1: finish dashboard polish', 'Goal 2: test onboarding flow', 'Main focus: NudgeAI employee experience'].map((placeholder) => (
                        <div key={placeholder} className="rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3 text-sm font-semibold text-[#8A8894]">
                          {placeholder}
                        </div>
                      ))}
                      <div className="min-h-28 rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3 text-sm font-semibold text-[#8A8894]">
                        Progress update: Completed the first visual pass and found two blockers around auth redirects.
                      </div>
                    </div>
                    <button type="button" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7F77DD] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#3C3489]">
                      <Send className="h-4 w-4" />
                      Submit check-in
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
                    <div className="mt-5 grid gap-3">
                      {[
                        ['Completion rate', '82%', '▲ 12% this week', '#1D9E75'],
                        ['Check-in streak', '9 days', 'Personal best', '#7F77DD'],
                        ['Blockers resolved', '4', '2 faster than avg', '#F59E0B']
                      ].map(([label, value, trend, color]) => (
                        <div key={label} className="rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8A8894]">{label}</p>
                          <p className="mt-2 text-3xl font-extrabold text-[#2C2C2A]">{value}</p>
                          <p className="mt-1 text-xs font-extrabold" style={{ color }}>{trend}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-[#2C2C2A]">Weekly progress curve</h2>
                        <p className="mt-1 text-sm font-semibold text-[#8A8894]">Tasks completed per day · last 7 days</p>
                      </div>
                      {!actualWeeklyProgressData.length ? (
                        <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-extrabold text-[#3C3489]">Demo data</span>
                      ) : null}
                    </div>
                    {weeklyProgressData.length ? (
                      <div className="mt-6 h-64 rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={weeklyProgressData} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
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
                      <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#3C3489] px-3 py-2 text-xs font-extrabold text-white">
                        <Download className="h-4 w-4" />
                        90-day PDF
                      </button>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {['30 days', '60 days', '90 days'].map((period, index) => (
                        <div key={period} className="rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <p className="text-sm font-extrabold text-[#3C3489]">{period}</p>
                          <p className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">{[18, 39, 64][index]}</p>
                          <p className="mt-1 text-xs font-semibold text-[#8A8894]">tasks completed</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-xl bg-[#F7F6FF] p-4 text-sm font-semibold leading-6 text-[#5F5E5A]">
                      <span className="font-extrabold text-[#3C3489]">NudgeAI career summary:</span> You are strongest on focused execution days and your most productive pattern is Tuesday morning deep work.
                    </div>
                  </section>
                  <section className="rounded-xl border border-[#EEEDFE] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <h2 className="text-xl font-extrabold text-[#2C2C2A]">Personal wins</h2>
                    <div className="mt-5 space-y-3">
                      {[
                        ['Resolved blocker without escalation', Zap, '#FFF3E0', '#F59E0B'],
                        ['9-day check-in streak', Trophy, '#FFFDE7', '#D97706'],
                        ['Helped teammate unblock', Star, '#EEEDFE', '#7F77DD']
                      ].map(([win, Icon, bg, color]) => (
                        <div key={win} className="flex items-center gap-3 rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: bg, color }}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <p className="text-sm font-extrabold text-[#2C2C2A]">{win}</p>
                        </div>
                      ))}
                    </div>
                  </section>
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
                        onClick={() => setCurrentView('nudgeai')}
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
                    <h2 className="text-xl font-extrabold text-[#2C2C2A]">Profile</h2>
                    <div className="mt-5 flex items-center gap-4 rounded-xl border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7F77DD] text-lg font-extrabold text-white">EU</span>
                      <div>
                        <p className="font-extrabold text-[#2C2C2A]">Employee User</p>
                        <p className="text-sm font-semibold text-[#8A8894]">employee@nudgehq.com</p>
                      </div>
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
                  </section>
                </div>
              )}

              <AnimatePresence>
                {selectedDemoTask && (
                  <motion.div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111827]/45 px-4 py-6 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 24, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 24, scale: 0.96 }}
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
                            showToast(`Demo task update submitted${proofCount ? ` with ${proofCount} proof item${proofCount > 1 ? 's' : ''}` : ''}.`, 'success');
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
                    onClick={() => {
                      if (demoEmployeeCanNavigate) setDemoEmployeeSection(label);
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-extrabold ${(demoEmployeeCanNavigate ? selectedDemoSection === label : index === 0) ? 'bg-[#7F77DD] text-white' : 'text-[#6E6B78]'}`}
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

      {currentView === 'dashboard' && !isSandbox && (
        <section
          className={`workspace-surface workspace-surface-${dashboardRole} relative mx-auto max-w-[96rem] overflow-hidden px-5 py-8 sm:px-6 lg:px-8`}
          style={{
            '--role-accent': roleTheme.accent,
            '--role-strong': roleTheme.strong,
            '--role-soft': roleTheme.soft,
            '--role-glow': roleTheme.glow
          }}
        >
          <div className="soft-grid absolute inset-x-0 top-0 -z-10 h-[34rem] opacity-45" />
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

            <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

          {/* --- SUBVIEW: EMPLOYEE WORKSPACE --- */}
          {isEmployeeDashboard && (
            <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)]">
              
              {/* Employee Left Column */}
              <div className="space-y-7">
                <div className="workspace-card rounded-2xl p-7">
                  <h3 className="text-lg font-bold text-[#2C2C2A] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#1D9E75]" />
                    Smart Presence Check-in
                  </h3>
                  <form onSubmit={handleCheckinSubmit} className="mt-5 grid gap-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} className="rounded-md border border-[#DAD7FB] bg-white px-3 py-2.5 text-sm outline-none">
                        <option value="office">Office</option>
                        <option value="home">Home</option>
                        <option value="client_site">Client site</option>
                        <option value="travel">Travel</option>
                      </select>
                      <div className="grid grid-cols-3 gap-2">
                        {['high', 'medium', 'low'].map((level) => (
                          <button key={level} type="button" onClick={() => setEnergyLevel(level)} className={`rounded-md border px-3 py-2 text-xs font-bold capitalize ${energyLevel === level ? 'border-[#7F77DD] bg-[#F4F3FF] text-[#3C3489]' : 'border-[#EEEDFE] text-[#5F5E5A]'}`}>
                            {level === 'high' ? '⚡' : level === 'medium' ? '🙂' : '🔋'} {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {goals.map((goal, index) => (
                        <input
                          key={index}
                          value={goal}
                          onChange={(e) => setGoals(goals.map((item, i) => i === index ? e.target.value : item))}
                          placeholder={`Today's goal ${index + 1}`}
                          className="rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                        />
                      ))}
                    </div>
                    <button type="submit" className="w-fit rounded-md bg-[#3C3489] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#7F77DD]">
                      Save Check-in
                    </button>
                  </form>
                </div>
                
                {/* Submit Daily Update */}
                <div className="workspace-card rounded-2xl p-7">
                  <h3 className="text-lg font-bold text-[#2C2C2A] flex items-center gap-2">
                    <Send className="h-5 w-5 text-[#7F77DD]" />
                    Share Daily Progress Update
                  </h3>
                  <form onSubmit={handleProgressSubmit} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5F5E5A]">Link this update to a Task (Optional)</label>
                      <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] bg-white px-3 py-2 text-sm outline-none focus:border-[#7F77DD]"
                      >
                        <option value="">General update / No task link</option>
                        {empTasks.map(t => (
                          <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5F5E5A]">What did you accomplish today? *</label>
                      <textarea
                        value={progressText}
                        onChange={(e) => setProgressText(e.target.value)}
                        placeholder="Detail accomplishments, milestones, or current focus..."
                        className="mt-1.5 block min-h-24 w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                        required
                      />
                    </div>

                    <div className="grid gap-3 rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-4 sm:grid-cols-[1fr_auto]">
                      <div>
                        <label className="block text-xs font-semibold text-[#5F5E5A]">What is your main focus right now?</label>
                        <input
                          type="text"
                          value={focusText}
                          onChange={(e) => setFocusText(e.target.value)}
                          placeholder="One clear focus for Focus Pulse"
                          className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#5F5E5A]">ETA</label>
                        <select value={focusEta} onChange={(e) => setFocusEta(e.target.value)} className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] bg-white px-3 py-2.5 text-sm outline-none">
                          <option value="today">Today</option>
                          <option value="tomorrow">Tomorrow</option>
                          <option value="this_week">This Week</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5F5E5A]">Proof/Deliverable Link (Optional)</label>
                      <input
                        type="url"
                        value={proofLink}
                        onChange={(e) => setProofLink(e.target.value)}
                        placeholder="https://github.com/... or https://docs.google.com/..."
                        className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingUpdate}
                      className="inline-flex items-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#3C3489] transition disabled:opacity-50"
                    >
                      {isSubmittingUpdate ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Log Progress Update
                    </button>
                    {qualityTip ? (
                      <div className="rounded-md border border-[#DAD7FB] bg-[#F4F3FF] p-3 text-xs font-semibold leading-6 text-[#3C3489]">
                        <span className="font-bold">NudgeAI tip:</span> {qualityTip}
                      </div>
                    ) : null}
                  </form>
                </div>

                {/* Task Status Transition Modal for Blockers */}
                {activeBlockTask && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1035]/45 px-5 py-8">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                      <div className="flex items-start justify-between">
                        <h4 className="text-lg font-bold text-rose-600">Declare Task Blocker</h4>
                        <button onClick={() => setActiveBlockTask(null)} className="text-[#5F5E5A] hover:text-[#2C2C2A]">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[#5F5E5A]">
                        Task: <strong>{activeBlockTask.title}</strong>
                      </p>
                      
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-[#5F5E5A]">What is blocking your progress?</label>
                        <textarea
                          value={blockerTextVal}
                          onChange={(e) => setBlockerTextVal(e.target.value)}
                          placeholder="Provide details about credentials needed, dependencies on other teams, or server issues..."
                          className="mt-1.5 block min-h-20 w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-sm outline-none focus:border-rose-500"
                          required
                        />
                      </div>

                      <div className="mt-5 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveBlockTask(null)}
                          className="rounded-md border border-[#DAD7FB] px-4 py-2 text-xs font-semibold text-[#5F5E5A] hover:bg-[#EEEDFE]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTaskStatusApi(activeBlockTask.id, 'blocked', blockerTextVal)}
                          disabled={!blockerTextVal.trim()}
                          className="rounded-md bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          Submit Blocker
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Check-in History */}
                <div className="workspace-card rounded-2xl p-7">
                  <h3 className="text-lg font-bold text-[#2C2C2A] flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-[#3C3489]" />
                    Your Progress Update History
                  </h3>
                  <div className="mt-5 divide-y divide-[#EEEDFE] max-h-96 overflow-y-auto pr-2">
                    {empHistory.length === 0 ? (
                      <p className="text-sm text-[#5F5E5A] py-4">No progress logs found in database history.</p>
                    ) : (
                      empHistory.map(h => (
                        <div key={h.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex justify-between text-xs text-[#5F5E5A]">
                            <span>{h.tasks ? `Task: ${h.tasks.title}` : 'General Update'}</span>
                            <span>{formatDisplayDate(h.created_at)}</span>
                          </div>
                          <p className="mt-2 text-sm text-[#2C2C2A] font-medium leading-relaxed">{h.progress_text}</p>
                          {h.quality_score ? (
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#F4F3FF] px-3 py-1 text-[11px] font-bold text-[#3C3489]">
                              Powered by NudgeAI
                              <span>Quality {h.quality_score}/10</span>
                            </div>
                          ) : null}
                          {h.proof_link && (
                            <a
                              href={h.proof_link}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-[#7F77DD] hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Deliverable Proof
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Employee Right Column: Task Status Desk */}
              <div className="space-y-7">
                <div className="workspace-card rounded-2xl p-7">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-[#2C2C2A]">
                    <Clock3 className="h-5 w-5 text-[#7F77DD]" />
                    Deep Work Mode
                  </h3>
                  {activeDeepWork ? (
                    <div className="mt-4 rounded-md bg-[#F4F3FF] p-4">
                      <p className="text-sm font-bold text-[#3C3489]">In Deep Work until {formatDisplayDate(activeDeepWork.end_time)}</p>
                      <p className="mt-1 text-xs text-[#5F5E5A]">{activeDeepWork.focus_declared}</p>
                      <textarea
                        value={deepWorkOutput}
                        onChange={(e) => setDeepWorkOutput(e.target.value)}
                        placeholder="Deep work session complete! What did you accomplish?"
                        className="mt-4 block min-h-20 w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-sm outline-none"
                      />
                      <button type="button" onClick={endDeepWorkSession} className="mt-3 rounded-md bg-[#3C3489] px-4 py-2 text-xs font-bold text-white hover:bg-[#7F77DD]">
                        Log Output
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={startDeepWorkSession} className="mt-4 grid gap-3">
                      <input value={deepWorkFocus} onChange={(e) => setDeepWorkFocus(e.target.value)} placeholder="What will you work on?" className="rounded-md border border-[#DAD7FB] px-3 py-2 text-sm outline-none" />
                      <select value={deepWorkDuration} onChange={(e) => setDeepWorkDuration(e.target.value)} className="rounded-md border border-[#DAD7FB] bg-white px-3 py-2 text-sm outline-none">
                        <option value={60}>1 hr</option>
                        <option value={120}>2 hr</option>
                        <option value={180}>3 hr</option>
                        <option value={45}>Custom: 45 min</option>
                      </select>
                      <button type="submit" className="rounded-md bg-[#7F77DD] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3C3489]">
                        Start Deep Work
                      </button>
                    </form>
                  )}
                </div>

                <div className="workspace-card rounded-2xl p-7">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#2C2C2A]">My Growth Portal</h3>
                    <PoweredByNudgeAi />
                  </div>
                  <button type="button" onClick={loadGrowthSummary} className="mt-4 rounded-md border border-[#DAD7FB] px-4 py-2 text-xs font-bold text-[#3C3489] hover:bg-[#EEEDFE]">
                    {growthLoading ? 'Loading...' : 'Generate 90-day summary'}
                  </button>
                  {growthSummary ? (
                    <div className="mt-4 space-y-3 text-sm">
                      <p className="rounded-md bg-[#FCFCFF] p-3 leading-6 text-[#2C2C2A]">{growthSummary.summary}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <span className="rounded-md bg-[#E8F7F1] p-2 text-xs font-bold text-[#1D9E75]">{growthSummary.completed_tasks} tasks</span>
                        <span className="rounded-md bg-[#F4F3FF] p-2 text-xs font-bold text-[#3C3489]">{growthSummary.completion_rate}% complete</span>
                        <span className="rounded-md bg-amber-50 p-2 text-xs font-bold text-amber-700">{growthSummary.streak_days?.length || 0} streak days</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {notifications.length > 0 ? (
                  <div className="workspace-card rounded-2xl p-7">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-[#2C2C2A]">
                      <Sparkles className="h-5 w-5 text-[#F59E0B]" />
                      Recognition
                    </h3>
                    <div className="mt-4 space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                          <p className="text-sm font-semibold leading-6 text-[#2C2C2A]">{notification.message}</p>
                          <p className="mt-2 text-[11px] font-semibold text-[#5F5E5A]">{formatDisplayDate(notification.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                {/* Stats Dashboard mini */}
                {empStats && (
                  <div className="workspace-card-quiet rounded-2xl p-7">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5F5E5A]">Assigned Task Ratios</h4>
                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white border border-[#EEEDFE] rounded p-2.5">
                        <span className="text-xl font-bold text-[#2C2C2A]">{empStats.todo + empStats.inProgress + empStats.completed + empStats.blocked}</span>
                        <p className="text-[10px] font-semibold text-[#5F5E5A] uppercase tracking-wider mt-1">Total</p>
                      </div>
                      <div className="bg-[#E8F7F1] border border-[#1D9E75]/20 rounded p-2.5">
                        <span className="text-xl font-bold text-[#1D9E75]">{empStats.completed}</span>
                        <p className="text-[10px] font-semibold text-[#1D9E75] uppercase tracking-wider mt-1">Done</p>
                      </div>
                      <div className="bg-[#F4F3FF] border border-[#7F77DD]/20 rounded p-2.5">
                        <span className="text-xl font-bold text-[#7F77DD]">{empStats.inProgress}</span>
                        <p className="text-[10px] font-semibold text-[#7F77DD] uppercase tracking-wider mt-1">Active</p>
                      </div>
                      <div className="bg-rose-50 border border-rose-200 rounded p-2.5">
                        <span className="text-xl font-bold text-rose-600">{empStats.blocked}</span>
                        <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mt-1">Block</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Tasks Card */}
                <div className="workspace-card rounded-2xl p-7">
                  <h3 className="text-lg font-bold text-[#2C2C2A] flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-[#1D9E75]" />
                    Assigned Task Registry
                  </h3>
                  <div className="mt-5 space-y-4">
                    {empTasks.length === 0 ? (
                      <p className="text-sm text-[#5F5E5A]">No tasks assigned to you currently.</p>
                    ) : (
                      empTasks.map(task => (
                        <div key={task.id} className="rounded-md border border-[#EEEDFE] p-4 bg-[#FCFCFF]">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-sm font-bold text-[#2C2C2A]">{task.title}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              task.status === 'completed' ? 'bg-[#E8F7F1] text-[#1D9E75]' :
                              task.status === 'blocked' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                              task.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          {task.description && <p className="mt-2 text-xs text-[#5F5E5A]">{task.description}</p>}
                          
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EEEDFE]/60 pt-3">
                            <span className="text-[10px] font-bold text-[#5F5E5A] w-full mb-1">Set status:</span>
                            {['todo', 'in_progress', 'completed', 'blocked'].map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleUpdateStatusClick(task, st)}
                                disabled={task.status === st}
                                className={`text-[10px] font-bold px-2 py-1 rounded border transition ${
                                  task.status === st 
                                    ? 'bg-[#3C3489] text-white border-[#3C3489]' 
                                    : 'bg-white border-[#DAD7FB] text-[#3C3489] hover:bg-[#EEEDFE]'
                                }`}
                              >
                                {st.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --- SUBVIEW: LEADER WORKSPACE --- */}
          {isLeaderDashboard && (
            <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.18fr)_minmax(22rem,0.82fr)]">
              
              {/* Admin Left Column */}
              <div className="space-y-7">
                <NudgeAiStandupCard
                  data={nudgeAiData.standup}
                  loading={nudgeAiLoading.standup}
                  onRegenerate={() => runNudgeAiFeature('standup', true)}
                />
                
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
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="workspace-card rounded-2xl p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1D9E75]">Manager Action Queue</p>
                          <h3 className="mt-2 text-xl font-extrabold text-[#2C2C2A]">Blockers your team needs cleared.</h3>
                        </div>
                        <AlertCircle className="h-8 w-8 text-[#F59E0B]" />
                      </div>
                      <div className="mt-5 space-y-3">
                        {managerBlockedTasks.length ? managerBlockedTasks.map((task) => (
                          <div key={task.id} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                            <p className="text-sm font-extrabold text-[#2C2C2A]">{task.title}</p>
                            <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">{task.assignee?.name || 'Unassigned'} · blocked</p>
                          </div>
                        )) : (
                          <p className="rounded-2xl border border-[#E8F7F1] bg-[#E8F7F1] px-4 py-3 text-sm font-bold text-[#1D9E75]">
                            No blocked team tasks right now.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="workspace-card rounded-2xl p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#3C3489]">Team Load</p>
                          <h3 className="mt-2 text-xl font-extrabold text-[#2C2C2A]">Assign work without leaving your scope.</h3>
                        </div>
                        <ListTodo className="h-8 w-8 text-[#7F77DD]" />
                      </div>
                      <div className="mt-5 space-y-3">
                        {managerUnassignedTasks.length ? managerUnassignedTasks.map((task) => (
                          <div key={task.id} className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3">
                            <p className="text-sm font-extrabold text-[#2C2C2A]">{task.title}</p>
                            <p className="mt-1 text-xs font-semibold text-[#5F5E5A]">Waiting for an owner</p>
                          </div>
                        )) : (
                          <p className="rounded-2xl border border-[#EEEDFE] bg-[#FCFCFF] px-4 py-3 text-sm font-bold text-[#3C3489]">
                            Every visible task has an owner.
                          </p>
                        )}
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
                <div className="workspace-card rounded-2xl p-7">
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
                <div className="workspace-card rounded-2xl p-7">
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
                        showToast("Sandbox data export simulated. Check console.", "info");
                        console.log(analytics);
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
                {isOpsDashboard && <div className="workspace-card rounded-2xl p-7">
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

      {['landing', 'signin', 'signup', 'privacy', 'terms', 'contact', 'dashboard'].includes(currentView) ? (
        <NudgeAssistant
          context={currentView === 'dashboard' ? 'dashboard' : 'public'}
          role={authRole || 'visitor'}
          page={currentView}
          dashboardSnapshot={assistantSnapshot}
          onAsk={askNudgeAi}
        />
      ) : null}
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
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-2xl border border-[#DAD7FB] bg-white p-8 shadow-2xl shadow-[#3C3489]/10">
        {invite?.organizations?.logo_url ? <img src={invite.organizations.logo_url} alt="" className="mx-auto h-14 w-14 rounded-xl object-cover" /> : <img src="/brand/nudgehq-icon.svg" alt="" className="mx-auto h-14 w-14 rounded-xl" />}
        <h1 className="mt-4 text-center text-2xl font-extrabold text-[#2C2C2A]">Join {invite?.organizations?.name || 'Company'} on NudgeHQ</h1>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <input className="block w-full rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="block w-full rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none focus:border-[#7F77DD]" placeholder="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <PasswordField label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
          {error ? <p className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-600">{error}</p> : null}
          <button disabled={submitting} className="w-full rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#3C3489] disabled:opacity-50">
            {submitting ? 'Joining...' : 'Join workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App
