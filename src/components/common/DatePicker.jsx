import { useState, useRef, useEffect, useMemo } from 'react'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function parseDate(str) {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null
  const d = new Date(str + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}
function formatDisplay(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${y}. ${m}. ${d}.`
}

export function DatePicker({ value, onChange, placeholder = '날짜 선택', className = '' }) {
  const [open, setOpen] = useState(false)
  const initial = parseDate(value) || new Date()
  const [viewY, setViewY] = useState(initial.getFullYear())
  const [viewM, setViewM] = useState(initial.getMonth())
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && value) {
      const d = parseDate(value)
      if (d) {
        setViewY(d.getFullYear())
        setViewM(d.getMonth())
      }
    }
  }, [open, value])

  const prev = () => {
    if (viewM === 0) {
      setViewY((y) => y - 1)
      setViewM(11)
    } else setViewM((m) => m - 1)
  }
  const next = () => {
    if (viewM === 11) {
      setViewY((y) => y + 1)
      setViewM(0)
    } else setViewM((m) => m + 1)
  }

  const cells = useMemo(() => {
    const first = new Date(viewY, viewM, 1)
    const startDay = (first.getDay() + 6) % 7
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate()
    const prevDays = new Date(viewY, viewM, 0).getDate()
    const result = []
    for (let i = 0; i < startDay; i++) {
      result.push({ day: prevDays - startDay + 1 + i, current: false, iso: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, current: true, iso: toISO(viewY, viewM, d) })
    }
    const remaining = 7 - (result.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        result.push({ day: d, current: false, iso: null })
      }
    }
    return result
  }, [viewY, viewM])

  const today = new Date()
  const todayISOStr = toISO(today.getFullYear(), today.getMonth(), today.getDate())

  const handlePick = (iso) => {
    if (!iso) return
    onChange(iso)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-3 py-2 border rounded-md text-sm bg-white flex items-center gap-2 hover:border-slate-400 transition-colors ${
          open ? 'ring-1 ring-indigo-300 border-indigo-300' : ''
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-slate-400 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18h-10.5A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2ZM3.5 7.5v7.75c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V7.5h-13Z"
            clipRule="evenodd"
          />
        </svg>
        <span className={`flex-1 truncate text-left ${value ? 'text-slate-700' : 'text-slate-400'}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 bg-white border rounded-lg shadow-lg p-3 w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={prev}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="text-sm font-semibold text-slate-700">
              {viewY}년 {viewM + 1}월
            </span>
            <button
              type="button"
              onClick={next}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7">
            {DAYS.map((d) => (
              <div
                key={d}
                className="flex items-center justify-center text-[10px] font-medium text-slate-400 h-7"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const isSelected = cell.iso && cell.iso === value
              const isToday = cell.iso && cell.iso === todayISOStr
              return (
                <div key={i} className="flex items-center justify-center h-8">
                  <button
                    type="button"
                    disabled={!cell.current}
                    onClick={() => handlePick(cell.iso)}
                    className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors
                      ${!cell.current ? 'text-slate-300 cursor-default' : 'cursor-pointer'}
                      ${isSelected ? 'bg-indigo-500 text-white font-semibold' : ''}
                      ${!isSelected && isToday ? 'border border-indigo-300 text-indigo-600 font-medium' : ''}
                      ${!isSelected && !isToday && cell.current ? 'hover:bg-slate-100 text-slate-700' : ''}
                    `}
                  >
                    {cell.day}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t">
            <button
              type="button"
              onClick={() => handlePick(todayISOStr)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
            >
              오늘
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                지우기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
