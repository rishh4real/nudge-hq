import { useState } from 'react'
import {
  ArrowRight,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  X,
  FileCheck2,
  Fingerprint,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  UsersRound,
  Workflow,
} from 'lucide-react'

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

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold text-[#2C2C2A] sm:text-4xl">{title}</h2>
      {copy ? <p className="mt-4 text-lg leading-8 text-[#5F5E5A]">{copy}</p> : null}
    </div>
  )
}

function App() {
  const [isTrialOpen, setIsTrialOpen] = useState(false)
  const openTrial = () => setIsTrialOpen(true)
  const closeTrial = () => setIsTrialOpen(false)

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-[#2C2C2A]">
      <header className="sticky inset-x-0 top-0 z-50 border-b border-[#EEEDFE] bg-white/95 shadow-sm shadow-[#EEEDFE]/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="NudgeHQ home">
            <img src="/brand/nudgehq-icon.svg" alt="" className="h-10 w-10 rounded-lg" />
            <span className="text-lg font-bold text-[#3C3489]">NudgeHQ</span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-[#5F5E5A] md:flex">
            <a className="transition hover:text-[#3C3489]" href="#features">Features</a>
            <a className="transition hover:text-[#3C3489]" href="#pricing">Pricing</a>
            <a className="transition hover:text-[#3C3489]" href="#security">Security</a>
          </div>
          <button
            type="button"
            onClick={openTrial}
            className="inline-flex items-center gap-2 rounded-md bg-[#7F77DD] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#7F77DD]/20 transition hover:bg-[#3C3489]"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      </header>

      <section id="top" className="relative isolate">
        <div className="dot-grid absolute inset-0 -z-10 opacity-50" />
        <div className="absolute left-1/2 top-14 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#F4F3FF]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#EEEDFE] bg-white px-4 py-2 text-sm font-semibold text-[#3C3489] shadow-sm">
              <Sparkles className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
              Real-time workforce progress tracking
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-extrabold leading-[1.02] text-[#2C2C2A] sm:text-6xl lg:text-7xl">
              Track team progress without chasing updates.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F5E5A] sm:text-xl">
              <span className="brand-shimmer font-bold">NudgeHQ</span> gives employees a fast way to share progress, blockers, and status while admins get one live view of workforce momentum.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openTrial}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#7F77DD]/25 transition hover:-translate-y-0.5 hover:bg-[#3C3489]"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-md border border-[#DAD7FB] bg-white px-6 py-4 text-base font-semibold text-[#3C3489] transition hover:border-[#7F77DD] hover:bg-[#EEEDFE]"
              >
                Explore features
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="soft-grid rounded-lg border border-[#DAD7FB] bg-white p-4 shadow-xl shadow-[#3C3489]/10">
              <div className="rounded-md border border-[#EEEDFE] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEEDFE] px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#3C3489]">Workforce dashboard</p>
                    <p className="text-xs text-[#5F5E5A]">Live across 6 teams</p>
                  </div>
                  <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-semibold text-[#1D9E75]">Live</span>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-3">
                  {[
                    ['82%', 'Tasks on track'],
                    ['14', 'Open blockers'],
                    ['96%', 'Check-ins sent'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-md border border-[#EEEDFE] bg-white p-4">
                      <p className="text-2xl font-bold text-[#3C3489]">{value}</p>
                      <p className="mt-1 text-xs font-medium text-[#5F5E5A]">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 px-5 pb-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <p className="font-semibold text-[#2C2C2A]">Department progress</p>
                      <LineChart className="h-5 w-5 text-[#7F77DD]" aria-hidden="true" />
                    </div>
                    {[
                      ['Sales ops', '88%'],
                      ['Field team', '74%'],
                      ['Support', '92%'],
                      ['Hiring', '67%'],
                    ].map(([team, percent]) => (
                      <div key={team} className="mb-4 last:mb-0">
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium text-[#2C2C2A]">{team}</span>
                          <span className="text-[#5F5E5A]">{percent}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#EEEDFE]">
                          <div className="h-2 rounded-full bg-[#7F77DD]" style={{ width: percent }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                    <p className="font-semibold text-[#2C2C2A]">Today&apos;s nudges</p>
                    <div className="mt-5 space-y-3">
                      {['12 blocker follow-ups', '36 progress check-ins', '4 HR escalations'].map((item) => (
                        <div key={item} className="flex items-center gap-3 text-sm text-[#5F5E5A]">
                          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEEDFE] text-[#3C3489]">
                            <BellRing className="h-4 w-4" aria-hidden="true" />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#EEEDFE] bg-[#FCFCFF] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="The problem"
            title="Progress gets messy when every update needs a chase."
            copy="NudgeHQ gives companies a calmer operating rhythm by making workforce progress visible before it becomes a meeting."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {painPoints.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#EEEDFE] text-[#3C3489]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#2C2C2A]">{title}</h3>
                <p className="mt-3 leading-7 text-[#5F5E5A]">{copy}</p>
              </article>
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
            <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-sm">
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
            </div>

            <div className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-sm">
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
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EEEDFE] px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="How it works"
            title="Three steps from chasing updates to seeing progress."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map(({ step, title, copy }) => (
              <article key={step} className="rounded-lg border border-white/70 bg-white p-7">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#7F77DD]">{step}</span>
                  <Workflow className="h-5 w-5 text-[#1D9E75]" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-xl font-bold text-[#2C2C2A]">{title}</h3>
                <p className="mt-3 leading-7 text-[#5F5E5A]">{copy}</p>
              </article>
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
          <div className="mt-14 grid gap-5 lg:grid-cols-4">
            {pricing.map(({ name, price, description, features, highlighted }) => (
              <article
                key={name}
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
                  onClick={openTrial}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition ${
                    highlighted
                      ? 'bg-white text-[#3C3489] hover:bg-[#EEEDFE]'
                      : 'bg-[#EEEDFE] text-[#3C3489] hover:bg-[#7F77DD] hover:text-white'
                  }`}
                >
                  Start Free Trial
                </button>
              </article>
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
            {badges.map(({ title, copy, icon: Icon }) => (
              <div key={title} className="flex items-center gap-4 rounded-lg border border-[#EEEDFE] bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#E8F7F1] text-[#1D9E75]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-[#2C2C2A]">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#5F5E5A]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-[#EEEDFE] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="flex items-center gap-3">
            <img src="/brand/nudgehq-icon.svg" alt="" className="h-9 w-9 rounded-lg" />
            <span className="font-bold text-[#3C3489]">NudgeHQ</span>
          </a>
          <div className="flex flex-wrap gap-5 text-sm font-medium text-[#5F5E5A]">
            <a className="hover:text-[#3C3489]" href="#features">Features</a>
            <a className="hover:text-[#3C3489]" href="#pricing">Pricing</a>
            <a className="hover:text-[#3C3489]" href="#security">Security</a>
          </div>
          <p className="text-sm text-[#5F5E5A]">(c) 2026 NudgeHQ. All rights reserved.</p>
        </div>
      </footer>

      {isTrialOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1A1035]/45 px-5 py-8">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl shadow-[#1A1035]/25">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1D9E75]">Trial access</p>
                <h2 className="mt-2 text-2xl font-bold text-[#2C2C2A]">We&apos;re setting up trials manually right now.</h2>
              </div>
              <button
                type="button"
                onClick={closeTrial}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#EEEDFE] text-[#5F5E5A] transition hover:bg-[#EEEDFE] hover:text-[#3C3489]"
                aria-label="Close trial request"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 leading-7 text-[#5F5E5A]">
              Backend signup is not connected yet. For now, request access and we&apos;ll wire this button to onboarding once the app flow is ready.
            </p>
            <div className="mt-6 grid gap-3">
              <a
                href="mailto:hello@nudgehq.com?subject=NudgeHQ%20trial%20request"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3C3489]"
              >
                Request access by email
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={closeTrial}
                className="rounded-md border border-[#DAD7FB] px-5 py-3 text-sm font-semibold text-[#3C3489] transition hover:bg-[#EEEDFE]"
              >
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default App
