import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from './supabase'

// status: loading | out (belum login) | denied (login tapi bukan admin) | ok
export function useAdmin() {
  const [st, setSt] = useState({ status: 'loading' })
  useEffect(() => {
    if (!supabaseReady) { setSt({ status: 'out' }); return }
    let alive = true
    const check = async (session) => {
      if (!session) { alive && setSt({ status: 'out' }); return }
      const { data } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      alive && setSt(data ? { status: 'ok', user: session.user } : { status: 'denied', user: session.user })
    }
    supabase.auth.getSession().then(({ data }) => check(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setTimeout(() => check(s), 0))
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])
  return st
}
