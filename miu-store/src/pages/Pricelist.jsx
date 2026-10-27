import { useEffect, useMemo, useState } from 'react'
import { Search, Sparkles, Heart, Flower2 } from 'lucide-react'
import { useCatalog } from '../lib/useCatalog'
import { rupiah } from '../lib/format'
import BackgroundFX from '../components/BackgroundFX'
import LoadingScreen from '../components/LoadingScreen'
import Typewriter from '../components/Typewriter'
import Logo from '../components/pixel/Logo'
import PixelCat from '../components/pixel/PixelCat'
import PixelBunny from '../components/pixel/PixelBunny'

// Semua dekorasi summer hanya berada di konten pricelist.
// BackgroundFX (latar bergerak milik Miu Store) TIDAK diubah.
const summerCSS = `
  .miu-paper {
    background-color: #fffefa;
    background-image:
      linear-gradient(rgba(157, 213, 241, .17) 1px, transparent 1px),
      linear-gradient(90deg, rgba(157, 213, 241, .17) 1px, transparent 1px);
    background-size: 23px 23px;
  }
  .miu-diary-shadow { box-shadow: 5px 6px 0 rgba(101, 153, 210, .17), 0 10px 28px rgba(99, 79, 146, .08); }
  .miu-product-shadow { box-shadow: 4px 5px 0 rgba(155, 145, 207, .20); }
  .miu-ring { width: 21px; height: 29px; border: 5px solid #91c6ef; border-radius: 999px; background: transparent; box-shadow: inset 2px 0 #e8f8ff; }
  .miu-tab { border: 2px solid #92c6e9; border-bottom: 0; border-radius: 13px 13px 0 0; box-shadow: 2px -2px 0 rgba(146, 198, 233, .15); }
  .miu-price-grid > * + * { border-top: 1px dashed #c9daea; }
  .miu-float { animation: miu-bob 4s ease-in-out infinite; }
  @keyframes miu-bob { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-5px) rotate(5deg); } }
  @media (prefers-reduced-motion: reduce) { .miu-float { animation: none; } }
`

const groupColors = [
  { bg: '#fff0f8', border: '#e9a8d1', title: '#a84b8f', accent: '#ffbddb' },
  { bg: '#ecfaff', border: '#a4d9ef', title: '#377ea8', accent: '#b2eaff' },
  { bg: '#f2ffec', border: '#bde4a7', title: '#608e4b', accent: '#d2f3b5' },
  { bg: '#fff9e9', border: '#f2d69b', title: '#a97b3d', accent: '#ffe6a3' },
]

function variantsOf(product) {
  return Array.isArray(product.variants) ? product.variants.filter((v) => v && String(v.label || '').trim()) : []
}

function firstPrice(product) {
  const prices = variantsOf(product)
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n) && n >= 0)
  return prices.length ? Math.min(...prices) : Number(product.price) || 0
}

// Label admin: "Sharing 1P1U | 1 hari". Label lama "1 hari" tetap didukung.
function groupVariants(variants) {
  const groups = []
  const positions = new Map()

  variants.forEach((variant, index) => {
    const label = String(variant.label || '').trim()
    const divider = label.indexOf('|')
    const hasGroup = divider > 0 && label.slice(divider + 1).trim().length > 0
    const name = hasGroup ? label.slice(0, divider).trim() : ''
    const duration = hasGroup ? label.slice(divider + 1).trim() : label
    const id = name ? `group:${name.toLocaleLowerCase('id-ID')}` : 'ungrouped'

    if (!positions.has(id)) {
      positions.set(id, groups.length)
      groups.push({ id, name, items: [] })
    }
    groups[positions.get(id)].items.push({ index, duration, price: variant.price })
  })

  return groups
}

// Baris opsional dalam Deskripsi Admin:
// @paket: Sharing 1P1U = Jarang limit screen
// Baris lain tetap menjadi catatan umum produk.
function parseDescription(description) {
  const notes = new Map()
  const general = []

  String(description || '').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*@paket\s*:\s*(.+?)\s*=\s*(.+?)\s*$/i)
    if (match) notes.set(match[1].trim().toLocaleLowerCase('id-ID'), match[2].trim())
    else general.push(line)
  })

  return { notes, general: general.join('\n').trim() }
}

