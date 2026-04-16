import { useMemo, useState } from 'react'
import { todayISO, daysBetween } from '../../lib/utils'

function GanttBar({ start, end, viewStart, dayWidth, days, label, color, opacity = '', done, onClick }) {
  const offset = daysBetween(viewStart, start)
  const length = daysBetween(start, end) + 1
  if (offset + length < 0 || offset > days) return null
  const clipStart = Math.max(offset, 0)
  const clipEnd = Math.min(offset + length, days)
  const clipLength = clipEnd - clipStart
  return (
    <div
      onClick={onClick}
      className={`absolute top-1 rounded ${color} ${opacity} ${
        done ? 'opacity-60' : ''
      } text-white text-[10px] px-2 py-1 truncate cursor-pointer hover:brightness-110 shadow`}
      style={{
        left: clipStart * dayWidth,
        width: clipLength * dayWidth,
        height: 'calc(100% - 8px)',
      }}
      title={`${label} (${start} ~ ${end})`}
    >
      {done && '✓ '}
      {label}
    </div>
  )
}

export function TimelineView({ state, tasks, onEditTask, onNewTask, onNewProject }) {
  const [viewStart, setViewStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  })
  const DAYS = 42
  const dayWidth = 32

  const days = useMemo(() => {
    return Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(viewStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [viewStart])

  const shift = (n) => {
    const d = new Date(viewStart)
    d.setDate(d.getDate() + n)
    setViewStart(d.toISOString().slice(0, 10))
  }

  const sortedProjects = state.projects

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => shift(-14)}
          className="px-3 py-1.5 border rounded bg-white hover:bg-slate-50"
        >
          ◀◀
        </button>
        <button
          onClick={() => shift(-7)}
          className="px-3 py-1.5 border rounded bg-white hover:bg-slate-50"
        >
          ◀
        </button>
        <div className="font-semibold min-w-[200px] text-center">
          {days[0].getMonth() + 1}/{days[0].getDate()} ~ {days[DAYS - 1].getMonth() + 1}/
          {days[DAYS - 1].getDate()}
        </div>
        <button
          onClick={() => shift(7)}
          className="px-3 py-1.5 border rounded bg-white hover:bg-slate-50"
        >
          ▶
        </button>
        <button
          onClick={() => shift(14)}
          className="px-3 py-1.5 border rounded bg-white hover:bg-slate-50"
        >
          ▶▶
        </button>
        <button
          onClick={() => {
            const d = new Date()
            d.setDate(d.getDate() - 7)
            setViewStart(d.toISOString().slice(0, 10))
          }}
          className="px-3 py-1.5 border rounded bg-white text-sm hover:bg-slate-50"
        >
          오늘
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onNewProject}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium hover:bg-slate-50"
          >
            + 프로젝트
          </button>
          <button
            onClick={onNewTask}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
          >
            + 태스크
          </button>
        </div>
      </div>

      <div className="bg-white rounded-md border overflow-auto scrollbar-thin">
        <div style={{ minWidth: `${260 + DAYS * dayWidth}px` }}>
          <div className="flex sticky top-0 bg-white border-b z-10">
            <div className="w-[260px] flex-shrink-0 p-2 font-semibold text-sm border-r">
              프로젝트 / 태스크
            </div>
            <div className="flex">
              {days.map((d, i) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6
                const isToday = d.toISOString().slice(0, 10) === todayISO()
                const isMonday = d.getDay() === 1
                return (
                  <div
                    key={i}
                    style={{ width: dayWidth }}
                    className={`text-center text-[10px] py-1 border-r ${
                      isWeekend ? 'bg-slate-50 text-slate-400' : ''
                    } ${isToday ? 'bg-yellow-100 font-bold' : ''} ${
                      isMonday ? 'border-l-2 border-l-slate-300' : ''
                    }`}
                  >
                    <div>
                      {d.getMonth() + 1}/{d.getDate()}
                    </div>
                    <div className="text-slate-400">
                      {['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {sortedProjects.map((p) => {
            const projTasks = tasks.filter((t) => t.projectId === p.id)
            if (projTasks.length === 0 && !(p.startDate && p.endDate)) return null
            return (
              <div key={p.id}>
                <div className="flex bg-slate-50 border-b hover:bg-slate-100">
                  <div className="w-[260px] flex-shrink-0 p-2 text-sm font-semibold border-r flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${p.color}`}></div>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <div className="flex relative" style={{ height: 36 }}>
                    {days.map((d, i) => {
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6
                      return (
                        <div
                          key={i}
                          style={{ width: dayWidth }}
                          className={`border-r ${isWeekend ? 'bg-slate-100/50' : ''}`}
                        ></div>
                      )
                    })}
                    {p.startDate && p.endDate && (
                      <GanttBar
                        start={p.startDate}
                        end={p.endDate}
                        viewStart={viewStart}
                        dayWidth={dayWidth}
                        days={DAYS}
                        label={p.name}
                        color={p.color}
                        opacity="opacity-40"
                      />
                    )}
                  </div>
                </div>
                {projTasks.map((t) => (
                  <div key={t.id} className="flex border-b hover:bg-slate-50">
                    <div
                      className="w-[260px] flex-shrink-0 p-2 text-sm border-r flex items-center gap-2 pl-6 cursor-pointer"
                      onClick={() => onEditTask(t)}
                    >
                      <span className="text-slate-400">└</span>
                      <span className="truncate flex-1">{t.title}</span>
                      {(() => {
                        const m = state.members.find((x) => x.id === t.assignee)
                        return m ? (
                          <span className="text-[10px] text-slate-500 flex-shrink-0">
                            {m.name}
                          </span>
                        ) : null
                      })()}
                    </div>
                    <div className="flex relative" style={{ height: 32 }}>
                      {days.map((d, i) => {
                        const isWeekend = d.getDay() === 0 || d.getDay() === 6
                        return (
                          <div
                            key={i}
                            style={{ width: dayWidth }}
                            className={`border-r ${isWeekend ? 'bg-slate-100/50' : ''}`}
                          ></div>
                        )
                      })}
                      {t.startDate && t.dueDate && (
                        <GanttBar
                          start={t.startDate}
                          end={t.dueDate}
                          viewStart={viewStart}
                          dayWidth={dayWidth}
                          days={DAYS}
                          label={t.title}
                          color={
                            state.projects.find((pp) => pp.id === t.projectId)?.color ||
                            'bg-slate-500'
                          }
                          done={t.status === 'done'}
                          onClick={() => onEditTask(t)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
          {sortedProjects.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              프로젝트를 먼저 추가해 주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
