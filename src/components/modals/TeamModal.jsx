import { useState } from 'react'
import { MEMBER_COLORS } from '../../lib/constants'
import { uid } from '../../lib/utils'
import { Modal } from '../common/Modal'

export function TeamModal({ members, onClose, onSave }) {
  const [draft, setDraft] = useState(() => members.map((m) => ({ ...m })))
  const [name, setName] = useState('')
  const [role, setRole] = useState('파트원')
  const [dirty, setDirty] = useState(false)

  const updateDraft = (id, patch) => {
    setDraft((d) => d.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    setDirty(true)
  }
  const deleteDraft = (id) => {
    setDraft((d) => d.filter((m) => m.id !== id))
    setDirty(true)
  }
  const addDraft = () => {
    if (!name.trim()) return
    setDraft((d) => [
      ...d,
      {
        id: uid(),
        name: name.trim(),
        role: role.trim() || '파트원',
        color: MEMBER_COLORS[d.length % MEMBER_COLORS.length],
      },
    ])
    setName('')
    setRole('파트원')
    setDirty(true)
  }

  const handleClose = () => {
    if (dirty && !confirm('저장하지 않은 변경사항이 있습니다. 닫을까요?')) return
    onClose()
  }

  return (
    <Modal onClose={handleClose} title="팀원 관리" wide>
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr_120px_48px] bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div className="px-4 py-3">Color</div>
          <div className="px-4 py-3">Name</div>
          <div className="px-4 py-3">Role</div>
          <div className="px-4 py-3"></div>
        </div>

        {/* Rows */}
        {draft.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            팀원이 없습니다. 아래에서 추가해주세요.
          </div>
        )}
        {draft.map((m, i) => (
          <div
            key={m.id}
            className={`grid grid-cols-[200px_1fr_120px_48px] items-center ${
              i !== draft.length - 1 ? 'border-b' : ''
            } hover:bg-slate-50/50 transition-colors`}
          >
            <div className="px-4 py-3.5 flex gap-2">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateDraft(m.id, { color: c })}
                  className={`w-7 h-7 shrink-0 aspect-square rounded-full ${c} transition-all ${
                    m.color === c
                      ? 'ring-2 ring-offset-2 ring-slate-500 scale-110'
                      : 'opacity-35 hover:opacity-70'
                  }`}
                />
              ))}
            </div>
            <div className="px-4 py-3">
              <input
                value={m.name}
                onChange={(e) => updateDraft(m.id, { name: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
            </div>
            <div className="px-4 py-3">
              <input
                value={m.role || ''}
                onChange={(e) => updateDraft(m.id, { role: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                placeholder="역할"
              />
            </div>
            <div className="px-2 py-3 text-center">
              <button
                onClick={() => {
                  if (confirm('이 팀원을 삭제할까요?')) deleteDraft(m.id)
                }}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title="삭제"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new member */}
      <div className="mt-6 pt-5 border-t">
        <div className="text-sm font-semibold mb-3">새 팀원 추가</div>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDraft()}
            placeholder="이름"
            className="px-3 py-2 border rounded-lg flex-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDraft()}
            placeholder="역할"
            className="px-3 py-2 border rounded-lg w-32 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
          <button
            onClick={addDraft}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors shrink-0"
          >
            + 추가
          </button>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 pt-5 border-t flex justify-end gap-3">
        <button
          onClick={handleClose}
          className="px-5 py-2.5 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          취소
        </button>
        <button
          onClick={() => {
            onSave(draft)
            onClose()
          }}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            dirty
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-indigo-400 text-white cursor-default'
          }`}
        >
          저장
        </button>
      </div>
    </Modal>
  )
}
