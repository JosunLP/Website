import { OG_IMAGE, OWNER, SITE_ORIGIN } from '@/app/configuration';
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
	/** Article-specific Open Graph data; only used when ogType is "article". */
	readonly article?: ArticleMeta;
}

export interface ArticleMeta {
	/** ISO date, e.g. "2026-02-14". */
	readonly publishedAt: string;
	readonly updatedAt?: string;
	readonly tags?: readonly string[];
	readonly section?: string;
}

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

/**
 * Roughly where search engines stop rendering a title. Not a hard limit
 * in any spec — a display budget.
 */
export const TITLE_MAX_LENGTH = 60;

/**
 * Composes a document title, appending the site name only when the result
 * still fits {@link TITLE_MAX_LENGTH}. On a long post title the suffix is
 * the first thing truncated anyway, and it pushes the words that actually
 * describe the page out of the visible part of the result.
 */
export function pageTitle(title: string, siteName: string): string {
	const combined = `${title} — ${siteName}`;
	return combined.length <= TITLE_MAX_LENGTH ? combined : title;
}

/* -------------------------------------------------------------------- */
/* Structured data                                                      */
/* -------------------------------------------------------------------- */

/**
 * Stable node identities for the site's structured-data graph.
 *
 * Every page emits one `@graph` document whose nodes reference each other
 * by `@id` instead of repeating the same Person and WebSite objects.
 * Search engines can then merge the per-page fragments into a single
 * entity for the site owner rather than treating each page as an
 * unrelated description.
 */
export const ENTITY_ID = {
	person: `${SITE_ORIGIN}/#person`,
	website: `${SITE_ORIGIN}/#website`,
} as const;

function pageId(url: string): string {
	return `${url}#webpage`;
}

function breadcrumbId(url: string): string {
	return `${url}#breadcrumb`;
}

/** A reference to another node in the same graph. */
function ref(id: string): object {
	return { '@id': id };
}

export interface PersonOptions {
	/** Localized one-sentence biography. */
	readonly description?: string;
	/** Topics the owner works on, used for entity disambiguation. */
	readonly knowsAbout?: readonly string[];
}

/** JSON-LD `Person` describing the site owner. */
export function personJsonLd(options: PersonOptions = {}): object {
	return {
		'@type': 'Person',
		'@id': ENTITY_ID.person,
		name: OWNER.name,
		alternateName: OWNER.alias,
		url: SITE_ORIGIN,
		// Both profiles are owner-controlled and confirm the same identity,
		// which is what `sameAs` is for.
		sameAs: [OWNER.gitHubUrl, OWNER.koFiUrl],
		jobTitle: 'Full-Stack Developer',
		email: `mailto:${OWNER.email}`,
		image: absoluteUrl('/android-chrome-512x512.png'),
		...(options.description !== undefined
			? { description: options.description }
			: {}),
		...(options.knowsAbout !== undefined && options.knowsAbout.length > 0
			? { knowsAbout: [...options.knowsAbout] }
			: {}),
	};
}

/** JSON-LD `WebSite` for the site as a whole. */
export function webSiteJsonLd(locale: Locale, description?: string): object {
	return {
		'@type': 'WebSite',
		'@id': ENTITY_ID.website,
		name: OWNER.name,
		alternateName: OWNER.alias,
		url: SITE_ORIGIN,
		inLanguage: locale,
		publisher: ref(ENTITY_ID.person),
		author: ref(ENTITY_ID.person),
		...(description !== undefined ? { description } : {}),
	};
}

