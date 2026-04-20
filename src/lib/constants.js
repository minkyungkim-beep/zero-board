export const STORAGE_KEY = 'team-dashboard-v1'

export const STATUS = [
  { key: 'todo',        label: 'To Do',       color: 'bg-slate-50 border-slate-200',   dot: 'bg-slate-400' },
  { key: 'in-progress', label: 'In Progress', color: 'bg-indigo-50/70 border-indigo-200', dot: 'bg-indigo-500' },
  { key: 'review',      label: 'Review',      color: 'bg-slate-100 border-slate-300',  dot: 'bg-indigo-300' },
  { key: 'done',        label: 'Done',        color: 'bg-white border-slate-200',      dot: 'bg-slate-500' },
]

export const PRIORITY = {
  low:  { label: '낮음', cls: 'bg-slate-100 text-slate-600' },
  mid:  { label: '보통', cls: 'bg-indigo-50 text-indigo-700' },
  high: { label: '높음', cls: 'bg-rose-50 text-rose-700' },
}

export const MEMBER_COLORS = [
  'bg-rose-300', 'bg-sky-300', 'bg-emerald-300', 'bg-violet-300', 'bg-amber-300',
]

export const PROJECT_COLORS = [
  'bg-rose-300', 'bg-sky-300', 'bg-emerald-300', 'bg-violet-300', 'bg-amber-300',
]

// 프로젝트 템플릿: 프로젝트 생성 시 선택하면 해당 태스크들이 자동 생성됨
export const PROJECT_TEMPLATES = [
  {
    id: 'vip',
    name: 'VIP 프로그램',
    description: 'VIP 프로그램 기본 태스크',
    tasks: [
      { title: '연사 섭외', priority: 'high', offsetDays: 7 },
      { title: '계약서 처리', priority: 'high', offsetDays: 7 },
      { title: '노션 가이드 제작', priority: 'mid', offsetDays: 14 },
      { title: '환불 규정 검토', priority: 'mid', offsetDays: 10 },
      { title: '신청 구글폼 제작', priority: 'mid', offsetDays: 7 },
      { title: '예치금 생성', priority: 'low', offsetDays: 14 },
      { title: '운영팀 공유 내용 정리', priority: 'mid', offsetDays: 10 },
    ],
  },
]

// 라이브 이벤트(설명회/박람회/세미나 등) 유형
export const BRIEFING_TYPES = [
  { value: 'online', label: '온라인' },
  { value: 'offline', label: '오프라인' },
]

// 세션(연사) 기본 스키마 - 라이브 이벤트의 각 회차(1부/2부…, 자동 넘버링)
export const createSession = () => ({
  id: `sess_${Math.random().toString(36).slice(2, 10)}`,
  timeSlot: '',
  topic: '',
  subTopic: '',
  // 연사 정보
  speakerName: '',        // 연사 (내부/실명)
  disclosedName: '',      // 노출 이름
  disclosedCompany: '',   // 노출 기업
  publicProfile: '',      // 공개 가능한 프로필
  faceDisclosed: false,   // 라이브 시 얼굴 노출
  photoUrl: '',           // 얼굴 노출 시 사진 링크
  isNew: false,
  contractRequired: true,
  contractAssignee: '',   // 계약서 작성 담당자 (member id)
  amount: '',
  note: '',
})

// 과거 라이브 이벤트에서 등장한 연사별 최신 정보를 집계 - 자동 완성용
// 키: speakerName (trim + 소문자). 값: 가장 최근(event.date 기준) 세션 정보 + 누적 등장 수.
export function buildSpeakerHistory(briefingEvents = []) {
  const map = new Map()
  briefingEvents.forEach((ev) => {
    (ev.sessions || []).forEach((s) => {
      const name = (s.speakerName || '').trim()
      if (!name) return
      const key = name.toLowerCase()
      const date = ev.date || ''
      const existing = map.get(key)
      const isNewer = !existing || date >= (existing._latestDate || '')
      const snapshot = {
        key: name,
        speakerName: name,
        disclosedName: s.disclosedName || '',
        disclosedCompany: s.disclosedCompany || '',
        publicProfile: s.publicProfile || '',
        faceDisclosed: !!s.faceDisclosed,
        photoUrl: s.photoUrl || '',
        _latestDate: date,
        appearances: (existing?.appearances || 0) + 1,
      }
      if (isNewer) {
        map.set(key, snapshot)
      } else {
        existing.appearances += 1
      }
    })
  })
  return Array.from(map.values()).sort((a, b) => b.appearances - a.appearances || a.speakerName.localeCompare(b.speakerName, 'ko'))
}

