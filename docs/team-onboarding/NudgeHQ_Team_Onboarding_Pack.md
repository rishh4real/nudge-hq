# NudgeHQ Team Onboarding Pack

**Version:** Internal beta brief  
**Prepared:** 10 June 2026  
**Audience:** New team members, contributors, advisors, and early operators  
**Owner:** NudgeHQ founding team

---

## 1. Executive Summary

NudgeHQ is a B2B SaaS platform for real-time workforce progress tracking. The product helps employees share quick daily updates, blockers, task status, proof, focus, and check-ins while managers, HR, and admins get the right visibility without chasing people across WhatsApp, Slack, spreadsheets, or meetings.

The core idea is simple: teams do not fail because work is not happening; teams fail because progress is invisible until it is too late. NudgeHQ becomes the lightweight daily visibility layer above the tools a company already uses.

### One-line positioning

NudgeHQ helps growing teams know what changed today, who is blocked, and what needs attention before work slips.

### Current product direction

- Build for early-stage and growing teams that need team clarity without enterprise bloat.
- Keep employee submission lightweight and human.
- Make WhatsApp a key workflow because employees already respond there.
- Turn raw updates into manager-ready intelligence through NudgeAI.
- Keep role views clean: employees see themselves, managers see their team, HR sees people signals, admins see company-wide operations.

---

## 2. The Problem

Most teams already have many tools: task boards, HR systems, chats, spreadsheets, email, and docs. But those tools do not automatically answer the daily operating questions leaders ask:

- What actually changed today?
- Which work is blocked?
- Who has not checked in?
- Which tasks are at risk?
- What should a manager follow up on first?
- Which employee wins should be recognized?
- What evidence exists for performance and growth conversations?

### Pain points we are solving

1. **Managers chase updates manually.** Standups, WhatsApp threads, Slack pings, and spreadsheets become a routine tax.
2. **Blockers surface late.** Teams often discover blockers only after a deadline is already slipping.
3. **Employees lose visibility.** Good work, proof, consistency, and growth can disappear in scattered messages.
4. **HR lacks live people signals.** HR often sees people health too late, after burnout, disengagement, or repeated missed updates.
5. **Founders and admins lack one operating view.** Leadership needs a simple command view across tasks, updates, blockers, departments, and reports.

---

## 3. Our Solution

NudgeHQ creates a daily operating rhythm where employees submit short signals, NudgeAI interprets the signals, and leaders act from dashboards.

### Product loop

1. **Employee receives or opens a check-in.** They share location, goals, progress, blockers, proof, and focus in under two minutes.
2. **NudgeHQ stores structured work signals.** Tasks, updates, blockers, focus sessions, deep work, and check-ins become useful data.
3. **NudgeAI summarizes and detects.** It creates briefs, scores update quality, flags inactivity, highlights blockers, forecasts sprint risk, and suggests appreciation.
4. **Managers, HR, and admins act.** Each role sees a scoped dashboard with next actions instead of scattered raw messages.

### What makes NudgeHQ different

- **Not another bloated work suite.** It does not try to replace every tool. It becomes the visibility layer above existing tools.
- **WhatsApp-first nudges.** Employees can receive nudges and reply from a channel they already use.
- **Role-scoped dashboards.** Admin, HR, manager, and employee experiences are intentionally separate.
- **AI turns updates into action.** NudgeAI converts small updates into summaries, alerts, forecasts, and manager-ready briefs.
- **Growth evidence for employees.** Progress history becomes useful for reviews, proof, recognition, and development.

---

## 4. Target Users and Roles

### Admin / Founder / Operations Lead

Needs company-wide visibility, role management, departments, invites, reports, billing, and control over the workspace.

### HR Lead

Needs people health, check-in consistency, burnout signals, skill gaps, attendance patterns, growth summaries, and board-ready reporting.

### Manager

Needs team tasks, blockers, recent updates, daily standup briefs, active risks, and quick ways to nudge or unblock people.

### Employee

Needs a clean personal workspace to see tasks, submit check-ins, report blockers, protect focus, and build a visible growth story.

