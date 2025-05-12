import { NextRequest, NextResponse } from 'next/server';
import { sendReportMessage } from '@/lib/redis-queue';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Get user directly using the server client for auth check
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user || !data.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized - you must be logged in to report posts' },
        { status: 401 }
      );
    }

    // Parse request body
    const { postId, postTitle } = await request.json();
    
    // Validate required fields
    if (!postId || !postTitle) {
      return NextResponse.json(
        { error: 'Post ID and title are required' },
        { status: 400 }
      );
    }

    // Send report to the queue
    await sendReportMessage(
      postId,
      postTitle,
      data.user.email
    );

    return NextResponse.json(
      { success: true, message: 'Post reported successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reporting post:', error);
    return NextResponse.json(
      { error: 'Failed to report post' },
      { status: 500 }
    );
  }
} 