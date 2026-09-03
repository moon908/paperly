-- ==============================================================================
-- Paperly Database Schema for NeonDB (PostgreSQL)
-- Compatible with Clerk Authentication (User ID: clerk_id)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Users Table (Synchronized with Clerk)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Clerk user id (e.g., 'user_2xABC...')
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Documents / Notes Table (BlockNote & Markdown Notes)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Document',
    content TEXT DEFAULT '',
    date_display VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Whiteboards Table (Excalidraw Visual Canvases)
CREATE TABLE IF NOT EXISTS whiteboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Whiteboard',
    content TEXT DEFAULT '{"elements":[]}',
    date_display VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Kanban Tasks Table (4-Column Agile Workflow)
CREATE TABLE IF NOT EXISTS kanban_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'on_hold')),
    priority VARCHAR(32) NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    category VARCHAR(64) DEFAULT 'General',
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Study Space Files Table (Uploaded PDFs & Lecture Slides)
CREATE TABLE IF NOT EXISTS study_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    name TEXT NOT NULL,
    size VARCHAR(32) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Calendar Events Table (Events & Meeting Reminders)
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    event_time TIMESTAMPTZ NOT NULL,
    color VARCHAR(32) DEFAULT '#007AFF',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- Indexes for High-Performance Multi-Tenant Queries
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_whiteboards_user_id ON whiteboards(user_id);
CREATE INDEX IF NOT EXISTS idx_whiteboards_updated_at ON whiteboards(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_kanban_tasks_user_id ON kanban_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_status ON kanban_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_due_date ON kanban_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_study_files_user_id ON study_files(user_id);
CREATE INDEX IF NOT EXISTS idx_study_files_uploaded_at ON study_files(uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time ON calendar_events(event_time);

-- ==============================================================================
-- Trigger to automatically update updated_at timestamps
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_whiteboards_updated_at ON whiteboards;
CREATE TRIGGER trg_whiteboards_updated_at
BEFORE UPDATE ON whiteboards
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_kanban_tasks_updated_at ON kanban_tasks;
CREATE TRIGGER trg_kanban_tasks_updated_at
BEFORE UPDATE ON kanban_tasks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();