---

## 5. Current MVP Scope

The MVP should prove that teams will adopt a lightweight daily visibility workflow and that leaders get value from the data.

### Built / active

- Public landing page with pricing, FAQ, contact, security, and product story.
- Dedicated Why NudgeHQ page comparing against bloated work tools.
- Auth flows: signup, login, email verification, forgot/reset password, Google OAuth callback foundation.
- Company onboarding: company details, departments, employee invites, CSV invite support.
- Role dashboards: admin, HR, manager, employee.
- Employee workspace: dashboard, tasks, check-in, progress curve, growth portal, NudgeSpace, NudgeAI helper, settings.
- Task management: create tasks, assign tasks, update status, report blockers, proof links.
- Progress updates and blocker logging.
- NudgeAI assistant and backend AI endpoints.
- WhatsApp notifications through Twilio: daily nudges, reply webhook, blocker alerts, weekly wins foundation.
- Supabase/PostgreSQL schema for organizations, users, departments, tasks, updates, blockers, invites, AI outputs, notifications, focus, check-ins, deep work, and reports.
- Demo mode kept separate from real product routes.

### MVP success criteria

- An admin can create a workspace, invite employees, and assign tasks.
- Employees can submit daily check-ins and task updates without confusion.
- Managers can see tasks, blockers, and recent activity in one place.
- WhatsApp nudges can reach employees with phone numbers and save replies.
- NudgeAI can summarize updates and provide useful next actions.
- OG/live accounts do not show fake demo data.

---

## 6. Product Modules

### Daily Check-In

Employees share daily work location, goals, focus, energy, and progress. This becomes the core recurring signal.

### Task Progress

Tasks move through states such as not started, in progress, blocked, and completed. Blocked status requires context so managers can act.

### Blocker Logs

Every blocker should be traceable: who is blocked, on what task, why, since when, and whether it is resolved.

### NudgeSpace

A lightweight internal social/update space for team posts. The goal is to make wins, updates, and team energy visible without fake comments or forced social behavior.

### NudgeAI

NudgeAI provides assistant answers, update scoring, daily summaries, delay analysis, inactivity nudges, burnout-care signals, sprint forecasts, standup briefs, anomaly checks, appreciation suggestions, and skill-gap analysis.

### WhatsApp Nudge Bot

WhatsApp acts as a low-friction front door for check-ins. Employees can receive reminders and reply from WhatsApp; NudgeHQ stores the response and updates dashboards.

### Growth Portal

Employees and HR can use progress history, completed work, proof links, streaks, blockers resolved, and update quality as evidence for development and reviews.

---

## 7. Architecture Overview

### Frontend

- React 19
- Vite
- Tailwind-style utility classes
- Framer Motion
- Lucide React
- Recharts
- Main app/router in `src/App.jsx`
- Global styling in `src/index.css`

### Backend

- Node.js
- Express
- Supabase/PostgreSQL
- JWT authentication
- bcryptjs password hashing
- Groq SDK for NudgeAI
- Nodemailer for email
- Razorpay payment foundation
- Twilio for WhatsApp
- Node cron for scheduled WhatsApp jobs

### Data model

Core tables include organizations, users, departments, tasks, progress updates, blocker logs, reports, invitations, invite links, email verification, password resets, AI outputs, employee notifications, focus sessions, daily check-ins, and deep work sessions.

### Integrations

- **Supabase:** database and live backend persistence.
- **Groq:** AI-powered summaries and assistant responses.
- **Twilio WhatsApp:** nudges, replies, blocker alerts, weekly wins.
- **Nodemailer:** verification, invites, contact form, password reset emails.
- **Razorpay:** payment foundation for India-focused billing.

---

## 8. Key Routes and APIs

### Frontend routes

