'use server';

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

// Get the current session server-side using server client
export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Get user server-side
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Protected action - only runs for authenticated users
export async function protectedAction() {
  const user = await getUser();
  
  if (!user) {
    redirect('/auth');
  }
  
  // Do something that requires authentication
  return { success: true };
} 