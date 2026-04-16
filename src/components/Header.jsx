import { Select } from './common/Select'

export function Header({ state, filter, setFilter }) {
  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="px-10 py-3 flex items-center gap-2 flex-wrap">
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={filter.project}
            onChange={(v) => setFilter({ ...filter, project: v })}
            options={[
              { value: 'all', label: '전체 프로젝트' },
              ...state.projects.map((p) => ({ value: p.id, label: p.name, color: p.color })),
            ]}
            className="w-44"
          />
          <Select
            value={filter.member}
            onChange={(v) => setFilter({ ...filter, member: v })}
            options={[
              { value: 'all', label: '전체 팀원' },
              ...state.members.map((m) => ({ value: m.id, label: m.name, color: m.color })),
            ]}
            className="w-36"
          />
          <input
            placeholder="🔍 태스크 검색"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm bg-white w-44"
          />
          {(filter.search || filter.member !== 'all' || filter.project !== 'all') && (
            <button
              onClick={() => setFilter({ member: 'all', project: 'all', search: '' })}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
            >
              초기화
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
