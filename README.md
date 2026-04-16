# ZERO_BOARD

기획팀 업무 대시보드 — Vite + React + Tailwind CSS.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저가 자동으로 http://localhost:5173 에서 열립니다.

## 빌드

```bash
npm run build     # dist/ 에 결과물 생성
npm run preview   # 빌드 결과물 미리보기
```

## 주요 기능

- 📊 대시보드: KPI, 팀원별 현황, 이번 주 마감, 프로젝트 진행률
- 🗂️ 칸반: 주차별 To Do / In Progress / Review / Done, 드래그앤드롭으로 상태 변경
- 📅 타임라인: 프로젝트·태스크 간트 차트
- 👥 팀원별 뷰: 멤버별 상태별 태스크 분포
- 백업 내보내기 / 불러오기 (JSON)
- 데이터는 브라우저 `localStorage`에 저장됩니다

## 배포

정적 사이트이므로 Vercel / Netlify / GitHub Pages 어디든 배포 가능합니다.

- **Vercel**: `vercel` CLI로 배포하거나 GitHub 연결 시 자동 배포
- **Netlify**: `npm run build` → `dist/` 업로드
- **GitHub Pages**: `dist/` 내용을 `gh-pages` 브랜치에 푸시
