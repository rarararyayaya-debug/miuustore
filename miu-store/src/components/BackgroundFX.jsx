import { useEffect, useMemo, useState } from 'react'
import PixelSprite from './pixel/PixelSprite'
import { CLOUD, CLOUD_PAL, BUTTERFLY, BUTTERFLY_PAL, HEART, HEART_PAL, MOON, MOON_PAL } from './pixel/sprites'

const rnd = (a, b) => a + Math.random() * (b - a)

// Lapisan latar: murni CSS animation (transform/opacity) supaya ringan di HP.
// Jumlah elemen dikurangi di layar kecil. Taruh konten di atasnya dengan z-10.
export default function BackgroundFX() {
  const lite = typeof window !== 'undefined' && window.innerWidth < 640
  const stars = useMemo(() => Array.from({ length: lite ? 18 : 34 }, () => ({
    x: rnd(0, 100), y: rnd(0, 88), plus: Math.random() < 0.25, d: rnd(0, 4), t: rnd(2, 5),
  })), [lite])
  const hearts = useMemo(() => Array.from({ length: lite ? 4 : 7 }, () => ({
    x: rnd(3, 95), d: rnd(0, 14), t: rnd(14, 24), s: rnd(2, 3.5),
  })), [lite])
  const motes = useMemo(() => Array.from({ length: lite ? 8 : 14 }, () => ({
    x: rnd(0, 100), d: rnd(0, 30), t: rnd(30, 50),
  })), [lite])
  const clouds = [{ y: 8, t: 90, d: 0, s: 6 }, { y: 28, t: 120, d: -40, s: 4 }, { y: 55, t: 100, d: -70, s: 5 }]
  const flies = [{ y: 30, t: 26, d: 0 }, { y: 62, t: 34, d: -12 }]

  const [shot, setShot] = useState(null)
  useEffect(() => {
    let t
    const go = () => {
      setShot({ x: rnd(40, 95), y: rnd(2, 30), k: Math.random() })
      t = setTimeout(() => { setShot(null); t = setTimeout(go, rnd(7000, 14000)) }, 1200)
    }
    t = setTimeout(go, rnd(3000, 6000))
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {stars.map((s, i) => (
        <i key={i} className={`star ${s.plus ? 'star-plus' : ''}`}
          style={{ left: `${s.x}%`, top: `${s.y}%`, animation: `twinkle ${s.t}s ${s.d}s infinite` }} />
      ))}

      <div className="moon" style={{ position: 'absolute', top: '6%', right: '8%' }}>
        <PixelSprite grid={MOON} palette={MOON_PAL} size={lite ? 4 : 6} />
      </div>

      {clouds.map((c, i) => (
        <div key={i} className="fx-move absolute" style={{ top: `${c.y}%`, left: 0, opacity: 0.85, animation: `drift ${c.t}s ${c.d}s linear infinite` }}>
          <PixelSprite grid={CLOUD} palette={CLOUD_PAL} size={c.s} />
        </div>
      ))}

      {flies.map((f, i) => (
        <div key={i} className="fx-move absolute" style={{ top: `${f.y}%`, left: 0, animation: `flyAcross ${f.t}s ${f.d}s linear infinite` }}>
          <div style={{ animation: 'sway 2.4s ease-in-out infinite' }}>
            <PixelSprite grid={BUTTERFLY} palette={BUTTERFLY_PAL} size={4} className="flap" />
          </div>
        </div>
      ))}

      {hearts.map((h, i) => (
        <div key={i} className="fx-move absolute" style={{ left: `${h.x}%`, top: 0, opacity: 0.7, animation: `floatUp ${h.t}s ${h.d}s linear infinite` }}>
          <div style={{ animation: 'sway 3s ease-in-out infinite' }}>
            <PixelSprite grid={HEART} palette={HEART_PAL} size={h.s} />
          </div>
        </div>
      ))}

      {motes.map((m, i) => (
        <i key={i} className="mote fx-move" style={{ left: `${m.x}%`, top: 0, animation: `floatUp ${m.t}s ${m.d}s linear infinite` }} />
      ))}

      {shot && <i key={shot.k} className="shooting fx-move" style={{ left: `${shot.x}%`, top: `${shot.y}%` }} />}
    </div>
  )
}
