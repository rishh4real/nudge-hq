import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BellRing,
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
  Globe2,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
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
  Search,
  Zap,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'

// --- CONSTANTS ---
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

const employeeFeatures = [
  ['Quick daily check-ins', Smartphone],
  ['Task progress nudges', BellRing],
  ['Blocker notes in seconds', MessageSquareText],
  ['Personal completion view', CheckCircle2],
]

const adminFeatures = [
  ['Live team dashboard', LayoutDashboard],
  ['Department progress trends', LineChart],
  ['Attendance and task visibility', UserCheck],
  ['Export-ready HR summaries', ClipboardCheck],
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
    name: 'Free',
    price: 'Rs.0',
    description: 'For small teams piloting progress visibility.',
    features: ['Free trial for 40 employees', 'Basic check-ins', 'Team progress board'],
  },
  {
    name: 'Starter',
    price: 'Rs.2000',
    description: 'For growing teams replacing manual follow-ups.',
    features: ['Up to 10 employees', 'Automated nudges', 'Weekly reports'],
  },
  {
    name: 'Growth',
    price: 'Rs.6000',
    description: 'For companies that need cross-team clarity.',
    features: ['Up to 40 employees', 'Admin analytics', 'Exports and roles'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For larger organizations with custom workflows.',
    features: ['Unlimited teams', 'Custom integrations', 'Priority support'],
  },
]

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
        ? 'Ask me about this workspace, tasks, blockers, NudgeAI reports, or what to do next.'
        : 'Ask me anything about NudgeHQ, pricing, features, privacy, or how the platform works.',
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
    ? ['What needs attention?', 'Explain my dashboard', 'What should I do next?']
    : ['What is NudgeHQ?', 'How does NudgeAI help?', 'Is pricing fixed?']

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
        className="group flex items-center gap-3 rounded-full bg-[#111827] px-5 py-4 text-sm font-extrabold text-white shadow-2xl shadow-[#111827]/25 transition hover:-translate-y-0.5 hover:bg-[#3C3489]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#8DE4C3]">
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
        </span>
        Ask NudgeAI
      </button>
    </div>
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
  if (path === '/dashboard' || path === '/dashboard/admin' || path === '/dashboard/employee') return 'signin';
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
  const [authRole, setAuthRole] = useState(null) // 'admin' | 'employee'
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  
  // Active Connection Metadata
  const [serverPort, setServerPort] = useState(null)
  const [isSandbox, setIsSandbox] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)

  // Sign-in States
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [signupCompany, setSignupCompany] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [signupAgree, setSignupAgree] = useState(false)
  const [signupError, setSignupError] = useState(null)
  const [signupLoading, setSignupLoading] = useState(false)
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
      } else if (path === '/dashboard' || path === '/dashboard/admin' || path === '/dashboard/employee') {
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
    else if (currentView === 'signin') targetPath = '/login';
    else if (currentView === 'signup') targetPath = '/signup';
    else if (currentView === 'choose_plan') targetPath = '/choose-plan';
    else if (currentView === 'payment') targetPath = '/payment';
    else if (currentView === 'onboarding') targetPath = '/onboarding';
    else if (currentView === 'join_workspace') targetPath = currentPath.startsWith('/join/') ? currentPath : '/join';
    else if (currentView === 'demo_console') targetPath = '/demo';
    else if (currentView === 'dashboard') targetPath = authRole === 'employee' ? '/dashboard/employee' : '/dashboard/admin';
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
      } else if (authRole === 'admin') {
        // Fetch Admin Analytics
        const { data: analyticRes } = await fetchApi('/analytics/dashboard', { method: 'GET' }, token);
        setAnalytics(analyticRes || null);

        // Fetch updates registry
        const { data: updateRes } = await fetchApi('/admin/updates', { method: 'GET' }, token);
        setAllUpdates(updateRes.updates || []);

        // Fetch departments
        const { data: deptRes } = await fetchApi('/admin/departments', { method: 'GET' }, token);
        setDepartments(deptRes.departments || []);

        // Fetch tasks to extract assignees/users list (Helper)
        const { data: taskRes } = await fetchApi('/tasks', { method: 'GET' }, token);
        const uniqueUsers = [];
        taskRes.tasks.forEach(t => {
          if (t.assignee && !uniqueUsers.some(u => u.id === t.assignee.id)) {
            uniqueUsers.push(t.assignee);
          }
        });
        setAdminUsers(uniqueUsers);

        const { data: focusRes } = await fetchApi('/focus/team', { method: 'GET' }, token);
        setTeamFocus(focusRes.focus_feed || []);
        setFocusInsight(focusRes.insight || '');

        const { data: presenceRes } = await fetchApi('/checkin/team', { method: 'GET' }, token);
        setTeamPresence(presenceRes.presence || []);
        setPresenceInsight(presenceRes.insight || '');

        const { data: deepWorkRes } = await fetchApi('/deepwork/team', { method: 'GET' }, token);
        setDeepWorkTeam(deepWorkRes || null);

        runNudgeAiFeature('standup', false);
        runNudgeAiFeature('skillGap', false);
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
    if (nextUser?.role === 'admin' && !nextUser?.onboarding_complete) {
      setOnboardingStep(1);
      setCurrentView('onboarding');
      return;
    }
    navigateDashboard(nextUser?.role || 'admin');
  };

  const enterSandboxDashboard = () => {
    const simulatedUser = emailInput === 'hr@nudgehq.com'
      ? { name: 'HR Operations', role: 'admin', email: 'hr@nudgehq.com' }
      : { name: 'Kunal', role: 'employee', email: 'employee@nudgehq.com' };

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
    if (role === 'admin') {
      setEmailInput('hr@nudgehq.com');
      setPasswordInput('nudgehq123');
    } else {
      setEmailInput('employee@nudgehq.com');
      setPasswordInput('nudgehq123');
    }
    setLoginError(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    if (isSandbox) {
      // Sandbox Authentication Bypass
      const simulatedUser = emailInput === 'hr@nudgehq.com'
        ? { name: 'HR Operations', role: 'admin', email: 'hr@nudgehq.com' }
        : { name: 'Kunal', role: 'employee', email: 'employee@nudgehq.com' };

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

  const startGoogleAuth = async (intent) => {
    setLoginError(null);
    setSignupError(null);

    if (intent === 'signup') {
      if (!signupCompany.trim()) {
        setSignupError('Add your company name before continuing with Google.');
        return;
      }
      if (!signupAgree) {
        setSignupError('Please agree to the Terms & Conditions to continue with Google.');
        return;
      }
      window.localStorage.setItem('nudgehq_google_signup_company', signupCompany.trim());
    } else {
      window.localStorage.removeItem('nudgehq_google_signup_company');
    }

    setGoogleLoading(true);
    try {
      const { data } = await fetchApi(`/auth/oauth/google/url?intent=${intent}`, { method: 'GET' });
      window.location.href = data.url;
    } catch (error) {
      const message = error.message || 'Could not start Google sign-in.';
      if (intent === 'signup') setSignupError(message);
      else setLoginError(message);
    } finally {
      setGoogleLoading(false);
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
        department_id: inviteDepartmentId || null
      };
      setAdminUsers([...adminUsers, invited]);
      setInviteResult({ email: inviteEmail, temporary_password: 'nudgehq123', sandbox: true });
      setInviteName('');
      setInviteEmail('');
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
          department_id: inviteDepartmentId || null
        })
      }, token);

      setAdminUsers([...adminUsers, data.employee]);
      setInviteResult({ email: data.employee.email, temporary_password: data.temporary_password, sandbox: false });
      setInviteName('');
      setInviteEmail('');
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
    const path = role === 'employee' ? '/dashboard/employee' : '/dashboard/admin';
    window.history.pushState({}, '', path);
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
        stats: authRole === 'admin' ? analytics : empStats,
        tasks: authRole === 'admin' ? allUpdates.slice(0, 5) : empTasks.slice(0, 5),
        departments: departments.slice(0, 5),
        focus: authRole === 'admin' ? teamFocus.slice(0, 5) : focusText,
        presence: authRole === 'admin' ? teamPresence.slice(0, 5) : { workLocation, goals, energyLevel },
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
      return 'NudgeAI is unavailable right now. Try again in a moment.';
    }
  }

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
          ? 'mx-auto mt-6 flex max-w-5xl items-center justify-between rounded-full border border-white/80 bg-white/90 px-6 py-3 shadow-2xl shadow-[#3C3489]/10 backdrop-blur-xl sm:px-7'
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

          {['landing', 'signin', 'signup', 'privacy', 'terms', 'verify_email', 'choose_plan', 'payment', 'onboarding', 'accept_invite', 'join_workspace', 'oauth_callback'].includes(currentView) ? (
            <>
              <div className="hidden items-center gap-8 text-sm font-medium text-[#5F5E5A] md:flex">
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#features">Features</a>
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#pricing">Pricing</a>
                <a onClick={() => setCurrentView('landing')} className="transition hover:text-[#3C3489]" href="#security">Security</a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => showToast('Search is coming soon with docs, features, and help articles.', 'info')}
                  className="hidden h-10 w-10 items-center justify-center rounded-md text-[#2C2C2A] transition hover:bg-[#EEEDFE] hover:text-[#3C3489] sm:inline-flex"
                  aria-label="Search NudgeHQ"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast('English is active. More languages will be added later.', 'info')}
                  className="hidden items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-[#2C2C2A] transition hover:bg-[#EEEDFE] hover:text-[#3C3489] lg:inline-flex"
                  aria-label="Language selector"
                >
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                  English
                </button>
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
            <div className="mx-auto flex max-w-7xl flex-col items-center px-5 pb-20 pt-52 text-center sm:px-6 lg:px-8 lg:pt-60">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-semibold text-[#3C3489] shadow-lg shadow-[#3C3489]/5 backdrop-blur"
              >
                <Sparkles className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
                Newly building for modern Indian teams
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
                NudgeHQ helps employees share progress, blockers, focus, and energy while admins get one calm dashboard powered by NudgeAI.
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
                className="mt-11 flex flex-col gap-4 sm:flex-row"
              >
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
                title="Built for employees and the teams that support them."
                copy="The employee side stays lightweight. The admin side turns every update into a clear operational signal."
              />
              <div className="mt-14 grid gap-6 lg:grid-cols-2">
                <motion.div {...cardMotion} className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#EEEDFE] text-[#3C3489]">
                      <UsersRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1D9E75]">Employee side</p>
                      <h3 className="text-2xl font-bold text-[#2C2C2A]">Fast progress sharing</h3>
                    </div>
                  </div>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {employeeFeatures.map(([feature, Icon]) => (
                      <div key={feature} className="flex items-center gap-3 rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <Icon className="h-5 w-5 shrink-0 text-[#7F77DD]" aria-hidden="true" />
                        <span className="font-medium text-[#2C2C2A]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div {...cardMotion} className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#E8F7F1] text-[#1D9E75]">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1D9E75]">Admin and HR side</p>
                      <h3 className="text-2xl font-bold text-[#2C2C2A]">Live workforce visibility</h3>
                    </div>
                  </div>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {adminFeatures.map(([feature, Icon]) => (
                      <div key={feature} className="flex items-center gap-3 rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <Icon className="h-5 w-5 shrink-0 text-[#1D9E75]" aria-hidden="true" />
                        <span className="font-medium text-[#2C2C2A]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
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
                copy="Choose a plan that matches your current team size and progress tracking needs."
              />
              <div className="mx-auto mt-7 max-w-3xl rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 text-center shadow-sm">
                <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#92400E]">Temporary pricing</p>
                <p className="mt-2 text-base font-bold leading-7 text-[#2C2C2A]">
                  Pricing is not fixed yet. These plans are early estimates and may change as NudgeHQ grows, adds features, and moves into future releases.
                </p>
              </div>
              <div className="mt-14 grid gap-5 lg:grid-cols-4">
                {pricing.map(({ name, price, description, features, highlighted }, index) => (
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
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">Popular</span>
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
                      onClick={openSignup}
                      className={`mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition ${
                        highlighted
                          ? 'bg-white text-[#3C3489] hover:bg-[#EEEDFE]'
                          : 'bg-[#EEEDFE] text-[#3C3489] hover:bg-[#7F77DD] hover:text-white'
                      }`}
                    >
                      Create workspace
                    </button>
                  </motion.article>
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
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#F7FAFF] px-5 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_10%,#DFECFF_0,transparent_32%),radial-gradient(circle_at_86%_18%,#DCF8EF_0,transparent_28%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)]" />
          <div className="absolute left-1/2 top-10 -z-10 h-80 w-[52rem] -translate-x-1/2 rounded-full bg-[#EEEDFE]/80 blur-3xl" />
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.div {...cardMotion}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-bold text-[#3C3489] shadow-lg shadow-[#3C3489]/5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
                Welcome back
              </span>
              <h1 className="mt-6 max-w-xl text-5xl font-medium leading-[1.08] text-[#1E2737] sm:text-6xl">
                Open your <span className="font-extrabold text-[#6476FF]">live</span> workspace.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#5F5E5A]">
                Use your company email and password to access employee updates, admin reports, tasks, blockers, and NudgeAI insights.
              </p>
              <div className="mt-8 rounded-2xl border border-white/90 bg-white/70 p-4 shadow-2xl shadow-[#7F77DD]/15 backdrop-blur-xl">
                <div className="rounded-xl bg-gradient-to-r from-white via-[#F4F3FF] to-[#E8F7F1] p-5">
                  <div className="flex items-center justify-between border-b border-white/70 pb-4">
                    <div>
                      <p className="text-sm font-extrabold text-[#3C3489]">Workspace pulse</p>
                      <p className="mt-1 text-xs font-medium text-[#5F5E5A]">NudgeAI keeps the next action visible</p>
                    </div>
                    <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-bold text-[#1D9E75]">Live</span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {['18 progress updates reviewed', '3 blockers need attention', '30 hrs saved every week'].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-lg bg-white/80 px-4 py-3 text-sm font-bold text-[#2C2C2A]">
                        <Check className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('demo_console')}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#3C3489]"
                  >
                    <Zap className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
                    Launch Demo Console
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div {...cardMotion} className="rounded-2xl border border-white/90 bg-white/85 p-7 shadow-2xl shadow-[#3C3489]/15 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-lg" />
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2C2C2A]">Sign In</h2>
                  <p className="text-sm text-[#5F5E5A]">Continue to your workspace</p>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-7 grid gap-4">
                <button
                  type="button"
                  onClick={() => startGoogleAuth('login')}
                  disabled={googleLoading}
                  className="inline-flex items-center justify-center gap-3 rounded-md border border-[#DAD7FB] bg-white px-5 py-3.5 text-sm font-extrabold text-[#2C2C2A] transition hover:border-[#7F77DD] hover:bg-[#FCFCFF] disabled:opacity-50"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-[#EEEDFE] bg-white text-base font-black text-[#4285F4]">G</span>
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </button>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#A09F9A]">
                  <span className="h-px flex-1 bg-[#EEEDFE]" />
                  or use email
                  <span className="h-px flex-1 bg-[#EEEDFE]" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Email address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="mt-2 block w-full rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none transition focus:border-[#7F77DD]"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <PasswordField
                  label="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                />
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentView('forgot_password')}
                    className="text-xs font-semibold text-[#3C3489] hover:underline hover:text-[#7F77DD]"
                  >
                    Forgot Password?
                  </button>
                </div>

                {loginError ? (
                  <p className="rounded-md border border-rose-100 bg-rose-50 p-3 text-sm font-medium text-rose-600">{loginError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3C3489] disabled:opacity-50"
                >
                  {loginLoading ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  Sign In
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#5F5E5A]">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={openSignup} className="font-bold text-[#3C3489] hover:text-[#7F77DD]">
                  Start free trial
                </button>
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* VIEW 3: SIGN UP */}
      {currentView === 'signup' && (
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#F7FAFF] px-5 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_8%,#DFECFF_0,transparent_30%),radial-gradient(circle_at_88%_16%,#DCF8EF_0,transparent_28%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)]" />
          <div className="absolute left-1/2 top-10 -z-10 h-80 w-[52rem] -translate-x-1/2 rounded-full bg-[#EEEDFE]/80 blur-3xl" />
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div {...cardMotion}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-bold text-[#3C3489] shadow-lg shadow-[#3C3489]/5 backdrop-blur">
                <Building2 className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
                Create workspace
              </span>
              <h1 className="mt-6 max-w-xl text-5xl font-medium leading-[1.08] text-[#1E2737] sm:text-6xl">
                Build your <span className="font-extrabold text-[#6476FF]">progress HQ</span>.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#5F5E5A]">
                Add your company, create the first admin account, then invite employees and assign tasks from the admin dashboard.
              </p>
              <div className="mt-8 grid gap-3 rounded-2xl border border-white/90 bg-white/70 p-4 shadow-2xl shadow-[#7F77DD]/15 backdrop-blur-xl">
                {['Create your organization', 'Set up admin access', 'Invite employees by email', 'Track updates and blockers'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-[#EEEDFE] bg-white/85 p-4 shadow-sm">
                    <Check className="h-5 w-5 text-[#1D9E75]" aria-hidden="true" />
                    <span className="font-semibold text-[#2C2C2A]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...cardMotion} className="rounded-2xl border border-white/90 bg-white/85 p-7 shadow-2xl shadow-[#3C3489]/15 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <img src="/brand/nudgehq-icon.svg" alt="" className="h-11 w-11 rounded-lg" />
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2C2C2A]">Sign Up</h2>
                  <p className="text-sm text-[#5F5E5A]">Create your company workspace</p>
                </div>
              </div>

              <form onSubmit={handleSignupSubmit} className="mt-7 grid gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">Company name</label>
                  <input
                    type="text"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    className="mt-2 block w-full rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none transition focus:border-[#7F77DD]"
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
                      className="mt-2 block w-full rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none transition focus:border-[#7F77DD]"
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
                      className="mt-2 block w-full rounded-md border border-[#DAD7FB] px-4 py-3 text-sm outline-none transition focus:border-[#7F77DD]"
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
                  />
                  <PasswordField
                    label="Confirm password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    placeholder="Repeat password"
                  />
                </div>

                <label className="flex items-start gap-3 rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-3 text-sm text-[#5F5E5A]">
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

                <button
                  type="button"
                  onClick={() => startGoogleAuth('signup')}
                  disabled={googleLoading}
                  className="inline-flex items-center justify-center gap-3 rounded-md border border-[#DAD7FB] bg-white px-5 py-3.5 text-sm font-extrabold text-[#2C2C2A] transition hover:border-[#7F77DD] hover:bg-[#FCFCFF] disabled:opacity-50"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-[#EEEDFE] bg-white text-base font-black text-[#4285F4]">G</span>
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </button>

                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#A09F9A]">
                  <span className="h-px flex-1 bg-[#EEEDFE]" />
                  or create with email
                  <span className="h-px flex-1 bg-[#EEEDFE]" />
                </div>

                {signupError ? (
                  <p className="rounded-md border border-rose-100 bg-rose-50 p-3 text-sm font-medium text-rose-600">{signupError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3C3489] disabled:opacity-50"
                >
                  {signupLoading ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Building2 className="h-4 w-4" aria-hidden="true" />}
                  Create workspace
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#5F5E5A]">
                Already have an account?{' '}
                <button type="button" onClick={openSignin} className="font-bold text-[#3C3489] hover:text-[#7F77DD]">
                  Sign in
                </button>
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* VIEW 4: DEMO LOGIN CONSOLE */}
      {currentView === 'demo_console' && (
        <section className="mx-auto max-w-lg px-5 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-[#DAD7FB] bg-white p-8 shadow-xl shadow-[#3C3489]/10"
          >
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F3FF] text-[#3C3489]">
                <Zap className="h-6 w-6 text-[#F59E0B]" />
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-[#2C2C2A]">Developer Demo Console</h2>
              <p className="mt-2 text-sm text-[#5F5E5A]">
                Switch between demo roles and test the backend endpoints in real-time.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoSignIn('employee')}
                className="rounded-md border border-[#EEEDFE] bg-[#F4F3FF] p-3 text-center transition hover:bg-[#EEEDFE]"
              >
                <User className="mx-auto h-5 w-5 text-[#7F77DD]" />
                <span className="mt-2 block text-xs font-bold text-[#3C3489]">Employee Account</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                className="rounded-md border border-[#EEEDFE] bg-[#E8F7F1] p-3 text-center transition hover:bg-[#EEEDFE]"
              >
                <Shield className="mx-auto h-5 w-5 text-[#1D9E75]" />
                <span className="mt-2 block text-xs font-bold text-[#1D9E75]">Admin / HR Account</span>
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F5E5A]">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                  required
                />
              </div>

              <PasswordField
                label="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                labelClassName="block text-xs font-semibold uppercase tracking-wider text-[#5F5E5A]"
              />

              {loginError && (
                <div className="rounded-md bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                  {isBackendConnectionError(loginError) ? (
                    <button
                      type="button"
                      onClick={enterSandboxDashboard}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#3C3489] ring-1 ring-[#DAD7FB] transition hover:bg-[#EEEDFE]"
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3C3489] transition disabled:opacity-50"
              >
                {loginLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                Sign in to Console
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setCurrentView('landing')}
                className="text-xs font-medium text-[#5F5E5A] hover:text-[#3C3489] underline"
              >
                Back to landing page
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* VIEW 3: LIVE DASHBOARD AREA */}
      {currentView === 'dashboard' && (
        <section className="relative mx-auto max-w-[92rem] px-5 py-10 sm:px-6 lg:px-8">
          <div className="dot-grid absolute inset-x-0 top-0 -z-10 h-72 opacity-30" />
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
          <div className="overflow-hidden rounded-lg border border-[#DAD7FB] bg-white p-7 shadow-xl shadow-[#3C3489]/10 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F3FF] px-3 py-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${authRole === 'admin' ? 'bg-[#1D9E75]' : 'bg-[#7F77DD]'}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3C3489]">
                  {authRole === 'admin' ? 'HR & Administration Workspace' : 'Employee Check-in Desk'}
                </span>
              </div>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight text-[#2C2C2A] sm:text-5xl">Hello, {user?.name || 'Demo User'}</h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#5F5E5A]">
                {authRole === 'admin'
                  ? 'A cleaner command center for team progress, NudgeAI signals, employee operations, and reports.'
                  : 'A focused workspace for daily check-ins, tasks, deep work, progress history, and personal growth.'}
              </p>
              <p className="mt-2 text-sm text-[#5F5E5A]">Logged in as: <strong className="text-[#3C3489]">{user?.email}</strong></p>
            </div>

            <button
              onClick={refreshDashboardData}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#DAD7FB] bg-[#F4F3FF] px-5 py-3 text-sm font-bold text-[#3C3489] transition hover:bg-[#EEEDFE] shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Dashboard
            </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(authRole === 'admin'
                ? [
                    ['NudgeAI Desk', 'Forecasts, standups, risks, and skill gaps.', Sparkles, '#7F77DD'],
                    ['Team Focus Feed', 'See what people are focused on right now.', Activity, '#1D9E75'],
                    ['Employee Ops', 'Invite people, create tasks, and manage teams.', UsersRound, '#3C3489'],
                    ['Board Pack', 'Generate clean monthly leadership reports.', FileCheck2, '#F59E0B']
                  ]
                : [
                    ['Daily Check-in', 'Share work location, energy, and top goals.', Activity, '#1D9E75'],
                    ['Progress Update', 'Log work, proof links, blockers, and focus.', Send, '#7F77DD'],
                    ['Deep Work', 'Declare focused time without noisy nudges.', Clock3, '#3C3489'],
                    ['Growth Portal', 'Build your personal performance summary.', LineChart, '#F59E0B']
                  ]).map(([title, copy, Icon, color]) => (
                <div key={title} className="rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#DAD7FB] hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white shadow-sm" style={{ color }}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-base font-extrabold text-[#2C2C2A]">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-[#5F5E5A]">{copy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- SUBVIEW: EMPLOYEE WORKSPACE --- */}
          {authRole === 'employee' && (
            <div className="mt-8 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
              
              {/* Employee Left Column */}
              <div className="space-y-7">
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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
                <div className="rounded-lg border border-[#DAD7FB] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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

                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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
                  <div className="rounded-lg border border-[#DAD7FB] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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
                  <div className="rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-7 shadow-md shadow-[#3C3489]/5">
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
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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

          {/* --- SUBVIEW: ADMIN WORKSPACE --- */}
          {authRole === 'admin' && (
            <div className="mt-8 grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">
              
              {/* Admin Left Column */}
              <div className="space-y-7">
                <NudgeAiStandupCard
                  data={nudgeAiData.standup}
                  loading={nudgeAiLoading.standup}
                  onRegenerate={() => runNudgeAiFeature('standup', true)}
                />
                
                {/* Metrics Stats Grid */}
                {analytics && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      ['Total Staff', analytics.summary.totalEmployees, UsersRound],
                      ['Completion Rate', `${analytics.summary.completionRate}%`, CheckCircle2],
                      ['Active Blockers', analytics.summary.blockersCount, AlertCircle],
                      ['Today Updates Ratio', `${analytics.summary.checkinRate}%`, Sparkles]
                    ].map(([label, val, Icon]) => (
                      <div key={label} className="rounded-lg border border-[#EEEDFE] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between text-[#5F5E5A]">
                          <span className="text-xs font-semibold">{label}</span>
                          <Icon className="h-4 w-4 text-[#3C3489]" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-[#2C2C2A]">{val}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="rounded-lg border border-[#EEEDFE] bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-[#2C2C2A]">Team Focus Feed</h3>
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

                  <div className="rounded-lg border border-[#EEEDFE] bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-[#2C2C2A]">Team Presence Overview</h3>
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

                  <div className="rounded-lg border border-[#EEEDFE] bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-[#2C2C2A]">Deep Work Tracker</h3>
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
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#F59E0B]" />
                    <h3 className="text-lg font-bold text-[#2C2C2A]">NudgeAI Operations Desk</h3>
                  </div>
                  <p className="mt-1 text-xs text-[#5F5E5A]">Turns active workforce data into summaries, delay signals, and suggested nudges.</p>
                  
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <button
                      onClick={() => triggerAiReport('summary')}
                      className="rounded-md border border-[#DAD7FB] bg-[#F4F3FF] p-3 text-center transition hover:border-[#7F77DD]"
                    >
                      <Sparkles className="mx-auto h-5 w-5 text-[#7F77DD]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">NudgeAI Daily Summary</span>
                    </button>
                    <button
                      onClick={() => triggerAiReport('delays')}
                      className="rounded-md border border-[#DAD7FB] bg-rose-50 p-3 text-center transition hover:border-rose-400"
                    >
                      <Clock3 className="mx-auto h-5 w-5 text-rose-500" />
                      <span className="mt-2 block text-xs font-bold text-rose-700">Audit Delayed Tasks</span>
                    </button>
                    <button
                      onClick={() => triggerAiReport('inactivity')}
                      className="rounded-md border border-[#DAD7FB] bg-amber-50 p-3 text-center transition hover:border-amber-400"
                    >
                      <UserCheck className="mx-auto h-5 w-5 text-amber-500" />
                      <span className="mt-2 block text-xs font-bold text-amber-700">Check Inactivity</span>
                    </button>
                    <button
                      onClick={() => runNudgeAiFeature('forecast', true)}
                      className="rounded-md border border-[#DAD7FB] bg-[#E8F7F1] p-3 text-center transition hover:border-[#1D9E75]"
                    >
                      <LineChart className="mx-auto h-5 w-5 text-[#1D9E75]" />
                      <span className="mt-2 block text-xs font-bold text-[#1D9E75]">Sprint Forecast</span>
                    </button>
                    <button
                      onClick={() => runNudgeAiFeature('burnout', true)}
                      className="rounded-md border border-[#DAD7FB] bg-white p-3 text-center transition hover:border-[#7F77DD]"
                    >
                      <ShieldCheck className="mx-auto h-5 w-5 text-[#3C3489]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">Burnout Predictor</span>
                    </button>
                    <button
                      onClick={() => runNudgeAiFeature('anomaly', true)}
                      className="rounded-md border border-[#DAD7FB] bg-amber-50 p-3 text-center transition hover:border-amber-400"
                    >
                      <Activity className="mx-auto h-5 w-5 text-amber-600" />
                      <span className="mt-2 block text-xs font-bold text-amber-700">Care Alerts</span>
                    </button>
                    <button
                      onClick={() => runNudgeAiFeature('appreciation', true)}
                      className="rounded-md border border-[#DAD7FB] bg-[#F4F3FF] p-3 text-center transition hover:border-[#7F77DD]"
                    >
                      <Sparkles className="mx-auto h-5 w-5 text-[#7F77DD]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">Appreciation</span>
                    </button>
                    <button
                      onClick={() => runNudgeAiFeature('skillGap', true)}
                      className="rounded-md border border-[#DAD7FB] bg-white p-3 text-center transition hover:border-[#3C3489]"
                    >
                      <Workflow className="mx-auto h-5 w-5 text-[#3C3489]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">Skill Gaps</span>
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <NudgeAiForecastCard data={nudgeAiData.forecast} loading={nudgeAiLoading.forecast} onRegenerate={() => runNudgeAiFeature('forecast', true)} />
                    <NudgeAiBurnoutCard data={nudgeAiData.burnout} loading={nudgeAiLoading.burnout} />
                    <NudgeAiAnomalyCard data={nudgeAiData.anomaly} loading={nudgeAiLoading.anomaly} />
                    <NudgeAiAppreciationCard data={nudgeAiData.appreciation} loading={nudgeAiLoading.appreciation} onSend={sendAppreciation} />
                    <NudgeAiSkillGapCard data={nudgeAiData.skillGap} loading={nudgeAiLoading.skillGap} />
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
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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
                <div className="rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-7 shadow-md shadow-[#3C3489]/5">
                  <h4 className="text-sm font-bold text-[#2C2C2A]">Export Operational Datasets</h4>
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
                </div>

                {/* Invite Employees */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
                  <h3 className="text-sm font-bold text-[#2C2C2A]">Invite Employee</h3>
                  <p className="mt-1 text-xs text-[#5F5E5A]">Create an employee login and assign them to a department.</p>

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
                      Invite Employee
                    </button>
                  </form>

                  {inviteResult ? (
                    <div className="mt-4 rounded-md border border-[#E8F7F1] bg-[#E8F7F1] p-3 text-xs text-[#1D9E75]">
                      <p className="font-bold">Invite ready for {inviteResult.email}</p>
                      <p className="mt-1">Temporary password: <span className="font-mono font-bold">{inviteResult.temporary_password}</span></p>
                    </div>
                  ) : null}
                </div>

                {/* Create & Assign Tasks */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
                  <h3 className="text-sm font-bold text-[#2C2C2A]">Create & Assign Tasks</h3>
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
                </div>

                {/* Manage Departments */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-md shadow-[#3C3489]/5">
                  <h3 className="text-sm font-bold text-[#2C2C2A]">Manage Departments</h3>
                  
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
                </div>

              </div>

            </div>
          )}

        </section>
      )}

      {['landing', 'signin', 'signup', 'privacy', 'terms', 'dashboard'].includes(currentView) ? (
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
    <div className="rounded-lg border border-[#DAD7FB] bg-white p-7 shadow-md shadow-[#3C3489]/5">
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
      if (!code) {
        setError(queryParams.get('error_description') || 'Google did not return an authorization code.');
        return;
      }

      try {
        const companyName = window.localStorage.getItem('nudgehq_google_signup_company') || '';
        const { data } = await fetchApi('/auth/oauth/google/callback', {
          method: 'POST',
          body: JSON.stringify({ code, company_name: companyName })
        });

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
      window.history.pushState({}, '', '/dashboard/employee');
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
