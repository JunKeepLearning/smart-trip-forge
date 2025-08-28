-- Add item_count and items_checked_count to checklists table
ALTER TABLE public.checklists
ADD COLUMN items_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN items_checked_count INTEGER NOT NULL DEFAULT 0;

-- Optional: Add indexes for potentially faster sorting/filtering if needed in the future
CREATE INDEX IF NOT EXISTS idx_checklists_items_count ON public.checklists(items_count);
CREATE INDEX IF NOT EXISTS idx_checklists_items_checked_count ON public.checklists(items_checked_count);
