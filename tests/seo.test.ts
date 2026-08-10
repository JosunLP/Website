import { describe, expect, it } from 'vitest';
import { renderHeadMeta, type PageMeta } from '@/domain/services/seo';

function head(overrides: Partial<PageMeta> = {}): string {
	return renderHeadMeta({
		locale: 'de',
		path: '/de/about/',
		title: 'Title',
		description: 'Description.',
		...overrides,
	}).value;
}

describe('renderHeadMeta', () => {
	it('emits one alternate per locale plus x-default', () => {
		const html = head();
		expect(html).toContain(
			'<link rel="alternate" hreflang="de" href="https://josunlp.de/de/about/">',
		);
		expect(html).toContain(
			'<link rel="alternate" hreflang="en" href="https://josunlp.de/en/about/">',
		);
	});

	it('points x-default at the German page for locale-specific routes', () => {
		expect(head()).toContain(
			'<link rel="alternate" hreflang="x-default" href="https://josunlp.de/de/about/">',
		);
	});

	it('points x-default at the language-decision page for the entry points', () => {
		// `/` decides between the two home pages, so it — not one of the
		// languages it chooses between — is what x-default must name.
		for (const path of ['/', '/de/', '/en/']) {
			expect(head({ path, locale: path === '/en/' ? 'en' : 'de' })).toContain(
				'<link rel="alternate" hreflang="x-default" href="https://josunlp.de/">',
			);
		}
	});

	it('honours an explicit canonical override', () => {
		const html = head({ canonicalUrl: 'https://example.org/post/' });
		expect(html).toContain(
			'<link rel="canonical" href="https://example.org/post/">',
		);
		expect(html).toContain(
			'<meta property="og:url" content="https://example.org/post/">',
		);
	});

	it('escapes metadata and keeps JSON-LD inert', () => {
		const html = head({
			title: 'A "quoted" & <angled> title',
			jsonLd: [{ name: '</script><script>alert(1)</script>' }],
		});
		expect(html).toContain('&quot;quoted&quot;');
		expect(html).not.toContain('<script>alert(1)</script>');
		expect(html).toContain('\\u003c/script');
	});

	it('marks noindex pages and still renders social metadata', () => {
		const html = head({ noindex: true });
		// "follow" keeps crawlers walking the links out of an unindexed
		// page (the 404 and the client-side article shell both link home).
		expect(html).toContain('<meta name="robots" content="noindex, follow">');
		expect(html).toContain('<meta property="og:image"');
	});

	it('opts indexable pages into large image previews', () => {
		expect(head()).toContain(
			'<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">',
		);
	});

	it('declares the generated social card with its dimensions', () => {
		const html = head();
		expect(html).toContain(
			'<meta property="og:image" content="https://josunlp.de/og-image.png">',
		);
		expect(html).toContain('<meta property="og:image:width" content="1200">');
		expect(html).toContain('<meta property="og:image:height" content="630">');
		expect(html).toContain(
			'<meta name="twitter:card" content="summary_large_image">',
		);
	});

	it('omits dimensions for a post-supplied cover image', () => {
		const html = head({ ogImage: '/content/blog/cover.png' });
		expect(html).toContain(
			'<meta property="og:image" content="https://josunlp.de/content/blog/cover.png">',
		);
		expect(html).not.toContain('og:image:width');
	});

	it('renders article metadata only for article pages', () => {
		const article = {
			publishedAt: '2026-02-01',
			updatedAt: '2026-03-02',
			tags: ['TypeScript', 'SEO'],
			section: 'TypeScript',
		};
		const html = head({ ogType: 'article', article });
		expect(html).toContain(
			'<meta property="article:published_time" content="2026-02-01">',
		);
		expect(html).toContain(
			'<meta property="article:modified_time" content="2026-03-02">',
		);
		expect(html).toContain('<meta property="article:tag" content="SEO">');
		expect(head({ article })).not.toContain('article:published_time');
	});

	it('names the author on every page', () => {
		expect(head()).toContain('<meta name="author" content="Jonas Pfalzgraf">');
	});
});
