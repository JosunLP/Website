import { registerBlogList } from '@/components/blog-list';
import { registerTagFilter } from '@/components/tag-filter';

/**
 * Blog index chunk. The index only needs the manifest-driven listing
 * refresh and the topic filter, so it deliberately does not pull in the
 * client-side article renderer or the reading affordances — those belong
 * to the article routes and would otherwise more than double this page's
 * script weight for code it never runs.
 */
registerBlogList();
registerTagFilter();
