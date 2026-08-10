import { registerBlogList } from '@/components/blog-list';

/**
 * Blog index chunk. The index only needs the manifest-driven listing
 * refresh, so it deliberately does not pull in the client-side article
 * renderer or the reading affordances — those belong to the article
 * routes and would otherwise more than double this page's script weight
 * for code it never runs.
 */
registerBlogList();
