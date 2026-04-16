import { PRIORITY } from '../../lib/constants'
import { Modal } from '../common/Modal'

export function ProjectTasksModal({ project, tasks, members, onClose, onToggleTask, onEditTask, onEditProject }) {
  const done = tasks.filter((t) => t.status === 'done').length
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  return (
    <Modal onClose={onClose} title={project.name} wide>
      {/* Progress header */}
      <div className="flex items-center gap-3 mb-1">
        <div className={`w-3 h-3 rounded-full ${project.color}`} />
        <span className="text-sm text-slate-500">{project.startDate} ~ {project.endDate}</span>
        <span className="ml-auto text-sm font-medium text-slate-600">{done}/{tasks.length} 완료</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-6">
        <div className={`${project.color} h-2 transition-all rounded-full`} style={{ width: `${rate}%` }} />
      </div>

      {/* Task checklist */}
      {tasks.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          이 프로젝트에 태스크가 없습니다.
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {tasks.map((t) => {
            const isDone = t.status === 'done'
            const member = members.find((m) => m.id === t.assignee)
            const pri = PRIORITY[t.priority]
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                {/* Checkbox */}
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

                {/* Title */}
                <span
                  className={`flex-1 text-sm cursor-pointer hover:text-indigo-600 transition-colors ${
                    isDone ? 'line-through text-slate-400' : 'text-slate-700'
                  }`}
                  onClick={() => onEditTask(t)}
                >
                  {t.title}
                </span>

                {/* Priority */}
                {pri && (
                  <span className={`text-xs px-2 py-0.5 rounded ${pri.cls}`}>{pri.label}</span>
                )}

                {/* Assignee */}
                {member && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${member.color}`} />
                    <span className="text-xs text-slate-500">{member.name}</span>
                  </div>
                )}

                {/* Due date */}
                {t.dueDate && (
                  <span className="text-xs text-slate-400 shrink-0">{t.dueDate}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 pt-4 border-t flex justify-between">
        <button
          onClick={() => onEditProject(project)}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          프로젝트 설정
        </button>
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
