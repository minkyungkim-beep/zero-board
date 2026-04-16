import { useState, useRef, useEffect } from 'react'
import { STATUS, PRIORITY } from '../../lib/constants'
import { todayISO, uid } from '../../lib/utils'
import { Modal, Field } from '../common/Modal'
import { DateRangePicker } from '../common/DateRangePicker'

export function TaskModal({ state, task, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(
    task || {
      title: '',
      projectId: state.projects[0]?.id || '',
      assignee: state.members[0]?.id || '',
      status: 'todo',
      priority: 'mid',
      startDate: todayISO(),
      dueDate: todayISO(),
      notes: '',
      subtasks: [],
    }
  )
  const memoRef = useRef(null)

  // Initialize memo HTML once on mount
  useEffect(() => {
    if (memoRef.current) {
      memoRef.current.innerHTML = form.notes || ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const normalizeUrl = (s) => {
    const v = s.trim()
    if (!v) return null
    if (/^https?:\/\//i.test(v)) return v
    return `https://${v}`
  }

  const escapeHtml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const handleMemoPaste = (e) => {
    const pasted = e.clipboardData.getData('text/plain').trim()
    if (!pasted) return
    const url = /^https?:\/\/\S+$/i.test(pasted) ? pasted : null
    if (!url) return

    const sel = window.getSelection()
    const hasSelection = sel && sel.toString().length > 0

    e.preventDefault()
    const linkHTML = `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${
      hasSelection ? escapeHtml(sel.toString()) : escapeHtml(url)
    }</a>`
    document.execCommand('insertHTML', false, linkHTML)
    setForm((f) => ({ ...f, notes: memoRef.current.innerHTML }))
  }

  const handleMemoInput = () => {
    setForm((f) => ({ ...f, notes: memoRef.current.innerHTML }))
  }

  const toggleSub = (id) =>
    setForm((f) => ({
      ...f,
      subtasks: f.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    }))
  const addSub = () => {
    const title = prompt('서브태스크 제목')
    if (title)
      setForm((f) => ({
        ...f,
        subtasks: [...(f.subtasks || []), { id: uid(), title, done: false }],
      }))
  }
  const removeSub = (id) =>
    setForm((f) => ({ ...f, subtasks: f.subtasks.filter((s) => s.id !== id) }))

  return (
    <Modal onClose={onClose} title={task ? '태스크 편집' : '새 태스크'}>
      <div className="space-y-3">
        <Field label="제목 *">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="태스크 제목"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="프로젝트">
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">(없음)</option>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="담당자">
            <select
              value={form.assignee || ''}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">(미지정)</option>
              {state.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="상태">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              {STATUS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="우선순위">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              {Object.entries(PRIORITY).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <DateRangePicker
          startDate={form.startDate || ''}
          endDate={form.dueDate || ''}
          onChangeStart={(v) => setForm({ ...form, startDate: v })}
          onChangeEnd={(v) => setForm({ ...form, dueDate: v })}
          startLabel="시작일"
          endLabel="마감일"
        />
        <Field label="메모">
          <div
            ref={memoRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleMemoInput}
            onPaste={handleMemoPaste}
            data-placeholder="상세 내용 (텍스트 선택 후 URL 붙여넣기로 링크 생성)"
            className="memo-editor w-full px-3 py-2 border rounded-lg text-sm min-h-[80px] outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
          />
        </Field>
        <Field label="서브태스크">
          <div className="space-y-1">
            {(form.subtasks || []).map((s) => (
              <div key={s.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50">
                <input type="checkbox" checked={s.done} onChange={() => toggleSub(s.id)} />
                <span
                  className={`flex-1 text-sm ${s.done ? 'line-through text-slate-400' : ''}`}
                >
                  {s.title}
                </span>
                <button
                  onClick={() => removeSub(s.id)}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  삭제
                </button>
              </div>
            ))}
            <button onClick={addSub} className="text-sm text-indigo-600 hover:underline">
              + 서브태스크 추가
            </button>
          </div>
        </Field>
      </div>
      <div className="flex items-center gap-2 mt-6 pt-4 border-t">
        {task && (
          <button
            onClick={onDelete}
            className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded text-sm"
          >
            삭제
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={() => form.title.trim() && onSave(form)}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            저장
          </button>
        </div>
      </div>
    </Modal>
  )
}
