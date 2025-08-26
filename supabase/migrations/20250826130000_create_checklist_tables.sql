-- Migration for creating checklist-related tables

-- 1. Checklists Table
-- Stores the main checklist information, linked to a user.
CREATE TABLE checklists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) > 0),
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security (RLS) for the checklists table.
-- This is a Supabase best practice to ensure users can only access their own data.
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

-- 2. Checklist Categories Table
-- Stores categories within a specific checklist.
CREATE TABLE checklist_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id uuid REFERENCES checklists(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) > 0),
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for categories.
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;

-- 3. Checklist Items Table
-- Stores individual items within a category.
CREATE TABLE checklist_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES checklist_categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) > 0),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    checked BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for items.
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- 4. Indexes for Foreign Keys
-- Improves performance for fetching data.
CREATE INDEX idx_checklists_user_id ON checklists(user_id);
CREATE INDEX idx_checklist_categories_checklist_id ON checklist_categories(checklist_id);
CREATE INDEX idx_checklist_items_category_id ON checklist_items(category_id);
