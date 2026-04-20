import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_STATE, deriveContractTasks } from './lib/constants'
import { useCloudState } from './lib/useCloudState'
import { uid, todayISO } from './lib/utils'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { DashboardView } from './components/views/DashboardView'
import { KanbanView } from './components/views/KanbanView'
import { TimelineView } from './components/views/TimelineView'
import { MemberView } from './components/views/MemberView'
import { BriefingView } from './components/views/BriefingView'
import { TaskModal } from './components/modals/TaskModal'
import { ProjectModal } from './components/modals/ProjectModal'
import { TeamModal } from './components/modals/TeamModal'
import { ProjectTasksModal } from './components/modals/ProjectTasksModal'
import { MemberTasksModal } from './components/modals/MemberTasksModal'

export default function App() {
  const [state, setState, cloudStatus] = useCloudState()
  const [view, setView] = useState('dashboard')
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState({ member: 'all', project: 'all', search: '' })

  // 라이브 이벤트의 '계약서 필요 + 담당자' 조합을 태스크로 자동 동기화
  // 사용자가 태스크에서 직접 편집한 내용(제목/메모/우선순위/서브태스크/상태)은 유지하고,
  // 라이브 이벤트 원본에서 파생된 값(담당자/기한)만 최신화.
  useEffect(() => {
    setState((prev) => {
      const desired = deriveContractTasks(prev.briefingEvents || [])
      const nonContract = prev.tasks.filter((t) => !t.id?.startsWith('contract_'))
      const merged = desired.map((ct) => {
        const existing = prev.tasks.find((t) => t.id === ct.id)
        if (!existing) return ct
        return {
          ...ct,
          status: existing.status ?? ct.status,
          priority: existing.priority ?? ct.priority,
          title: existing.title || ct.title,
          notes: existing.notes ?? ct.notes,
          subtasks:
            existing.subtasks && existing.subtasks.length ? existing.subtasks : ct.subtasks,
        }
      })
      const newTasks = [...nonContract, ...merged]
      if (JSON.stringify(newTasks) === JSON.stringify(prev.tasks)) return prev
      return { ...prev, tasks: newTasks }
    })
  }, [state.briefingEvents])

  const update = (patcher) => setState((s) => patcher({ ...s }))

  const addProject = (p) => update((s) => ({ ...s, projects: [...s.projects, p] }))
  const updateProject = (id, patch) =>
    update((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  const deleteProject = (id) =>
    update((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.filter((t) => t.projectId !== id),
    }))

  const addBriefingEvent = (ev) =>
    update((s) => ({ ...s, briefingEvents: [...(s.briefingEvents || []), ev] }))
  const updateBriefingEvent = (id, patch) =>
    update((s) => ({
      ...s,
      briefingEvents: (s.briefingEvents || []).map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
  const deleteBriefingEvent = (id) =>
    update((s) => ({
      ...s,
      briefingEvents: (s.briefingEvents || []).filter((e) => e.id !== id),
    }))

  const addTask = (t) => update((s) => ({ ...s, tasks: [...s.tasks, t] }))
  const updateTask = (id, patch) =>
    update((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  const deleteTask = (id) =>
    update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))


  const filtered = useMemo(() => {
    return state.tasks.filter((t) => {
      if (filter.member !== 'all' && t.assignee !== filter.member) return false
      if (filter.project !== 'all' && t.projectId !== filter.project) return false
      if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase()))
        return false
      return true
    })
  }, [state.tasks, filter])

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-dashboard-backup-${todayISO()}.json`
    a.click()
  }

  const importData = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (parsed.members && parsed.projects && parsed.tasks) {
          setState(parsed)
          alert('데이터를 불러왔습니다.')
        } else {
          alert('유효한 백업 파일이 아닙니다.')
        }
      } catch {
        alert('파일 읽기 오류')
      }
    }
    reader.readAsText(file)
  }

  const resetAll = () => {
    if (confirm('모든 데이터를 초기화할까요? 이 작업은 되돌릴 수 없습니다.')) {
      setState(DEFAULT_STATE)
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar
        view={view}
        setView={setView}
        onManageTeam={() => setModal({ type: 'team' })}
        onExport={exportData}
        onImport={importData}
        onReset={resetAll}
        cloudStatus={cloudStatus}
      />
      <div className="flex-1 flex flex-col min-w-0">
      <Header state={state} filter={filter} setFilter={setFilter} />

      <main className="px-10 pt-6 pb-16">
        {view === 'dashboard' && (
          <DashboardView
            state={state}
            filtered={filtered}
            onEditTask={(t) => setModal({ type: 'task', data: t })}
            onEditProject={(p) => setModal({ type: 'project', data: p })}
            onOpenProjectTasks={(p) => setModal({ type: 'project-tasks', data: p })}
            onOpenMemberTasks={(m) => setModal({ type: 'member-tasks', data: m })}
            onNewTask={() => setModal({ type: 'task' })}
            onNewProject={() => setModal({ type: 'project' })}
          />
        )}
        {view === 'kanban' && (
          <KanbanView
            state={state}
            tasks={filtered}
            updateTask={updateTask}
            onEditTask={(t) => setModal({ type: 'task', data: t })}
            onNewTask={() => setModal({ type: 'task' })}
          />
        )}
        {view === 'timeline' && (
          <TimelineView
            state={state}
            tasks={filtered}
            onEditTask={(t) => setModal({ type: 'task', data: t })}
            onNewTask={() => setModal({ type: 'task' })}
            onNewProject={() => setModal({ type: 'project' })}
          />
        )}
        {view === 'member' && (
          <MemberView
            state={state}
            tasks={filtered}
            onEditTask={(t) => setModal({ type: 'task', data: t })}
            onNewTask={() => setModal({ type: 'task' })}
          />
        )}
        {view === 'briefing' && (
          <BriefingView
            events={state.briefingEvents || []}
            members={state.members}
            onAdd={addBriefingEvent}
            onUpdate={updateBriefingEvent}
            onDelete={deleteBriefingEvent}
          />
        )}
      </main>
      </div>

      {modal?.type === 'task' && (
        <TaskModal
          state={state}
          task={modal.data}
          onClose={() => setModal(null)}
          onSave={(t) => {
            if (modal.data) updateTask(modal.data.id, t)
            else addTask({ ...t, id: uid() })
            setModal(null)
          }}
          onDelete={() => {
            if (confirm('이 태스크를 삭제할까요?')) {
              deleteTask(modal.data.id)
              setModal(null)
            }
          }}
        />
      )}
      {modal?.type === 'project' && (
        <ProjectModal
          project={modal.data}
          members={state.members}
          onClose={() => setModal(null)}
          onSave={(p, template, assignee) => {
            if (modal.data) {
              updateProject(modal.data.id, p)
            } else {
              const newId = uid()
              const newProject = { ...p, id: newId }
              if (template) {
                const base = new Date(p.startDate || todayISO())
                const templateTasks = template.tasks.map((tt) => {
                  const due = new Date(base)
                  due.setDate(due.getDate() + (tt.offsetDays || 7))
                  return {
                    id: uid(),
                    projectId: newId,
                    title: tt.title,
                    assignee: assignee || null,
                    status: 'todo',
                    priority: tt.priority || 'mid',
                    startDate: p.startDate || todayISO(),
                    dueDate: due.toISOString().slice(0, 10),
                    notes: '',
                    subtasks: [],
                  }
                })
                setState((s) => ({
                  ...s,
                  projects: [...s.projects, newProject],
                  tasks: [...s.tasks, ...templateTasks],
                }))
              } else {
                addProject(newProject)
              }
            }
            setModal(null)
          }}
          onDelete={() => {
            if (confirm('프로젝트와 소속 태스크가 모두 삭제됩니다. 계속할까요?')) {
              deleteProject(modal.data.id)
              setModal(null)
            }
          }}
        />
      )}
      {modal?.type === 'member-tasks' && (
        <MemberTasksModal
          member={modal.data}
          tasks={state.tasks.filter((t) => t.assignee === modal.data.id)}
          projects={state.projects}
          onClose={() => setModal(null)}
          onToggleTask={(id, status) => updateTask(id, { status })}
          onEditTask={(t) => setModal({ type: 'task', data: t })}
        />
      )}
      {modal?.type === 'project-tasks' && (
        <ProjectTasksModal
          project={modal.data}
          tasks={state.tasks.filter((t) => t.projectId === modal.data.id)}
          members={state.members}
          onClose={() => setModal(null)}
          onToggleTask={(id, status) => updateTask(id, { status })}
          onEditTask={(t) => setModal({ type: 'task', data: t })}
          onEditProject={(p) => {
            setModal({ type: 'project', data: p })
          }}
        />
      )}
      {modal?.type === 'team' && (
        <TeamModal
          members={state.members}
          onClose={() => setModal(null)}
          onSave={(updatedMembers) => {
            const removedIds = new Set(
              state.members
                .filter((m) => !updatedMembers.find((u) => u.id === m.id))
                .map((m) => m.id)
            )
            setState((s) => ({
              ...s,
              members: updatedMembers,
              tasks: s.tasks.map((t) =>
                removedIds.has(t.assignee) ? { ...t, assignee: null } : t
              ),
            }))
          }}
        />
      )}
    </div>
  )
}
