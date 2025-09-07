-- Function to update checklist counts incrementally and efficiently
CREATE OR REPLACE FUNCTION public.update_checklist_counts_incrementally()
RETURNS TRIGGER AS $
DECLARE
  v_checklist_id_old uuid;
  v_checklist_id_new uuid;
BEGIN
  -- On UPDATE, find both old and new checklist_ids
  IF (TG_OP = 'UPDATE') THEN
    SELECT c.checklist_id INTO v_checklist_id_old FROM public.checklist_categories c WHERE c.id = OLD.category_id;
    SELECT c.checklist_id INTO v_checklist_id_new FROM public.checklist_categories c WHERE c.id = NEW.category_id;

    -- If item moved between checklists
    IF (v_checklist_id_old IS DISTINCT FROM v_checklist_id_new) THEN
      -- Decrement old checklist if it exists
      IF v_checklist_id_old IS NOT NULL THEN
        UPDATE public.checklists
        SET
          items_count = items_count - 1,
          items_checked_count = items_checked_count - CASE WHEN OLD.checked THEN 1 ELSE 0 END
        WHERE id = v_checklist_id_old;
      END IF;
      -- Increment new checklist if it exists
      IF v_checklist_id_new IS NOT NULL THEN
        UPDATE public.checklists
        SET
          items_count = items_count + 1,
          items_checked_count = items_checked_count + CASE WHEN NEW.checked THEN 1 ELSE 0 END
        WHERE id = v_checklist_id_new;
      END IF;
    ELSE -- Item updated within the same checklist
      IF (OLD.checked IS DISTINCT FROM NEW.checked) THEN
        UPDATE public.checklists
        SET items_checked_count = items_checked_count + CASE WHEN NEW.checked THEN 1 ELSE -1 END
        WHERE id = v_checklist_id_new;
      END IF;
    END IF;

  -- On DELETE, find the old checklist_id and decrement
  ELSIF (TG_OP = 'DELETE') THEN
    SELECT c.checklist_id INTO v_checklist_id_old FROM public.checklist_categories c WHERE c.id = OLD.category_id;
    IF v_checklist_id_old IS NOT NULL THEN
      UPDATE public.checklists
      SET
        items_count = items_count - 1,
        items_checked_count = items_checked_count - CASE WHEN OLD.checked THEN 1 ELSE 0 END
      WHERE id = v_checklist_id_old;
    END IF;

  -- On INSERT, find the new checklist_id and increment
  ELSIF (TG_OP = 'INSERT') THEN
    SELECT c.checklist_id INTO v_checklist_id_new FROM public.checklist_categories c WHERE c.id = NEW.category_id;
    IF v_checklist_id_new IS NOT NULL THEN
      UPDATE public.checklists
      SET
        items_count = items_count + 1,
        items_checked_count = items_checked_count + CASE WHEN NEW.checked THEN 1 ELSE 0 END
      WHERE id = v_checklist_id_new;
    END IF;
  END IF;

  RETURN NULL; -- The trigger result is irrelevant
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger before creating the new one
DROP TRIGGER IF EXISTS trigger_update_checklist_counts ON public.checklist_items;

-- Create the new, efficient trigger
CREATE TRIGGER trigger_update_checklist_counts
AFTER INSERT OR UPDATE OR DELETE ON public.checklist_items
FOR EACH ROW EXECUTE FUNCTION public.update_checklist_counts_incrementally();
