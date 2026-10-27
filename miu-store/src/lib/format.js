export const rupiah = (n) => 'Rp' + new Intl.NumberFormat('id-ID').format(Number(n) || 0)

// Varian ditulis admin per baris: "1 hari = 4000"
export const parseVariants = (t) =>
  t.split('\n').map((l) => l.trim()).filter((l) => l.includes('=')).map((l) => {
    const i = l.lastIndexOf('=')
    return { label: l.slice(0, i).trim(), price: parseInt(l.slice(i + 1).replace(/\D/g, ''), 10) || 0 }
  }).filter((v) => v.label && v.price)

export const variantsToText = (v) => (v || []).map((x) => `${x.label} = ${x.price}`).join('\n')
