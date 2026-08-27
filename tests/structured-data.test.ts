import { describe, expect, it } from 'vitest';
import {
	blogPostingJsonLd,
	ENTITY_ID,
	pageGraphJsonLd,
	projectJsonLd,
	type PageMeta,
} from '@/domain/services/seo';

interface GraphNode extends Record<string, unknown> {
	'@type': string;
	'@id'?: string;
}

const META: PageMeta = {
	locale: 'de',
	path: '/de/projects/',
	title: 'Projekte',
	description: 'Beschreibung.',
};

function graph(options: Parameters<typeof pageGraphJsonLd>[0]): GraphNode[] {
	const document = pageGraphJsonLd(options) as {
		'@context': string;
		'@graph': GraphNode[];
	};
	expect(document['@context']).toBe('https://schema.org');
	return document['@graph'];
}

function nodeOf(nodes: GraphNode[], type: string): GraphNode {
	const found = nodes.find((node) => node['@type'] === type);
	expect(found, `no ${type} node in graph`).toBeDefined();
	return found!;
}

/** Every `{"@id": …}` used as a reference value anywhere in the graph. */
function referencedIds(nodes: GraphNode[]): string[] {
	return [...JSON.stringify(nodes).matchAll(/\{"@id":"([^"]+)"\}/g)].map(
		(match) => match[1] ?? '',
	);
}

describe('pageGraphJsonLd', () => {
	it('always describes the owner and the site under stable ids', () => {
		const nodes = graph({ meta: META });
		expect(nodeOf(nodes, 'Person')['@id']).toBe(ENTITY_ID.person);
		expect(nodeOf(nodes, 'WebSite')['@id']).toBe(ENTITY_ID.website);
		expect(nodeOf(nodes, 'WebPage')).toMatchObject({
			'@id': 'https://josunlp.de/de/projects/#webpage',
			isPartOf: { '@id': ENTITY_ID.website },
		});
	});

	it('resolves every internal reference within the same graph', () => {
		const article = blogPostingJsonLd({
			title: 'Post',
			description: 'Summary.',
			path: '/de/blog/post/',
			locale: 'de',
			publishedAt: '2026-01-01',
			tags: ['TypeScript'],
		}) as GraphNode;
		const nodes = graph({
			meta: { ...META, path: '/de/blog/post/' },
			breadcrumb: [{ name: 'Start', path: '/de/' }],
			about: ENTITY_ID.person,
			mainEntity: article['@id'] ?? '',
			nodes: [article],
		});
		const defined = new Set(
			nodes.map((node) => node['@id']).filter(Boolean) as string[],
		);
		for (const reference of referencedIds(nodes)) {
			expect(defined, `dangling reference ${reference}`).toContain(reference);
		}
	});

	it('links the breadcrumb from the page instead of leaving it loose', () => {
		const nodes = graph({
			meta: META,
			breadcrumb: [
				{ name: 'Start', path: '/de/' },
				{ name: 'Projekte', path: '/de/projects/' },
			],
		});
		const breadcrumb = nodeOf(nodes, 'BreadcrumbList');
		expect(nodeOf(nodes, 'WebPage').breadcrumb).toEqual({
			'@id': breadcrumb['@id'],
		});
		expect(breadcrumb.itemListElement).toHaveLength(2);
	});

	it('omits the breadcrumb reference when there is no trail', () => {
		const nodes = graph({ meta: META });
		expect(nodeOf(nodes, 'WebPage').breadcrumb).toBeUndefined();
		expect(nodes.some((node) => node['@type'] === 'BreadcrumbList')).toBe(
			false,
		);
	});

	it('uses the requested WebPage subtype', () => {
		const nodes = graph({ meta: META, pageType: 'CollectionPage' });
		expect(nodeOf(nodes, 'CollectionPage')).toBeDefined();
	});
});

describe('blogPostingJsonLd', () => {
	const post = {
		title: 'Post',
		description: 'Summary.',
		path: '/de/blog/post/',
		locale: 'de' as const,
		publishedAt: '2026-01-01',
		updatedAt: '2026-02-03',
		tags: ['TypeScript', 'SEO'],
		wordCount: 900,
		readingMinutes: 5,
	};

	it('carries the fields article rich results are built from', () => {
		expect(blogPostingJsonLd(post)).toMatchObject({
			'@type': 'BlogPosting',
			'@id': 'https://josunlp.de/de/blog/post/#article',
			headline: 'Post',
			datePublished: '2026-01-01',
			dateModified: '2026-02-03',
			articleSection: 'TypeScript',
			wordCount: 900,
			timeRequired: 'PT5M',
			author: { '@id': ENTITY_ID.person },
			publisher: { '@id': ENTITY_ID.person },
		});
	});

	it('falls back to the publication date when a post was never updated', () => {
		const { updatedAt, ...never } = post;
		expect(updatedAt).toBeDefined();
		expect(blogPostingJsonLd(never)).toMatchObject({
			dateModified: '2026-01-01',
		});
	});

	it('falls back to the generated social card when there is no cover', () => {
		expect(blogPostingJsonLd(post)).toMatchObject({
			image: 'https://josunlp.de/og-image.png',
		});
	});
});

describe('projectJsonLd', () => {
	it('attributes the project to the owner and prefers its own site', () => {
		expect(
			projectJsonLd({
				name: 'bQuery.js',
				description: 'A framework.',
				repositoryUrl: 'https://github.com/bQuery/bQuery',
				websiteUrl: 'https://bquery.js.org/',
				technologies: ['TypeScript', 'Web Components'],
				license: 'MIT',
			}),
		).toMatchObject({
			'@type': 'SoftwareSourceCode',
			url: 'https://bquery.js.org/',
			codeRepository: 'https://github.com/bQuery/bQuery',
			programmingLanguage: ['TypeScript', 'Web Components'],
			author: { '@id': ENTITY_ID.person },
		});
	});

	it('falls back to the repository when a project has no site', () => {
		expect(
			projectJsonLd({
				name: 'Tool',
				description: 'A tool.',
				repositoryUrl: 'https://github.com/JosunLP/tool',
				technologies: ['Rust'],
				license: 'MIT',
			}),
		).toMatchObject({ url: 'https://github.com/JosunLP/tool' });
	});
});
