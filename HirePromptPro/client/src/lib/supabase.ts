import { createClient } from '@supabase/supabase-js';

// Use default values when environment variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables - using fallback mode with local storage only');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  return await supabase.auth.getUser();
}

export async function getSession() {
  return await supabase.auth.getSession();
}

export async function uploadResume(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file);
    
  if (error) {
    throw error;
  }
  
  return data;
}
