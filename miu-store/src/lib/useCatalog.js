import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseReady } from './supabase'

export const DEFAULT_SETTINGS = {
  store_name: 'miu store', tagline: 'tiny pixels, lovely finds ♡',
  hero_subtitle: 'your little purple pixel wonderland', description: '', logo_url: null,
}

export function useCatalog() {
  const [state, set] = useState({ loading: true, error: null, settings: DEFAULT_SETTINGS, categories: [], products: [] })
  const load = useCallback(async () => {
    if (!supabaseReady) { set((s) => ({ ...s, loading: false, error: 'Supabase belum dikonfigurasi (cek file .env / Environment Variables Netlify).' })); return }
    try {
      const [s, c, p] = await Promise.all([
        supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('categories').select('*').order('sort_order').order('name'),
        supabase.from('products').select('*').order('sort_order').order('created_at', { ascending: false }),
      ])
      const err = s.error || c.error || p.error
      set({ loading: false, error: err ? err.message : null, settings: { ...DEFAULT_SETTINGS, ...(s.data || {}) }, categories: c.data || [], products: p.data || [] })
    } catch (e) { set((x) => ({ ...x, loading: false, error: e.message })) }
  }, [])
  useEffect(() => { load() }, [load])
  return { ...state, reload: load }
}
