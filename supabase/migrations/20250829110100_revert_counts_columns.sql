-- Revert the addition of item count columns from the checklists table

ALTER TABLE public.checklists
DROP COLUMN IF EXISTS items_checked_count,
DROP COLUMN IF EXISTS items_count;