function PriceRows({ items }) {
  return (
    <div className="miu-price-grid">
      {items.map((item) => (
        <div key={item.index} className="flex items-start justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
          <span className="min-w-0 break-words leading-5 text-[#5e6085]">{item.duration}</span>
          <strong className="shrink-0 whitespace-nowrap font-extrabold text-[#4e5384]">{rupiah(item.price)}</strong>
        </div>
      ))}
    </div>
  )
}

function GroupedPrices({ variants, notes }) {
  const groups = groupVariants(variants)
  const hasNamedGroups = groups.some((g) => Boolean(g.name))

  // Produk biasa tidak dipaksa mempunyai nama paket.
  if (!hasNamedGroups) {
    return (
      <div className="rounded-2xl border-2 border-[#b9dff0] bg-white/90 p-3">
        <PriceRows items={groups.flatMap((g) => g.items)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group, i) => {
        const theme = groupColors[i % groupColors.length]
        const note = group.name ? notes.get(group.name.toLocaleLowerCase('id-ID')) : null
        return (
          <section
            key={group.id}
            aria-label={group.name || 'Pilihan lainnya'}
            className="relative overflow-hidden rounded-[18px] border-2 p-3"
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          >
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 h-11 w-11 rounded-full opacity-40"
              style={{ background: theme.accent }}
            />
            <div className="relative mb-2 flex items-center gap-2 pr-5">
              <Heart aria-hidden="true" size={14} fill={theme.accent} color={theme.title} />
              <h4 className="break-words text-sm font-extrabold" style={{ color: theme.title }}>
                {group.name || 'Pilihan lainnya'}
              </h4>
            </div>
            {note && <p className="relative mb-3 text-xs italic leading-5 text-[#6e7297]">{note}</p>}
            <div className="relative rounded-xl border border-white bg-white/80 p-3">
              <PriceRows items={group.items} />
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ProductCard({ product: p, catName, i }) {
  const variants = variantsOf(p)
  const out = !p.in_stock
  const { notes, general } = parseDescription(p.description)

  return (
    <article
      className="miu-product-shadow reveal flex min-w-0 flex-col overflow-hidden rounded-[24px] border-[3px] border-[#afd4ec] bg-[#fffefa]"
      style={{ animationDelay: `${Math.min(i * 60, 480)}ms` }}
    >
      <div className="relative overflow-hidden bg-[#e3f6ff]">
        <div className="absolute left-4 top-0 z-10 flex gap-2" aria-hidden="true">
          <span className="h-3 w-12 rounded-b-lg border-2 border-t-0 border-[#a0d1e8] bg-[#ffcce4]" />
          <span className="h-3 w-8 rounded-b-lg border-2 border-t-0 border-[#a0d1e8] bg-[#fff0ac]" />
        </div>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className={`aspect-[4/3] w-full object-cover ${out ? 'grayscale opacity-65' : ''}`}
          />
        ) : (
          <div className="miu-paper grid aspect-[4/3] place-items-center">
            <PixelBunny size={6} />
          </div>
        )}
        <span
          className={`absolute bottom-3 left-3 rounded-full border-2 px-3 py-1 text-[11px] font-extrabold shadow-sm ${out ? 'border-[#aab1bc] bg-[#eaebef] text-[#6b7181]' : 'border-[#99d2a0] bg-[#e7ffdc] text-[#538554]'}`}
        >
          {out ? 'HABIS' : 'TERSEDIA'}
        </span>
        <span aria-hidden="true" className="absolute bottom-2 right-3 text-2xl text-white drop-shadow-sm">✿</span>
      </div>

      <div className="miu-paper flex flex-1 flex-col gap-3 p-4">
        <div>
          {catName && (
            <span className="mb-2 inline-block rounded-full border border-[#f6bfda] bg-[#fff0f9] px-3 py-1 text-[10px] font-bold text-[#b55c90]">
              ✦ {catName}
            </span>
          )}
          <h3 className="break-words text-lg font-extrabold leading-snug text-[#595380]">{p.name}</h3>
{(variants.length > 0 || firstPrice(p) > 0) && (
  <p className="mt-1 text-sm font-extrabold text-[#cf77a9]">
    {variants.length ? 'mulai ' : ''}{rupiah(firstPrice(p))}
  </p>
)}            {variants.length ? 'mulai ' : ''}{rupiah(firstPrice(p))}
          </p>
        </div>

        {variants.length > 0 && <GroupedPrices variants={variants} notes={notes} />}

        {general && (
          <div className="mt-auto rounded-2xl border-2 border-dashed border-[#eac8df] bg-[#fff7fc] p-3">
            <p className="mb-1 text-xs font-extrabold text-[#aa6a98]">✎ ♡ Daftar Harga & Info Paket</p>
            <p className="whitespace-pre-line break-words text-xs leading-5 text-[#706984]">{general}</p>
          </div>
        )}
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

  useEffect(() => {
    document.title = `${settings.store_name || 'miu store'} ♡ ${settings.tagline || ''}`
  }, [settings.store_name, settings.tagline])

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  const list = useMemo(() => {
    let result = products.filter((p) => p.is_published)
    if (cat !== 'all') result = result.filter((p) => p.category_id === cat)

    const term = q.trim().toLocaleLowerCase('id-ID')
    if (term) {
      result = result.filter((p) => {
        const labels = variantsOf(p).map((v) => v.label).join(' ')
        return `${p.name || ''} ${p.description || ''} ${labels}`
          .toLocaleLowerCase('id-ID')
          .includes(term)
      })
    }

    if (sort === 'asc') result = [...result].sort((a, b) => firstPrice(a) - firstPrice(b))
    if (sort === 'desc') result = [...result].sort((a, b) => firstPrice(b) - firstPrice(a))
    return result
  }, [products, cat, q, sort])

  const chipClass = (active) =>
    `min-h-[40px] rounded-full border-2 px-3 py-2 text-xs font-extrabold transition-colors ${
      active
        ? 'border-[#a77fc6] bg-[#bca1ef] text-white'
        : 'border-[#bbdcee] bg-white/85 text-[#66668a] hover:bg-[#fff2fa]'
    }`

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <style>{summerCSS}</style>
      {!done && <LoadingScreen ready={!loading} onDone={() => setDone(true)} />}
      <BackgroundFX />

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-5 px-4 py-7 sm:px-6">
        {/* Summer diary header; animated site background tetap di belakang. */}
        <div className="relative pt-5">
          <div aria-hidden="true" className="absolute left-8 top-0 h-7 w-24 rounded-t-2xl border-[3px] border-b-0 border-[#a8d6ed] bg-[#ffd0e7] sm:left-14" />
          <div aria-hidden="true" className="absolute left-36 top-1 h-6 w-16 rounded-t-2xl border-[3px] border-b-0 border-[#a8d6ed] bg-[#fff5c9] sm:left-44" />
          <header className="miu-paper miu-diary-shadow relative overflow-hidden rounded-[26px] border-[3px] border-[#9ed6f2] px-5 pb-6 pt-7 sm:px-9">
            <div className="pointer-events-none absolute left-2 top-8 hidden flex-col gap-9 sm:flex" aria-hidden="true">
              {[0, 1, 2].map((j) => <span key={j} className="miu-ring -ml-4" />)}
            </div>
            <span aria-hidden="true" className="miu-float absolute right-6 top-4 text-2xl text-[#f9a8c9]">✿</span>
            <span aria-hidden="true" className="absolute bottom-3 left-6 text-2xl text-[#a3e5cb]">✦</span>
            <span aria-hidden="true" className="absolute bottom-2 right-20 text-xl text-[#ffd0a6]">♡</span>
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:items-start sm:pl-4 sm:text-left">
                {settings.logo_url && (
                  <img src={settings.logo_url} alt={`Logo ${settings.store_name}`} className="max-h-14 max-w-[160px] object-contain" />
                )}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Sparkles size={20} className="text-[#ff99c5]" aria-hidden="true" />
                  <h1 className="break-words text-[#a362ab]">
                    <Logo name={`${settings.store_name || 'miu store'} ♡`} className="text-base sm:text-xl" />
                  </h1>
                </div>
                <p className="min-h-[26px] max-w-lg font-pixel text-[9px] leading-6 text-[#729bc1] sm:text-[10px]">
                  {done && <Typewriter text={settings.hero_subtitle || 'a little summer diary ♡'} delay={200} />}
                </p>
                <div className="flex items-center gap-2 rounded-full border border-[#badff1] bg-white/90 px-3 py-1 text-xs font-semibold text-[#78a4be]">
                  <Flower2 size={14} aria-hidden="true" />
                  your tiny pastel corner
                  <Heart size={12} aria-hidden="true" />
                </div>
              </div>
              <div className="shrink-0 rounded-full border-2 border-[#c6e6f5] bg-[#f9edff]/75 p-4">
                <PixelCat size={6} />
              </div>
            </div>
          </header>
        </div>

        {/* Search notebook */}
        <section aria-label="Cari dan filter produk" className="miu-diary-shadow relative rounded-[22px] border-[3px] border-[#add9ef] bg-[#f8fdff]/95 p-4">
          <div aria-hidden="true" className="absolute right-4 top-0 flex gap-2">
            <span className="miu-tab h-3 w-11 bg-[#ffdaec]" />
            <span className="miu-tab h-3 w-9 bg-[#daf6cb]" />
          </div>
          <div className="mb-3 flex items-center gap-2 font-extrabold text-[#708eb8]">
            <span className="text-lg text-[#f49dc4]">✿</span>
            Find your favorite ♡
          </div>
          <label className="relative block">
            <span className="sr-only">Cari produk</span>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fb2cb]" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="cari produk… (mis. netflix)"
              className="min-h-[46px] w-full rounded-2xl border-2 border-[#b8dcec] bg-white px-3 pl-10 text-sm text-[#50577e] outline-none focus:border-[#d4a5df]"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={chipClass(cat === 'all')} onClick={() => setCat('all')}>Semua ♡</button>
            {categories.map((c) => (
              <button type="button" key={c.id} className={chipClass(cat === c.id)} onClick={() => setCat(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
          <label className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[#6e88ad]">
            Urutkan:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-[42px] flex-1 rounded-xl border-2 border-[#b8dcec] bg-white px-3 text-sm text-[#565b80] sm:flex-none"
            >
              <option value="default">Urutan toko</option>
              <option value="asc">Harga termurah</option>
              <option value="desc">Harga termahal</option>
            </select>
          </label>
        </section>

        {error && (
          <div role="alert" className="rounded-2xl border-2 border-[#eaa8bb] bg-[#fff1f5] p-3 text-sm text-[#8d5366]">
            Ups, data belum bisa dimuat: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-72 animate-pulse rounded-[24px] border-2 border-[#b7dcef] bg-[#f4faff]" />)}
          </div>
        ) : list.length === 0 ? (
          <div className="miu-paper miu-diary-shadow flex flex-col items-center gap-4 rounded-[22px] border-[3px] border-[#b4d9ec] p-8 text-center">
            <PixelCat size={6} />
            <p className="font-bold text-[#69618c]">
              {products.length ? 'Produk tidak ditemukan, coba kata lain ♡' : 'Belum ada produk, mampir lagi nanti ♡'}
            </p>
          </div>
        ) : (
          <section aria-label="Daftar produk">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full border-2 border-[#efbdd9] bg-[#fff0f9] px-3 py-1 text-xs font-extrabold text-[#ac75a4]">
                ✿ {list.length} produk
              </span>
              <span className="text-sm text-[#91b4d7]">✦ ✦ ✦</span>
            </div>
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => (
                <ProductCard key={p.id} product={p} catName={categoryNames[p.category_id]} i={i} />
              ))}
            </div>
          </section>
        )}

        <footer className="miu-paper miu-diary-shadow rounded-[22px] border-[3px] border-[#add9ef] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-sm text-[#6a7194]">
              {settings.description && <p className="mb-2 whitespace-pre-line break-words">{settings.description}</p>}
              <p className="font-pixel text-[8px] leading-5 text-[#9b7bad]">
                © {settings.store_name || 'miu store'} ♡ {settings.tagline || 'tiny pixels, lovely finds ♡'}
              </p>
            </div>
            <PixelBunny size={4} />
          </div>
        </footer>
      </main>
    </div>
  )
}
