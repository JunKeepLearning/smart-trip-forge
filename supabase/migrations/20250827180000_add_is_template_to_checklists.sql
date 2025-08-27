-- Add is_template column to checklists table
-- This allows distinguishing between user-created checklists and public templates.
ALTER TABLE public.checklists
ADD COLUMN is_template BOOLEAN NOT NULL DEFAULT false;

-- Add an index on the new column as we will frequently query for templates.
CREATE INDEX idx_checklists_is_template ON public.checklists(is_template);

-- Additionally, let's add some sample templates to the database
-- so that there is data to see for anonymous users.
INSERT INTO public.checklists (user_id, name, tags, is_template)
VALUES
    -- This user_id should correspond to a user in your auth.users table.
    -- You might need to create a placeholder user or use an existing one.
    -- For this example, we assume a user with a specific UUID exists.
    -- IMPORTANT: Replace '00000000-0000-0000-0000-000000000001' with a real user_id from your project.
    ('00000000-0000-0000-0000-000000000001', 'Weekend Getaway', '{"2 days", "short trip", "packing"}', true),
    ('00000000-0000-0000-0000-000000000001', 'International Travel (1 Week)', '{"international", "1 week", "essentials"}', true),
    ('00000000-0000-0000-0000-000000000001', 'Beach Vacation', '{"beach", "summer", "holiday"}', true);

