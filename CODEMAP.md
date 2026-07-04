# NudgeHQ Code Map

This guide is for new teammates who need to understand where things live without reading the whole repo first.

## Quick Start

- Frontend app: `src/App.jsx`
- Frontend entry: `src/main.jsx`
- Frontend styles: `src/index.css`, `src/Ferrofluid.css`
- Backend API entry: `server/src/index.js`
- Database schema: `server/src/db/schema.sql`
- API docs/testing: `postman/`

Run locally:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
cd server && npm start
```

Frontend: `http://127.0.0.1:5173/`

Backend health: `http://127.0.0.1:5001/health`

## Product Areas

### Landing, Auth, Pricing

- Main UI lives in `src/App.jsx`.
- Signup/login/payment/onboarding flows are currently in the same file.
- Pricing constants and trial UI are in the landing/pricing sections of `src/App.jsx`.

### Dashboards

Role dashboards are controlled by `DASHBOARD_SECTIONS_BY_ROLE` in `src/App.jsx`.

- Admin route: `/dashboard/admin`
- HR route: `/dashboard/hr`
- Manager route: `/dashboard/manager`
- Employee route: `/dashboard/employee`

Important rule: demo dashboards can use sandbox data, but OG/live dashboards should show real backend data or empty states.

### NudgeSpace + U Space

Frontend:

- `nudgeSpacePosts`, `nudgeSpaceDraft`, `demoNudgeSpaceView` state in `src/App.jsx`
- `loadNudgeSpacePosts`
- `submitNudgeSpacePost`

Backend:

- `server/src/controllers/nudgespace.controller.js`
- `server/src/routes/nudgespace.routes.js`
- `nudgespace_posts` table in `server/src/db/schema.sql`

Social posts are workspace-scoped. U Space posts are private to the author.

### Projects, Integrations, Feedback

Frontend:

- Project editor state and handlers in `src/App.jsx`
- Integration request form in Admin/HR Integrations
- Feedback/review form in dashboard settings/feedback areas

Backend:

- `server/src/controllers/admin.controller.js`
- `server/src/routes/admin.routes.js`
- Tables: `workspace_projects`, `integration_requests`, `feedback_items`

These now try to save to Supabase first and fall back locally if the latest schema has not been applied yet.

### NudgeAI

Frontend:

- `runNudgeAiFeature`
- `renderLatestAiResult`
- dashboard NudgeAI panels in `src/App.jsx`

Backend:

- `server/src/controllers/ai.controller.js`
- `server/src/routes/ai.routes.js`
- Groq setup: `server/src/config/groq.js`

NudgeAI should return readable, manager-friendly summaries. Avoid showing raw JSON in UI.

### Admin, HR, Manager, Employee Data

Backend controllers:

- Admin/HR/Manager shared ops: `server/src/controllers/admin.controller.js`
- Tasks: `server/src/controllers/task.controller.js`
- Employee dashboard/history/growth: `server/src/controllers/employee.controller.js`
- Analytics: `server/src/controllers/analytics.controller.js`
- Reports: `server/src/controllers/report.controller.js`
- Notifications/WhatsApp: `server/src/controllers/notifications.controller.js`
- Focus/check-in/deep work: `server/src/controllers/focus.controller.js`, `checkin.controller.js`, `deepwork.controller.js`

## Shared Frontend Utilities

- `src/lib/storage.js`: safe localStorage JSON helper
- `src/lib/format.js`: date and task-status formatting helpers
- `src/lib/api.js`: frontend API helper, backend port probing, and connection-error detection
- `src/lib/dashboard.js`: dashboard route paths, role groups, and sidebar section lists

New shared helpers should go in `src/lib/`, not inside `App.jsx`.

## Backend Structure

- `server/src/index.js`: Express app, route mounting, health endpoint, cron jobs
- `server/src/middleware/auth.js`: JWT auth and role authorization
- `server/src/middleware/security.js`: Helmet, CORS, rate limits, security headers
- `server/src/middleware/validate.js`: basic request-body validation
- `server/src/config/supabase.js`: Supabase service client
- `server/src/config/groq.js`: Groq client
- `server/src/services/whatsapp.js`: WhatsApp/Twilio helpers
- `server/src/utils/mailer.js`: email helpers

## Database Tables

Core:

- `organizations`
- `departments`
- `users`
- `tasks`
- `progress_updates`
- `blocker_logs`

Feature tables:

- `nudgespace_posts`
- `workspace_projects`
- `integration_requests`
- `feedback_items`
- `daily_checkins`
- `focus_sessions`
- `deep_work_sessions`
- `ai_outputs`
- `reports`
- `whatsapp_notification_logs`

On every schema change, update `server/src/db/schema.sql`.

## Current Refactor Direction

`src/App.jsx` is still the largest technical debt. When adding new UI:

- Prefer creating small components in `src/components/`.
- Prefer moving shared logic into `src/lib/`.
- Do not add new demo data to OG/live dashboard branches.
- Keep backend persistence in controllers/routes instead of localStorage.

Recommended next splits:

- `src/components/dashboard/DashboardShell.jsx`
- `src/components/dashboard/NudgeSpacePanel.jsx`
- `src/components/dashboard/ProjectBoard.jsx`
- `src/components/landing/LandingPage.jsx`
- `src/components/auth/AuthPages.jsx`

## QA Checklist

Before pushing:

```bash
npm run build
npm run lint
find server/src -name '*.js' -maxdepth 4 -print0 | xargs -0 -n1 node --check
```

Manual smoke test:

- `/`
- `/login`
- `/signup`
- `/blog`
- `/dashboard/admin`
- `/dashboard/hr`
- `/dashboard/manager`
- `/dashboard/employee`

For protected dashboards, unauthenticated users should redirect to `/login`.

## Team Rule

Demo is for product preview. Free trial / OG workspace is real setup only. If there is no real data, show a clean empty state instead of fake activity.
