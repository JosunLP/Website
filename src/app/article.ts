import { registerBlogArticle } from '@/components/blog-article';
import { registerBlogList } from '@/components/blog-list';

/**
 * Blog entry chunk, loaded only on blog routes: manifest-driven listing
 * refresh and client-side rendering of posts uploaded after the build.
 */
registerBlogList();
registerBlogArticle();
