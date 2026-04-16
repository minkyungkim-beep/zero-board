import { useMemo, useState } from 'react'
import { STATUS, PRIORITY } from '../../lib/constants'
import { todayISO, getWeekOf, formatWeekLabel } from '../../lib/utils'

function KanbanCard({ task, state, onClick, onDragStart }) {
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
      className="bg-white rounded p-3 border shadow-sm hover:shadow-md cursor-pointer transition"
    >
      {project && (
        <div className="flex items-center gap-1 mb-2">
          <div className={`w-2 h-2 rounded-sm ${project.color}`}></div>
          <div className="text-xs text-slate-500 truncate">{project.name}</div>
        </div>
      )}
      <div className="font-medium text-sm mb-2">{task.title}</div>
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
              overdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
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
                e.currentTarget.classList.add('drag-over')
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
              onDrop={(e) => {
                e.currentTarget.classList.remove('drag-over')
                if (dragTask) updateTask(dragTask, { status: s.key })
                setDragTask(null)
              }}
              className={`rounded-md border-2 p-3 ${s.color} min-h-[400px]`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">{s.label}</div>
                <div className="text-xs text-slate-500">{colTasks.length}</div>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <KanbanCard
                    key={t.id}
                    task={t}
                    state={state}
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
