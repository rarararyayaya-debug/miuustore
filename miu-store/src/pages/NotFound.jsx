import { Link } from 'react-router-dom'
import BackgroundFX from '../components/BackgroundFX'
import PixelCat from '../components/pixel/PixelCat'

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6 relative">
      <BackgroundFX />
      <div className="pixel-box relative z-10 p-6 text-center flex flex-col items-center gap-4">
        <PixelCat size={6} />
        <h1 className="font-pixel text-lg text-deep mt-8">404</h1>
        <p>Ups, halaman ini tersesat di dunia pixel ♡</p>
        <Link to="/" className="pixel-btn inline-flex items-center">Kembali ke miu store</Link>
      </div>
    </div>
  )
}
