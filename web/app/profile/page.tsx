'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication redirect
  useEffect(() => {
    // Only redirect after component is mounted and we've confirmed user is not logged in
    if (mounted && !loading && !user) {
      console.log('Redirecting to /auth - no user found');
      router.push('/auth');
    }
  }, [user, loading, router, mounted]);

  // Show loading state while checking authentication
  if (loading || !mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if user is not logged in (will be redirected)
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Not authenticated. Redirecting...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p>{user.email}</p>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
            <p className="font-mono text-xs">{user.id}</p>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Last Sign In</h3>
            <p>
              {user.last_sign_in_at 
                ? new Date(user.last_sign_in_at).toLocaleString() 
                : 'N/A'}
            </p>
          </div>

          <Separator />

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Email Confirmed</h3>
            <p>
              {user.email_confirmed_at 
                ? 'Yes' 
                : 'No - Please check your email to confirm your account'}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 