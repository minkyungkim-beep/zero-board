import { PRIORITY, STATUS } from '../../lib/constants'
import { Modal } from '../common/Modal'

export function MemberTasksModal({ member, tasks, projects, onClose, onToggleTask, onEditTask }) {
  const done = tasks.filter((t) => t.status === 'done').length
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  // 상태별로 그룹핑
  const groups = STATUS.map((s) => ({
    ...s,
    tasks: tasks.filter((t) => t.status === s.key),
  }))

  return (
    <Modal onClose={onClose} title={`${member.name} 님의 태스크`} wide>
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className={`w-4 h-4 rounded-full ${member.color}`} />
        <span className="text-sm text-slate-500">{member.role}</span>
        <span className="ml-auto text-sm font-medium text-slate-600">{done}/{tasks.length} 완료</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-6">
        <div className="bg-green-500 h-2 transition-all rounded-full" style={{ width: `${rate}%` }} />
      </div>

      {/* Tasks by status */}
      {tasks.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          할당된 태스크가 없습니다.
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            g.tasks.length > 0 && (
              <div key={g.key}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-600">{g.label}</h3>
                  <span className="text-xs text-slate-400">{g.tasks.length}</span>
                </div>
                <div className="border rounded-lg divide-y">
                  {g.tasks.map((t) => {
                    const isDone = t.status === 'done'
                    const project = projects.find((p) => p.id === t.projectId)
                    const pri = PRIORITY[t.priority]
                    return (
                      <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                        <button
                          onClick={() => onToggleTask(t.id, isDone ? 'todo' : 'done')}
                          className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'border-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          {isDone && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm cursor-pointer hover:text-indigo-600 transition-colors ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-700'
                          }`}
                          onClick={() => onEditTask(t)}
                        >
                          {t.title}
                        </span>
                        {project && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className={`w-2 h-2 rounded-full ${project.color}`} />
                            <span className="text-xs text-slate-500">{project.name}</span>
                          </div>
                        )}
                        {pri && (
                          <span className={`text-xs px-2 py-0.5 rounded ${pri.cls}`}>{pri.label}</span>
                        )}
                        {t.dueDate && (
                          <span className="text-xs text-slate-400 shrink-0">{t.dueDate}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <div className="mt-5 pt-4 border-t flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
        >
          닫기
        </button>
      </div>
    </Modal>
  )
}
