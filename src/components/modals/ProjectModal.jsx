import { useState } from 'react'
import { PROJECT_COLORS } from '../../lib/constants'
import { todayISO } from '../../lib/utils'
import { Modal, Field } from '../common/Modal'
import { DateRangePicker } from '../common/DateRangePicker'

export function ProjectModal({ project, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(
    project || {
      name: '',
      color: PROJECT_COLORS[0],
      startDate: todayISO(),
      endDate: (() => {
        const d = new Date()
        d.setDate(d.getDate() + 30)
        return d.toISOString().slice(0, 10)
      })(),
      description: '',
    }
  )
  return (
    <Modal onClose={onClose} title={project ? '프로젝트 편집' : '새 프로젝트'}>
      <div className="space-y-3">
        <Field label="프로젝트명 *">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </Field>
        <DateRangePicker
          startDate={form.startDate || ''}
          endDate={form.endDate || ''}
          onChangeStart={(v) => setForm({ ...form, startDate: v })}
          onChangeEnd={(v) => setForm({ ...form, endDate: v })}
          startLabel="시작일"
          endLabel="종료일"
        />
        <Field label="설명">
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </Field>
        <Field label="색상">
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`w-7 h-7 shrink-0 aspect-square rounded-full ${c} transition-all ${
                  form.color === c
                    ? 'ring-2 ring-offset-2 ring-slate-500 scale-110'
                    : 'opacity-35 hover:opacity-70'
                }`}
              />
            ))}
          </div>
        </Field>
      </div>
      <div className="flex items-center gap-2 mt-6 pt-4 border-t">
        {project && (
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
            onClick={() => form.name.trim() && onSave(form)}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            저장
          </button>
        </div>
      </div>
    </Modal>
  )
}
