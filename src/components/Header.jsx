export function Header({ state, filter, setFilter }) {
  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="px-10 py-3 flex items-center gap-4 flex-wrap">
        <div className="ml-auto flex items-center gap-2">
          <select
            value={filter.project}
            onChange={(e) => setFilter({ ...filter, project: e.target.value })}
            className="select-chevron pl-3 pr-10 py-1.5 border rounded text-sm bg-white w-44"
          >
            <option value="all">전체 프로젝트</option>
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={filter.member}
            onChange={(e) => setFilter({ ...filter, member: e.target.value })}
            className="select-chevron pl-3 pr-10 py-1.5 border rounded text-sm bg-white w-36"
          >
            <option value="all">전체 팀원</option>
            {state.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            placeholder="🔍 태스크 검색"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="px-3 py-1.5 border rounded text-sm bg-white w-44"
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
