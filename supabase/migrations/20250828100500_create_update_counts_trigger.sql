-- Function to update checklist counts
CREATE OR REPLACE FUNCTION public.update_checklist_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_checklist_id uuid;
BEGIN
  -- Determine the checklist_id from the changed row
  IF (TG_OP = 'DELETE') THEN
    -- For DELETE, the checklist_id comes from the OLD row
    SELECT category.checklist_id INTO v_checklist_id FROM public.checklist_categories category WHERE category.id = OLD.category_id;
  ELSE
    -- For INSERT or UPDATE, it comes from the NEW row
    SELECT category.checklist_id INTO v_checklist_id FROM public.checklist_categories category WHERE category.id = NEW.category_id;
  END IF;

  -- If a checklist_id was found, update its counts
  IF v_checklist_id IS NOT NULL THEN
    UPDATE public.checklists
    SET
      items_count = (
        SELECT COUNT(*)
        FROM public.checklist_items i
        JOIN public.checklist_categories c ON i.category_id = c.id
        WHERE c.checklist_id = v_checklist_id
      ),
      items_checked_count = (
        SELECT COUNT(*)
        FROM public.checklist_items i
        JOIN public.checklist_categories c ON i.category_id = c.id
        WHERE c.checklist_id = v_checklist_id AND i.checked = TRUE
      )
    WHERE id = v_checklist_id;
  END IF;

  -- Return the appropriate row
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after any change to checklist_items
CREATE TRIGGER trigger_update_checklist_counts
AFTER INSERT OR UPDATE OR DELETE ON public.checklist_items
FOR EACH ROW EXECUTE FUNCTION public.update_checklist_counts();
