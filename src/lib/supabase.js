import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경변수 없으면 로컬 단독 모드로 동작 (graceful fallback)
export const isCloudConfigured = !!(url && anonKey)

export const supabase = isCloudConfigured
  ? createClient(url, anonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
      auth: { persistSession: false },
    })
  : null
