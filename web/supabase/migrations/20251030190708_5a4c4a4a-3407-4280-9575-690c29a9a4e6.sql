-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE public.question_type AS ENUM (
  'short_text',
  'long_text',
  'multiple_choice',
  'rating',
  'nps'
);

CREATE TYPE public.survey_status AS ENUM (
  'draft',
  'active',
  'paused',
  'completed'
);

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'manager',
  'viewer'
);

-- ============================================
-- TABELAS
-- ============================================

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id, role)
);

-- Tabela de pesquisas
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status survey_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  allow_anonymous BOOLEAN NOT NULL DEFAULT false,
  show_progress_bar BOOLEAN NOT NULL DEFAULT true,
  thank_you_message TEXT NOT NULL DEFAULT 'Obrigado por participar!',
  total_responses INTEGER NOT NULL DEFAULT 0,
  is_template BOOLEAN NOT NULL DEFAULT false,
  duplicated_from UUID REFERENCES public.surveys(id)
);

CREATE INDEX idx_surveys_status ON public.surveys(status);
CREATE INDEX idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX idx_surveys_created_at ON public.surveys(created_at DESC);

-- Tabela de perguntas
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  min_rating INTEGER DEFAULT 1,
  max_rating INTEGER DEFAULT 5,
  max_length INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(survey_id, order_index)
);

CREATE INDEX idx_questions_survey ON public.questions(survey_id, order_index);

-- Tabela de opções de perguntas
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, order_index)
);

CREATE INDEX idx_question_options_question ON public.question_options(question_id);

-- Tabela de sessões de resposta
CREATE TABLE public.response_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  respondent_ip TEXT,
  respondent_user_agent TEXT,
  time_spent_seconds INTEGER
);

CREATE INDEX idx_response_sessions_survey ON public.response_sessions(survey_id);
CREATE INDEX idx_response_sessions_respondent ON public.response_sessions(respondent_id);
CREATE INDEX idx_response_sessions_complete ON public.response_sessions(survey_id, is_complete);

-- Tabela de respostas
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.response_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  text_response TEXT,
  numeric_response INTEGER,
  selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_id)
);

CREATE INDEX idx_responses_session ON public.responses(session_id);
CREATE INDEX idx_responses_question ON public.responses(question_id);

-- Tabela de métricas de pesquisa
CREATE TABLE public.survey_metrics (
  survey_id UUID PRIMARY KEY REFERENCES public.surveys(id) ON DELETE CASCADE,
  total_responses INTEGER NOT NULL DEFAULT 0,
  completed_responses INTEGER NOT NULL DEFAULT 0,
  average_completion_time_seconds INTEGER,
  completion_rate NUMERIC(5,2),
  average_rating NUMERIC(3,2),
  nps_score INTEGER,
  nps_promoters INTEGER NOT NULL DEFAULT 0,
  nps_passives INTEGER NOT NULL DEFAULT 0,
  nps_detractors INTEGER NOT NULL DEFAULT 0,
  csat_score NUMERIC(5,2),
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- FUNÇÕES
-- ============================================

-- Função para verificar se usuário tem uma role específica
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Função para verificar se usuário é admin ou manager
CREATE OR REPLACE FUNCTION public.is_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('admin', 'manager')
  )
$$;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário')
  );
  
  -- Primeiro usuário é admin, demais são viewers
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função para atualizar contador de respostas
CREATE OR REPLACE FUNCTION public.update_survey_response_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_complete = true AND (OLD.is_complete IS NULL OR OLD.is_complete = false) THEN
    UPDATE public.surveys
    SET total_responses = total_responses + 1
    WHERE id = NEW.survey_id;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para criar perfil ao cadastrar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_survey_metrics_updated_at
  BEFORE UPDATE ON public.survey_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger para atualizar contador de respostas
CREATE TRIGGER on_response_session_completed
  AFTER UPDATE ON public.response_sessions
  FOR EACH ROW
  WHEN (NEW.is_complete = true)
  EXECUTE FUNCTION public.update_survey_response_count();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para PROFILES
CREATE POLICY "Usuários podem ver próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para USER_ROLES
CREATE POLICY "Usuários podem ver próprios roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para SURVEYS
CREATE POLICY "Todos podem ver pesquisas ativas"
  ON public.surveys FOR SELECT
  USING (
    status = 'active' OR
    created_by = auth.uid() OR
    public.is_manager(auth.uid())
  );

CREATE POLICY "Managers podem criar pesquisas"
  ON public.surveys FOR INSERT
  WITH CHECK (
    public.is_manager(auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "Criadores podem atualizar suas pesquisas"
  ON public.surveys FOR UPDATE
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Criadores podem excluir suas pesquisas"
  ON public.surveys FOR DELETE
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- Políticas para QUESTIONS
CREATE POLICY "Usuários podem ver perguntas de pesquisas visíveis"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = questions.survey_id
      AND (surveys.status = 'active' OR surveys.created_by = auth.uid())
    )
  );

CREATE POLICY "Criadores podem gerenciar perguntas"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.created_by = auth.uid()
    )
  );

-- Políticas para QUESTION_OPTIONS
CREATE POLICY "Usuários podem ver opções de perguntas visíveis"
  ON public.question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.surveys s ON s.id = q.survey_id
      WHERE q.id = question_options.question_id
      AND (s.status = 'active' OR s.created_by = auth.uid())
    )
  );

CREATE POLICY "Criadores podem gerenciar opções"
  ON public.question_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.surveys s ON s.id = q.survey_id
      WHERE q.id = question_options.question_id
      AND s.created_by = auth.uid()
    )
  );

-- Políticas para RESPONSE_SESSIONS
CREATE POLICY "Usuários podem ver próprias sessões"
  ON public.response_sessions FOR SELECT
  USING (
    respondent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = response_sessions.survey_id
      AND surveys.created_by = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar sessões"
  ON public.response_sessions FOR INSERT
  WITH CHECK (
    respondent_id = auth.uid() OR
    respondent_id IS NULL
  );

CREATE POLICY "Usuários podem atualizar próprias sessões"
  ON public.response_sessions FOR UPDATE
  USING (respondent_id = auth.uid() OR respondent_id IS NULL);

-- Políticas para RESPONSES
CREATE POLICY "Usuários podem ver respostas de suas sessões ou suas pesquisas"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.response_sessions rs
      WHERE rs.id = responses.session_id
      AND (
        rs.respondent_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.surveys
          WHERE surveys.id = rs.survey_id
          AND surveys.created_by = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Usuários podem criar respostas em suas sessões"
  ON public.responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.response_sessions
      WHERE response_sessions.id = responses.session_id
      AND (response_sessions.respondent_id = auth.uid() OR response_sessions.respondent_id IS NULL)
    )
  );

-- Políticas para SURVEY_METRICS
CREATE POLICY "Criadores podem ver métricas de suas pesquisas"
  ON public.survey_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = survey_metrics.survey_id
      AND (surveys.created_by = auth.uid() OR public.is_manager(auth.uid()))
    )
  );

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW public.survey_statistics AS
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

CREATE OR REPLACE VIEW public.complete_responses AS
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