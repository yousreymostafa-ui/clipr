import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getClips(userId) {
  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function saveClip(clip) {
  const { data, error } = await supabase
    .from('clips').insert([clip]).select().single()
  if (error) throw error
  return data
}

export async function updateClip(id, updates) {
  const { data, error } = await supabase
    .from('clips').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteClip(id) {
  const { error } = await supabase.from('clips').delete().eq('id', id)
  if (error) throw error
}

export async function uploadFile(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('clip-uploads')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: urlData } = supabase.storage.from('clip-uploads').getPublicUrl(path)
  return { url: urlData.publicUrl, name: file.name, type: file.type }
}

export function subscribeToClips(userId, callback) {
  return supabase
    .channel('clips-v3')
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'clips',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}
