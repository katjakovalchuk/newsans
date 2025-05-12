'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FlagIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface ReportButtonProps {
  postId: string;
  postTitle: string;
}

export default function ReportButton({ postId, postTitle }: ReportButtonProps) {
  const [isReporting, setIsReporting] = useState(false);
  const { user } = useAuth();

  const handleReport = async () => {
    // If user is not logged in, show a message
    if (!user) {
      toast.error('You must be logged in to report posts');
      return;
    }

    try {
      setIsReporting(true);
      
      const response = await fetch('/api/posts/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, postTitle }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to report post');
      }
      
      toast.success('Post reported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleReport}
      disabled={isReporting || !user}
      title={user ? 'Report this post' : 'Login to report posts'}
    >
      <FlagIcon className="h-4 w-4" />
    </Button>
  );
} 