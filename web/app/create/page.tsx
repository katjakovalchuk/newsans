import { redirect } from 'next/navigation';
import { getUser } from '@/app/actions';
import CreatePostForm from './CreatePostForm';
import { createClient } from '@/lib/supabase-server';

export default async function CreatePostPage() {
  // Get user directly for the most reliable check
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  
  console.log("Auth check on create page:", { 
    userFromSupabase: data?.user ? 'Found' : 'Not found',
    error: error ? error.message : 'None'
  });
  
  // If no user is found, redirect to authentication page
  if (!data.user) {
    console.log("Auth check failed, redirecting to /auth");
    redirect('/auth');
  }
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Create Post</h1>
      <CreatePostForm />
    </>
  );
} 