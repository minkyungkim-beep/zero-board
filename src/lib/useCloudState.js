import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isCloudConfigured } from './supabase'
import { STORAGE_KEY, DEFAULT_STATE } from './constants'

const TABLE = 'team_state'
const ROW_ID = 'main'
const DEBOUNCE_MS = 500

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

/**
 * 팀 공유 상태 훅 (Supabase).
 *  - Supabase 가 설정되어 있으면: team_state 테이블의 단일 row 를 upsert + realtime 구독.
 *  - 미설정이면: localStorage 단독 (기존 동작 유지).
 *  - 반환: [state, setState, status]
 *    status: 'local' | 'connecting' | 'syncing' | 'synced' | 'error'
 */
export function useCloudState() {
  const [state, _setState] = useState(loadFromLocalStorage)
  const [status, setStatus] = useState(isCloudConfigured ? 'connecting' : 'local')

  const writeTimerRef = useRef(null)
  const lastWrittenRef = useRef(null)
  const currentRef = useRef(state)

  useEffect(() => {
    currentRef.current = state
  }, [state])

  useEffect(() => {
    if (!isCloudConfigured) return

    let mounted = true
    let channel = null

    async function init() {
      // 최초 로드
      const { data, error } = await supabase
        .from(TABLE)
        .select('data')
        .eq('id', ROW_ID)
        .maybeSingle()

      if (!mounted) return

      if (error) {
        console.error('[cloud] fetch error:', error)
        setStatus('error')
        return
      }

      if (data?.data) {
        const json = JSON.stringify(data.data)
        _setState(data.data)
        lastWrittenRef.current = json
        try {
          localStorage.setItem(STORAGE_KEY, json)
        } catch {
          // ignore
        }
      } else {
        // row 미존재 → localStorage (또는 기본값) 로 시드
        const initial = loadFromLocalStorage()
        const { error: seedErr } = await supabase
          .from(TABLE)
          .upsert({ id: ROW_ID, data: initial })
        if (seedErr) {
          console.error('[cloud] seed error:', seedErr)
          setStatus('error')
          return
        }
        lastWrittenRef.current = JSON.stringify(initial)
      }
      setStatus('synced')

      // realtime 구독
      channel = supabase
        .channel(`team_state:${ROW_ID}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TABLE,
            filter: `id=eq.${ROW_ID}`,
          },
          (payload) => {
            const nextData = payload.new?.data
            if (!nextData) return
            const json = JSON.stringify(nextData)
            if (json === lastWrittenRef.current) return
            _setState(nextData)
            lastWrittenRef.current = json
            try {
              localStorage.setItem(STORAGE_KEY, json)
            } catch {
              // ignore
            }
            setStatus('synced')
          }
        )
        .subscribe()
    }

    init()

    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const setState = useCallback((updater) => {
    _setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      if (!isCloudConfigured) return next

      if (writeTimerRef.current) clearTimeout(writeTimerRef.current)
      writeTimerRef.current = setTimeout(async () => {
        const data = currentRef.current
        const json = JSON.stringify(data)
        lastWrittenRef.current = json
        setStatus('syncing')
        const { error } = await supabase.from(TABLE).upsert({ id: ROW_ID, data })
        if (error) {
          console.error('[cloud] write error:', error)
          setStatus('error')
        } else {
          setStatus('synced')
        }
      }, DEBOUNCE_MS)

      return next
    })
  }, [])

  return [state, setState, status]
}
