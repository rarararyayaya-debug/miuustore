import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useCatalog } from '../lib/useCatalog'
import { rupiah } from '../lib/format'
import BackgroundFX from '../components/BackgroundFX'
import LoadingScreen from '../components/LoadingScreen'
import Typewriter from '../components/Typewriter'
import Logo from '../components/pixel/Logo'
import PixelCat from '../components/pixel/PixelCat'
import PixelBunny from '../components/pixel/PixelBunny'

function Card({ p, catName, i }) {
  const v = p.variants || []
  const out = !p.in_stock
  return (
    <article className="pixel-box reveal flex flex-col overflow-hidden" style={{ animationDelay: `${Math.min(i * 60, 480)}ms` }}>
      <div className="relative aspect-square bg-lilac">
        {p.image_url
          ? <img src={p.image_url} alt={p.name} loading="lazy" className={`w-full h-full object-cover ${out ? 'grayscale opacity-70' : ''}`} />
          : <div className="w-full h-full grid place-items-center"><PixelBunny size={6} /></div>}
        <span className={`absolute top-2 left-2 font-pixel text-[8px] px-2 py-1 ${out ? 'bg-ink text-white' : 'bg-white text-deep'}`}>{out ? 'HABIS' : 'TERSEDIA'}</span>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        {catName && <span className="font-pixel text-[8px] text-dream">{catName}</span>}
        <h3 className="font-extrabold text-base leading-tight">{p.name}</h3>
        <p className="font-pixel text-[11px] text-deep">{v.length ? 'mulai ' : ''}{rupiah(p.price)}</p>
        {v.length > 0 && (
          <ul className="text-sm bg-light p-2 border-2 border-lilac">
            {v.map((x) => <li key={x.label} className="flex justify-between gap-2"><span>{x.label}</span><b>{rupiah(x.price)}</b></li>)}
          </ul>
        )}
        {p.description && <p className="text-sm whitespace-pre-line opacity-80">{p.description}</p>}
      </div>
    </article>
  )
}

export default function Pricelist() {
  const { loading, error, settings, categories, products } = useCatalog()
  const [done, setDone] = useState(false)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('default')

  useEffect(() => { document.title = `${settings.store_name} ♡ ${settings.tagline}` }, [settings])

  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories])
  const list = useMemo(() => {
    let l = products.filter((p) => p.is_published)
    if (cat !== 'all') l = l.filter((p) => p.category_id === cat)
    const s = q.trim().toLowerCase()
    if (s) l = l.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(s))
    if (sort === 'asc') l = [...l].sort((a, b) => a.price - b.price)
    if (sort === 'desc') l = [...l].sort((a, b) => b.price - a.price)
    return l
  }, [products, cat, q, sort])

  const chip = (active) => `min-h-[40px] px-3 text-sm font-bold border-2 border-deep ${active ? 'bg-dream text-white' : 'bg-cream text-ink'}`

  return (
    <div className="min-h-screen relative">
      {!done && <LoadingScreen ready={!loading} onDone={() => setDone(true)} />}
      <BackgroundFX />
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 flex flex-col gap-5">
        <header className="pixel-box p-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col gap-3 items-center sm:items-start">
            {settings.logo_url && <img src={settings.logo_url} alt={settings.store_name} className="h-12 object-contain" />}
            <h1><Logo name={`${settings.store_name} ♡`} className="text-base sm:text-xl" /></h1>
            <p className="font-pixel text-[9px] sm:text-[10px] leading-5 min-h-[20px]">
              {done && <Typewriter text={settings.hero_subtitle} delay={200} />}
            </p>
          </div>
          <div className="pt-12"><PixelCat size={6} /></div>
        </header>

        <div className="pixel-box p-3 flex flex-col gap-3">
          <label className="relative block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-deep" />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="cari produk… (mis. netflix)"
              className="w-full min-h-[44px] pl-10 pr-3 border-2 border-deep bg-light rounded-none outline-none focus:bg-white" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={chip(cat === 'all')} onClick={() => setCat('all')}>Semua</button>
            {categories.map((c) => <button key={c.id} className={chip(cat === c.id)} onClick={() => setCat(c.id)}>{c.name}</button>)}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan harga"
            className="min-h-[44px] px-2 border-2 border-deep bg-cream rounded-none">
            <option value="default">Urutan toko</option>
            <option value="asc">Harga termurah</option>
            <option value="desc">Harga termahal</option>
          </select>
        </div>

        {error && <div className="pixel-box p-3 text-sm">Ups, data belum bisa dimuat: {error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="pixel-box h-72 animate-pulse bg-lilac" />)}
          </div>
        ) : list.length === 0 ? (
          <div className="pixel-box p-8 flex flex-col items-center gap-6 text-center">
            <PixelCat size={6} />
            <p className="mt-6 font-bold">{products.length ? 'Produk tidak ditemukan, coba kata lain ♡' : 'Belum ada produk, mampir lagi nanti ♡'}</p>
          </div>
        ) : (
          <>
            <p className="font-pixel text-[9px] text-ink">{list.length} produk</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {list.map((p, i) => <Card key={p.id} p={p} catName={catName[p.category_id]} i={i} />)}
            </div>
          </>
        )}

        <footer className="pixel-box p-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            {settings.description && <p className="whitespace-pre-line mb-1">{settings.description}</p>}
            <p className="font-pixel text-[8px]">© {settings.store_name} ♡ {settings.tagline}</p>
          </div>
          <PixelBunny size={4} />
        </footer>
      </main>
    </div>
  )
}
