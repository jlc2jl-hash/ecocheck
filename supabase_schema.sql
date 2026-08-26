-- ============================================================
-- EcoCheck — tabelas de diagnóstico e pendências por usuário
-- Rode isto uma vez no SQL Editor do Supabase.
-- ============================================================

create table if not exists diagnosticos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razao_social text,
  nome_fantasia text,
  cnpj text,
  estado text,
  municipio text,
  atividade text,
  porte text,
  area text,
  funcionarios text,
  respostas jsonb,        -- todas as respostas do onboarding (água, resíduos, licença, etc.)
  nivel_risco text,       -- BAIXO | MODERADO | ALTO
  pontos_atencao int,
  resumo_cards jsonb,     -- array de cards (licenciamento, documentos, resíduos, água, prazos)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pendencias (
  id uuid primary key default gen_random_uuid(),
  diagnostico_id uuid references diagnosticos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  area text,
  priority text,          -- ALTA | MÉDIA | BAIXA
  detail text,
  status text default 'aberta',  -- aberta | resolvida
  created_at timestamptz default now()
);

-- Cada usuário só enxerga e mexe nos próprios dados.
alter table diagnosticos enable row level security;
alter table pendencias enable row level security;

create policy "select proprio diagnostico" on diagnosticos
  for select using (auth.uid() = user_id);
create policy "insert proprio diagnostico" on diagnosticos
  for insert with check (auth.uid() = user_id);
create policy "update proprio diagnostico" on diagnosticos
  for update using (auth.uid() = user_id);
create policy "delete proprio diagnostico" on diagnosticos
  for delete using (auth.uid() = user_id);

create policy "select propria pendencia" on pendencias
  for select using (auth.uid() = user_id);
create policy "insert propria pendencia" on pendencias
  for insert with check (auth.uid() = user_id);
create policy "update propria pendencia" on pendencias
  for update using (auth.uid() = user_id);
create policy "delete propria pendencia" on pendencias
  for delete using (auth.uid() = user_id);

create index if not exists idx_diagnosticos_user on diagnosticos(user_id);
create index if not exists idx_pendencias_user on pendencias(user_id);
create index if not exists idx_pendencias_diagnostico on pendencias(diagnostico_id);
