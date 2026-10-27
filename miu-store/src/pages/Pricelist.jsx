import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCatalog } from '../lib/useCatalog'
import { rupiah } from '../lib/format'
import BackgroundFX from '../components/BackgroundFX'
import LoadingScreen from '../components/LoadingScreen'
import Typewriter from '../components/Typewriter'
import Logo from '../components/pixel/Logo'
import PixelCat from '../components/pixel/PixelCat'
import PixelBunny from '../components/pixel/PixelBunny'

// Tab yang terbuka pertama kali (dan setelah tombol refresh).
// Ganti ke 'pricelist' kalau pembeli ingin langsung melihat katalog.
const INITIAL_TAB = 'home'

const TABS = [
  { id: 'home', label: 'Homepage', path: '' },
  { id: 'pricelist', label: 'Pricelist', path: 'pricelist' },
  { id: 'about', label: 'About Store', path: 'about' },
]

// Semua dekorasi hanya berada di dalam jendela browser.
// BackgroundFX (latar ungu bergerak milik Miu Store) TIDAK diubah dan tidak ditutup.
const kawaiiCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');

  .kw-root {
    font-family: 'Itim', 'Patrick Hand', 'Comic Sans MS', 'Chalkboard SE', ui-rounded, system-ui, sans-serif;
    color: #5a4a78;
  }
  .kw-root button, .kw-root input, .kw-root select { font-family: inherit; }
  .kw-root :focus-visible { outline: 3px solid #8e6bc9; outline-offset: 2px; }

  .kw-window {
    background: #b8d49a;
    border: 4px solid #86b060;
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 0 0 4px rgba(255, 252, 245, .7), 6px 9px 0 rgba(120, 90, 170, .3);
  }
  .kw-titlebar {
    padding: 12px 12px 0;
    background-color: #c9e3a5;
    background-image:
      radial-gradient(rgba(255, 255, 255, .6) 2px, transparent 2.5px),
      repeating-linear-gradient(0deg, transparent 0 9px, rgba(255, 255, 255, .28) 9px 11px);
    background-size: 16px 16px, auto;
  }
  .kw-tab {
    position: relative;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    min-height: 44px; min-width: 0; flex: 1 1 0;
    padding: 0 8px;
    border: 3px solid #86b060; border-bottom: 0;
    border-radius: 22px 22px 0 0;
    font-size: 15px; line-height: 1;
    color: #6b4a94;
    background-color: #e8d8f8;
    background-image: radial-gradient(rgba(255, 255, 255, .8) 2px, transparent 2.5px);
    background-size: 12px 12px;
    cursor: pointer;
    transition: background-color .15s;
  }
  .kw-tab:hover { background-color: #f1e6fc; }
  .kw-tab[aria-selected='true'] {
    background-color: #fff2c6; color: #4f7a3a;
    min-height: 50px; margin-bottom: -3px; z-index: 2;
  }
  .kw-tab:not([aria-selected='true']) { margin-top: 6px; }

  .kw-toolbar {
    background-color: #fff2c6;
    background-image: radial-gradient(rgba(255, 255, 255, .75) 2px, transparent 2.5px);
    background-size: 14px 14px;
    border-bottom: 3px solid #e3cc85;
    padding: 10px 12px;
  }
  .kw-navbtn {
    display: grid; place-items: center;
    width: 44px; height: 44px; flex: none;
    border: 3px solid #86b060; border-radius: 16px;
    background: #fffcf5; color: #4f7a3a;
    box-shadow: 2px 3px 0 rgba(134, 176, 96, .35);
    cursor: pointer;
    transition: transform .12s;
  }
  .kw-navbtn:active:not(:disabled) { transform: translate(2px, 3px); box-shadow: none; }
  .kw-navbtn:disabled { opacity: .4; cursor: not-allowed; box-shadow: none; }
  .kw-navbtn.lilac { border-color: #c8a8e9; background: #f3e9fd; color: #7a52b3; box-shadow: 2px 3px 0 rgba(200, 168, 233, .45); }
  .kw-navbtn.pink { border-color: #efb8d2; background: #fff0f6; color: #b9558a; box-shadow: 2px 3px 0 rgba(239, 184, 210, .5); }
  .kw-address {
    display: flex; align-items: center; gap: 8px;
    min-width: 0; flex: 1 1 0; min-height: 44px;
    padding: 0 14px;
    border: 3px solid #86b060; border-radius: 16px;
    background: #fffcf5; color: #5a4a78; font-size: 15px;
  }

  .kw-body {
    background-color: #fffcf5;
    background-image:
      linear-gradient(rgba(232, 216, 248, .30) 50%, transparent 50%),
      linear-gradient(90deg, rgba(232, 216, 248, .30) 50%, transparent 50%);
    background-size: 28px 28px;
  }
  .kw-paper {
    background-color: #fffcf5;
    background-image: radial-gradient(rgba(200, 168, 233, .22) 1.5px, transparent 2px);
    background-size: 16px 16px;
  }
  .kw-memo { box-shadow: 4px 5px 0 rgba(120, 90, 170, .16); }
  .kw-stitch { border: 2px dashed; pointer-events: none; }

  .kw-banner {
    background-color: #e8d8f8;
    background-image:
      radial-gradient(rgba(255, 255, 255, .7) 2.5px, transparent 3px),
      linear-gradient(115deg, #e8d8f8 0%, #f8d9e7 38%, #fff2c6 66%, #c9e3a5 100%);
    background-size: 18px 18px, auto;
  }
  .kw-bubble {
    border: 3px dashed #c8a8e9;
    border-radius: 26px;
    background: #fffcf5;
    box-shadow: 0 0 0 4px #fffcf5, 3px 5px 0 4px rgba(200, 168, 233, .4);
  }
  .kw-tape {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 6px;
    background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, .4) 0 6px, transparent 6px 12px);
    font-size: 14px; line-height: 1.4;
  }
  .kw-footer {
    border-top: 3px dashed #86b060;
    background-color: #c9e3a5;
    background-image: radial-gradient(rgba(255, 255, 255, .6) 2px, transparent 2.5px);
    background-size: 16px 16px;
  }
  .kw-bar {
    height: 14px;
    background: repeating-linear-gradient(90deg, #e8d8f8 0 44px, #f8d9e7 44px 88px, #c9e3a5 88px 132px, #fff2c6 132px 176px);
    border-bottom: 3px solid #e3cc85;
  }
  .kw-price-grid > * + * { border-top: 1px dashed #c8a8e9; }

  .kw-float { animation: kw-bob 4s ease-in-out infinite; }
  @keyframes kw-bob { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-5px) rotate(5deg); } }
  .kw-spin { animation: kw-rot .6s linear; }
  @keyframes kw-rot { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .kw-float, .kw-spin { animation: none; } }
`

// Tema warna kartu: lilac, hijau, pink, krem.
const cardThemes = [
  { bg: '#f4ebfd', border: '#c8a8e9', tape: '#e8d8f8', title: '#6b4a94', accent: '#e8d8f8' },
  { bg: '#f2f8e8', border: '#b8d49a', tape: '#c9e3a5', title: '#4f7a3a', accent: '#c9e3a5' },
  { bg: '#fff1f7', border: '#efb8d2', tape: '#f8d9e7', title: '#a24a7c', accent: '#f8d9e7' },
  { bg: '#fff8de', border: '#e6cf86', tape: '#fff2c6', title: '#86661f', accent: '#fff2c6' },
]

function Clover({ size = 22, color = '#8db766', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <g fill={color}>
        <circle cx="8" cy="8" r="5" />
        <circle cx="16" cy="8" r="5" />
        <circle cx="8" cy="16" r="5" />
        <circle cx="16" cy="16" r="5" />
      </g>
      <circle cx="12" cy="12" r="2.6" fill="#fffcf5" opacity=".75" />
    </svg>
  )
}

function variantsOf(product) {
  return Array.isArray(product.variants) ? product.variants.filter((v) => v && String(v.label || '').trim()) : []
}

function firstPrice(product) {
  const prices = variantsOf(product)
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n) && n >= 0)
  return prices.length ? Math.min(...prices) : Number(product.price) || 0
}

// Label lama admin: "Sharing 1P1U | 1 hari". Label biasa "1 hari" tetap didukung.
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

// Hanya dipakai untuk produk dengan variants lama.
// Baris opsional "@paket: Sharing 1P1U = catatan" menjadi catatan di grup harga.
// Baris lain tetap tampil sebagai teks bebas.
function parseDescription(description) {
  const notes = new Map()
  const general = []

  String(description || '').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*@paket\s*:\s*(.+?)\s*=\s*(.+?)\s*$/i)
    if (match) notes.set(match[1].trim().toLocaleLowerCase('id-ID'), match[2].trim())
    else general.push(line)
  })

  return { notes, general: general.join('\n').replace(/^(\s*\n)+/, '').trimEnd() }
}

function PriceRows({ items }) {
  return (
    <div className="kw-price-grid">
      {items.map((item) => (
        <div key={item.index} className="flex items-start justify-between gap-3 py-2 text-base first:pt-0 last:pb-0">
          <span className="min-w-0 break-words leading-6 text-[#5a4a78]">{item.duration}</span>
          <strong className="shrink-0 whitespace-nowrap font-normal text-[#7a52b3]">{rupiah(item.price)}</strong>
        </div>
      ))}
    </div>
  )
}

function GroupedPrices({ variants, notes }) {
  const groups = groupVariants(variants)
  const hasNamedGroups = groups.some((g) => Boolean(g.name))

  if (!hasNamedGroups) {
    return (
      <div className="rounded-2xl border-2 border-[#c8a8e9] bg-white/90 p-3">
        <PriceRows items={groups.flatMap((g) => g.items)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group, i) => {
        const theme = cardThemes[(i + 1) % cardThemes.length]
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
              className="absolute -right-2 -top-2 h-11 w-11 rounded-full opacity-60"
              style={{ background: theme.accent }}
            />
            <div className="relative mb-2 flex items-center gap-2 pr-5">
              <Heart aria-hidden="true" size={15} fill={theme.accent} color={theme.title} />
              <h4 className="break-words text-base font-normal" style={{ color: theme.title }}>
                {group.name || 'Pilihan lainnya'}
              </h4>
            </div>
            {note && <p className="relative mb-3 text-sm leading-5 text-[#6e5f8a]">{note}</p>}
            <div className="relative rounded-xl border border-white bg-white/85 p-3">
              <PriceRows items={group.items} />
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ProductCard({ product: p, catName, i }) {
  const theme = cardThemes[i % cardThemes.length]
  const variants = variantsOf(p)
  const out = !p.in_stock

  // Harga teks bebas: tampilkan apa adanya (enter, baris kosong, emoji, simbol).
  // Hanya produk dengan variants lama yang memakai parser "@paket".
  const rawDescription = String(p.description || '')
  const freeText = variants.length > 0
    ? parseDescription(rawDescription).general
    : rawDescription.replace(/^(\s*\r?\n)+/, '').trimEnd()
  const notes = variants.length > 0 ? parseDescription(rawDescription).notes : new Map()

  return (
    <article
      className="kw-memo reveal relative flex min-w-0 flex-col rounded-[24px] border-[3px] pt-3"
      style={{
        animationDelay: `${Math.min(i * 60, 480)}ms`,
        backgroundColor: theme.bg,
        borderColor: theme.border,
      }}
    >
      <span
        aria-hidden="true"
        className="kw-tape absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3"
        style={{ backgroundColor: theme.tape, opacity: 0.95 }}
      />

      <div className="relative px-3 pt-3">
        <div
          className="relative overflow-hidden rounded-2xl border-[3px] bg-white"
          style={{ borderColor: '#fffcf5', boxShadow: `0 0 0 2px ${theme.border}` }}
        >
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              loading="lazy"
              className={`aspect-[4/3] w-full object-cover ${out ? 'opacity-65 grayscale' : ''}`}
            />
          ) : (
            <div className="kw-paper grid aspect-[4/3] place-items-center">
              <PixelBunny size={6} />
            </div>
          )}
          <span
            className={`absolute bottom-2 left-2 rounded-full border-2 px-3 py-1 text-sm leading-none shadow-sm ${
              out
                ? 'border-[#b4aec0] bg-[#eeebf2] text-[#6f6a7c]'
                : 'border-[#9cc97a] bg-[#e9f7d6] text-[#4f7a3a]'
            }`}
          >
            {out ? 'HABIS' : 'TERSEDIA'}
          </span>
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute -right-1 top-1 text-2xl" style={{ color: theme.border }}>✿</span>
      </div>

      <div className="relative flex flex-1 flex-col gap-3 p-4">
        <div className="kw-stitch absolute inset-2 rounded-[18px]" style={{ borderColor: theme.border, opacity: 0.55 }} aria-hidden="true" />
        <div className="relative">
          {catName && (
            <span className="kw-tape mb-2" style={{ backgroundColor: theme.tape, color: theme.title }}>
              ✦ {catName}
            </span>
          )}
          <h3 className="break-words text-xl leading-snug" style={{ color: theme.title }}>{p.name}</h3>
          {(variants.length > 0 || firstPrice(p) > 0) && (
            <p className="mt-1 text-base text-[#b9558a]">
              {variants.length ? 'mulai ' : ''}{rupiah(firstPrice(p))}
            </p>
          )}
        </div>

        {variants.length > 0 && (
          <div className="relative">
            <GroupedPrices variants={variants} notes={notes} />
          </div>
        )}

        {freeText && (
          <div className="relative mt-auto rounded-2xl border-2 border-dashed bg-white/80 p-3" style={{ borderColor: theme.border }}>
            <p className="kw-tape mb-2" style={{ backgroundColor: theme.tape, color: theme.title }}>✎ daftar harga &amp; info ♡</p>
            <p className="whitespace-pre-wrap break-words text-base leading-6 text-[#5a4a78]">{freeText}</p>
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
  const [spinning, setSpinning] = useState(false)
  // Riwayat tab disimpan di state internal (bukan URL) supaya React Router & /admin aman.
  const [nav, setNav] = useState({ stack: [INITIAL_TAB], idx: 0 })
  const firstRender = useRef(true)
  const spinTimer = useRef(null)

  const tab = nav.stack[nav.idx]
  const canBack = nav.idx > 0
  const canForward = nav.idx < nav.stack.length - 1
  const currentTab = TABS.find((t) => t.id === tab) || TABS[0]

  const go = useCallback((next) => {
    setNav((n) => (n.stack[n.idx] === next
      ? n
      : { stack: [...n.stack.slice(0, n.idx + 1), next], idx: n.idx + 1 }))
  }, [])
  const goBack = () => setNav((n) => (n.idx > 0 ? { ...n, idx: n.idx - 1 } : n))
  const goForward = () => setNav((n) => (n.idx < n.stack.length - 1 ? { ...n, idx: n.idx + 1 } : n))
  const refresh = () => {
    setNav({ stack: [INITIAL_TAB], idx: 0 })
    setQ('')
    setCat('all')
    setSort('default')
    setSpinning(true)
    window.clearTimeout(spinTimer.current)
    spinTimer.current = window.setTimeout(() => setSpinning(false), 650)
  }

  useEffect(() => () => window.clearTimeout(spinTimer.current), [])

  useEffect(() => {
    document.title = `${settings.store_name || 'miu store'} ♡ ${settings.tagline || ''}`
  }, [settings.store_name, settings.tagline])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [tab])

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  const publishedCount = useMemo(() => products.filter((p) => p.is_published).length, [products])

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
    `min-h-[44px] rounded-full border-[3px] px-4 py-2 text-base leading-none transition-colors ${
      active
        ? 'border-[#a77fc6] bg-[#c8a8e9] text-white'
        : 'border-[#d9c4f0] bg-white/90 text-[#6b4a94] hover:bg-[#f3e9fd]'
    }`

  const storeName = settings.store_name || 'miu store'

  return (
    <div className="kw-root relative min-h-screen overflow-x-hidden">
      <style>{kawaiiCSS}</style>
      {!done && <LoadingScreen ready={!loading} onDone={() => setDone(true)} />}
      <BackgroundFX />

      <main className="relative z-10 mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-9">
        <div className="kw-window">
          {/* ===== Tab melengkung ===== */}
          <div className="kw-titlebar">
            <div role="tablist" aria-label="Halaman toko" className="flex items-end gap-1.5 sm:gap-2">
              {TABS.map((t) => {
                const active = t.id === tab
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`kw-tab-${t.id}`}
                    aria-selected={active}
                    aria-controls={`kw-panel-${t.id}`}
                    className="kw-tab"
                    onClick={() => go(t.id)}
                  >
                    {t.id === 'home' && <Clover size={18} className="hidden shrink-0 sm:block" />}
                    {t.id === 'pricelist' && <Heart size={16} aria-hidden="true" className="hidden shrink-0 text-[#c8689a] sm:block" fill="#f8d9e7" />}
                    {t.id === 'about' && <Star size={16} aria-hidden="true" className="hidden shrink-0 text-[#7a52b3] sm:block" fill="#e8d8f8" />}
                    <span className="truncate">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ===== Panah, refresh, address bar ===== */}
          <div className="kw-toolbar flex items-center gap-2">
            <button type="button" className="kw-navbtn" onClick={goBack} disabled={!canBack} aria-label="Kembali">
              <ArrowLeft size={22} aria-hidden="true" />
            </button>
            <button type="button" className="kw-navbtn" onClick={goForward} disabled={!canForward} aria-label="Maju">
              <ArrowRight size={22} aria-hidden="true" />
            </button>
            <button type="button" className="kw-navbtn pink" onClick={refresh} aria-label="Muat ulang tampilan">
              <RotateCw size={20} aria-hidden="true" className={spinning ? 'kw-spin' : ''} />
            </button>
            <div className="kw-address" aria-label="Alamat halaman">
              <Clover size={20} className="shrink-0" />
              <span className="min-w-0 truncate">https://miu.store/{currentTab.path}</span>
            </div>
          </div>
          <div className="kw-bar" aria-hidden="true" />

          {/* ===== Isi halaman ===== */}
          <div
            role="tabpanel"
            id={`kw-panel-${tab}`}
            aria-labelledby={`kw-tab-${tab}`}
            className="kw-body min-w-0 p-3 sm:p-6"
          >
            {tab === 'home' && (
              <div className="flex flex-col gap-5">
                <section className="kw-banner kw-memo relative overflow-hidden rounded-[24px] border-[3px] border-[#c8a8e9] p-4 sm:p-6">
                  <span aria-hidden="true" className="kw-float pointer-events-none absolute right-4 top-3 text-2xl text-[#e58bb8]">✿</span>
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-4 text-2xl text-[#86b060]">✦</span>
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-8 text-xl text-[#c8a8e9]">♡</span>
                  <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                    <div className="shrink-0 rounded-[28px] border-[3px] border-dashed border-[#b8d49a] bg-[#fffcf5] p-4">
                      <PixelCat size={6} />
                    </div>
                    <div className="kw-bubble min-w-0 flex-1 px-5 py-4 text-center sm:text-left">
                      <p className="min-h-[28px] break-words text-lg leading-7 text-[#6b4a94]">
                        {done && <Typewriter text={settings.hero_subtitle || 'a little dreamy diary ♡'} delay={200} />}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="grid min-w-0 gap-5 md:grid-cols-5">
                  <section className="kw-paper kw-memo relative flex min-w-0 flex-col items-center gap-3 rounded-[24px] border-[3px] border-[#b8d49a] p-5 text-center sm:p-7 md:col-span-3 md:items-start md:text-left">
                    <span className="kw-tape bg-[#f8d9e7] text-[#a24a7c]">♡ hello, friend!</span>
                    {settings.logo_url && (
                      <img src={settings.logo_url} alt={`Logo ${storeName}`} className="max-h-16 max-w-[180px] object-contain" />
                    )}
                    <h1 className="break-words text-3xl leading-tight text-[#7a52b3] sm:text-4xl">welcome to miu store! ♡</h1>
                    <p className="flex flex-wrap items-center justify-center gap-2 text-xl text-[#4f7a3a] md:justify-start">
                      <Clover size={22} />
                      your little dreamy digital shop ✿
                    </p>
                    <button
                      type="button"
                      onClick={() => go('pricelist')}
                      className="mt-2 inline-flex min-h-[52px] items-center gap-2 rounded-full border-[3px] border-[#a77fc6] bg-[#c8a8e9] px-6 text-xl text-white shadow-[3px_4px_0_rgba(120,90,170,.35)] transition-transform hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <Sparkles size={20} aria-hidden="true" />
                      explore pricelist ♡
                    </button>
                  </section>

                  <aside className="kw-paper kw-memo relative min-w-0 rounded-[24px] border-[3px] border-[#c8a8e9] p-5 md:col-span-2">
                    <div className="mb-3 flex items-center gap-2 text-lg text-[#6b4a94]">
                      <Flower2 size={20} aria-hidden="true" className="text-[#e58bb8]" />
                      info toko
                    </div>
                    <dl className="flex flex-col gap-3 text-base">
                      <div>
                        <dt className="kw-tape bg-[#f8d9e7] text-[#a24a7c]">toko</dt>
                        <dd className="mt-1 break-words">{storeName}</dd>
                      </div>
                      {settings.tagline && (
                        <div>
                          <dt className="kw-tape bg-[#e8d8f8] text-[#6b4a94]">tagline</dt>
                          <dd className="mt-1 break-words">{settings.tagline}</dd>
                        </div>
                      )}
                      {!loading && (
                        <div>
                          <dt className="kw-tape bg-[#c9e3a5] text-[#4f7a3a]">katalog</dt>
                          <dd className="mt-1">{publishedCount} produk · {categories.length} kategori</dd>
                        </div>
                      )}
                    </dl>
                  </aside>
                </div>
              </div>
            )}

            {tab === 'pricelist' && (
              <div className="flex min-w-0 flex-col gap-5">
                {/* Pencarian & filter */}
                <section aria-label="Cari dan filter produk" className="kw-paper kw-memo relative rounded-[22px] border-[3px] border-[#c8a8e9] p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-lg text-[#6b4a94]">
                    <span className="text-xl text-[#e58bb8]">✿</span>
                    find your favorite ♡
                  </div>
                  <label className="relative block">
                    <span className="sr-only">Cari produk</span>
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7ec0]" aria-hidden="true" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      type="search"
                      placeholder="cari produk… (mis. netflix)"
                      className="min-h-[50px] w-full rounded-2xl border-[3px] border-[#d9c4f0] bg-white px-3 pl-11 text-base text-[#5a4a78] outline-none focus:border-[#a77fc6]"
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
                  <label className="mt-3 flex flex-wrap items-center gap-2 text-base text-[#6b4a94]">
                    Urutkan:
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="min-h-[44px] flex-1 rounded-xl border-[3px] border-[#d9c4f0] bg-white px-3 text-base text-[#5a4a78] sm:flex-none"
                    >
                      <option value="default">Urutan toko</option>
                      <option value="asc">Harga termurah</option>
                      <option value="desc">Harga termahal</option>
                    </select>
                  </label>
                </section>

                {error && (
                  <div role="alert" className="rounded-2xl border-[3px] border-[#efb8d2] bg-[#fff1f7] p-3 text-base text-[#8d4a6c]">
                    Ups, data belum bisa dimuat: {error}
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="h-72 animate-pulse rounded-[24px] border-[3px] border-[#d9c4f0] bg-[#f6effd]" />
                    ))}
                  </div>
                ) : list.length === 0 ? (
                  <div className="kw-paper kw-memo flex flex-col items-center gap-4 rounded-[22px] border-[3px] border-[#c8a8e9] p-8 text-center">
                    <PixelCat size={6} />
                    <p className="text-lg text-[#6b4a94]">
                      {products.length ? 'Produk tidak ditemukan, coba kata lain ♡' : 'Belum ada produk, mampir lagi nanti ♡'}
                    </p>
                  </div>
                ) : (
                  <section aria-label="Daftar produk">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="kw-tape bg-[#f8d9e7] text-[#a24a7c]">✿ {list.length} produk</span>
                      <span className="text-base text-[#9a7ec0]">✦ ✦ ✦</span>
                    </div>
                    <div className="grid grid-cols-1 items-start gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((p, i) => (
                        <ProductCard key={p.id} product={p} catName={categoryNames[p.category_id]} i={i} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {tab === 'about' && (
              <section className="kw-paper kw-memo relative mx-auto flex max-w-2xl min-w-0 flex-col items-center gap-4 overflow-hidden rounded-[24px] border-[3px] border-[#c8a8e9] p-5 text-center sm:p-8">
                <span aria-hidden="true" className="kw-float pointer-events-none absolute right-4 top-3 text-2xl text-[#e58bb8]">✿</span>
                <span aria-hidden="true" className="pointer-events-none absolute left-4 top-4 text-xl text-[#86b060]">✦</span>
                <span className="kw-tape bg-[#c9e3a5] text-[#4f7a3a]">about store ♡</span>
                {settings.logo_url && (
                  <img src={settings.logo_url} alt={`Logo ${storeName}`} className="max-h-24 max-w-[220px] object-contain" />
                )}
                <h2 className="break-words text-[#7a52b3]">
                  <Logo name={`${storeName} ♡`} className="text-lg sm:text-2xl" />
                </h2>
                {settings.tagline && (
                  <p className="kw-bubble max-w-full break-words px-5 py-2 text-lg text-[#6b4a94]">{settings.tagline}</p>
                )}
                {settings.description ? (
                  <div className="w-full rounded-2xl border-[3px] border-dashed border-[#b8d49a] bg-white/85 p-4 text-left">
                    <p className="whitespace-pre-wrap break-words text-base leading-7 text-[#5a4a78]">{settings.description}</p>
                  </div>
                ) : (
                  !loading && <p className="text-base text-[#7d6c98]">Deskripsi toko belum diisi ♡</p>
                )}
                <div className="flex items-center gap-3 text-[#c8a8e9]" aria-hidden="true">
                  <Clover size={22} />
                  <PixelBunny size={4} />
                  <Clover size={22} color="#c8a8e9" />
                </div>
              </section>
            )}
          </div>

          {/* ===== Footer berjahit ===== */}
          <div className="kw-footer flex justify-center px-4 py-4">
            <span className="max-w-full truncate rounded-full border-[3px] border-dashed border-[#86b060] bg-[#fffcf5] px-5 py-2 text-base text-[#4f7a3a]">
              by {storeName} ♡ {settings.tagline || 'tiny pixels, lovely finds'}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