/** JSON-LD `BreadcrumbList` from (label, path) pairs. */
export function breadcrumbJsonLd(
	items: readonly { name: string; path: string }[],
	id?: string,
): object {
	return {
		'@type': 'BreadcrumbList',
		...(id !== undefined ? { '@id': id } : {}),
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
	websiteUrl?: string;
	technologies: readonly string[];
	license: string;
}): object {
	return {
		'@type': 'SoftwareSourceCode',
		'@id': `${project.repositoryUrl}#software`,
		name: project.name,
		description: project.description,
		codeRepository: project.repositoryUrl,
		url: project.websiteUrl ?? project.repositoryUrl,
		programmingLanguage: [...project.technologies],
		keywords: project.technologies.join(', '),
		// Schema.org accepts a licence identifier as text; SPDX ids are the
		// most machine-readable form the curated data carries.
		license: project.license,
		author: ref(ENTITY_ID.person),
		maintainer: ref(ENTITY_ID.person),
		isAccessibleForFree: true,
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
	wordCount?: number;
	readingMinutes?: number;
}): object {
	const url = absoluteUrl(post.path);
	return {
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: post.title,
		description: post.description,
		url,
		// A URL rather than a node reference: the same node is also emitted
		// on the blog index, where the post's own WebPage node is not part
		// of the graph and a reference would dangle.
		mainEntityOfPage: url,
		inLanguage: post.locale,
		datePublished: post.publishedAt,
		dateModified: post.updatedAt ?? post.publishedAt,
		keywords: post.tags.join(', '),
		...(post.tags[0] !== undefined ? { articleSection: post.tags[0] } : {}),
		image: absoluteUrl(post.coverImage ?? OG_IMAGE.path),
		...(post.wordCount !== undefined ? { wordCount: post.wordCount } : {}),
		...(post.readingMinutes !== undefined
			? { timeRequired: `PT${String(post.readingMinutes)}M` }
			: {}),
		author: ref(ENTITY_ID.person),
		publisher: ref(ENTITY_ID.person),
		isAccessibleForFree: true,
	};
}

/** Page types that map onto a schema.org `WebPage` subtype. */
export type PageType =
	'WebPage' | 'AboutPage' | 'ProfilePage' | 'ContactPage' | 'CollectionPage';

export interface PageGraphOptions {
	readonly meta: PageMeta;
	/** Breadcrumb trail, root first. */
	readonly breadcrumb?: readonly { name: string; path: string }[];
	/** More specific `WebPage` subtype, when one applies. */
	readonly pageType?: PageType;
	/** Localized biography attached to the Person node. */
	readonly personDescription?: string;
	/** Topics attached to the Person node. */
	readonly knowsAbout?: readonly string[];
	/** Primary content of the page (an article, a list, the owner). */
	readonly mainEntity?: string;
	/** Subject matter of the page, when the page has a clear one. */
	readonly about?: string;
	/** Additional nodes (articles, projects, item lists). */
	readonly nodes?: readonly object[];
}

/**
 * Builds the complete structured-data document for one page: a single
 * `@graph` holding the Person, the WebSite, the page itself, its
 * breadcrumb, and whatever the page adds — all cross-referenced by `@id`.
 */
export function pageGraphJsonLd(options: PageGraphOptions): object {
	const { meta } = options;
	const url = meta.canonicalUrl ?? absoluteUrl(meta.path);
	const webPage = {
		'@type': options.pageType ?? 'WebPage',
		'@id': pageId(url),
		url,
		name: meta.title,
		description: meta.description,
		inLanguage: meta.locale,
		isPartOf: ref(ENTITY_ID.website),
		...(options.about !== undefined ? { about: ref(options.about) } : {}),
		...(options.mainEntity !== undefined
			? { mainEntity: ref(options.mainEntity) }
			: {}),
		primaryImageOfPage: absoluteUrl(meta.ogImage ?? OG_IMAGE.path),
		...(options.breadcrumb !== undefined
			? { breadcrumb: ref(breadcrumbId(url)) }
			: {}),
	};
	return {
		'@context': 'https://schema.org',
		'@graph': [
			personJsonLd({
				...(options.personDescription !== undefined
					? { description: options.personDescription }
					: {}),
				...(options.knowsAbout !== undefined
					? { knowsAbout: options.knowsAbout }
					: {}),
			}),
			webSiteJsonLd(meta.locale),
			webPage,
			...(options.breadcrumb !== undefined
				? [breadcrumbJsonLd(options.breadcrumb, breadcrumbId(url))]
				: []),
			...(options.nodes ?? []),
		],
	};
}

