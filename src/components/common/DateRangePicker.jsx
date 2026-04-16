import { useState, useMemo } from 'react'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseDate(str) {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null
  const d = new Date(str + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

export function DateRangePicker({ startDate, endDate, onChangeStart, onChangeEnd, startLabel, endLabel }) {
  const initial = parseDate(startDate) || new Date()
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const [picking, setPicking] = useState(null)

  const prev = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }
  const next = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const startDay = (first.getDay() + 6) % 7
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevDays = new Date(viewYear, viewMonth, 0).getDate()

    const result = []
    for (let i = 0; i < startDay; i++) {
      result.push({ day: prevDays - startDay + 1 + i, current: false, iso: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, current: true, iso: toISO(viewYear, viewMonth, d) })
    }
    const remaining = 7 - (result.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        result.push({ day: d, current: false, iso: null })
      }
    }
    return result
  }, [viewYear, viewMonth])

  const handleDayClick = (iso) => {
    if (!iso) return
    if (picking === 'start') {
      onChangeStart(iso)
      // 시작일이 마감일보다 늦으면 마감일을 시작일로 맞춰줌
      if (endDate && iso > endDate) onChangeEnd(iso)
      setPicking('end')
    } else if (picking === 'end') {
      // 마감일이 시작일보다 이르면 시작일을 마감일로 맞춰줌
      if (startDate && iso < startDate) onChangeStart(iso)
      onChangeEnd(iso)
      setPicking(null)
    } else {
      onChangeStart(iso)
      if (endDate && iso > endDate) onChangeEnd(iso)
      setPicking('end')
    }
  }

  // 입력창에서 직접 타이핑할 때도 유효성 보정
  const handleStartChange = (v) => {
    onChangeStart(v)
    if (/^\d{4}-\d{2}-\d{2}$/.test(v) && endDate && v > endDate) {
      onChangeEnd(v)
    }
  }
  const handleEndChange = (v) => {
    onChangeEnd(v)
    if (/^\d{4}-\d{2}-\d{2}$/.test(v) && startDate && v < startDate) {
      onChangeStart(v)
    }
  }

  const isInRange = (iso) => {
    if (!iso || !startDate || !endDate) return false
    return iso > startDate && iso < endDate
  }
  const isStart = (iso) => iso && iso === startDate
  const isEnd = (iso) => iso && iso === endDate

  const sLabel = startLabel || '시작일'
  const eLabel = endLabel || '종료일'

  const rangeText = startDate && endDate
    ? `${startDate} ~ ${endDate}`
    : startDate
    ? `${startDate} ~`
    : ''

  return (
    <div className="border rounded-lg overflow-hidden font-[Pretendard_Variable,Pretendard,sans-serif]">
      <div className="flex">
        {/* Calendar */}
        <div className="p-4 border-r flex-1 min-w-0">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
            </button>
            <span className="text-sm font-semibold text-slate-700">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7">
            {DAYS.map((d) => (
              <div key={d} className="flex items-center justify-center text-[11px] font-medium text-slate-400 h-9">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const inRange = isInRange(cell.iso)
              const start = isStart(cell.iso)
              const end = isEnd(cell.iso)
              const selected = start || end
              // 시작=끝일 때는 띠 없이 원만
              const sameDay = startDate && endDate && startDate === endDate
              // band: continuous strip behind circles
              const bandL = !sameDay && (inRange || end)
              const bandR = !sameDay && (inRange || start)
              return (
                <div key={i} className="relative flex items-center justify-center h-9">
                  {/* Background band (left half + right half) */}
                  {bandL && <div className="absolute left-0 top-0.5 w-1/2 h-8 bg-indigo-100" />}
                  {bandR && <div className="absolute right-0 top-0.5 w-1/2 h-8 bg-indigo-100" />}
                  {/* Circle button */}
                  <button
                    disabled={!cell.current}
                    onClick={() => handleDayClick(cell.iso)}
                    className={`
                      relative z-10 w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors
                      ${!cell.current ? 'text-slate-300 cursor-default' : 'cursor-pointer'}
                      ${cell.current && !selected && !inRange ? 'hover:bg-slate-100 text-slate-700' : ''}
                      ${inRange ? 'bg-indigo-100 text-indigo-700 font-medium' : ''}
                      ${selected ? 'bg-indigo-500 text-white font-semibold' : ''}
                    `}
                  >
                    {cell.day}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="p-4 w-48 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              {sLabel} *
            </label>
            <input
              type="text"
              value={startDate || ''}
              onFocus={() => setPicking('start')}
              onChange={(e) => handleStartChange(e.target.value)}
              placeholder="YYYY-MM-DD"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 ${
                picking === 'start' ? 'ring-1 ring-indigo-400 border-indigo-400' : ''
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              {eLabel} *
            </label>
            <input
              type="text"
              value={endDate || ''}
              onFocus={() => setPicking('end')}
              onChange={(e) => handleEndChange(e.target.value)}
              placeholder="YYYY-MM-DD"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 ${
                picking === 'end' ? 'ring-1 ring-indigo-400 border-indigo-400' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Range summary */}
      {rangeText && (
        <div className="px-4 py-2.5 border-t bg-slate-50 text-xs text-slate-500">
          {rangeText}
        </div>
      )}
    </div>
  )
}
