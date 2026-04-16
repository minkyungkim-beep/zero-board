import { useState, useRef, useEffect } from 'react'
import { STATUS, PRIORITY } from '../../lib/constants'
import { todayISO, uid } from '../../lib/utils'
import { Modal, Field } from '../common/Modal'
import { DateRangePicker } from '../common/DateRangePicker'
import { Select } from '../common/Select'

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
            <Select
              value={form.projectId}
              onChange={(v) => setForm({ ...form, projectId: v })}
              options={[
                { value: '', label: '(없음)' },
                ...state.projects.map((p) => ({ value: p.id, label: p.name, color: p.color })),
              ]}
              placeholder="프로젝트 선택"
            />
          </Field>
          <Field label="담당자">
            <Select
              value={form.assignee || ''}
              onChange={(v) => setForm({ ...form, assignee: v })}
              options={[
                { value: '', label: '(미지정)' },
                ...state.members.map((m) => ({ value: m.id, label: m.name, color: m.color })),
              ]}
              placeholder="담당자 선택"
            />
          </Field>
          <Field label="상태">
            <Select
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={STATUS.map((s) => ({ value: s.key, label: s.label }))}
            />
          </Field>
          <Field label="우선순위">
            <Select
              value={form.priority}
              onChange={(v) => setForm({ ...form, priority: v })}
              options={Object.entries(PRIORITY).map(([k, v]) => ({ value: k, label: v.label }))}
            />
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
