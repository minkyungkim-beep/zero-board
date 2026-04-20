import { useMemo, useState } from 'react'
import {
  BRIEFING_TYPES,
  createSession,
  createLiveEvent,
  buildSpeakerHistory,
} from '../../lib/constants'
import { Select } from '../common/Select'
import { DatePicker } from '../common/DatePicker'
import { SpeakerCombobox } from '../common/SpeakerCombobox'
import { Modal, Field } from '../common/Modal'

export function BriefingView({ events, members = [], onAdd, onUpdate, onDelete }) {
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(
    () =>
      typeFilter === 'all'
        ? events
        : events.filter((ev) => ev.briefingType === typeFilter),
    [events, typeFilter]
  )

  const speakerHistory = useMemo(() => buildSpeakerHistory(events), [events])

  const stats = useMemo(() => {
    const allSessions = events.flatMap((ev) => ev.sessions || [])
    const contractCount = allSessions.filter((s) => s.contractRequired).length
    const totalAmount = allSessions.reduce((sum, s) => {
      const n = Number(String(s.amount || '').replace(/[^0-9.-]/g, ''))
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
    return {
      eventCount: events.length,
      sessionCount: allSessions.length,
      contractCount,
      totalAmount,
    }
  }, [events])

  const tabs = [{ value: 'all', label: '전체' }, ...BRIEFING_TYPES]

  const addEvent = () => onAdd(createLiveEvent())

  const addSession = (ev) =>
    onUpdate(ev.id, { sessions: [...(ev.sessions || []), createSession()] })

  const updateSession = (ev, sid, patch) =>
    onUpdate(ev.id, {
      sessions: (ev.sessions || []).map((s) => (s.id === sid ? { ...s, ...patch } : s)),
    })

  const removeSession = (ev, sid) =>
    onUpdate(ev.id, { sessions: (ev.sessions || []).filter((s) => s.id !== sid) })

  return (
    <div className="space-y-6 mt-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="라이브 이벤트" value={stats.eventCount} />
        <Stat label="등록된 세션" value={stats.sessionCount} />
        <Stat label="계약서 필요" value={stats.contractCount} />
        <Stat
          label="총 연사료"
          value={stats.totalAmount ? `${stats.totalAmount.toLocaleString()}원` : '-'}
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 p-1 bg-white border rounded-md">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  typeFilter === t.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={addEvent}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
          >
            + 라이브 이벤트
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-md border p-10 text-center">
            <div className="text-sm text-slate-500 mb-2">
              {events.length === 0
                ? '아직 등록된 라이브 이벤트가 없습니다.'
                : '해당 유형의 이벤트가 없습니다.'}
            </div>
            <div className="text-xs text-slate-400">
              상단의 "+ 라이브 이벤트" 버튼으로 추가하세요.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ev) => (
              <EventEditor
                key={ev.id}
                event={ev}
                members={members}
                speakerHistory={speakerHistory}
                onChange={(patch) => onUpdate(ev.id, patch)}
                onRemove={() => onDelete(ev.id)}
                onAddSession={() => addSession(ev)}
                onUpdateSession={(sid, patch) => updateSession(ev, sid, patch)}
                onRemoveSession={(sid) => removeSession(ev, sid)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-100 rounded-md p-4 shadow-md">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function EventEditor({
  event,
  members = [],
  speakerHistory = [],
  onChange,
  onRemove,
  onAddSession,
  onUpdateSession,
  onRemoveSession,
}) {
  const sessions = event.sessions || []
  const [extrasSessionId, setExtrasSessionId] = useState(null)
  const extrasSession = sessions.find((s) => s.id === extrasSessionId) || null

  return (
    <div className="bg-white rounded-md border overflow-hidden">
      {/* 이벤트 헤더 - 유형/날짜/주제 가로 배치 */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b bg-slate-50/60">
        <div className="w-36 shrink-0">
          <Select
            value={event.briefingType || 'online'}
            onChange={(v) => onChange({ briefingType: v })}
            options={BRIEFING_TYPES.map((b) => ({ value: b.value, label: b.label }))}
          />
        </div>
        <div className="w-40 shrink-0">
          <DatePicker
            value={event.date || ''}
            onChange={(v) => onChange({ date: v })}
            placeholder="날짜 선택"
          />
        </div>
        <input
          value={event.summary || ''}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="라이브 주제 (예: 경영지원 직무 오프라인 설명회)"
          className="flex-1 min-w-[240px] px-3 py-2 border rounded-md text-sm"
        />
        <span className="text-xs text-slate-500 shrink-0">세션 {sessions.length}</span>
        <button
          onClick={() => {
            if (confirm('이 라이브 이벤트를 삭제할까요?')) onRemove()
          }}
          className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md shrink-0"
        >
          이벤트 삭제
        </button>
      </div>

      {/* 세션 테이블 - 가로 스크롤 가능한 와이드 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-white text-slate-500">
            <tr className="border-b">
              <th className="text-left px-3 py-2 font-medium w-14">#</th>
              <th className="text-left px-2 py-2 font-medium w-24">타임라인</th>
              <th className="text-left px-2 py-2 font-medium min-w-[240px]">설명회 주제</th>
              <th className="text-left px-2 py-2 font-medium w-28">연사</th>
              <th className="text-left px-2 py-2 font-medium w-32">노출 이름</th>
              <th className="text-left px-2 py-2 font-medium w-32">노출 기업</th>
              <th className="text-left px-2 py-2 font-medium w-56">공개 가능한 프로필</th>
              <th className="text-left px-2 py-2 font-medium w-20">사진 링크</th>
              <th className="text-center px-1.5 py-2 font-medium w-20 leading-tight">
                라이브<br />얼굴 공개
              </th>
              <th className="text-center px-1.5 py-2 font-medium w-14">신규</th>
              <th className="text-center px-1.5 py-2 font-medium w-20" title="계약/금액/담당자/비고">계약·금액</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {sessions.map((s, idx) => (
              <SessionRow
                key={s.id}
                index={idx}
                session={s}
                speakerHistory={speakerHistory}
                onChange={(patch) => onUpdateSession(s.id, patch)}
                onRemove={() => onRemoveSession(s.id)}
                onOpenExtras={() => setExtrasSessionId(s.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t bg-slate-50/40">
        <button
          onClick={onAddSession}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + 세션 추가
        </button>
      </div>

      {extrasSession && (
        <SessionExtrasModal
          session={extrasSession}
          sessionIndex={sessions.findIndex((s) => s.id === extrasSession.id)}
          members={members}
          onChange={(patch) => onUpdateSession(extrasSession.id, patch)}
          onClose={() => setExtrasSessionId(null)}
        />
      )}
    </div>
  )
}

function SessionRow({
  index,
  session,
  speakerHistory = [],
  onChange,
  onRemove,
  onOpenExtras,
}) {
  const cellInput = 'w-full px-1.5 py-1 border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:outline-none rounded text-xs bg-transparent'
  const hasExtras = !!(session.contractRequired || session.amount || session.note)

  return (
    <tr className="hover:bg-slate-50/40 align-top">
      <td className="px-3 py-1.5 text-slate-500 font-medium whitespace-nowrap">
        {index + 1}부
      </td>
      <td className="px-1 py-1.5">
        <input
          value={session.timeSlot || ''}
          onChange={(e) => onChange({ timeSlot: e.target.value })}
          placeholder="20:15"
          className={cellInput}
        />
      </td>
      <td className="px-1 py-1.5">
        <input
          value={session.topic || ''}
          onChange={(e) => onChange({ topic: e.target.value })}
          placeholder="설명회 주제"
          className={cellInput}
        />
        <input
          value={session.subTopic || ''}
          onChange={(e) => onChange({ subTopic: e.target.value })}
          placeholder="서브 주제 (선택)"
          className={`${cellInput} text-[11px] text-slate-500 mt-0.5`}
        />
      </td>
      <td className="px-1 py-1.5">
        <SpeakerCombobox
          value={session.speakerName || ''}
          onChange={(v) => onChange({ speakerName: v })}
          onSelect={(sp) =>
            onChange({
              speakerName: sp.speakerName,
              disclosedName: sp.disclosedName,
              disclosedCompany: sp.disclosedCompany,
              publicProfile: sp.publicProfile,
              faceDisclosed: sp.faceDisclosed,
              photoUrl: sp.photoUrl,
            })
          }
          speakers={speakerHistory}
          placeholder="연사"
          className={cellInput}
        />
      </td>
      <td className="px-1 py-1.5">
        <input
          value={session.disclosedName || ''}
          onChange={(e) => onChange({ disclosedName: e.target.value })}
          placeholder="예: H 멘토 (남성)"
          className={cellInput}
        />
      </td>
      <td className="px-1 py-1.5">
        <input
          value={session.disclosedCompany || ''}
          onChange={(e) => onChange({ disclosedCompany: e.target.value })}
          placeholder="예: 카카오"
          className={cellInput}
        />
      </td>
      <td className="px-1 py-1.5">
        <textarea
          value={session.publicProfile || ''}
          onChange={(e) => onChange({ publicProfile: e.target.value })}
          placeholder="예: 전 카카오 계열사 HR"
          rows={2}
          className={`${cellInput} resize-y leading-snug whitespace-pre-wrap break-words`}
        />
      </td>
      <td className="px-1 py-1.5">
        {session.faceDisclosed ? (
          <div className="flex items-center gap-1">
            <input
              type="url"
              value={session.photoUrl || ''}
              onChange={(e) => onChange({ photoUrl: e.target.value })}
              placeholder="URL"
              className={`${cellInput} truncate`}
              title={session.photoUrl || ''}
            />
            {session.photoUrl && (
              <a
                href={session.photoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500 hover:text-indigo-700 text-[10px] shrink-0"
                title="새 창에서 열기"
              >
                ↗
              </a>
            )}
          </div>
        ) : (
          <span className="text-slate-300 text-[11px] px-1.5">—</span>
        )}
      </td>
      <td className="px-1.5 py-1.5 text-center">
        <input
          type="checkbox"
          checked={!!session.faceDisclosed}
          onChange={(e) => onChange({ faceDisclosed: e.target.checked })}
          className="accent-emerald-500"
        />
      </td>
      <td className="px-1.5 py-1.5 text-center">
        <input
          type="checkbox"
          checked={!!session.isNew}
          onChange={(e) => onChange({ isNew: e.target.checked })}
          className="accent-rose-500"
        />
      </td>
      <td className="px-1.5 py-1.5 text-center">
        <button
          onClick={onOpenExtras}
          className={`w-full px-2 py-1 text-[11px] rounded border transition-colors ${
            session.amount === '불필요'
              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              : hasExtras
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
          title="계약서 · 금액 · 비고"
        >
          {hasExtras
            ? session.amount
              ? String(session.amount)
              : '입력됨'
            : '입력'}
        </button>
      </td>
      <td className="px-1 py-1.5 text-center">
        <button
          onClick={onRemove}
          className="text-slate-300 hover:text-rose-500 text-sm leading-none"
          title="세션 삭제"
        >
          ×
        </button>
      </td>
    </tr>
  )
}

function SessionExtrasModal({ session, sessionIndex, members = [], onChange, onClose }) {
  return (
    <Modal
      onClose={onClose}
      title={`${sessionIndex + 1}부 · 계약 / 금액 / 담당자 / 비고`}
    >
      <div className="space-y-4">
        <div className="text-xs text-slate-500">
          {session.speakerName ? `연사: ${session.speakerName}` : '연사 미입력'}
          {session.topic && ` · ${session.topic}`}
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 items-end">
          <Field label="계약서 작성 필요">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer h-[38px] px-3 border rounded-lg">
              <input
                type="checkbox"
                checked={!!session.contractRequired}
                onChange={(e) => {
                  const required = e.target.checked
                  const next = { contractRequired: required }
                  if (!required) next.amount = '불필요'
                  else if (session.amount === '불필요') next.amount = ''
                  onChange(next)
                }}
                className="accent-emerald-500 w-4 h-4"
              />
              필요
            </label>
          </Field>
          <Field label="금액">
            <input
              value={session.amount || ''}
              onChange={(e) => onChange({ amount: e.target.value })}
              placeholder="400,000"
              disabled={!session.contractRequired}
              className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-500"
            />
          </Field>
        </div>

        <Field label="계약 담당자">
          {session.contractRequired ? (
            <Select
              value={session.contractAssignee || ''}
              onChange={(v) => onChange({ contractAssignee: v })}
              options={[
                { value: '', label: '(미지정)' },
                ...members.map((m) => ({ value: m.id, label: m.name, color: m.color })),
              ]}
              placeholder="담당자 선택"
            />
          ) : (
            <div className="px-3 py-2 border rounded-lg text-sm text-slate-400 bg-slate-50">
              계약서 작성 필요 시 지정 가능
            </div>
          )}
        </Field>

        <Field label="비고">
          <textarea
            value={session.note || ''}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="기타 메모"
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </Field>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          확인
        </button>
      </div>
    </Modal>
  )
}

