import { useState } from 'react'
import { PROJECT_COLORS, PROJECT_TEMPLATES } from '../../lib/constants'
import { todayISO } from '../../lib/utils'
import { Modal, Field } from '../common/Modal'
import { DateRangePicker } from '../common/DateRangePicker'
import { Select } from '../common/Select'

export function ProjectModal({ project, members = [], onClose, onSave, onDelete }) {
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
  const [templateId, setTemplateId] = useState('')
  const [assignee, setAssignee] = useState('')
  const isNew = !project
  const template = PROJECT_TEMPLATES.find((t) => t.id === templateId)

  return (
    <Modal onClose={onClose} title={project ? '프로젝트 편집' : '새 프로젝트'}>
      <div className="space-y-3">
        <Field label="프로젝트명 *">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="예: VIP 프로그램"
          />
        </Field>

        {isNew && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="템플릿">
              <Select
                value={templateId}
                onChange={(v) => setTemplateId(v)}
                options={[
                  { value: '', label: '없음 (빈 프로젝트)' },
                  ...PROJECT_TEMPLATES.map((t) => ({ value: t.id, label: t.name })),
                ]}
                placeholder="템플릿 선택"
              />
            </Field>
            <Field label="담당자">
              <Select
                value={assignee}
                onChange={(v) => setAssignee(v)}
                options={[
                  { value: '', label: '(미지정)' },
                  ...members.map((m) => ({ value: m.id, label: m.name, color: m.color })),
                ]}
                placeholder="담당자 선택"
              />
            </Field>
            {template && (
              <div className="col-span-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
                <div className="font-medium mb-1">{template.description}</div>
                <div className="text-indigo-600 leading-relaxed">
                  {template.tasks.map((t) => t.title).join(' · ')}
                </div>
                <div className="mt-1 text-indigo-500">
                  저장 시 {template.tasks.length}개의 태스크가 자동 생성됩니다.
                </div>
              </div>
            )}
          </div>
        )}

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
            className="w-full px-3 py-2 border rounded-lg"
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
            className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-sm"
          >
            삭제
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={() => form.name.trim() && onSave(form, template, assignee || null)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            저장
          </button>
        </div>
      </div>
    </Modal>
  )
}
