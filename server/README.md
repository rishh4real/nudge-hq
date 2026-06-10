# NudgeHQ Backend Server

This is the Express.js and PostgreSQL/Supabase backend server for **NudgeHQ** workforce tracking platform.

## Features

- **JWT Authentication**: Secure login/signup with custom role authorization (`admin` & `employee`).
- **Workforce Task Management**: Assignments, status transitions, and automated blocker logging.
- **WhatsApp Automation**: Daily nudges, deadline reminders, blocker alerts, employee weekly wins, and manager/admin weekly reports.
- **Analytics Engine**: Metrics computation, completion indicators, and check-in rates.
- **Groq AI Integration**: Daily summaries, delay assessments, and activity nudges.
- **MVC Architecture**: Scalable file structure dividing controllers, routes, configurations, and middleware.

## Directory Layout

```
server/
├── src/
│   ├── config/          # Clients (Supabase, Groq)
│   ├── db/              # SQL setup schemas
│   ├── middleware/      # Auth validation
│   ├── controllers/     # Business logic
│   ├── routes/          # REST endpoints
│   └── index.js         # Server entrypoint
├── .env.example
└── package.json
```

## Getting Started

### 1. Database Setup
Copy the statements in `src/db/schema.sql` and run them in your Supabase SQL editor to instantiate the tables and indexes.

### 2. Environment Setup
Create a `.env` file in the `server` root:
```bash
cp .env.example .env
```
Fill in the credentials for Supabase, Groq API, and JWT Secret.

### 3. Installation
Install the Node.js packages:
```bash
npm install
```

### 4. Running Locally
Run the server in development mode:
```bash
npm run dev
```
The API is exposed locally at: `http://localhost:5000`

If port `5000` is already occupied locally, run:

```bash
PORT=5001 npm run dev
```

The frontend probes both `5000` and `5001`.

## API Reference

### Auth Endpoint `/api/auth`
- `POST /signup` - Register a new employee/admin.
- `POST /company-signup` - Create a company workspace, default department, and admin account.
- `POST /login` - Sign in and receive token.
- `GET /me` - Get current profile info (Protected).

### Employees Endpoint `/api/employees`
- `POST /updates` - Log daily update check-in (Protected).
- `GET /updates` - Fetch user progress update history (Protected).
- `GET /dashboard` - Get employee task stats (Protected).

### Tasks Endpoint `/api/tasks`
- `GET /` - Fetch tasks (Protected).
- `POST /` - Create a task (Admin only).
- `PUT /:id` - Edit task details (Admin only).
- `PUT /:id/status` - Transition task state. If status is `blocked`, requires `blocker_text` (Protected).
- `DELETE /:id` - Remove a task (Admin only).

### Admin Endpoint `/api/admin`
- `GET /updates` - Review all employee progress updates (Admin only).
- `GET /departments` - List departments (Protected).
- `POST /departments` - Create department (Admin only).
- `PUT /departments/:id` - Edit department (Admin only).
- `DELETE /departments/:id` - Delete department (Admin only).
- `POST /employees/invite` - Invite an employee and create their login (Admin only).
- `GET /reports/export` - Export task and blocker metrics as JSON ready for Excel/CSV formatting (Admin only).

### Analytics Endpoint `/api/analytics`
- `GET /dashboard` - Get high-level team completion rates and blocker summary stats (Admin only).

### AI Endpoint `/api/ai`
- `GET /summary/daily` - Retrieve daily LLM-generated operational brief (Admin only).
- `GET /delays` - Highlight overdue tasks and risk assessments (Admin only).
- `GET /inactivity` - Identify employees with no progress updates for 3 days and generate nudge draft templates (Admin only).
- `POST /burnout-check` - Private admin/HR burnout risk signals powered by NudgeAI (Admin only).
- `POST /sprint-forecast` - Weekly completion forecast, at-risk tasks, and recommended actions (Admin only).
- `POST /standup-brief` - Manager-ready daily standup brief from recent updates (Admin only).
- `POST /score-update` - Optional progress update quality score and improvement tip (Employee/Admin).
- `POST /anomaly-check` - Care-oriented check-in anomaly alerts (Admin only).
- `POST /appreciation` - Appreciation suggestions and one-click recognition delivery (Admin only).
- `GET|POST /skill-gap-analysis` - Recurring blocker themes and suggested learning areas (Admin only).

### Focus Pulse Endpoint `/api/focus`
- `POST /update` - Employee voluntarily shares current focus, ETA, and focus status.
- `GET /team` - Admin view of the current team focus feed and NudgeAI switching insight.

### Smart Presence Endpoint `/api/checkin`
- `POST /daily` - Employee submits work location, top goals, and energy level.
- `GET /team` - Admin overview of location, goals, and energy patterns.

### Deep Work Endpoint `/api/deepwork`
- `POST /start` - Employee starts Deep Work Mode with focus and duration.
- `POST /end` - Employee logs output after a deep work session.
- `GET /team` - Admin insight into active and monthly deep work usage.

### Board Pack Endpoint `/api/reports`
- `POST /board-pack` - Generate a monthly NudgeAI PDF board pack (Admin only).

### Notifications Endpoint `/api/notify`
- `POST /whatsapp` - Send daily pending-update WhatsApp nudges (Admin/HR).
- `POST /whatsapp/deadlines` - Send WhatsApp reminders for tasks due within the next 24 hours (Admin/HR/Manager).
- `POST /whatsapp/weekly-wins` - Send weekly employee WhatsApp win summaries (Admin/HR).
- `POST /whatsapp/weekly-report` - Send weekly WhatsApp reports to managers, HR, and admins (Admin/HR/Manager).
- `POST /whatsapp/reply` - Twilio webhook to save employee replies back into NudgeHQ.

Run the latest `src/db/schema.sql` in Supabase after pulling this version. It adds `ai_outputs`, `employee_notifications`, update quality score columns, `focus_sessions`, `daily_checkins`, `deep_work_sessions`, task organization/due-date indexes, and board-pack report metadata used by NudgeAI.

## Postman

Import from the repository root:

- `postman/NudgeHQ.postman_collection.json`
- `postman/NudgeHQ.postman_environment.json`

Run the auth requests first to populate `adminToken` and `employeeToken`.
