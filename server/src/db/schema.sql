-- Database Schema for NudgeHQ Workforce Tracking Platform
-- Designed for PostgreSQL / Supabase

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    owner_id UUID,
    industry VARCHAR(80),
    size VARCHAR(30),
    country VARCHAR(80) DEFAULT 'India',
    city VARCHAR(120),
    logo_url TEXT,
    plan VARCHAR(40) DEFAULT 'free_trial',
    trial_ends_at TIMESTAMPTZ,
    plan_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    company_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'manager', 'hr', 'admin')) DEFAULT 'employee',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    phone_number VARCHAR(40),
    whatsapp_nudge_sent_at TIMESTAMPTZ,
    last_whatsapp_nudge TIMESTAMPTZ,
    avatar_url TEXT,
    onboarding_complete BOOLEAN DEFAULT FALSE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')) DEFAULT 'todo',
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
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
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    visible_to_admin BOOLEAN DEFAULT FALSE NOT NULL,
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
    company_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'hr', 'admin')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    phone_number VARCHAR(40),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    token TEXT,
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    accepted_at TIMESTAMPTZ
);

-- Public magic invite links
CREATE TABLE IF NOT EXISTS invite_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 15,
    uses_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Email Verification Tokens
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. AI Output Cache Table
CREATE TABLE IF NOT EXISTS ai_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_type VARCHAR(60) NOT NULL,
    entity_id TEXT,
    output_json JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ
);

-- 12. Employee Recognition Notifications
CREATE TABLE IF NOT EXISTS employee_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL DEFAULT 'recognition',
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. Focus Pulse Sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    focus_text TEXT NOT NULL,
    eta VARCHAR(30) NOT NULL CHECK (eta IN ('today', 'tomorrow', 'this_week')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('focused', 'switched', 'blocked')) DEFAULT 'focused',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. Smart Presence Daily Check-ins
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

-- 15. Deep Work Sessions
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

-- 16. NudgeSpace Posts
CREATE TABLE IF NOT EXISTS nudgespace_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    space VARCHAR(20) NOT NULL CHECK (space IN ('social', 'u_space')) DEFAULT 'social',
    visibility_scope VARCHAR(20) NOT NULL CHECK (visibility_scope IN ('company', 'people', 'department', 'private')) DEFAULT 'company',
    post_type VARCHAR(30) NOT NULL DEFAULT 'status',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. WhatsApp Notification Logs
CREATE TABLE IF NOT EXISTS whatsapp_notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    phone_number VARCHAR(40),
    status VARCHAR(30) NOT NULL DEFAULT 'queued',
    notification_type VARCHAR(40) NOT NULL DEFAULT 'daily_nudge',
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    twilio_sid TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Backfill-safe migrations for existing Supabase projects
ALTER TABLE departments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_nudge_sent_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_whatsapp_nudge TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE blocker_logs ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'open';
ALTER TABLE blocker_logs ADD COLUMN IF NOT EXISTS visible_to_admin BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry VARCHAR(80);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS size VARCHAR(30);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country VARCHAR(80) DEFAULT 'India';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan VARCHAR(40) DEFAULT 'free_trial';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_name_key;
ALTER TABLE progress_updates ADD COLUMN IF NOT EXISTS quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10);
ALTER TABLE progress_updates ADD COLUMN IF NOT EXISTS quality_tip TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_month INTEGER;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_year INTEGER;
ALTER TABLE employee_invitations ADD COLUMN IF NOT EXISTS token TEXT;
ALTER TABLE employee_invitations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE employee_invitations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE employee_invitations ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE employee_invitations ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'employee';
ALTER TABLE employee_invitations ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE employee_invitations ADD COLUMN IF NOT EXISTS phone_number VARCHAR(40);
ALTER TABLE employee_invitations ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE nudgespace_posts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE nudgespace_posts ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE nudgespace_posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE nudgespace_posts ADD COLUMN IF NOT EXISTS space VARCHAR(20) DEFAULT 'social';
ALTER TABLE nudgespace_posts ADD COLUMN IF NOT EXISTS visibility_scope VARCHAR(20) DEFAULT 'company';
ALTER TABLE nudgespace_posts ADD COLUMN IF NOT EXISTS post_type VARCHAR(30) DEFAULT 'status';
ALTER TABLE nudgespace_posts ADD COLUMN IF NOT EXISTS content TEXT;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('employee', 'manager', 'hr', 'admin'));
ALTER TABLE employee_invitations DROP CONSTRAINT IF EXISTS employee_invitations_role_check;
ALTER TABLE employee_invitations
  ADD CONSTRAINT employee_invitations_role_check CHECK (role IN ('employee', 'manager', 'hr', 'admin'));
ALTER TABLE nudgespace_posts DROP CONSTRAINT IF EXISTS nudgespace_posts_space_check;
ALTER TABLE nudgespace_posts
  ADD CONSTRAINT nudgespace_posts_space_check CHECK (space IN ('social', 'u_space'));
ALTER TABLE nudgespace_posts DROP CONSTRAINT IF EXISTS nudgespace_posts_visibility_scope_check;
ALTER TABLE nudgespace_posts
  ADD CONSTRAINT nudgespace_posts_visibility_scope_check CHECK (visibility_scope IN ('company', 'people', 'department', 'private'));

ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_owner_id_fkey;
ALTER TABLE organizations
  ADD CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- Keep demo accounts usable after email verification is enabled.
UPDATE users
SET is_verified = TRUE
WHERE email IN ('admin@nudgehq.com', 'hr@nudgehq.com', 'manager@nudgehq.com', 'employee@nudgehq.com');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_last_whatsapp_nudge ON users(last_whatsapp_nudge);
CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments(organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_org_name ON departments(organization_id, name);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_organization ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_progress_updates_user ON progress_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_task ON progress_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_blocker_logs_task ON blocker_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_blocker_logs_resolved ON blocker_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_employee_invitations_email ON employee_invitations(email);
CREATE INDEX IF NOT EXISTS idx_employee_invitations_organization ON employee_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_invitations_company ON employee_invitations(company_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_employee_invitations_token ON employee_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invite_links_code ON invite_links(code);
CREATE INDEX IF NOT EXISTS idx_invite_links_company ON invite_links(company_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_feature ON ai_outputs(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_entity ON ai_outputs(entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_expires ON ai_outputs(expires_at);
CREATE INDEX IF NOT EXISTS idx_employee_notifications_user ON employee_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_updated ON focus_sessions(last_updated);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_deep_work_sessions_user ON deep_work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_deep_work_sessions_end ON deep_work_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_nudgespace_posts_organization ON nudgespace_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_nudgespace_posts_department ON nudgespace_posts(department_id);
CREATE INDEX IF NOT EXISTS idx_nudgespace_posts_author ON nudgespace_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_nudgespace_posts_space ON nudgespace_posts(space);
CREATE INDEX IF NOT EXISTS idx_nudgespace_posts_created ON nudgespace_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notification_logs_organization ON whatsapp_notification_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notification_logs_user ON whatsapp_notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notification_logs_type ON whatsapp_notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notification_logs_task ON whatsapp_notification_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notification_logs_created ON whatsapp_notification_logs(created_at DESC);
