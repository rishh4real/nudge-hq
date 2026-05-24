-- Database Schema for NudgeHQ Workforce Tracking Platform
-- Designed for PostgreSQL / Supabase

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')) DEFAULT 'todo',
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Progress Updates Table
CREATE TABLE IF NOT EXISTS progress_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    progress_text TEXT NOT NULL,
    proof_link TEXT,
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
    quality_tip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Blocker Logs Table
CREATE TABLE IF NOT EXISTS blocker_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocker_text TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly')) DEFAULT 'daily',
    content JSONB NOT NULL, -- Holds AI summary JSON payload (e.g. daily team summaries, delayed list)
    report_month INTEGER,
    report_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Employee Invitations Table
CREATE TABLE IF NOT EXISTS employee_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'revoked')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. AI Output Cache Table
CREATE TABLE IF NOT EXISTS ai_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_type VARCHAR(60) NOT NULL,
    entity_id TEXT,
    output_json JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ
);

-- 10. Employee Recognition Notifications
CREATE TABLE IF NOT EXISTS employee_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL DEFAULT 'recognition',
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Focus Pulse Sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    focus_text TEXT NOT NULL,
    eta VARCHAR(30) NOT NULL CHECK (eta IN ('today', 'tomorrow', 'this_week')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('focused', 'switched', 'blocked')) DEFAULT 'focused',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Smart Presence Daily Check-ins
CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(30) NOT NULL CHECK (location IN ('office', 'home', 'client_site', 'travel')),
    goals_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    energy_level VARCHAR(20) NOT NULL CHECK (energy_level IN ('high', 'medium', 'low')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date)
);

-- 13. Deep Work Sessions
CREATE TABLE IF NOT EXISTS deep_work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    focus_declared TEXT NOT NULL,
    output_logged TEXT,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Backfill-safe migrations for existing Supabase projects
ALTER TABLE departments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE progress_updates ADD COLUMN IF NOT EXISTS quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10);
ALTER TABLE progress_updates ADD COLUMN IF NOT EXISTS quality_tip TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_month INTEGER;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_year INTEGER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_progress_updates_user ON progress_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_task ON progress_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_blocker_logs_task ON blocker_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_blocker_logs_resolved ON blocker_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_employee_invitations_email ON employee_invitations(email);
CREATE INDEX IF NOT EXISTS idx_employee_invitations_organization ON employee_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_feature ON ai_outputs(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_entity ON ai_outputs(entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_expires ON ai_outputs(expires_at);
CREATE INDEX IF NOT EXISTS idx_employee_notifications_user ON employee_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_updated ON focus_sessions(last_updated);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_deep_work_sessions_user ON deep_work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_deep_work_sessions_end ON deep_work_sessions(end_time);