/* -------------------------------------------------------------------- */
/* Head markup                                                          */
/* -------------------------------------------------------------------- */

/**
 * Robots directive for indexable pages. `max-image-preview:large` opts
 * into full-size thumbnails in Google Images and Discover; the snippet
 * limits stop the defaults from truncating descriptions.
 */
const ROBOTS_INDEXABLE =
	'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

function renderArticleMeta(article: ArticleMeta): string[] {
	const lines = [
		`<meta property="article:published_time" content="${escape(article.publishedAt)}">`,
		`<meta property="article:author" content="${escape(OWNER.gitHubUrl)}">`,
	];
	if (article.updatedAt !== undefined) {
		lines.push(
			`<meta property="article:modified_time" content="${escape(article.updatedAt)}">`,
		);
	}
	if (article.section !== undefined) {
		lines.push(
			`<meta property="article:section" content="${escape(article.section)}">`,
		);
	}
	for (const tag of article.tags ?? []) {
		lines.push(`<meta property="article:tag" content="${escape(tag)}">`);
	}
	return lines;
}

function renderJsonLd(jsonLd: readonly object[]): string[] {
	return jsonLd.map((data) => {
		// JSON-LD scripts are data, not executable code; escape "<" to keep
		// "</script>" sequences inert inside the script element.
		const json = JSON.stringify(data).replaceAll('<', '\\u003c');
		return `<script type="application/ld+json">${json}</script>`;
	});
}

/**
 * Renders all head metadata for a page: title, description, canonical,
 * hreflang alternates (de/en/x-default), robots, Open Graph (including
 * article metadata), Twitter Card, and JSON-LD.
 */
export function renderHeadMeta(meta: PageMeta): SafeHtml {
	const canonical = meta.canonicalUrl ?? absoluteUrl(meta.path);
	const alternates = alternatePaths(meta.path);
	const lines: string[] = [
		`<title>${escape(meta.title)}</title>`,
		`<meta name="description" content="${escape(meta.description)}">`,
		`<meta name="author" content="${escape(OWNER.name)}">`,
		`<link rel="canonical" href="${escape(canonical)}">`,
		`<meta name="robots" content="${
			meta.noindex === true ? 'noindex, follow' : ROBOTS_INDEXABLE
		}">`,
	];
	lines.push(
		...Object.entries(alternates).map(
			([locale, path]) =>
				`<link rel="alternate" hreflang="${locale}" href="${escape(absoluteUrl(path))}">`,
		),
	);
	const ogImage = absoluteUrl(meta.ogImage ?? OG_IMAGE.path);
	const usesDefaultImage = meta.ogImage === undefined;
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
	);
	// Dimensions are only known for the generated default card; a
	// post-supplied cover image is declared without them rather than with
	// wrong ones.
	if (usesDefaultImage) {
		lines.push(
			`<meta property="og:image:type" content="${OG_IMAGE.type}">`,
			`<meta property="og:image:width" content="${String(OG_IMAGE.width)}">`,
			`<meta property="og:image:height" content="${String(OG_IMAGE.height)}">`,
		);
	}
	lines.push(
		`<meta name="twitter:card" content="summary_large_image">`,
		`<meta name="twitter:title" content="${escape(meta.title)}">`,
		`<meta name="twitter:description" content="${escape(meta.description)}">`,
		`<meta name="twitter:image" content="${escape(ogImage)}">`,
		`<meta name="twitter:image:alt" content="${escape(meta.title)}">`,
	);
	if (meta.ogType === 'article' && meta.article !== undefined) {
		lines.push(...renderArticleMeta(meta.article));
	}
	lines.push(
		...Object.keys(alternates)
			.filter((locale) => locale !== meta.locale)
			.map(
				(locale) => `<meta property="og:locale:alternate" content="${locale}">`,
			),
		...renderJsonLd(meta.jsonLd ?? []),
	);
	return raw(lines.join('\n\t\t'));
}
