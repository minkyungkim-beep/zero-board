import { useState, useRef, useEffect } from 'react'

/**
 * options: Array<{ value: string, label: string, color?: string }>
 */
export function Select({ value, onChange, options, placeholder, className = '' }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-3.5 py-2 pr-10 border rounded-lg text-sm text-left bg-white flex items-center gap-2 hover:border-slate-400 transition-colors ${
          open ? 'ring-1 ring-indigo-300 border-indigo-300' : ''
        }`}
      >
        {selected?.color && (
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selected.color}`} />
        )}
        <span className={`flex-1 truncate ${selected ? 'text-slate-700' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder || '선택'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
          {options.map((o) => {
            const isSelected = o.value === value
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={`w-full px-3.5 py-2 text-sm text-left flex items-center gap-2 transition-colors ${
                  isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {o.color && <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${o.color}`} />}
                <span className="flex-1 truncate">{o.label}</span>
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-600">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
