import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

export function SpeakerCombobox({
  value,
  onChange,
  onSelect,
  speakers = [],
  placeholder = '연사',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState(null)
  const inputRef = useRef(null)
  const popoverRef = useRef(null)

  const filtered = useMemo(() => {
    const q = (value || '').trim().toLowerCase()
    const list = q
      ? speakers.filter((s) => s.speakerName.toLowerCase().includes(q))
      : speakers
    return list.slice(0, 8)
  }, [value, speakers])

  const updateRect = () => {
    const r = inputRef.current?.getBoundingClientRect()
    if (r) setRect({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 260) })
  }

  const openDropdown = () => {
    updateRect()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (inputRef.current?.contains(e.target)) return
      if (popoverRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const handleScroll = () => updateRect()
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [open])

  return (
    <>
      <input
        ref={inputRef}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={openDropdown}
        placeholder={placeholder}
        className={className}
      />
      {open &&
        filtered.length > 0 &&
        rect &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-50 bg-white border rounded-lg shadow-lg py-1 max-h-72 overflow-y-auto"
            style={{ top: rect.top, left: rect.left, width: rect.width }}
          >
            <div className="px-3 py-1.5 text-[10px] text-slate-400 border-b">
              지난 라이브에 등장한 연사 · 클릭하면 자동 기입
            </div>
            {filtered.map((sp) => (
              <button
                key={sp.key}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect?.(sp)
                  setOpen(false)
                  inputRef.current?.blur()
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">{sp.speakerName}</span>
                  {sp.disclosedCompany && (
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 rounded">
                      {sp.disclosedCompany}
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-slate-400">
                    {sp.appearances}회
                  </span>
                </div>
                {sp.publicProfile && (
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {sp.publicProfile}
                  </div>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}
