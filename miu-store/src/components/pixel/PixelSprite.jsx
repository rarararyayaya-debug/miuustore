import { memo } from 'react'

// Menggambar grid teks menjadi SVG pixel. Tiap warna jadi <g class="px-{huruf}">
// sehingga bagian tertentu (mis. mata 'e') bisa dianimasikan lewat CSS.
function PixelSprite({ grid, palette, size = 4, className = '', title }) {
  const rows = grid.length
  const cols = grid[0].length
  const groups = {}
  grid.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.' || !palette[ch]) return
      ;(groups[ch] ||= []).push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
    })
  )
  return (
    <svg
      className={className}
      width={cols * size}
      height={rows * size}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {Object.entries(groups).map(([ch, rects]) => (
        <g key={ch} className={`px-${ch}`} fill={palette[ch]}>{rects}</g>
      ))}
    </svg>
  )
}
export default memo(PixelSprite)
