# NudgeHQ Project Context

Read this file first before changing code. It is the fast map for the NudgeHQ codebase.

## Project Overview

NudgeHQ is a B2B SaaS platform for real-time workforce progress tracking.
It helps employees submit check-ins, tasks, blockers, focus updates, and proof while managers, HR, and admins see the right level of visibility.
NudgeAI powers summaries, forecasts, quality scoring, alerts, and the in-app assistant.

## Tech Stack

- Frontend: React 19, Vite, Tailwind-style CSS utilities, Framer Motion, Lucide React, Recharts, OGL/WebGL.
- Backend: Node.js, Express, Supabase/Postgres, JWT auth, bcryptjs, Groq, Nodemailer, Razorpay.
- Database: Supabase SQL schema in `server/src/db/schema.sql`.
- API docs/testing: Postman collection in `postman/`.
- Main styling: `src/index.css`.
- Main frontend app/router: `src/App.jsx`.

## Folder Structure

```text
.
├── public/
│   └── brand/
│       └── nudgehq-icon.svg
├── src/
│   ├── App.jsx
│   ├── Ferrofluid.css
│   ├── Ferrofluid.jsx
│   ├── index.css
│   └── main.jsx
├── server/
│   ├── README.md
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── groq.js
│       │   └── supabase.js
│       ├── controllers/
│       ├── db/
│       │   ├── schema.sql
│       │   └── seed.sql
│       ├── index.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── validate.js
│       ├── routes/
│       └── utils/
│           └── mailer.js
├── postman/
│   ├── NudgeHQ.postman_collection.json
│   └── NudgeHQ.postman_environment.json
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Key Files Map

- `src/App.jsx`: Main frontend file. Contains landing page, auth pages, onboarding, NudgeAI page, demo console, role dashboards, and most UI logic.
- `src/index.css`: Global styles, responsive rules, animations, cards, and dashboard polish.
- `src/Ferrofluid.jsx`: WebGL/OGL animated fluid background component.
- `src/Ferrofluid.css`: Container styles for the fluid animation.
- `src/main.jsx`: React app bootstrap.
- `public/brand/nudgehq-icon.svg`: NudgeHQ brand icon.
- `server/src/index.js`: Express app setup, middleware, health route, and API route mounts.
- `server/src/config/supabase.js`: Supabase client setup.
- `server/src/config/groq.js`: Groq/NudgeAI client setup.
- `server/src/routes/*.routes.js`: Backend route declarations.
- `server/src/controllers/*.controller.js`: Backend business logic.
- `server/src/middleware/auth.js`: Auth and role guard middleware.
- `server/src/utils/mailer.js`: Email sending and templates.
- `server/src/db/schema.sql`: Supabase/Postgres database schema.
- `server/src/db/seed.sql`: Seed/demo data.
- `postman/*.json`: Postman API collection and environment.

## Role Flow

- Public landing: `/`
- Auth: `/signup`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`, `/oauth/callback`
- Plan/payment: `/choose-plan`, `/payment`
- Company setup: `/onboarding`
- Invited employees: `/set-password`, `/accept-invite`, `/join/[code]`
- Admin dashboard: `/dashboard/admin`
- HR dashboard: `/dashboard/hr`
- Manager dashboard: `/dashboard/manager`
- Employee dashboard: `/dashboard/employee`
- Generic dashboard redirect: `/dashboard`
- Demo sandbox: `/demo`
- Public NudgeAI page: `/nudgeai`
- Legal/support: `/privacy`, `/terms`, `/contact`, `/faq`

Role redirect rules:

- `admin` -> `/dashboard/admin`
- `hr` -> `/dashboard/hr`
- `manager` -> `/dashboard/manager`
- `employee` -> `/dashboard/employee`

## Database Tables

- `organizations`: Company/workspace records, plan, owner, location, industry, trial dates.
- `departments`: Departments inside a company.
- `users`: App users with role, company, department, avatar, onboarding status.
- `tasks`: Assigned work items, status, priority, due date, assignee.
- `progress_updates`: Employee updates, mood, blockers, proof links, AI quality score.
- `blocker_logs`: Task blocker history and resolution status.
- `reports`: Stored reports and board packs.
- `employee_invitations`: Email invite records and tokens.
- `invite_links`: Magic invite links for joining a company.
- `email_verifications`: Email verification tokens.
- `password_resets`: Password reset tokens.
- `ai_outputs`: Stored NudgeAI outputs so content does not regenerate every refresh.
- `employee_notifications`: Recognition and notification messages.
- `focus_sessions`: Focus Pulse state and employee focus history.
- `daily_checkins`: Smart Presence check-ins, location, goals, energy.
- `deep_work_sessions`: Deep work declarations and logged outputs.

## API Endpoint Groups

See `ROUTES.md` for the full route list.

Main backend mounts in `server/src/index.js`:

- `/api/auth`
- `/api/employees`
- `/api/employee`
- `/api/tasks`
- `/api/admin`
- `/api/analytics`
- `/api/ai`
- `/api/focus`
- `/api/checkin`
- `/api/deepwork`
- `/api/reports`
- `/api/payment`
- `/api/contact`
- `/health`

## NudgeAI Routes

- `POST /api/ai/assistant`: General NudgeAI helper.
- `POST /api/ai/score-update`: Scores update quality.
- `GET /api/ai/summary/daily`: Daily AI summary.
- `GET /api/ai/delays`: Delay signals.
- `GET /api/ai/inactivity`: Inactivity signals.
- `POST /api/ai/burnout-check`: Burnout risk.
- `POST /api/ai/sprint-forecast`: Sprint forecast.
- `POST /api/ai/standup-brief`: Manager/admin standup brief.
- `POST /api/ai/anomaly-check`: Anomaly detection.
- `POST /api/ai/appreciation`: Appreciation suggestions.
- `GET /api/ai/skill-gap-analysis`: Skill gap analysis.
- `POST /api/ai/skill-gap-analysis`: Regenerate skill gap analysis.

## Where Not To Touch Unless Asked

- `.env*`: Contains secrets and local environment config.
- `node_modules/`, `dist/`: Generated dependencies/build output.
- `package-lock.json` and `server/package-lock.json`: Only change when dependencies change.
- `server/src/db/schema.sql`: Only edit when database schema changes are required.
- `public/brand/nudgehq-icon.svg`: Only edit for brand/logo work.
- `postman/`: Only edit when API documentation or sample requests change.
- `/demo` behavior in `src/App.jsx`: Keep separate from real product unless the request specifically mentions demo.
- Auth, onboarding, payment, and invite flows: High-risk. Edit carefully and test.

## Fast Workflow For Future AI Sessions

Start prompts like this:

```text
Read CONTEXT.md and ROUTES.md first. Then do: [task]
```
