import { useMemo } from 'react'
import { todayISO, getWeekOf, formatWeekLabel } from '../../lib/utils'
import { TaskRow } from '../common/TaskRow'

function Stat({ label, value, color }) {
  return (
    <div className={`${color} rounded-md p-4 shadow-md hover:shadow-lg transition-shadow`}>
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

export function DashboardView({ state, filtered, onEditTask, onEditProject, onOpenProjectTasks, onOpenMemberTasks, onNewTask, onNewProject }) {
  const stats = useMemo(() => {
    const total = filtered.length
    const done = filtered.filter((t) => t.status === 'done').length
    const inProgress = filtered.filter((t) => t.status === 'in-progress').length
    const overdue = filtered.filter(
      (t) => t.status !== 'done' && t.dueDate && t.dueDate < todayISO()
    ).length
    return {
      total,
      done,
      inProgress,
      overdue,
      rate: total ? Math.round((done / total) * 100) : 0,
    }
  }, [filtered])

  const byMember = state.members.map((m) => {
    const mine = filtered.filter((t) => t.assignee === m.id)
    const done = mine.filter((t) => t.status === 'done').length
    return {
      ...m,
      total: mine.length,
      done,
      rate: mine.length ? Math.round((done / mine.length) * 100) : 0,
    }
  })

  const thisWeek = getWeekOf(todayISO())
  const thisWeekTasks = filtered.filter((t) => getWeekOf(t.dueDate) === thisWeek)

  return (
    <div className="space-y-6 mt-2">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="전체 태스크" value={stats.total} color="bg-slate-100" />
        <Stat label="진행 중" value={stats.inProgress} color="bg-slate-100" />
        <Stat label="완료" value={stats.done} color="bg-slate-100" />
        <Stat label="지연" value={stats.overdue} color="bg-slate-100" />
        <Stat label="완료율" value={`${stats.rate}%`} color="bg-slate-100" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">프로젝트 진행 현황</h2>
          <button
            onClick={onNewProject}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium hover:bg-slate-50"
          >
            + 프로젝트
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.projects.map((p) => {
            const tasks = filtered.filter((t) => t.projectId === p.id)
            const done = tasks.filter((t) => t.status === 'done').length
            const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0
            return (
              <div
                key={p.id}
                className="bg-white rounded-md border p-4 cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onOpenProjectTasks(p)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="ml-auto text-sm text-slate-500">
                    {done}/{tasks.length}
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-sm h-2 overflow-hidden mb-2">
                  <div
                    className={`${p.color} h-2 transition-all`}
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{p.startDate} ~ {p.endDate}</span>
                  <span>{rate}% 완료</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">팀원별 업무 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {byMember.map((m) => (
            <div
              key={m.id}
              onClick={() => onOpenMemberTasks(m)}
              className="bg-white rounded-md border p-4 cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${m.color}`} />
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.role}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-bold">{m.total}</div>
                  <div className="text-xs text-slate-500">태스크</div>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-sm h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-2 transition-all"
                  style={{ width: `${m.rate}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                완료 {m.done} / {m.total} ({m.rate}%)
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">
            태스크 관리 ({formatWeekLabel(thisWeek)})
          </h2>
          <button
            onClick={onNewTask}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
          >
            + 태스크
          </button>
        </div>
        {thisWeekTasks.length === 0 ? (
          <div className="bg-white rounded-md border p-6 text-center text-slate-500 text-sm">
            이번 주 마감 태스크가 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-md border divide-y">
            {thisWeekTasks.map((t) => (
              <TaskRow key={t.id} task={t} state={state} onClick={() => onEditTask(t)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
