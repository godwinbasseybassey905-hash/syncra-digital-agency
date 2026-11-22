import { useParams } from 'react-router-dom';
import BlogPostPage from '../BlogPostPage';

export default function BlogPostRoute() {
  const { slug = '' } = useParams();
  return <BlogPostPage slug={decodeURIComponent(slug)} />;
}
