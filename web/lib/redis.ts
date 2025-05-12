import Redis from 'ioredis';

// Environment variables with defaults
const REDIS_WRITE_URL = process.env.REDIS_WRITE_URL || 'redis://localhost:6379';
const REDIS_READ_URL = process.env.REDIS_READ_URL || 'redis://localhost:6379';

// Create Redis clients
export const redisWrite = new Redis(REDIS_WRITE_URL);
export const redisRead = new Redis(REDIS_READ_URL);

// Post keys
export const POSTS_KEY = 'posts';

// Helper functions for post operations
export async function savePost(post: {
  id: string;
  title: string;
  body: string;
  authorEmail: string;
  createdAt: string;
}) {
  await redisWrite.hset(
    POSTS_KEY,
    post.id,
    JSON.stringify(post)
  );
}

export async function getAllPosts() {
  const posts = await redisRead.hgetall(POSTS_KEY);
  return Object.values(posts).map(post => JSON.parse(post));
} 