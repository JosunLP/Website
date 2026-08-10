import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

/**
 * Validates the production build in `dist/`:
 * - every HTML page has exactly one h1, a title, a meta description,
 *   a canonical URL, and a lang attribute,
 * - indexable pages carry hreflang alternates,
 * - JSON-LD blocks parse as JSON,
 * - internal links and asset references resolve to files,
 * - sitemaps exist, parse, and only reference existing pages,
 * - robots.txt references both sitemaps,
 * - one Atom feed per locale exists and is linked from every page,
 * - highlighted code carries classes the stylesheet actually styles.
 */
const DIST = join(process.cwd(), 'dist');
const ORIGIN = 'https://josunlp.de';
const errors: string[] = [];

function walk(dir: string): string[] {
	const files: string[] = [];
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			files.push(...walk(full));
		} else {
			files.push(full);
		}
	}
	return files;
}

/** Resolves a site-absolute path to a file inside dist. */
function resolvesToFile(path: string): boolean {
	const clean = (path.split('#')[0] ?? '').split('?')[0] ?? '';
	if (clean === '') {
		return true;
	}
	const relative = clean.replaceAll('/', sep).replace(/^\\|^\//, '');
	const direct = join(DIST, relative);
	if (existsSync(direct) && statSync(direct).isFile()) {
		return true;
	}
	return existsSync(join(direct, 'index.html'));
}

if (!existsSync(DIST)) {
	console.error('dist/ missing — run the build first.');
	process.exit(1);
}

const htmlFiles = walk(DIST).filter((file) => file.endsWith('.html'));
if (htmlFiles.length < 20) {
	errors.push(
		`expected at least 20 prerendered pages, found ${String(htmlFiles.length)}`,
	);
}

for (const file of htmlFiles) {
	const rel = file.slice(DIST.length + 1).replaceAll(sep, '/');
	const html = readFileSync(file, 'utf8');

	const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
	if (h1Count !== 1) {
		errors.push(`${rel}: expected exactly one <h1>, found ${String(h1Count)}`);
	}
	if (!/<title>[^<]+<\/title>/.test(html)) {
		errors.push(`${rel}: missing <title>`);
	}
	if (!/<meta name="description" content="[^"]+"/.test(html)) {
		errors.push(`${rel}: missing meta description`);
	}
	if (!html.includes('<link rel="canonical" href="https://')) {
		errors.push(`${rel}: missing canonical link`);
	}
	if (!/<html lang="[a-z]{2}"/.test(html)) {
		errors.push(`${rel}: missing html lang attribute`);
	}
	const noindex = html.includes('name="robots" content="noindex"');
	if (!noindex && !html.includes('hreflang="x-default"')) {
		errors.push(`${rel}: missing hreflang alternates`);
	}

	for (const match of html.matchAll(
		/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
	)) {
		try {
			JSON.parse(match[1] ?? '');
		} catch {
			errors.push(`${rel}: invalid JSON-LD`);
		}
	}

	for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
		const target = match[1] ?? '';
		if (!resolvesToFile(target)) {
			errors.push(`${rel}: broken internal reference "${target}"`);
		}
	}

	// External links opened in a new tab must be hardened.
	for (const match of html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) {
		if (!match[0].includes('noopener') || !match[0].includes('noreferrer')) {
			errors.push(`${rel}: target="_blank" link without noopener noreferrer`);
		}
	}

	if (!html.includes('type="application/atom+xml"')) {
		errors.push(`${rel}: missing feed autodiscovery link`);
	}
}

// Atom feeds.
for (const locale of ['de', 'en']) {
	const file = join(DIST, locale, 'blog', 'feed.xml');
	if (!existsSync(file)) {
		errors.push(`${locale}/blog/feed.xml missing from dist/`);
		continue;
	}
	const xml = readFileSync(file, 'utf8');
	if (!xml.includes('<feed xmlns="http://www.w3.org/2005/Atom"')) {
		errors.push(`${locale}/blog/feed.xml: not an Atom feed`);
	}
	for (const match of xml.matchAll(
		/<link rel="alternate" type="text\/html" href="([^"]+)"\/>/g,
	)) {
		const url = match[1] ?? '';
		if (!resolvesToFile(url.slice(ORIGIN.length))) {
			errors.push(`${locale}/blog/feed.xml: dead entry link ${url}`);
		}
	}
}

/*
 * Syntax highlighting is only visible if the stylesheet defines rules for
 * the classes highlight.js emits. Shipping the highlighter without them
 * costs ~19 KB gzip and renders identically to plain text, which is easy
 * to miss because nothing errors.
 */
const cssFiles = walk(join(DIST, 'assets')).filter((file) =>
	file.endsWith('.css'),
);
const css = cssFiles.map((file) => readFileSync(file, 'utf8')).join('');
const highlighted = new Set<string>();
for (const file of htmlFiles) {
	for (const match of readFileSync(file, 'utf8').matchAll(
		/class="(hljs-[^"]*)"/g,
	)) {
		for (const token of (match[1] ?? '').split(/\s+/)) {
			if (token.startsWith('hljs-')) {
				highlighted.add(token);
			}
		}
	}
}
for (const token of highlighted) {
	if (!css.includes(`.${token}`)) {
		errors.push(`stylesheet has no rule for highlight class "${token}"`);
	}
}

// Sitemaps.
for (const name of ['sitemap.xml', 'blog-sitemap.xml']) {
	const file = join(DIST, name);
	if (!existsSync(file)) {
		errors.push(`${name} missing from dist/`);
		continue;
	}
	const xml = readFileSync(file, 'utf8');
	if (!xml.includes('<urlset')) {
		errors.push(`${name}: not a urlset`);
	}
	for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
		const url = match[1] ?? '';
		if (!url.startsWith(ORIGIN)) {
			errors.push(`${name}: non-canonical URL ${url}`);
			continue;
		}
		if (!resolvesToFile(url.slice(ORIGIN.length) || '/')) {
			errors.push(`${name}: URL does not resolve to a file: ${url}`);
		}
	}
}

// Robots.
const robotsFile = join(DIST, 'robots.txt');
if (!existsSync(robotsFile)) {
	errors.push('robots.txt missing from dist/');
} else {
	const robots = readFileSync(robotsFile, 'utf8');
	for (const sitemap of ['sitemap.xml', 'blog-sitemap.xml']) {
		if (!robots.includes(`${ORIGIN}/${sitemap}`)) {
			errors.push(`robots.txt does not reference ${sitemap}`);
		}
	}
}

if (errors.length > 0) {
	console.error(`Validation failed with ${String(errors.length)} problem(s):`);
	for (const error of errors) {
		console.error(`  - ${error}`);
	}
	process.exit(1);
}
console.log(
	`Validation passed: ${String(htmlFiles.length)} pages, sitemaps, robots.txt OK.`,
);
