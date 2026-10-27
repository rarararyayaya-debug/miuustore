import { useEffect, useState } from 'react'
import PixelSprite from './pixel/PixelSprite'
import Logo from './pixel/Logo'
import { HEART, HEART_PAL } from './pixel/sprites'

const MIN_MS = 1200   // tampil minimal agar tidak berkedip
const MAX_MS = 4000   // batas maksimal menunggu

// ready = true saat data awal selesai dimuat. Layar hilang otomatis.
export default function LoadingScreen({ ready, onDone }) {
  const [pct, setPct] = useState(0)
  const [minPassed, setMinPassed] = useState(false)
  const [maxPassed, setMaxPassed] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const a = setTimeout(() => setMinPassed(true), MIN_MS)
    const b = setTimeout(() => setMaxPassed(true), MAX_MS)
    const iv = setInterval(() => setPct((p) => Math.min(p + 6, 90)), 100)
    return () => { clearTimeout(a); clearTimeout(b); clearInterval(iv) }
  }, [])

  useEffect(() => {
    if ((ready && minPassed) || maxPassed) {
      setPct(100)
      const a = setTimeout(() => setLeaving(true), 250)
      const b = setTimeout(() => onDone?.(), 750)
      return () => { clearTimeout(a); clearTimeout(b) }
    }
  }, [ready, minPassed, maxPassed])

  const blocks = 10
  const filled = Math.round((pct / 100) * blocks)

  return (
    <div role="status" aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 px-6 text-center transition-opacity duration-500 ${leaving ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(180deg,#E9D5FF,#CDB4FF)' }}>
      <Logo className="text-lg sm:text-2xl" />
      <span style={{ animation: 'pulse-heart 0.9s ease-in-out infinite' }}>
        <PixelSprite grid={HEART} palette={HEART_PAL} size={10} />
      </span>
      <div className="pixel-box flex gap-1 p-2" style={{ width: 'min(260px,70vw)' }}>
        {Array.from({ length: blocks }, (_, i) => (
          <span key={i} className="h-4 flex-1" style={{ background: i < filled ? '#B197FC' : '#F8F3FF' }} />
        ))}
      </div>
      <p className="font-pixel text-[9px] sm:text-[10px] leading-5 text-ink">loading your little pixel world…</p>
    </div>
  )
}