- `/` landing page
- `/why-nudgehq` product comparison page
- `/contact` contact page
- `/faq` FAQ page
- `/nudgeai` public NudgeAI page
- `/signup`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`
- `/choose-plan`, `/payment`, `/onboarding`
- `/set-password`, `/accept-invite`, `/join/[code]`
- `/dashboard/admin`, `/dashboard/hr`, `/dashboard/manager`, `/dashboard/employee`
- `/demo` sandbox demo console

### Backend API groups

- `/api/auth` authentication, onboarding, invites, session
- `/api/employees` employee updates, dashboard, notifications, growth summary
- `/api/tasks` task CRUD and status updates
- `/api/admin` departments, employees, invites, updates, exports
- `/api/analytics` dashboard analytics
- `/api/ai` NudgeAI endpoints
- `/api/focus` Focus Pulse
- `/api/checkin` Smart Presence
- `/api/deepwork` Deep Work
- `/api/reports` board pack and reports
- `/api/payment` payment setup
- `/api/contact` contact form
- `/api/notify/whatsapp` WhatsApp notification workflow

---

## 9. Pricing Direction

NudgeHQ uses simple flat monthly plans. Starter packs have fixed limits; custom plans can be configured from 5 employees upward.

| Plan | India price | USD price | Employee limit |
|---|---:|---:|---|
| Starter | ₹2,000/month | $9/month | Up to 20 employees |
| Growth | ₹4,500/month | $25/month | Up to 50 employees |
| Business | ₹8,500/month | $49/month | Up to 100 employees |
| Custom | Custom | Custom | Any custom employee limit from 5+ |

Pricing is early-stage launch pricing and may change as the product grows.

---

## 10. Implementation Plan

### Phase 1: Stabilize MVP foundations

- Keep demo and live product data separate.
- Ensure real accounts load real backend data or clear empty states.
- Fix stale pricing references across NudgeAI, landing, FAQ, and backend assistant copy.
- Confirm Supabase schema is fully applied in production project.
- Ensure auth/session flow does not log users out when visiting public pages.
- Harden onboarding plan limits and invite behavior.

### Phase 2: Polish role dashboards

- Finish Manager dashboard as the next priority.
- Improve HR dashboard around people health, burnout risk, attendance, skill gaps, and reports.
- Improve Admin dashboard around company control, departments, roles, billing, and invites.
- Keep Employee dashboard focused on daily action: tasks, check-in, progress, blockers, growth.

### Phase 3: WhatsApp production readiness

- Move from sandbox testing to approved WhatsApp sender when ready.
- Add clear phone-number collection during onboarding and profile settings.
- Add opt-out, resend, failure status, and admin preview controls.
- Confirm webhook reliability using Cloudflare Tunnel or deployed API URL.
- Log every notification: sent, skipped, failed, replied.

### Phase 4: Reporting and evidence

- Improve 90-day growth PDF styling.
- Build admin/HR board pack reports.
- Add CSV/PDF exports for tasks, blockers, check-ins, and employee growth.
- Create report templates for weekly team review and monthly leadership review.

### Phase 5: Production readiness

- Deploy frontend and backend to stable environments.
- Add environment setup documentation.
- Add CI checks for lint/build.
- Add route/API smoke tests.
- Improve email deliverability with domain email, SPF, DKIM, and DMARC.
- Add privacy/security review before external scale.

---

## 11. Future Product Plan

### Near term: next 30 days

- Manager dashboard polish.
- HR dashboard polish.
- Admin dashboard polish.
- Real data curves and empty states across all OG dashboards.
- Twilio WhatsApp manual and scheduled nudges fully verified.
- Pricing copy and plan enforcement aligned across frontend/backend/NudgeAI.

### Mid term: 60 days

- File uploads through Supabase Storage: profile images, company logos, proof screenshots, PDFs.
- Better onboarding UX and company branding.
- More robust NudgeSpace with live persistence and moderation basics.
- Board pack PDF generation and export quality upgrade.
- Role-based analytics filters by department, date, manager, and task status.

### Longer term: 90+ days

- Custom WhatsApp branded sender.
- Slack/Teams integrations if customer demand appears.
- Advanced NudgeAI personalization by role, team, and employee history.
- More automation: recurring tasks, reminders, review cycles, recognition workflows.
- Customer-facing analytics and ROI dashboard.
- Security hardening for larger companies: SSO, audit logs, data retention controls.

---

## 12. Team Operating Rules

### Product principles

- Do not add fake data to OG/live dashboards.
- Keep demo mode separate from real accounts.
- Keep employee actions lightweight.
- Make managers faster, not busier.
- Prefer clear empty states over fake activity.
- Build WhatsApp as a core feature, not a side add-on.
- Avoid bloated-suite thinking; NudgeHQ is the visibility layer.

### Engineering rules

- Read `CONTEXT.md` and `ROUTES.md` before major changes.
- Do not touch `.env*` or secrets.
- Do not change database schema unless needed.
- Do not edit lockfiles unless dependencies change.
- Run lint/build after meaningful frontend changes.
- Treat auth, onboarding, payment, and invite flows as high-risk.

### Design rules

- Keep the interface clean, modern, and B2B SaaS-oriented.
- Avoid unrelated navigation labels such as Labs, Studio, Shop, or other agency-style items.
- Avoid fake logos, fake comments, and fake customer claims.
- Keep dashboards full-page and command-center style where possible.
- Make modals dismiss on outside click where natural.

---

## 13. Risks and Open Questions

### Product risks

- Employees may resist another daily workflow if it feels like surveillance.
- WhatsApp reminders must feel helpful, not spammy.
- AI outputs must be useful and safe, especially around burnout and people health.
- Managers need clear next actions, not more dashboards.

### Technical risks

- Single large frontend file increases maintenance difficulty.
- AI and WhatsApp reliability depend on external services.
- Schema changes must stay synchronized across Supabase environments.
- Payment, invite, and auth flows need careful testing before launch.

### Open questions

- Which customer segment should be first: startups, agencies, sales teams, HR-led companies, or operations-heavy teams?
- Should Custom pricing be self-serve with a calculator or sales-assisted?
- Which integration should follow WhatsApp: Slack, Teams, Jira, or Google Workspace?
- What is the minimum daily check-in that employees will actually complete consistently?

---

## 14. New Team Member First Week

### Day 1: Understand the product

- Read this pack.
- Open the landing page and Why NudgeHQ page.
- Use the demo console.
- Log in as demo employee and demo admin if available.
- Understand the four roles: Admin, HR, Manager, Employee.

### Day 2: Understand the codebase

- Read `CONTEXT.md` and `ROUTES.md`.
- Read `README.md` and `server/README.md`.
- Run frontend and backend locally.
- Review `src/App.jsx`, `src/index.css`, and `server/src/index.js`.

### Day 3: Understand backend and data

- Review Supabase schema.
- Review auth, employees, tasks, admin, analytics, AI, and notification controllers.
- Review WhatsApp service and notification controller.
- Test key endpoints in Postman if needed.

### Day 4: Pick a small contribution

Good first tasks:

- Fix copy mismatch.
- Improve empty state.
- Polish one dashboard card.
- Add a missing loading state.
- Improve one route doc.
- Test one API manually and document result.

### Day 5: Ship with confidence

- Run lint/build.
- Verify the relevant page in browser.
- Write a clear summary of what changed.
- Avoid touching unrelated areas.

---

## 15. Current Priority Stack

1. Manager dashboard polish.
2. HR dashboard polish.
3. Admin dashboard polish.
4. WhatsApp workflow reliability.
5. Real-data curves and empty states.
6. Onboarding and invite reliability.
7. File uploads and proof storage.
8. PDF/board-pack reports.
9. Production deployment and CI.
10. Security/email/payment hardening.

---

## 16. Quick Local Setup

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Database:

1. Open Supabase SQL editor.
2. Run `server/src/db/schema.sql`.
3. Run `server/src/db/seed.sql` if demo records are needed.

Useful checks:

```bash
npm run lint
npm run build
cd server && npm run dev
```

---

## 17. Final Note for New Teammates

NudgeHQ is still early, but the direction is clear: make team progress visible without making people feel monitored. The product should feel calm, fast, and useful. When in doubt, ask: does this reduce chasing, reveal blockers earlier, or help employees show their work better?
