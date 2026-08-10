import { registerArticleTools } from '@/components/article-tools';
import { registerBlogArticle } from '@/components/blog-article';

/**
 * Article-shell chunk, loaded only on the client-side article route:
 * rendering of posts uploaded after the build, plus the reading
 * affordances layered onto the result. The blog index has its own,
 * smaller chunk (see `blog-index.ts`).
 */
registerBlogArticle();
registerArticleTools();
