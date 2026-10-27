import PixelSprite from './PixelSprite'
import { STAR } from './sprites'

export default function Logo({ name = 'miu store', className = '' }) {
  const pal = { y: '#B197FC' }
  return (
    <span className={`inline-flex items-center gap-2 font-pixel text-deep ${className}`}
      style={{ textShadow: '2px 2px 0 #E9D5FF' }}>
      <span className="star-spin"><PixelSprite grid={STAR} palette={pal} size={3} /></span>
      <span>{name}</span>
      <span className="star-spin" style={{ animationDelay: '.6s' }}><PixelSprite grid={STAR} palette={pal} size={2} /></span>
    </span>
  )
}
