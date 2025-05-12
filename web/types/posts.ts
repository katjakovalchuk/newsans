export interface Post {
  id: string;
  title: string;
  body: string;
  authorEmail: string;
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  body: string;
} 