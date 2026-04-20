import { useMemo, useState } from 'react'
import { STATUS, PRIORITY } from '../../lib/constants'
import { todayISO, getWeekOf, formatWeekLabel } from '../../lib/utils'

function KanbanCard({ task, state, statusColor, onClick, onDragStart }) {
  const project = state.projects.find((p) => p.id === task.projectId)
  const member = state.members.find((m) => m.id === task.assignee)
  const overdue = task.status !== 'done' && task.dueDate && task.dueDate < todayISO()
  const doneCount = task.subtasks?.filter((s) => s.done).length || 0
  const totalSub = task.subtasks?.length || 0
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`rounded-lg p-3 border hover:shadow-sm cursor-pointer transition ${statusColor}`}
    >
      {project && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-1.5 h-1.5 rounded-full ${project.color}`}></div>
          <div className="text-[11px] text-slate-500 truncate">{project.name}</div>
        </div>
      )}
      <div className="font-medium text-sm mb-2 text-slate-800 leading-snug">{task.title}</div>
      {totalSub > 0 && (
        <div className="text-xs text-slate-500 mb-2">
          ✓ {doneCount}/{totalSub}
        </div>
      )}
      <div className="flex items-center gap-1 flex-wrap">
        {task.priority && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${PRIORITY[task.priority].cls}`}>
            {PRIORITY[task.priority].label}
          </span>
        )}
        {task.dueDate && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              overdue ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {task.dueDate.slice(5)}
          </span>
        )}
        {member && (
          <span className="ml-auto text-[10px] text-slate-600">{member.name}</span>
        )}
      </div>
    </div>
  )
}

export function KanbanView({ state, tasks, updateTask, onEditTask, onNewTask }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekStart = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return getWeekOf(d.toISOString().slice(0, 10))
  }, [weekOffset])

  const weekTasks = tasks.filter((t) => {
    const wk = getWeekOf(t.dueDate) || getWeekOf(t.startDate)
    return wk === weekStart
  })

  const [dragTask, setDragTask] = useState(null)

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="px-3 py-1.5 border rounded bg-white hover:bg-slate-50"
        >
          ◀
        </button>
        <div className="font-semibold min-w-[180px] text-center">
          {formatWeekLabel(weekStart)}
        </div>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="px-3 py-1.5 border rounded bg-white hover:bg-slate-50"
        >
          ▶
        </button>
        <button
          onClick={() => setWeekOffset(0)}
          className="px-3 py-1.5 border rounded bg-white text-sm hover:bg-slate-50"
        >
          오늘
        </button>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-sm text-slate-500">이 주의 태스크 {weekTasks.length}개</div>
          <button
            onClick={onNewTask}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
          >
            + 태스크
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {STATUS.map((s) => {
          const colTasks = weekTasks.filter((t) => t.status === s.key)
          return (
            <div
              key={s.key}
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('drag-over-col')
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over-col')}
              onDrop={(e) => {
                e.currentTarget.classList.remove('drag-over-col')
                if (dragTask) updateTask(dragTask, { status: s.key })
                setDragTask(null)
              }}
              className="min-h-[400px] rounded-lg transition"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                  <div className="font-semibold text-sm text-slate-700">{s.label}</div>
                </div>
                <div className="text-xs text-slate-400">{colTasks.length}</div>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <KanbanCard
                    key={t.id}
                    task={t}
                    state={state}
                    statusColor={s.color}
                    onClick={() => onEditTask(t)}
                    onDragStart={() => setDragTask(t.id)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-xs text-slate-400 text-center py-4">비어있음</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
