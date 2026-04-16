export const STORAGE_KEY = 'team-dashboard-v1'

export const STATUS = [
  { key: 'todo', label: 'To Do', color: 'bg-slate-100 border-slate-300' },
  { key: 'in-progress', label: 'In Progress', color: 'bg-blue-50 border-blue-300' },
  { key: 'review', label: 'Review', color: 'bg-amber-50 border-amber-300' },
  { key: 'done', label: 'Done', color: 'bg-green-50 border-green-300' },
]

export const PRIORITY = {
  low: { label: '낮음', cls: 'bg-slate-100 text-slate-600' },
  mid: { label: '보통', cls: 'bg-blue-100 text-blue-700' },
  high: { label: '높음', cls: 'bg-rose-100 text-rose-700' },
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
    description: 'VIP 프로그램 운영 기본 태스크',
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

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const DEFAULT_STATE = {
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
