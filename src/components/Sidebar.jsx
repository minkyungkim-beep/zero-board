import { useRef } from 'react'

const STATUS_LABEL = {
  local: { label: '로컬 저장소', dot: 'bg-slate-400', desc: 'Supabase 미설정' },
  connecting: { label: '연결 중…', dot: 'bg-amber-400 animate-pulse', desc: '' },
  syncing: { label: '동기화 중…', dot: 'bg-sky-400 animate-pulse', desc: '' },
  synced: { label: '팀 동기화됨', dot: 'bg-emerald-400', desc: '실시간 공유' },
  error: { label: '동기화 오류', dot: 'bg-rose-500', desc: '콘솔 확인' },
}

export function Sidebar({ view, setView, onManageTeam, onExport, onImport, onReset, cloudStatus = 'local' }) {
  const s = STATUS_LABEL[cloudStatus] || STATUS_LABEL.local
  const fileRef = useRef()
  const tabs = [
    { key: 'dashboard', label: '대시보드' },
    { key: 'kanban', label: '칸반' },
    { key: 'timeline', label: '타임라인' },
    { key: 'member', label: '팀원별 뷰' },
    { key: 'briefing', label: '설명회' },
  ]
  const sideBtn =
    'w-full pl-5 pr-4 py-2 text-sm font-medium text-left transition text-slate-300 hover:bg-slate-800'
  return (
    <aside className="w-56 bg-slate-900 text-white sticky top-0 self-start h-screen flex-shrink-0 flex flex-col">
      <div className="px-5 py-6">
        <span className="text-3xl font-extrabold tracking-tight text-white">zero-base</span>
      </div>
      <nav className="flex flex-col gap-1 mt-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`w-full pl-5 pr-4 py-2 text-sm font-medium text-left transition ${
              view === t.key
                ? 'bg-white text-slate-900'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1 pb-6 border-t border-slate-800 pt-4">
        <div className="px-5 pb-3 flex items-center gap-2" title={s.desc}>
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className="text-[11px] text-slate-400">{s.label}</span>
        </div>
        <button onClick={onManageTeam} className={sideBtn}>
          팀원 관리
        </button>
        <button onClick={onExport} className={sideBtn}>
          백업 내보내기
        </button>
        <button onClick={() => fileRef.current.click()} className={sideBtn}>
          백업 불러오기
        </button>
        <button
          onClick={onReset}
          className="w-full pl-5 pr-4 py-2 text-sm font-medium text-left transition text-rose-400 hover:bg-slate-800"
        >
          초기화
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImport(f)
            e.target.value = ''
          }}
        />
      </div>
    </aside>
  )
}
