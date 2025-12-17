-- Corrigir views para usar security_invoker
DROP VIEW IF EXISTS public.survey_statistics;
CREATE VIEW public.survey_statistics
WITH (security_invoker = true)
AS
SELECT 
  s.id,
  s.title,
  s.status,
  s.created_by,
  COUNT(DISTINCT rs.id) as total_sessions,
  COUNT(DISTINCT CASE WHEN rs.is_complete THEN rs.id END) as completed_sessions,
  COUNT(DISTINCT r.id) as total_responses,
  AVG(rs.time_spent_seconds) as avg_time_spent,
  MAX(rs.completed_at) as last_response_at
FROM public.surveys s
LEFT JOIN public.response_sessions rs ON rs.survey_id = s.id
LEFT JOIN public.responses r ON r.session_id = rs.id
GROUP BY s.id, s.title, s.status, s.created_by;

DROP VIEW IF EXISTS public.complete_responses;
CREATE VIEW public.complete_responses
WITH (security_invoker = true)
AS
SELECT
  s.id as survey_id,
  s.title as survey_title,
  rs.id as session_id,
  rs.respondent_id,
  rs.completed_at,
  q.id as question_id,
  q.question_text,
  q.question_type,
  r.text_response,
  r.numeric_response,
  qo.option_text as selected_option_text
FROM public.surveys s
JOIN public.response_sessions rs ON rs.survey_id = s.id
JOIN public.responses r ON r.session_id = rs.id
JOIN public.questions q ON q.id = r.question_id
LEFT JOIN public.question_options qo ON qo.id = r.selected_option_id
WHERE rs.is_complete = true;