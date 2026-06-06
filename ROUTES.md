# NudgeHQ Routes Map

Use this file to jump directly to the right frontend route or backend endpoint.

## Frontend Routes

All frontend routing currently lives in `src/App.jsx`.

| Route | Purpose |
| --- | --- |
| `/` | Landing page with hero, sections, pricing, FAQ, CTA, and footer. |
| `/privacy` | Privacy Policy page. |
| `/terms` | Terms & Conditions page. |
| `/contact` | Connect/contact form page. |
| `/faq` | Full FAQ page. |
| `/nudgeai` | Full-page NudgeAI assistant/chat experience. |
| `/signup` | Company/admin signup page. |
| `/login` | Login page. |
| `/signin` | Login alias. |
| `/verify-email` | Email verification waiting/result page. |
| `/forgot-password` | Password reset request page. |
| `/reset-password` | Password reset form. |
| `/oauth/callback` | OAuth callback handling. |
| `/choose-plan` | Plan selection after verification. |
| `/payment` | Starter plan payment/trial continuation page. |
| `/onboarding` | Company setup wizard. |
| `/set-password` | Invited employee password setup. |
| `/accept-invite` | Invite acceptance alias/page. |
| `/join/[code]` | Magic invite link flow. |
| `/dashboard` | Role-based dashboard redirect. |
| `/dashboard/admin` | Admin workspace. |
| `/dashboard/hr` | HR workspace. |
| `/dashboard/manager` | Manager workspace. |
| `/dashboard/employee` | Employee workspace. |
| `/demo` | Public sandbox/demo console. |

## Backend Base Routes

The Express server mounts routes in `server/src/index.js`.

| Mount | File | Purpose |
| --- | --- | --- |
| `/api/auth` | `server/src/routes/auth.routes.js` | Signup, login, verification, invites, onboarding, user session. |
| `/api/employees` | `server/src/routes/employee.routes.js` | Employee dashboard/update APIs. |
| `/api/employee` | `server/src/routes/employee.routes.js` | Same employee routes, singular alias. |
| `/api/tasks` | `server/src/routes/task.routes.js` | Task CRUD and status updates. |
| `/api/admin` | `server/src/routes/admin.routes.js` | Departments, employees, invites, admin updates, exports. |
| `/api/analytics` | `server/src/routes/analytics.routes.js` | Dashboard analytics. |
| `/api/ai` | `server/src/routes/ai.routes.js` | NudgeAI endpoints. |
| `/api/focus` | `server/src/routes/focus.routes.js` | Focus Pulse sessions/feed. |
| `/api/checkin` | `server/src/routes/checkin.routes.js` | Smart Presence daily check-ins. |
| `/api/deepwork` | `server/src/routes/deepwork.routes.js` | Deep Work sessions. |
| `/api/reports` | `server/src/routes/report.routes.js` | Board pack and reports. |
| `/api/payment` | `server/src/routes/payment.routes.js` | Razorpay order/verification. |
| `/api/contact` | `server/src/routes/contact.routes.js` | Contact form email. |
| `/health` | `server/src/index.js` | Server health check. |

## Auth API

- `POST /api/auth/signup`: Basic signup.
- `POST /api/auth/company-signup`: Create company workspace and first admin.
- `POST /api/auth/login`: Login and return authenticated user/session data.
- `GET /api/auth/oauth/google/url`: Google OAuth URL.
- `POST /api/auth/oauth/google/callback`: Google OAuth callback.
- `GET /api/auth/verify-email`: Verify email token.
- `POST /api/auth/resend-verification`: Resend verification email.
- `POST /api/auth/forgot-password`: Request password reset.
- `POST /api/auth/reset-password`: Reset password.
- `GET /api/auth/invite-status`: Check employee invite token.
- `POST /api/auth/accept-invite`: Accept employee invite.
- `POST /api/auth/set-password`: Set invited employee password.
- `GET /api/auth/join-status`: Check magic join code.
- `POST /api/auth/join`: Join workspace by magic link.
- `POST /api/auth/onboarding/complete`: Complete company onboarding.
- `GET /api/auth/me`: Current logged-in user.

## Employee API

Mounted at both `/api/employees` and `/api/employee`.

- `POST /updates`: Submit employee progress update.
- `GET /updates`: Get employee progress updates.
- `GET /dashboard`: Get employee dashboard data.
- `GET /notifications`: Get employee notifications.
- `GET /growth-summary`: Get employee growth summary.

## Task API

- `POST /api/tasks/`: Create task.
- `GET /api/tasks/`: List tasks.
- `PUT /api/tasks/:id`: Update task.
- `DELETE /api/tasks/:id`: Delete task.
- `PUT /api/tasks/:id/status`: Update task status.

## Admin API

- `GET /api/admin/departments`: List departments.
- `POST /api/admin/departments`: Create department.
- `PUT /api/admin/departments/:id`: Update department.
- `DELETE /api/admin/departments/:id`: Delete department.
- `GET /api/admin/employees`: List employees.
- `POST /api/admin/employees/invite`: Invite employees.
- `GET /api/admin/updates`: List company updates.
- `GET /api/admin/reports/export`: Export operational report.

## Analytics API

- `GET /api/analytics/dashboard`: Company dashboard analytics.

## NudgeAI API

- `POST /api/ai/assistant`: General assistant response.
- `POST /api/ai/score-update`: Score progress update quality.
- `GET /api/ai/summary/daily`: Daily summary.
- `GET /api/ai/delays`: Delay detection.
- `GET /api/ai/inactivity`: Inactivity detection.
- `POST /api/ai/burnout-check`: Burnout prediction.
- `POST /api/ai/sprint-forecast`: Sprint forecast.
- `POST /api/ai/standup-brief`: Standup brief.
- `POST /api/ai/anomaly-check`: Anomaly detection.
- `POST /api/ai/appreciation`: Appreciation suggestion.
- `GET /api/ai/skill-gap-analysis`: Get skill gap analysis.
- `POST /api/ai/skill-gap-analysis`: Regenerate skill gap analysis.

## Workforce Feature APIs

- `POST /api/focus/update`: Create/update focus session.
- `GET /api/focus/team`: Team focus feed.
- `POST /api/checkin/daily`: Submit daily check-in.
- `GET /api/checkin/team`: Team presence overview.
- `POST /api/deepwork/start`: Start deep work session.
- `POST /api/deepwork/end`: End deep work session.
- `GET /api/deepwork/team`: Team deep work overview.

## Reports, Payment, Contact

- `POST /api/reports/board-pack`: Generate board pack.
- `POST /api/payment/create-order`: Create Razorpay order.
- `POST /api/payment/verify`: Verify Razorpay payment.
- `POST /api/contact/`: Send contact/support email.
