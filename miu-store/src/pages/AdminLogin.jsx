import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase, supabaseReady } from '../lib/supabase'
import { useAdmin } from '../lib/useAdmin'
import BackgroundFX from '../components/BackgroundFX'
import Logo from '../components/pixel/Logo'
import PixelCat from '../components/pixel/PixelCat'

const inp = 'w-full min-h-[44px] px-3 border-2 border-deep bg-light rounded-none outline-none focus:bg-white'

export default function AdminLogin() {
  const adm = useAdmin()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (adm.status === 'ok') return <Navigate to="/admin/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr('Email atau password salah.')
    setBusy(false)
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 relative">
      <BackgroundFX />
      <form onSubmit={submit} className="pixel-box relative z-10 w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2"><Logo name="miu store" /><span className="font-pixel text-[9px]">admin login</span></div>
        <div className="self-center pt-10"><PixelCat size={5} /></div>
        {!supabaseReady && <p className="text-sm">Supabase belum dikonfigurasi (.env).</p>}
        {adm.status === 'denied' && (
          <p className="text-sm">Akun ini bukan admin.{' '}
            <button type="button" className="underline font-bold" onClick={() => supabase.auth.signOut()}>Keluar</button></p>
        )}
        <input className={inp} type="email" placeholder="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inp} type="password" placeholder="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
        {err && <p className="text-sm font-bold text-deep">{err}</p>}
        <button className="pixel-btn" disabled={busy || !supabaseReady}>{busy ? 'masuk…' : 'Masuk ♡'}</button>
      </form>
    </div>
  )
}
