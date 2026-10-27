import { useEffect, useState } from 'react'

// Teks muncul satu per satu seperti dialog RPG. Jika pengguna memilih
// "reduce motion", teks langsung tampil penuh.
export default function Typewriter({ text, speed = 45, delay = 0, onDone, className = '' }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [n, setN] = useState(reduce ? text.length : 0)

  useEffect(() => {
    if (reduce) { setN(text.length); onDone?.(); return }
    setN(0)
    let i = 0, iv
    const st = setTimeout(() => {
      iv = setInterval(() => {
        i++; setN(i)
        if (i >= text.length) { clearInterval(iv); onDone?.() }
      }, speed)
    }, delay)
    return () => { clearTimeout(st); clearInterval(iv) }
  }, [text, speed, delay, reduce])

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {n < text.length && <span className="tw-cursor" aria-hidden="true">▌</span>}
    </span>
  )
}
