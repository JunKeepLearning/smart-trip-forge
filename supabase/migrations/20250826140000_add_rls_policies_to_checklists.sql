-- RLS Policies for checklist-related tables
-- This migration ensures that users can only access their own data.

-- 1. Policies for 'checklists' table

-- Allow users to see only their own checklists.
CREATE POLICY "Allow select for own checklists" ON checklists
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert checklists only for themselves.
CREATE POLICY "Allow insert for own checklists" ON checklists
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own checklists.
CREATE POLICY "Allow update for own checklists" ON checklists
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own checklists.
CREATE POLICY "Allow delete for own checklists" ON checklists
FOR DELETE USING (auth.uid() = user_id);


-- 2. Policies for 'checklist_categories' table

-- Users can only access categories that belong to a checklist they own.
CREATE POLICY "Allow access for own categories" ON checklist_categories
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM checklists
        WHERE checklists.id = checklist_categories.checklist_id AND checklists.user_id = auth.uid()
    )
);


-- 3. Policies for 'checklist_items' table

-- Users can only access items that belong to a category within a checklist they own.
CREATE POLICY "Allow access for own items" ON checklist_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM checklists
        JOIN checklist_categories ON checklists.id = checklist_categories.checklist_id
        WHERE checklist_categories.id = checklist_items.category_id AND checklists.user_id = auth.uid()
    )
);
