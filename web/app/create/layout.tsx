import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CreatePostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            &larr; Back to Posts
          </Button>
        </Link>
      </div>
      {children}
    </div>
  );
} 