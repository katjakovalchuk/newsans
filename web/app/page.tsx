import { Suspense } from 'react';
import Link from 'next/link';
import PostList from '@/app/components/PostList';
import LoadingPosts from '@/app/components/LoadingPosts';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-server';

export default async function Home() {
  // Get user directly using Supabase client
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  
  // Debug authentication status
  console.log("Auth status on home page:", !!user);
  if (user) {
    console.log("User email:", user.email);
  }
  
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        {user ? (
          <Link href="/create">
            <Button>Create Post</Button>
          </Link>
        ) : (
          <Link href="/auth">
            <Button variant="outline">Sign In to Create Posts</Button>
          </Link>
        )}
      </div>
      
      <Suspense fallback={<LoadingPosts />}>
        <PostList />
      </Suspense>
    </main>
  );
}
