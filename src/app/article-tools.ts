import { registerArticleTools } from '@/components/article-tools';

/**
 * Reading-affordances chunk for prerendered blog articles.
 *
 * Kept separate from the `article` entry on purpose: that chunk carries
 * the manifest client and bQuery's component runtime, which a fully
 * prerendered article never needs. Articles are the most-linked pages on
 * the site, so they load only this — no bQuery imports, a few hundred
 * bytes gzipped.
 */
registerArticleTools();
