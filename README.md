# NudgeHQ

NudgeHQ is a B2B SaaS web app for real-time workforce progress tracking. It helps employees share quick progress updates, blockers, and task status while giving HR and managers a live view of team momentum.

## Product Highlights

- Modern SaaS landing page with trust signals, pricing, security, and early-access CTAs
- Developer demo console for switching between employee and admin/HR roles
- Company onboarding endpoint for creating a workspace and admin account
- Employee invite flow for creating employee logins from the admin dashboard
- Employee workspace for progress check-ins, task status updates, blockers, and proof links
- Admin/HR workspace for analytics, departments, task assignment, progress review, and reporting
- Groq-powered AI summary endpoints for daily summaries, delay analysis, and inactivity nudges
- Supabase-ready backend schema, seed data, authentication, and role-based API routes
- Sandbox mode fallback for demoing the product before Supabase is connected

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express
- Supabase/PostgreSQL
- JWT authentication
- Groq SDK

## Repository Structure

```text
.
├── CODEMAP.md             # Teammate guide to the codebase
├── public/brand/          # NudgeHQ brand icon
├── postman/               # API collection and local environment
├── src/                   # React frontend
├── server/                # Express API, Supabase schema, seed data
├── package.json           # Frontend scripts and dependencies
└── vite.config.js
```

New teammates should start with [CODEMAP.md](./CODEMAP.md) before editing dashboards or backend routes.

## Local Development

Install frontend dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run the backend:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The frontend auto-detects the backend on ports `5000` or `5001`. If Supabase is not connected yet, use Sandbox Mode in the demo console.

## Environment

Backend environment variables live in `server/.env`, which is intentionally ignored by git.

Required for live backend mode:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `GROQ_MODEL`

## Database Setup

In Supabase SQL editor:

1. Run `server/src/db/schema.sql`
2. Run `server/src/db/seed.sql`

Run the latest schema again after pulling changes. It uses safe `IF NOT EXISTS` statements for organizations and employee invitations.

The seed file creates demo accounts:

- Admin/HR: `hr@nudgehq.com`
- Employee: `employee@nudgehq.com`
- Password: `nudgehq123`

## Scripts

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Backend:

```bash
cd server
npm run dev
npm start
```

## API Testing

Import these files into Postman:

- `postman/NudgeHQ.postman_collection.json`
- `postman/NudgeHQ.postman_environment.json`

Run `Login Admin` and `Login Employee` first. The collection saves JWTs into Postman environment variables for the protected routes.

## Contact

Official email: `hello.nudgehq@gmail.com`
