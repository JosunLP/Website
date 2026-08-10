import {
	OWNER,
	SITE_ORIGIN,
	blogPostPath,
	pagePath,
} from '@/app/configuration';
import type { BlogManifestEntry } from '@/domain/models/blog';
import type { Locale } from '@/domain/models/locale';
import { absoluteUrl } from '@/domain/services/seo';
import { escape } from '@/utils/html';

/**
 * Atom 1.0 feed generation for the blog.
 *
 * One feed per locale, written as a static file next to the prerendered
 * pages. Atom rather than RSS 2.0: it mandates the date format and
 * `<id>` semantics instead of leaving them to convention, which matters
 * for a feed generated without a library.
 *
 * Entries carry the post summary only, never the rendered article body:
 * the feed stays small, and readers follow the link to the canonical page
 * rather than rendering HTML this site cannot style.
 */

/** Site-absolute path of a locale's feed. */
export function feedPath(locale: Locale): string {
	return `/${locale}/blog/feed.xml`;
}

/**
 * Stable, location-independent entry identity. Tag URIs (RFC 4151) are
 * the canonical choice for Atom `<id>`: unlike the article URL they stay
 * valid if the route ever changes, so readers never re-announce old posts.
 */
function tagUri(date: string, locale: Locale, slug: string): string {
	const authority = SITE_ORIGIN.replace(/^https?:\/\//, '');
	return `tag:${authority},${date}:${locale}/${slug}`;
}

/** Atom requires RFC 3339 timestamps; posts only carry a calendar date. */
function toTimestamp(isoDate: string): string {
	return `${isoDate}T00:00:00Z`;
}

/** Newest `updatedAt`/`publishedAt` across the feed, or a stable fallback. */
function feedUpdated(posts: readonly BlogManifestEntry[]): string {
	const latest = posts
		.map((post) => post.updatedAt ?? post.publishedAt)
		.sort()
		.at(-1);
	return toTimestamp(latest ?? '1970-01-01');
}

export interface FeedOptions {
	readonly locale: Locale;
	readonly title: string;
	readonly subtitle: string;
	readonly posts: readonly BlogManifestEntry[];
}

/** Renders the complete Atom document for one locale. */
export function renderAtomFeed(options: FeedOptions): string {
	const { locale, title, subtitle, posts } = options;
	const self = absoluteUrl(feedPath(locale));
	const blogUrl = absoluteUrl(pagePath(locale, 'blog'));
	const entries = posts
		.map((post) => {
			const url = absoluteUrl(blogPostPath(locale, post.slug));
			const categories = post.tags
				.map((tag) => `\t\t<category term="${escape(tag)}"/>`)
				.join('\n');
			return `\t<entry>
\t\t<title>${escape(post.title)}</title>
\t\t<link rel="alternate" type="text/html" href="${escape(url)}"/>
\t\t<id>${escape(tagUri(post.publishedAt, locale, post.slug))}</id>
\t\t<published>${toTimestamp(post.publishedAt)}</published>
\t\t<updated>${toTimestamp(post.updatedAt ?? post.publishedAt)}</updated>
\t\t<summary type="text">${escape(post.description)}</summary>${
				categories === '' ? '' : `\n${categories}`
			}
\t</entry>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">
\t<title>${escape(title)}</title>
\t<subtitle>${escape(subtitle)}</subtitle>
\t<link rel="self" type="application/atom+xml" href="${escape(self)}"/>
\t<link rel="alternate" type="text/html" href="${escape(blogUrl)}"/>
\t<id>${escape(blogUrl)}</id>
\t<updated>${feedUpdated(posts)}</updated>
\t<author>
\t\t<name>${escape(OWNER.name)}</name>
\t\t<uri>${SITE_ORIGIN}</uri>
\t</author>
\t<generator uri="${SITE_ORIGIN}">josunlp.de</generator>${
		entries === '' ? '' : `\n${entries}`
	}
</feed>
`;
}
