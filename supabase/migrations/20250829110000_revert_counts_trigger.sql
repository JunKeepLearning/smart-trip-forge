-- Drop the trigger and the function

DROP TRIGGER IF EXISTS trigger_update_checklist_counts ON public.checklist_items;

DROP FUNCTION IF EXISTS public.update_checklist_counts_incrementally();

-- Also drop the old function just in case it's still there from a previous migration attempt
DROP FUNCTION IF EXISTS public.update_checklist_counts();
