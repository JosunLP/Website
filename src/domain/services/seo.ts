import { OWNER, SITE_ORIGIN } from '@/app/configuration';
import { alternatePaths } from '@/app/routes';
import type { Locale } from '@/domain/models/locale';
import { escape, raw, type SafeHtml } from '@/utils/html';

/** Everything the document head needs for one page. */
export interface PageMeta {
	readonly locale: Locale;
	/** Site-absolute path, e.g. "/de/projects/". */
	readonly path: string;
	readonly title: string;
	readonly description: string;
	/** Open Graph type; articles get richer treatment. */
	readonly ogType?: 'website' | 'article';
	/** JSON-LD structured data objects rendered into the head. */
	readonly jsonLd?: readonly object[];
	readonly noindex?: boolean;
	/** Overrides the default canonical URL (used for syndicated posts). */
	readonly canonicalUrl?: string;
	/** Site-absolute path of the social preview image (og/twitter). */
	readonly ogImage?: string;
}

/** Fallback social preview image (site logo). */
const DEFAULT_OG_IMAGE = '/android-chrome-512x512.png';

/**
 * Target of the `x-default` hreflang alternate.
 *
 * `/` is the language-decision page, so it is the correct x-default for
 * the entry points it decides between (itself and the two home pages).
 * Every other route has no locale-neutral equivalent; those fall back to
 * the German version, matching {@link DEFAULT_LOCALE}.
 */
function xDefaultPath(alternates: Record<Locale, string>): string {
	return alternates.de === '/de/' ? '/' : alternates.de;
}

export function absoluteUrl(path: string): string {
	return `${SITE_ORIGIN}${path}`;
}

/** JSON-LD `Person` describing the site owner. */
export function personJsonLd(): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: OWNER.name,
		alternateName: OWNER.alias,
		url: SITE_ORIGIN,
		sameAs: [OWNER.gitHubUrl],
		jobTitle: 'Full-Stack Developer',
	};
}

/** JSON-LD `WebSite` for the home pages. */
export function webSiteJsonLd(locale: Locale): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: OWNER.name,
		url: SITE_ORIGIN,
		inLanguage: locale,
	};
}

/** JSON-LD `WebPage` for a static page. */
export function webPageJsonLd(meta: PageMeta): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: meta.title,
		description: meta.description,
		url: absoluteUrl(meta.path),
		inLanguage: meta.locale,
	};
}

/** JSON-LD `BreadcrumbList` from (label, path) pairs. */
export function breadcrumbJsonLd(
	items: readonly { name: string; path: string }[],
): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		})),
	};
}

/** JSON-LD `SoftwareSourceCode` for a project. */
export function projectJsonLd(project: {
	name: string;
	description: string;
	repositoryUrl: string;
	technologies: readonly string[];
	license: string;
}): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareSourceCode',
		name: project.name,
		description: project.description,
		codeRepository: project.repositoryUrl,
		programmingLanguage: project.technologies[0] ?? 'TypeScript',
		author: { '@type': 'Person', name: OWNER.name },
	};
}

/** JSON-LD `BlogPosting` for an article page. */
export function blogPostingJsonLd(post: {
	title: string;
	description: string;
	path: string;
	locale: Locale;
	publishedAt: string;
	updatedAt?: string;
	tags: readonly string[];
	coverImage?: string;
}): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description,
		url: absoluteUrl(post.path),
		inLanguage: post.locale,
		datePublished: post.publishedAt,
		...(post.updatedAt !== undefined ? { dateModified: post.updatedAt } : {}),
		keywords: post.tags.join(', '),
		...(post.coverImage !== undefined
			? { image: absoluteUrl(post.coverImage) }
			: {}),
		author: { '@type': 'Person', name: OWNER.name, url: SITE_ORIGIN },
	};
}

/** JSON-LD `Blog` for the blog index. */
export function blogJsonLd(locale: Locale, path: string): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'Blog',
		url: absoluteUrl(path),
		inLanguage: locale,
		author: { '@type': 'Person', name: OWNER.name, url: SITE_ORIGIN },
	};
}

/**
 * Renders all head metadata for a page: title, description, canonical,
 * hreflang alternates (de/en/x-default), robots, Open Graph, Twitter
 * Card, and JSON-LD.
 */
export function renderHeadMeta(meta: PageMeta): SafeHtml {
	const canonical = meta.canonicalUrl ?? absoluteUrl(meta.path);
	const alternates = alternatePaths(meta.path);
	const lines: string[] = [
		`<title>${escape(meta.title)}</title>`,
		`<meta name="description" content="${escape(meta.description)}">`,
		`<link rel="canonical" href="${escape(canonical)}">`,
	];
	if (meta.noindex === true) {
		lines.push('<meta name="robots" content="noindex">');
	}
	for (const [locale, path] of Object.entries(alternates)) {
		lines.push(
			`<link rel="alternate" hreflang="${locale}" href="${escape(absoluteUrl(path))}">`,
		);
	}
	const ogImage = absoluteUrl(meta.ogImage ?? DEFAULT_OG_IMAGE);
	lines.push(
		`<link rel="alternate" hreflang="x-default" href="${escape(
			absoluteUrl(xDefaultPath(alternates)),
		)}">`,
		`<meta property="og:type" content="${meta.ogType ?? 'website'}">`,
		`<meta property="og:title" content="${escape(meta.title)}">`,
		`<meta property="og:description" content="${escape(meta.description)}">`,
		`<meta property="og:url" content="${escape(canonical)}">`,
		`<meta property="og:site_name" content="${escape(OWNER.name)}">`,
		`<meta property="og:locale" content="${meta.locale}">`,
		`<meta property="og:image" content="${escape(ogImage)}">`,
		`<meta property="og:image:alt" content="${escape(meta.title)}">`,
		`<meta name="twitter:card" content="summary">`,
		`<meta name="twitter:title" content="${escape(meta.title)}">`,
		`<meta name="twitter:description" content="${escape(meta.description)}">`,
		`<meta name="twitter:image" content="${escape(ogImage)}">`,
	);
	for (const locale of Object.keys(alternates)) {
		if (locale !== meta.locale) {
			lines.push(`<meta property="og:locale:alternate" content="${locale}">`);
		}
	}
	for (const data of meta.jsonLd ?? []) {
		// JSON-LD scripts are data, not executable code; escape "<" to keep
		// "</script>" sequences inert inside the script element.
		const json = JSON.stringify(data).replaceAll('<', '\\u003c');
		lines.push(`<script type="application/ld+json">${json}</script>`);
	}
	return raw(lines.join('\n\t\t'));
}
