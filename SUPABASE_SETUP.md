# Supabase 팀 공유 세팅 가이드

이 앱은 Supabase Postgres + Realtime 을 통해 팀원 간 실시간 데이터 공유를 지원합니다.
환경변수를 세팅하지 않으면 자동으로 localStorage 단독 모드로 동작합니다.

## 1. Supabase 프로젝트 생성 (최초 1회)

1. https://supabase.com → **Start your project** → GitHub 또는 이메일 로그인
2. **New project**
   - Organization: 개인 계정으로 생성되는 기본 org 사용
   - Name: `zero-board` 등
   - Database Password: 복잡한 값으로 설정 + **꼭 저장** (복구 용도)
   - Region: `Northeast Asia (Seoul)` 권장
3. 프로젝트 생성 완료까지 1~2분 대기

## 2. 테이블 + 정책 생성

좌측 메뉴 **SQL Editor → New query** 에 레포 루트의 [`supabase.sql`](./supabase.sql) 내용 전체 복붙 → **Run**.

이 스크립트가 해주는 것:
- `team_state` 테이블 생성 (id text primary key + data jsonb)
- Row Level Security 활성화 + 익명 read/write 허용 정책
- `updated_at` 자동 갱신 트리거
- Realtime 퍼블리케이션 등록

## 3. API 키 확인

좌측 **Project Settings → API**:
- `Project URL` → `VITE_SUPABASE_URL` 값
- `Project API keys` 의 **anon / public** 키 → `VITE_SUPABASE_ANON_KEY` 값

> ⚠️ `service_role` 키는 서버 전용이라 절대 프론트엔드에 넣지 마세요. 반드시 **anon** 키 사용.

## 4. Vercel 환경변수 등록

Vercel 프로젝트 → **Settings → Environment Variables**:

| 이름 | 값 |
|---|---|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public key |

환경은 `Production`, `Preview`, `Development` 모두 체크. 저장 후 **Deployments → 최신 → Redeploy**.

## 5. 로컬 개발 (선택)

루트에 `.env` 파일을 만들고 `.env.example` 의 키에 같은 값을 채우면 `npm run dev` 에서도 Supabase 와 동기화됩니다.

## 6. 초기 데이터 마이그레이션

- Supabase 설정이 적용된 새 배포를 처음 여는 브라우저의 localStorage 내용이 `team_state` row 로 자동 업로드됩니다.
- 이후 다른 팀원 접속 시엔 Supabase 데이터가 로컬보다 우선. 개별 팀원의 로컬-only 변경분이 있다면 사전 백업(사이드바 → 백업 내보내기) 권장.

## 7. 동작 확인

사이드바 하단 점 색상:
- 🟡 연결 중… → 🟢 팀 동기화됨 = 정상
- ⚪ 로컬 저장소 = 환경변수 미설정
- 🔵 동기화 중… = 방금 변경 Supabase 반영 중 (정상 깜빡임)
- 🔴 동기화 오류 = 브라우저 콘솔 확인 (보통 RLS 정책 미적용 / 키 오탈자)

두 브라우저에서 같은 Vercel URL 열고 한쪽에서 뭔가 추가해 보세요. 1초 내로 반대쪽 반영되면 성공.

## 8. 주의사항 & 다음 단계

- 현재 정책은 **완전 공개** — URL + anon key 를 아는 사람 누구나 읽기/쓰기 가능.
  - 외부 유입 우려 시: Supabase Auth(이메일/Google/GitHub) 도입 후 `using (auth.uid() is not null)` 로 규칙 교체
  - 또는 임시 비밀번호 게이트를 앱 안에 추가
- 무료 플랜: DB 500MB · 월 5GB 대역폭 · 2GB 파일 저장 — 5인 팀 대시보드엔 충분.
- 데이터 백업: Supabase 대시보드 → Database → Backups (유료 플랜부터 자동) 또는 사이드바 `백업 내보내기` 정기 사용.
