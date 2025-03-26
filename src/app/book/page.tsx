import { getPostsByCategory } from '@/lib/markdown';
import BookContent from './BookContent';

export default function BookPage() {
  // Only show published posts - this runs on the server
  const posts = getPostsByCategory('book', false);
  
  return <BookContent posts={posts} />;
}
