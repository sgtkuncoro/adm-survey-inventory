-- Function to get inventory dashboard statistics
CREATE OR REPLACE FUNCTION get_inventory_stats()
RETURNS TABLE (
  total_surveys BIGINT,
  active_surveys BIGINT,
  avg_cpi_cents NUMERIC,
  avg_loi_minutes NUMERIC,
  total_slots BIGINT,
  last_sync TIMESTAMPTZ
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM external_surveys) as total_surveys,
    (SELECT count(*) FROM external_surveys WHERE is_active = true) as active_surveys,
    (SELECT COALESCE(avg(cpi_cents), 0) FROM external_surveys WHERE is_active = true) as avg_cpi_cents,
    (SELECT COALESCE(avg(loi_minutes), 0) FROM external_surveys WHERE is_active = true) as avg_loi_minutes,
    (
      SELECT COALESCE(SUM(completes_required - completes_current), 0)
      FROM survey_quotas q
      JOIN external_surveys s ON s.id = q.survey_id
      WHERE s.is_active = true AND q.is_open = true
    ) as total_slots,
    (SELECT updated_at FROM external_surveys ORDER BY updated_at DESC LIMIT 1) as last_sync;
END;
$$;
