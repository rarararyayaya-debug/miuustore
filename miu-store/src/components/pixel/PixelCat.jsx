import { useEffect, useRef, useState } from 'react'
import PixelSprite from './PixelSprite'
import { CAT, CAT_TAIL, CAT_PAL } from './sprites'

const LINES = ['meow ♡', 'mew mew!', 'welcome~', 'nyaa ✧', 'hehe ♡']

// Maskot: berkedip, ekor bergoyang, bernapas pelan; saat disentuh melompat,
// mata jadi senang, dan muncul dialog kecil.
export default function PixelCat({ size = 8, className = '' }) {
  const [active, setActive] = useState(false)
  const [line, setLine] = useState('')
  const n = useRef(0)
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])

  const poke = () => {
    setActive(true)
    setLine(LINES[n.current++ % LINES.length])
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setActive(false), 1400)
  }

  return (
    <button type="button" onClick={poke} aria-label="Elus kucing miu store"
      className={`relative inline-block bg-transparent border-0 p-0 cursor-pointer ${className}`}
      style={{ width: 19 * size, height: 14 * size }}>
      {active && (
        <span className="pixel-box absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 font-pixel text-[9px] reveal">
          {line}
        </span>
      )}
      <span className={`block pixel-blink ${active ? 'cat-hop cat-happy' : 'cat-idle'}`}>
        <PixelSprite grid={CAT} palette={CAT_PAL} size={size} />
        <span className="cat-tail absolute" style={{ left: 15 * size, top: 7 * size }}>
          <PixelSprite grid={CAT_TAIL} palette={CAT_PAL} size={size} />
        </span>
      </span>
    </button>
  )
}
