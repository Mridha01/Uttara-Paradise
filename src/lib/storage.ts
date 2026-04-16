import { supabase } from '@/integrations/supabase/client';

export async function uploadImage(bucket: string, file: File, folder?: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const name = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const { error } = await supabase.storage.from(bucket).upload(name, file, {
    cacheControl: '3600',
    upsert: false,
  });
  
  if (error) throw error;
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(name);
  return data.publicUrl;
}
