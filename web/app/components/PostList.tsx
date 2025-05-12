import { Post } from '@/types/posts';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAllPosts } from '@/lib/redis';

// Get posts directly from Redis instead of via API
async function getPosts(): Promise<Post[]> {
  return getAllPosts();
}

export default async function PostList() {
  try {
    const posts = await getPosts();
    
    if (posts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No posts available yet.</p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground line-clamp-4">{post.body}</p>
            </CardContent>
            <Separator />
            <CardFooter className="pt-4">
              <div className="flex flex-col w-full text-sm text-muted-foreground">
                <span>{post.authorEmail}</span>
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading posts:', error);
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Failed to load posts. Please try again later.</p>
      </div>
    );
  }
} 