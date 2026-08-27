import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { blogPostPath } from '@/app/configuration';
import { absoluteUrl } from '@/domain/services/seo';
import { loadAllPosts, toManifestEntries } from './lib/blog-files';

/**
 * Generates `public/blog-sitemap.xml` from the local Markdown posts.
 * Regenerate and upload alongside new posts so search engines discover
 * articles that were never part of a build.
 */
const entries = toManifestEntries(loadAllPosts());

const urls = entries
	.map((entry) => {
		const loc = absoluteUrl(blogPostPath(entry.locale, entry.slug));
		const lastmod = entry.updatedAt ?? entry.publishedAt;
		const alternates = entries
			.filter((candidate) => candidate.translationKey === entry.translationKey)
			.map(
				(candidate) =>
					`\t\t<xhtml:link rel="alternate" hreflang="${candidate.locale}" href="${absoluteUrl(blogPostPath(candidate.locale, candidate.slug))}"/>`,
			)
			.join('\n');
		return `\t<url>\n\t\t<loc>${loc}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n${alternates}\n\t</url>`;
	})
	.join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

const target = join(process.cwd(), 'public', 'blog-sitemap.xml');
writeFileSync(target, xml);
console.log(
	`public/blog-sitemap.xml written (${String(entries.length)} URLs).`,
);
