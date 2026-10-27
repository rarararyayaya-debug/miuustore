import PixelSprite from './PixelSprite'
import { BUNNY, BUNNY_PAL } from './sprites'

export default function PixelBunny({ size = 4, className = '' }) {
  return (
    <span className={`inline-block pixel-blink bunny-idle ${className}`}>
      <PixelSprite grid={BUNNY} palette={BUNNY_PAL} size={size} />
    </span>
  )
}
