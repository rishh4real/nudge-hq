-- Seed database records for NudgeHQ
-- Run these statements in Supabase SQL editor to set up the Demo Accounts

-- 1. Insert demo organization
INSERT INTO organizations (id, name)
VALUES ('99999999-9999-9999-9999-999999999999', 'NudgeHQ Demo Company')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Departments and capture IDs
INSERT INTO departments (id, name, description)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Sales Operations', 'Responsible for commercial updates and field support tracking.'),
  ('b2222222-2222-2222-2222-222222222222', 'Engineering', 'Builds backend components and infrastructure integrations.')
ON CONFLICT (name) DO NOTHING;

UPDATE departments
SET organization_id = '99999999-9999-9999-9999-999999999999'
WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
);

-- 3. Insert Users
-- Password for both accounts: nudgehq123 (hashed: $2a$10$iNcWZbbWXE9NpcvR9dX6KO6.3B7Wwo6E8NRtrRdnhl6juBfx/iMDi)
INSERT INTO users (id, name, email, password_hash, role, department_id)
VALUES
  (
    'c3333333-3333-3333-3333-333333333333', 
    'HR Operations', 
    'hr@nudgehq.com', 
    '$2a$10$iNcWZbbWXE9NpcvR9dX6KO6.3B7Wwo6E8NRtrRdnhl6juBfx/iMDi', 
    'admin', 
    NULL
  ),
  (
    'd4444444-4444-4444-4444-444444444444', 
    'Kunal', 
    'employee@nudgehq.com', 
    '$2a$10$iNcWZbbWXE9NpcvR9dX6KO6.3B7Wwo6E8NRtrRdnhl6juBfx/iMDi', 
    'employee', 
    'a1111111-1111-1111-1111-111111111111'
  )
ON CONFLICT (email) DO NOTHING;

UPDATE users
SET organization_id = '99999999-9999-9999-9999-999999999999'
WHERE id IN (
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444'
);

-- 4. Insert Starter Tasks
INSERT INTO tasks (id, title, description, status, assignee_id, due_date)
VALUES
  (
    'e5555555-5555-5555-5555-555555555555',
    'Verify customer email lists for marketing campaign',
    'Review bounce rate projections and clean up stale addresses before dispatch.',
    'completed',
    'd4444444-4444-4444-4444-444444444444',
    NOW() - INTERVAL '1 day'
  ),
  (
    'f6666666-6666-6666-6666-666666666666',
    'Finalize weekly sales forecast summary',
    'Compile team sales updates and structure them into the executive board deck.',
    'in_progress',
    'd4444444-4444-4444-4444-444444444444',
    NOW() + INTERVAL '2 days'
  ),
  (
    'g7777777-7777-7777-7777-777777777777',
    'Resolve database replication delays in staging',
    'Investigate latency peaks during sync sessions between regional Supabase replica databases.',
    'blocked',
    'd4444444-4444-4444-4444-444444444444',
    NOW() + INTERVAL '4 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Active Blocker Log for the blocked task
INSERT INTO blocker_logs (id, task_id, reporter_id, blocker_text, resolved)
VALUES
  (
    'h8888888-8888-8888-8888-888888888888',
    'g7777777-7777-7777-7777-777777777777',
    'd4444444-4444-4444-4444-444444444444',
    'Waiting on AWS DevOps keys to audit database sync access policies.',
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Insert sample progress updates
INSERT INTO progress_updates (id, user_id, task_id, progress_text, proof_link)
VALUES
  (
    'i9999999-9999-9999-9999-999999999999',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555',
    'Scrubbed all duplicate emails and verified bounce rates are under 1%. Check proof sheet.',
    'https://sheets.google.com/test-sales-scrub'
  )
ON CONFLICT (id) DO NOTHING;
