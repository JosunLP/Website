import { spawnSync } from 'node:child_process';
import {
	copyFileSync,
	cpSync,
	existsSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { pagePath, PAGE_IDS, type PageId } from '@/app/configuration';
import { LOCALES, type Locale } from '@/domain/models/locale';
import { absoluteUrl } from '@/domain/services/seo';
import { alternatePaths } from '@/app/routes';

/**
 * Post-build steps:
 * 1. copy `content/blog/` into `dist/` (Markdown + manifest are public),
 * 2. generate the root `sitemap.xml` for all static pages,
 * 3. place the top-level `404.html` (German copy with visible language
 *    links; locale-specific variants live at /{locale}/404.html),
 * 4. drop Vite's build manifest, which `prerender.ts` has already read.
 */
const DIST = join(process.cwd(), 'dist');

// 1. Public blog content.
cpSync(join(process.cwd(), 'content', 'blog'), join(DIST, 'content', 'blog'), {
	recursive: true,
});

// 2. Root sitemap: static, indexable pages only (blog articles live in
// blog-sitemap.xml, which is generated from the same Markdown sources).

/**
 * Sources whose last change is what "this page changed" means. Layout and
 * styling touch every page but do not change what a page says, so they
 * are deliberately excluded: a `lastmod` that moves on every commit is
 * treated as noise by crawlers and stops being a useful signal.
 */
const PAGE_SOURCES: Readonly<Record<PageId, readonly string[]>> = {
	home: [
		'src/render/pages/home.ts',
		'src/content/projects.ts',
		'src/content/skills.ts',
	],
	about: ['src/render/pages/about.ts'],
	projects: ['src/render/pages/projects.ts', 'src/content/projects.ts'],
	blog: ['src/render/pages/blog.ts', 'content/blog'],
	contact: ['src/render/pages/contact.ts'],
	imprint: ['src/content/pages/legal.ts'],
	privacy: ['src/content/pages/legal.ts'],
	accessibility: ['src/content/pages/legal.ts'],
};

/**
 * Date of the last commit touching any of the given paths, as `YYYY-MM-DD`.
 * Returns undefined outside a git checkout (e.g. a source tarball), in
 * which case the sitemap simply omits `lastmod` rather than inventing one.
 */
function lastCommitDate(paths: readonly string[]): string | undefined {
	const result = spawnSync(
		'git',
		['log', '-1', '--format=%cs', '--', ...paths],
		{ encoding: 'utf8' },
	);
	if (result.status !== 0) {
		return undefined;
	}
	const date = result.stdout.trim();
	return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}

function sourcesFor(locale: Locale, page: PageId): readonly string[] {
	// Locale files carry the visible copy, so they always count.
	return [...PAGE_SOURCES[page], `src/locales/${locale}.ts`];
}

const entries: { path: string; sources: readonly string[] }[] = [
	{ path: '/', sources: ['src/render/pages/root.ts'] },
];
for (const locale of LOCALES) {
	for (const page of PAGE_IDS) {
		entries.push({
			path: pagePath(locale, page),
			sources: sourcesFor(locale, page),
		});
	}
}
const paths = entries.map((entry) => entry.path);
const urls = entries
	.map(({ path, sources }) => {
		const alternates =
			path === '/'
				? ''
				: `\n${[
						...Object.entries(alternatePaths(path)).map(
							([locale, alt]) =>
								`\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${absoluteUrl(alt)}"/>`,
						),
						// Mirrors the x-default the pages themselves declare, so the
						// sitemap and the markup cannot disagree.
						`\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(
							alternatePaths(path).de === '/de/'
								? '/'
								: alternatePaths(path).de,
						)}"/>`,
					].join('\n')}`;
		const lastmod = lastCommitDate(sources);
		return `\t<url>\n\t\t<loc>${absoluteUrl(path)}</loc>${
			lastmod === undefined ? '' : `\n\t\t<lastmod>${lastmod}</lastmod>`
		}${alternates}\n\t</url>`;
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

// 4. `dist/.vite/manifest.json` is build scaffolding: prerender.ts has
// resolved every hashed asset URL from it by now, and nothing at runtime
// reads it. Shipping it would publish the module graph — every entry,
// chunk and source path — for no benefit. Removed here rather than in
// vite.config.ts because the prerender step still needs the file.
rmSync(join(DIST, '.vite'), { recursive: true, force: true });

console.log(
	`Postbuild done: sitemap.xml (${String(paths.length)} URLs), blog content copied, 404.html placed.`,
);
console.log(`dist/ entries: ${readdirSync(DIST).join(', ')}`);
