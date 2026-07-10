import {
	copyFileSync,
	cpSync,
	existsSync,
	readdirSync,
	writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { pagePath, PAGE_IDS } from '@/app/configuration';
import { LOCALES } from '@/domain/models/locale';
import { absoluteUrl } from '@/domain/services/seo';
import { alternatePaths } from '@/app/routes';

/**
 * Post-build steps:
 * 1. copy `content/blog/` into `dist/` (Markdown + manifest are public),
 * 2. generate the root `sitemap.xml` for all static pages,
 * 3. place the top-level `404.html` (German copy with visible language
 *    links; locale-specific variants live at /{locale}/404.html).
 */
const DIST = join(process.cwd(), 'dist');

// 1. Public blog content.
cpSync(join(process.cwd(), 'content', 'blog'), join(DIST, 'content', 'blog'), {
	recursive: true,
});

// 2. Root sitemap: static, indexable pages only (blog articles live in
// blog-sitemap.xml, which is generated from the same Markdown sources).
const paths: string[] = ['/'];
for (const locale of LOCALES) {
	for (const page of PAGE_IDS) {
		paths.push(pagePath(locale, page));
	}
}
const urls = paths
	.map((path) => {
		const alternates =
			path === '/'
				? ''
				: `\n${Object.entries(alternatePaths(path))
						.map(
							([locale, alt]) =>
								`\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${absoluteUrl(alt)}"/>`,
						)
						.join('\n')}`;
		return `\t<url>\n\t\t<loc>${absoluteUrl(path)}</loc>${alternates}\n\t</url>`;
	})
	.join('\n');
writeFileSync(
	join(DIST, 'sitemap.xml'),
	`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`,
);

// 3. Top-level 404 fallback.
const de404 = join(DIST, 'de', '404.html');
if (existsSync(de404)) {
	copyFileSync(de404, join(DIST, '404.html'));
}

console.log(
	`Postbuild done: sitemap.xml (${String(paths.length)} URLs), blog content copied, 404.html placed.`,
);
console.log(`dist/ entries: ${readdirSync(DIST).join(', ')}`);
