-- This script creates a PostgreSQL function to synchronize a checklist.
-- It handles updates, inserts, and deletes for categories and items in a single transaction.
-- Using ON CONFLICT for UPSERT logic makes the function more robust and concise.

CREATE OR REPLACE FUNCTION public.sync_checklist(
    p_checklist_id uuid,
    p_user_id uuid,
    p_data jsonb
)
RETURNS void AS $$
DECLARE
    v_category jsonb;
    v_item jsonb;
    v_incoming_category_ids uuid[];
    v_incoming_item_ids uuid[];
    v_checklist_user_id uuid;
    v_new_category_id uuid;
BEGIN
    -- 1. Security Check: Ensure the user owns the checklist before proceeding.
    SELECT user_id INTO v_checklist_user_id FROM public.checklists WHERE id = p_checklist_id;

    IF v_checklist_user_id IS NULL OR v_checklist_user_id != p_user_id THEN
        RAISE EXCEPTION 'Permission denied: User % does not own checklist %.', p_user_id, p_checklist_id;
    END IF;

    -- 2. Update the main checklist details (name and tags).
    UPDATE public.checklists
    SET
        name = p_data->>'name',
        tags = ARRAY(SELECT jsonb_array_elements_text(p_data->'tags'))
    WHERE id = p_checklist_id;

    -- 3. Sync Categories
    -- First, get all category IDs from the incoming JSON data.
    SELECT array_agg((cat->>'id')::uuid) INTO v_incoming_category_ids
    FROM jsonb_array_elements(p_data->'categories') AS cat
    WHERE cat->>'id' IS NOT NULL;

    -- Delete any categories that exist in the database for this checklist but were not in the incoming data.
    DELETE FROM public.checklist_categories
    WHERE checklist_id = p_checklist_id AND id NOT IN (SELECT unnest(v_incoming_category_ids));

    -- Loop through each category from the incoming data to UPSERT (Update or Insert).
    FOR v_category IN SELECT * FROM jsonb_array_elements(p_data->'categories')
    LOOP
        -- Use INSERT ... ON CONFLICT to either update an existing category or insert a new one.
        INSERT INTO public.checklist_categories (id, checklist_id, name, icon)
        VALUES (
            COALESCE((v_category->>'id')::uuid, gen_random_uuid()), -- Generate new UUID if ID is null
            p_checklist_id,
            v_category->>'name',
            v_category->>'icon'
        )
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, icon = EXCLUDED.icon
        RETURNING id INTO v_new_category_id;

        -- 4. Sync Items within the current category
        -- This follows the same logic as syncing categories.
        SELECT array_agg((itm->>'id')::uuid) INTO v_incoming_item_ids
        FROM jsonb_array_elements(v_category->'items') AS itm
        WHERE itm->>'id' IS NOT NULL;

        DELETE FROM public.checklist_items
        WHERE category_id = v_new_category_id AND id NOT IN (SELECT unnest(v_incoming_item_ids));

        FOR v_item IN SELECT * FROM jsonb_array_elements(v_category->'items')
        LOOP
            INSERT INTO public.checklist_items (id, category_id, name, quantity, checked, notes)
            VALUES (
                COALESCE((v_item->>'id')::uuid, gen_random_uuid()), -- Generate new UUID if ID is null
                v_new_category_id,
                v_item->>'name',
                (v_item->>'quantity')::int,
                (v_item->>'checked')::boolean,
                v_item->>'notes'
            )
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name,
                quantity = EXCLUDED.quantity,
                checked = EXCLUDED.checked,
                notes = EXCLUDED.notes;
        END LOOP;
    END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
