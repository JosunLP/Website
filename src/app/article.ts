import { registerArticleTools } from '@/components/article-tools';
import { registerBlogArticle } from '@/components/blog-article';
import { registerBlogList } from '@/components/blog-list';

/**
 * Blog entry chunk, loaded only on blog routes: manifest-driven listing
 * refresh, client-side rendering of posts uploaded after the build, and
 * the reading affordances layered onto article pages.
 */
registerBlogList();
registerBlogArticle();
registerArticleTools();
