-- Criar tabela para análise de sentimento de respostas abertas
CREATE TABLE IF NOT EXISTS public.response_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(response_id)
);

-- Enable RLS
ALTER TABLE public.response_sentiment ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sentiment analysis of their surveys
CREATE POLICY "Usuários podem ver análise de sentimento de suas pesquisas"
ON public.response_sentiment
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM responses r
    JOIN response_sessions rs ON rs.id = r.session_id
    JOIN surveys s ON s.id = rs.survey_id
    WHERE r.id = response_sentiment.response_id
    AND (s.created_by = auth.uid() OR rs.respondent_id = auth.uid())
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_response_sentiment_response_id ON public.response_sentiment(response_id);
CREATE INDEX IF NOT EXISTS idx_response_sentiment_sentiment ON public.response_sentiment(sentiment);