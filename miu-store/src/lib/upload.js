import { supabase } from './supabase'

export async function uploadImage(file, folder = 'products') {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar')
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB')
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '31536000', contentType: file.type })
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}
