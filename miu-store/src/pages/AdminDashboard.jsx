import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LogOut, Pencil, Plus, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../lib/useAdmin'
import { useCatalog } from '../lib/useCatalog'
import { uploadImage } from '../lib/upload'
import { parseVariants, rupiah, variantsToText } from '../lib/format'
import BackgroundFX from '../components/BackgroundFX'
import Logo from '../components/pixel/Logo'
import PixelCat from '../components/pixel/PixelCat'

const inp = 'w-full min-h-[44px] px-3 py-2 border-2 border-deep bg-light rounded-none outline-none focus:bg-white'
const Field = ({ label, children }) => <label className="flex flex-col gap-1 text-sm font-bold">{label}{children}</label>
const danger = { background: '#4B3768' }

function ProductForm({ product, categories, toast, reload, onClose }) {
  const TABS = [
  { id: 'home', label: 'Homepage', path: '' },
  { id: 'pricelist', label: 'Pricelist', path: 'pricelist' },
  { id: 'about', label: 'About Store', path: 'about' },
]

// Semua dekorasi hanya berada di dalam jendela browser.
// BackgroundFX (latar ungu bergerak milik Miu Store) TIDAK diubah dan tidak ditutup.
const kawaiiCSS = `
  const save = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const image_url = file ? await uploadImage(file) : f.image_url
      const variants = []
const freePriceText = f.variantsText.trim()
      const price = parseInt(String(f.price).replace(/\D/g, ''), 10) || (variants.length ? Math.min(...variants.map((v) => v.price)) : 0)
const row = {
  name: f.name.trim(),
  price,
  category_id: f.category_id || null,
  description: freePriceText,
  variants,
  image_url,
  in_stock: f.in_stock,
  is_published: f.is_published
}      const { error } = product
        ? await supabase.from('products').update(row).eq('id', product.id)
        : await supabase.from('products').insert(row)
      if (error) throw error
      toast('Tersimpan ♡'); await reload(); onClose()
    } catch (err) { toast('Gagal: ' + err.message) } finally { setBusy(false) }
  }

  const preview = file ? URL.createObjectURL(file) : f.image_url
  return (
    <form onSubmit={save} className="pixel-box p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <b className="font-pixel text-[10px]">{product ? 'edit produk' : 'produk baru'}</b>
        <button type="button" onClick={onClose} aria-label="Tutup"><X /></button>
      </div>
      <Field label="Nama produk"><input className={inp} required value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
      <Field label="Harga (Rp) — kosongkan jika pakai varian"><input className={inp} inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value)} /></Field>
     <Field label="Daftar Harga Bebas ♡">
  <textarea
    className={inp}
    rows={10}
    value={f.variantsText}
    onChange={(e) => set('variantsText', e.target.value)}
    placeholder={'♡ SHARING 1P1U\n1 hari — 4k\n7 hari — 15k\n\n♡ PRIVATE\n1 bulan — 150k'}
  />
</Field>
      <Field label="Kategori">
        <select className={inp} value={f.category_id} onChange={(e) => set('category_id', e.target.value)}>
          <option value="">— tanpa kategori —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Foto produk (dari galeri HP)">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </Field>
      {preview && <img src={preview} alt="preview" className="h-28 w-28 object-cover border-2 border-deep" />}
      <label className="flex items-center gap-2 min-h-[44px]"><input type="checkbox" className="h-5 w-5" checked={f.in_stock} onChange={(e) => set('in_stock', e.target.checked)} /> Tersedia (hapus centang = HABIS)</label>
      <label className="flex items-center gap-2 min-h-[44px]"><input type="checkbox" className="h-5 w-5" checked={f.is_published} onChange={(e) => set('is_published', e.target.checked)} /> Tampilkan di pricelist publik</label>
      <button className="pixel-btn" disabled={busy}>{busy ? 'menyimpan…' : 'Simpan'}</button>
    </form>
  )
}

function ProductsTab({ categories, products, toast, reload }) {
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const del = async (p) => {
    if (!window.confirm(`Hapus "${p.name}"? Tidak bisa dibatalkan.`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    toast(error ? 'Gagal: ' + error.message : 'Produk dihapus'); reload()
  }
  if (editing) return <ProductForm product={editing === 'new' ? null : editing} categories={categories} toast={toast} reload={reload} onClose={() => setEditing(null)} />
  return (
    <div className="flex flex-col gap-3">
      <button className="pixel-btn inline-flex items-center justify-center gap-2" onClick={() => setEditing('new')}><Plus size={16} /> Produk baru</button>
      {products.length === 0 && <p className="pixel-box p-4 text-sm">Belum ada produk. Tekan "Produk baru" ♡</p>}
      {products.map((p) => (
        <div key={p.id} className="pixel-box p-3 flex items-center gap-3">
          {p.image_url ? <img src={p.image_url} alt="" className="h-14 w-14 object-cover border-2 border-deep" /> : <div className="h-14 w-14 bg-lilac border-2 border-deep" />}
          <div className="flex-1 min-w-0">
            <b className="block truncate">{p.name}</b>
            <span className="text-xs">{rupiah(p.price)} · {catName[p.category_id] || 'tanpa kategori'} · {p.in_stock ? 'tersedia' : 'HABIS'}{p.is_published ? '' : ' · disembunyikan'}</span>
          </div>
          <button aria-label="Edit" className="p-2" onClick={() => setEditing(p)}><Pencil size={18} /></button>
          <button aria-label="Hapus" className="p-2" onClick={() => del(p)}><Trash2 size={18} /></button>
        </div>
      ))}
    </div>
  )
}

function CategoriesTab({ categories, toast, reload }) {
  const [name, setName] = useState('')
  const [names, setNames] = useState({})
  const run = async (q, msg) => { const { error } = await q; toast(error ? 'Gagal: ' + error.message : msg); reload() }
  return (
    <div className="flex flex-col gap-3">
      <form className="pixel-box p-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { run(supabase.from('categories').insert({ name: name.trim() }), 'Kategori ditambah ♡'); setName('') } }}>
        <input className={inp} placeholder="kategori baru" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="pixel-btn">Tambah</button>
      </form>
      {categories.map((c) => (
        <div key={c.id} className="pixel-box p-3 flex gap-2 items-center">
          <input className={inp} value={names[c.id] ?? c.name} onChange={(e) => setNames({ ...names, [c.id]: e.target.value })} />
          <button className="pixel-btn" onClick={() => run(supabase.from('categories').update({ name: (names[c.id] ?? c.name).trim() }).eq('id', c.id), 'Kategori disimpan')}>Simpan</button>
          <button aria-label="Hapus" className="p-2" onClick={() => window.confirm(`Hapus kategori "${c.name}"? Produknya jadi tanpa kategori.`) && run(supabase.from('categories').delete().eq('id', c.id), 'Kategori dihapus')}><Trash2 size={18} /></button>
        </div>
      ))}
    </div>
  )
}

function SettingsTab({ settings, toast, reload }) {
  const [f, setF] = useState(settings)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const logo_url = file ? await uploadImage(file, 'logo') : f.logo_url
      const { error } = await supabase.from('settings').update({ store_name: f.store_name, tagline: f.tagline, hero_subtitle: f.hero_subtitle, description: f.description, logo_url }).eq('id', 1)
      if (error) throw error
      toast('Identitas toko tersimpan ♡'); reload()
    } catch (err) { toast('Gagal: ' + err.message) } finally { setBusy(false) }
  }
  return (
    <form onSubmit={save} className="pixel-box p-4 flex flex-col gap-3">
      <Field label="Nama toko"><input className={inp} required value={f.store_name} onChange={(e) => set('store_name', e.target.value)} /></Field>
      <Field label="Tagline"><input className={inp} value={f.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
      <Field label="Teks di bawah nama toko"><input className={inp} value={f.hero_subtitle} onChange={(e) => set('hero_subtitle', e.target.value)} /></Field>
      <Field label="Deskripsi toko (footer)"><textarea className={inp} rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} /></Field>
      <Field label="Logo (opsional)"><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field>
      {(file || f.logo_url) && <img src={file ? URL.createObjectURL(file) : f.logo_url} alt="logo" className="h-16 object-contain self-start" />}
      <button className="pixel-btn" disabled={busy}>{busy ? 'menyimpan…' : 'Simpan'}</button>
    </form>
  )
}

export default function AdminDashboard() {
  const adm = useAdmin()
  const cat = useCatalog()
  const [tab, setTab] = useState('produk')
  const [msg, setMsg] = useState('')
  const toast = (t) => { setMsg(t); setTimeout(() => setMsg(''), 3000) }

  if (adm.status === 'loading') return <p className="p-6 font-pixel text-[10px]">loading…</p>
  if (adm.status !== 'ok') return <Navigate to="/admin" replace />

  const total = cat.products.length
  const avail = cat.products.filter((p) => p.in_stock).length
  const tabBtn = (k, l) => <button key={k} onClick={() => setTab(k)} className={`flex-1 min-h-[44px] font-bold border-2 border-deep ${tab === k ? 'bg-dream text-white' : 'bg-cream'}`}>{l}</button>

  return (
    <div className="min-h-screen relative">
      <BackgroundFX />
      <div className="relative z-10 mx-auto max-w-2xl p-4 flex flex-col gap-4">
        <header className="pixel-box p-3 flex items-center justify-between gap-2">
          <Logo name={cat.settings.store_name} className="text-[10px]" />
          <div className="flex gap-2 items-center">
            <Link to="/" className="text-sm underline font-bold">lihat situs</Link>
            <button aria-label="Keluar" className="p-2" onClick={() => supabase.auth.signOut()}><LogOut size={18} /></button>
          </div>
        </header>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[['Produk', total], ['Tersedia', avail], ['Habis', total - avail], ['Kategori', cat.categories.length]].map(([l, n]) => (
            <div key={l} className="pixel-box p-2"><div className="font-pixel text-sm text-deep">{n}</div><div className="text-[11px] font-bold">{l}</div></div>
          ))}
        </div>
        {cat.error && <div className="pixel-box p-3 text-sm">Error: {cat.error}</div>}
        <nav className="flex gap-2">{tabBtn('produk', 'Produk')}{tabBtn('kategori', 'Kategori')}{tabBtn('toko', 'Toko')}</nav>
        {tab === 'produk' && <ProductsTab {...cat} toast={toast} />}
        {tab === 'kategori' && <CategoriesTab {...cat} toast={toast} />}
        {tab === 'toko' && !cat.loading && <SettingsTab key={cat.settings.store_name + cat.settings.logo_url} settings={cat.settings} toast={toast} reload={cat.reload} />}
        <div className="self-center pt-6"><PixelCat size={4} /></div>
      </div>
      {msg && <div role="status" className="pixel-box fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 font-pixel text-[9px] reveal max-w-[90vw]">{msg}</div>}
    </div>
  )
}