// 계약서 작성 필요 + 담당자가 지정된 세션을 자동으로 태스크 형태로 변환
export function deriveContractTasks(briefingEvents = []) {
  const tasks = []
  briefingEvents.forEach((ev) => {
    (ev.sessions || []).forEach((s, idx) => {
      if (!s.contractRequired || !s.contractAssignee) return
      const title = `계약서 · ${ev.summary || '라이브 이벤트'} ${idx + 1}부${
        s.speakerName ? ` (${s.speakerName})` : ''
      }`
      tasks.push({
        id: `contract_${s.id}`,
        projectId: null,
        title,
        assignee: s.contractAssignee,
        status: 'todo',
        priority: 'high',
        startDate: ev.date || '',
        dueDate: ev.date || '',
        notes: s.amount ? `금액: ${s.amount}` : '',
        subtasks: [],
        isContract: true,
      })
    })
  })
  return tasks
}

// 라이브 이벤트(하나의 날짜에 진행되는 설명회/박람회/세미나 단위)
export const createLiveEvent = () => ({
  id: `le_${Math.random().toString(36).slice(2, 10)}`,
  briefingType: 'online',
  date: '',
  summary: '',
  sessions: [createSession()],
})

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const DEFAULT_STATE = {
  briefingEvents: [],
  members: [
    { id: 'm1', name: '밍', color: 'bg-rose-300', role: '팀장' },
    { id: 'm2', name: '파트원A', color: 'bg-sky-300', role: '파트원' },
    { id: 'm3', name: '파트원B', color: 'bg-emerald-300', role: '파트원' },
  ],
  projects: [
    {
      id: 'p1',
      name: '2분기 기획 리뉴얼',
      color: 'bg-rose-300',
      startDate: todayISO(),
      endDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10) })(),
      description: '분기 기획 전반 개편',
    },
    {
      id: 'p2',
      name: '브랜딩 프로그램',
      color: 'bg-sky-300',
      startDate: todayISO(),
      endDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10) })(),
      description: '',
    },
    {
      id: 'p3',
      name: 'VIP 프로그램',
      color: 'bg-emerald-300',
      startDate: todayISO(),
      endDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10) })(),
      description: '',
    },
  ],
  tasks: [
    {
      id: 't1',
      projectId: 'p1',
      title: '기획안 초안 작성',
      assignee: 'm1',
      status: 'in-progress',
      priority: 'high',
      startDate: todayISO(),
      dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().slice(0, 10) })(),
      notes: '',
      subtasks: [
        { id: 's1', title: '경쟁사 리서치', done: true },
        { id: 's2', title: '핵심 메시지 정리', done: false },
      ],
    },
    // 브랜딩 프로그램 태스크
    { id: 't2', projectId: 'p2', title: '연사 섭외', assignee: 'm1', status: 'todo', priority: 'high', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't3', projectId: 'p2', title: '계약서 처리', assignee: 'm2', status: 'todo', priority: 'high', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't4', projectId: 'p2', title: '노션 가이드 제작', assignee: 'm2', status: 'todo', priority: 'mid', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't5', projectId: 'p2', title: '환불 규정 검토', assignee: 'm1', status: 'todo', priority: 'mid', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't6', projectId: 'p2', title: '신청 구글폼 제작', assignee: 'm3', status: 'todo', priority: 'mid', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't7', projectId: 'p2', title: '예치금 생성', assignee: 'm1', status: 'todo', priority: 'low', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't8', projectId: 'p2', title: '운영팀 공유 내용 정리', assignee: 'm3', status: 'todo', priority: 'mid', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    // VIP 프로그램 태스크 (브랜딩과 동일)
    { id: 't9', projectId: 'p3', title: '연사 섭외', assignee: 'm1', status: 'todo', priority: 'high', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't10', projectId: 'p3', title: '계약서 처리', assignee: 'm2', status: 'todo', priority: 'high', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't11', projectId: 'p3', title: '노션 가이드 제작', assignee: 'm2', status: 'todo', priority: 'mid', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't12', projectId: 'p3', title: '환불 규정 검토', assignee: 'm1', status: 'todo', priority: 'mid', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't13', projectId: 'p3', title: '신청 구글폼 제작', assignee: 'm3', status: 'todo', priority: 'mid', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't14', projectId: 'p3', title: '예치금 생성', assignee: 'm1', status: 'todo', priority: 'low', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
    { id: 't15', projectId: 'p3', title: '운영팀 공유 내용 정리', assignee: 'm3', status: 'todo', priority: 'mid', startDate: todayISO(), dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().slice(0, 10) })(), notes: '', subtasks: [] },
  ],
}
