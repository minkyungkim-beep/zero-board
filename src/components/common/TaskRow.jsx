import { STATUS, PRIORITY } from '../../lib/constants'
import { todayISO } from '../../lib/utils'

export function TaskRow({ task, state, onClick }) {
  const project = state.projects.find((p) => p.id === task.projectId)
  const member = state.members.find((m) => m.id === task.assignee)
  const status = STATUS.find((s) => s.key === task.status)
  const overdue = task.status !== 'done' && task.dueDate && task.dueDate < todayISO()
  return (
    <div
      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3"
      onClick={onClick}
    >
      {project && <div className={`w-2 h-8 rounded-sm ${project.color}`}></div>}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{task.title}</div>
        <div className="text-xs text-slate-500 truncate">
          {project?.name} · {status?.label}
          {task.subtasks?.length > 0 &&
            ` · ✓ ${task.subtasks.filter((s) => s.done).length}/${task.subtasks.length}`}
        </div>
      </div>
      {task.priority && (
        <span className={`text-xs px-2 py-0.5 rounded ${PRIORITY[task.priority].cls}`}>
          {PRIORITY[task.priority].label}
        </span>
      )}
      {task.dueDate && (
        <span className={`text-xs ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
          {task.dueDate}
        </span>
      )}
      {member && (
        <span className="text-xs text-slate-600">{member.name}</span>
      )}
    </div>
  )
}
