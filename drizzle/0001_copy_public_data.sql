DO $$
DECLARE
  v_table_name text;
  common_columns text;
  sequence_name text;
  max_id bigint;
BEGIN
  FOR v_table_name IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'annavedah' AND t.table_type = 'BASE TABLE'
    ORDER BY CASE WHEN t.table_name = 'users' THEN 0 ELSE 1 END, t.table_name
  LOOP
    IF to_regclass(format('public.%I', v_table_name)) IS NULL THEN
      CONTINUE;
    END IF;

    SELECT string_agg(format('%I', destination.column_name), ', ' ORDER BY destination.ordinal_position)
      INTO common_columns
    FROM information_schema.columns destination
    JOIN information_schema.columns source
      ON source.table_schema = 'public'
     AND source.table_name = destination.table_name
     AND source.column_name = destination.column_name
    WHERE destination.table_schema = 'annavedah'
      AND destination.table_name = v_table_name;

    IF common_columns IS NOT NULL THEN
      EXECUTE format(
        'INSERT INTO annavedah.%I (%s) SELECT %s FROM public.%I ON CONFLICT DO NOTHING',
        v_table_name, common_columns, common_columns, v_table_name
      );
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'annavedah'
        AND table_name = v_table_name
        AND column_name = 'id'
    ) THEN
      sequence_name := pg_get_serial_sequence(format('annavedah.%I', v_table_name), 'id');
    ELSE
      sequence_name := NULL;
    END IF;
    IF sequence_name IS NOT NULL THEN
      EXECUTE format('SELECT COALESCE(MAX(id), 0) FROM annavedah.%I', v_table_name) INTO max_id;
      IF max_id > 0 THEN
        PERFORM setval(sequence_name, max_id, true);
      END IF;
    END IF;
  END LOOP;
END $$;
