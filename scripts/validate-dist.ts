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

/**
 * Display budgets for search results. Not spec limits — the points past
 * which Google truncates, which is where a title stops earning clicks.
 * Enforced only on indexable pages.
 */
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 160;

/**
 * Anchor texts that describe nothing on their own. Matched case-folded
 * against the whole link text, so German "Start" trips over "start" the
 * same way English "here" does — which is the point: auditors do not
 * special-case a language either.
 */
const NON_DESCRIPTIVE_LINK_TEXT = new Set([
	'click here',
	'click this',
	'go',
	'here',
	'this',
	'start',
	'right here',
	'more',
	'learn more',
]);

/** Indexable pages must not compete with each other for the same query. */
const seenTitles = new Map<string, string>();
const seenDescriptions = new Map<string, string>();

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
	// The directive carries a crawl policy after the index policy
	// ("noindex, follow"), so match the prefix, not the whole value.
	const noindex = html.includes('name="robots" content="noindex');
	if (!noindex && !html.includes('hreflang="x-default"')) {
		errors.push(`${rel}: missing hreflang alternates`);
	}

	// Snippet budgets and uniqueness, for pages that can actually appear in
	// a result list.
	if (!noindex) {
		const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
		const description =
			/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
		if (title.length > TITLE_MAX) {
			errors.push(
				`${rel}: title is ${String(title.length)} characters, over the ${String(TITLE_MAX)}-character display budget`,
			);
		}
		if (
			description.length < DESCRIPTION_MIN ||
			description.length > DESCRIPTION_MAX
		) {
			errors.push(
				`${rel}: meta description is ${String(description.length)} characters, outside ${String(DESCRIPTION_MIN)}–${String(DESCRIPTION_MAX)}`,
			);
		}
		const duplicateTitle = seenTitles.get(title);
		if (duplicateTitle !== undefined) {
			errors.push(`${rel}: duplicate title, shared with ${duplicateTitle}`);
		}
		seenTitles.set(title, rel);
		const duplicateDescription = seenDescriptions.get(description);
		if (duplicateDescription !== undefined) {
			errors.push(
				`${rel}: duplicate meta description, shared with ${duplicateDescription}`,
			);
		}
		seenDescriptions.set(description, rel);
	}

	// Structured data: one @graph per page whose nodes are all typed and
	// whose internal @id references resolve. A dangling reference is
	// silently dropped by consumers, so nothing would otherwise surface it.
	const graphIds = new Set<string>();
	const graphRefs: string[] = [];
	for (const match of html.matchAll(
		/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
	)) {
		let data: unknown;
		try {
			data = JSON.parse(match[1] ?? '');
		} catch {
			errors.push(`${rel}: invalid JSON-LD`);
			continue;
		}
		const graph = (data as { '@graph'?: unknown })['@graph'];
		if (!Array.isArray(graph)) {
			errors.push(`${rel}: JSON-LD block is not a @graph document`);
			continue;
		}
		for (const node of graph as Record<string, unknown>[]) {
			if (typeof node['@type'] !== 'string') {
				errors.push(`${rel}: JSON-LD node without @type`);
			}
			if (typeof node['@id'] === 'string') {
				graphIds.add(node['@id']);
			}
		}
		// Collect every {"@id": …} used as a reference value.
		for (const reference of (match[1] ?? '').matchAll(/\{"@id":"([^"]+)"\}/g)) {
			graphRefs.push(reference[1] ?? '');
		}
	}
	for (const reference of graphRefs) {
		if (!graphIds.has(reference)) {
			errors.push(`${rel}: JSON-LD reference to unknown node "${reference}"`);
		}
	}

	// Social preview: crawlers need an absolute image URL that exists.
	const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
	if (ogImage?.startsWith(ORIGIN) !== true) {
		errors.push(`${rel}: missing or non-absolute og:image`);
	} else if (!resolvesToFile(ogImage.slice(ORIGIN.length))) {
		errors.push(`${rel}: og:image does not resolve to a file (${ogImage})`);
	}
	if (!/<meta name="robots" content="[^"]+"/.test(html)) {
		errors.push(`${rel}: missing robots directive`);
	}

	for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
		const target = match[1] ?? '';
		if (!resolvesToFile(target)) {
			errors.push(`${rel}: broken internal reference "${target}"`);
		}
	}

	// Anchor text has to describe the destination on its own: it is what
	// search engines attribute to the target page, and what a screen
	// reader announces when a user tabs through links out of context.
	// This is the blocklist Lighthouse's "link-text" audit uses.
	for (const match of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/g)) {
		const text = (match[1] ?? '')
			.replace(/<[^>]+>/g, ' ')
			.replace(/&[a-z]+;/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			.toLowerCase();
		if (NON_DESCRIPTIVE_LINK_TEXT.has(text)) {
			errors.push(`${rel}: non-descriptive link text "${text}"`);
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
	for (const match of xml.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(match[1] ?? '')) {
			errors.push(`${name}: malformed lastmod "${match[1] ?? ''}"`);
		}
	}
	// A sitemap alternate that disagrees with the page's own hreflang is
	// worse than none: search engines treat the pair as a conflict.
	for (const match of xml.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)) {
		const url = match[2] ?? '';
		if (!resolvesToFile(url.slice(ORIGIN.length) || '/')) {
			errors.push(`${name}: dead hreflang alternate ${url}`);
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
