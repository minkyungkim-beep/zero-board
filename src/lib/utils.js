export const uid = () => Math.random().toString(36).slice(2, 9)

export const todayISO = () => new Date().toISOString().slice(0, 10)

export function getWeekOf(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

export function formatWeekLabel(weekStart) {
  if (!weekStart) return '미지정'
  const start = new Date(weekStart)
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const fmt = (x) => `${x.getMonth() + 1}/${x.getDate()}`
  return `${fmt(start)} ~ ${fmt(end)}`
}

export function daysBetween(a, b) {
  if (!a || !b) return 0
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24))
}
