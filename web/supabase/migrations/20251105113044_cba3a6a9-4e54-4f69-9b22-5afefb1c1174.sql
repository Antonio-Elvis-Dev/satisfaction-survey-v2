-- Função para agregar respostas por data
CREATE OR REPLACE FUNCTION get_responses_by_date(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  response_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(rs.completed_at) as date,
    COUNT(DISTINCT rs.id)::BIGINT as response_count
  FROM response_sessions rs
  JOIN surveys s ON s.id = rs.survey_id
  WHERE s.created_by = p_user_id
    AND rs.is_complete = true
    AND rs.completed_at >= NOW() - (p_days || ' days')::INTERVAL
    AND rs.completed_at IS NOT NULL
  GROUP BY DATE(rs.completed_at)
  ORDER BY date DESC;
END;
$$;