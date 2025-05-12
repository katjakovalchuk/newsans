import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { savePost } from '@/lib/redis';
import { CreatePostInput, Post } from '@/types/posts';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Get user directly using the server client for more reliable auth check
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreatePostInput = await request.json();
    
    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Create new post
    const post: Post = {
      id: uuidv4(),
      title: body.title,
      body: body.body,
      authorEmail: data.user.email || 'unknown@example.com',
      createdAt: new Date().toISOString(),
    };

    // Save post to Redis
    await savePost(post);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 