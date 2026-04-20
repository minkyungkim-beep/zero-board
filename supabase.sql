-- ZERO_BOARD 팀 공유 테이블 세팅
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 한 번 실행하면 됩니다.

-- 1) 테이블
create table if not exists public.team_state (
  id         text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) RLS 활성화 + 공개 정책 (팀 공유 · 로그인 없음)
alter table public.team_state enable row level security;

drop policy if exists "public read"   on public.team_state;
drop policy if exists "public insert" on public.team_state;
drop policy if exists "public update" on public.team_state;

create policy "public read"   on public.team_state for select using (true);
create policy "public insert" on public.team_state for insert with check (true);
create policy "public update" on public.team_state for update using (true) with check (true);

-- 3) updated_at 자동 갱신 트리거
create or replace function public.team_state_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists team_state_updated_at on public.team_state;
create trigger team_state_updated_at
before update on public.team_state
for each row execute function public.team_state_set_updated_at();

-- 4) Realtime 활성화 (이미 추가되어 있으면 무시)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'team_state'
  ) then
    alter publication supabase_realtime add table public.team_state;
  end if;
end $$;
