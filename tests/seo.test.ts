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
		expect(html).toContain('<meta name="robots" content="noindex">');
		expect(html).toContain('<meta property="og:image"');
	});
});
