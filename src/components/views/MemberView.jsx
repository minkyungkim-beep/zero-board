import { STATUS } from '../../lib/constants'

export function MemberView({ state, tasks, onEditTask, onNewTask }) {
  return (
    <div className="mt-2 space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onNewTask}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
        >
          + 태스크
        </button>
      </div>
      {state.members.map((m) => {
        const mine = tasks.filter((t) => t.assignee === m.id)
        const byStatus = STATUS.reduce((acc, s) => {
          acc[s.key] = mine.filter((t) => t.status === s.key)
          return acc
        }, {})
        return (
          <section key={m.id} className="bg-white rounded-md border overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b bg-slate-50">
              <div>
                <div className="font-bold text-lg">{m.name}</div>
                <div className="text-xs text-slate-500">{m.role}</div>
              </div>
              <div className="ml-auto flex gap-4 text-center">
                {STATUS.map((s) => (
                  <div key={s.key}>
                    <div className="text-xs text-slate-500">{s.label}</div>
                    <div className="text-lg font-bold">{byStatus[s.key].length}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-x">
              {STATUS.map((s) => (
                <div key={s.key} className="p-3 min-h-[200px]">
                  <div className="text-xs font-semibold text-slate-600 mb-2">{s.label}</div>
                  <div className="space-y-2">
                    {byStatus[s.key].map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onEditTask(t)}
                        className="bg-slate-50 rounded p-2 text-sm cursor-pointer hover:bg-slate-100"
                      >
                        <div className="font-medium truncate">{t.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          {state.projects.find((p) => p.id === t.projectId)?.name}
                          {t.dueDate && <span>· {t.dueDate.slice(5)}</span>}
                        </div>
                      </div>
                    ))}
                    {byStatus[s.key].length === 0 && (
                      <div className="text-xs text-slate-300 text-center py-4">—</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
