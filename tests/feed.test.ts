import { describe, expect, it } from 'vitest';
import type { BlogManifestEntry } from '@/domain/models/blog';
import { feedPath, renderAtomFeed } from '@/domain/services/feed';
import { estimateReadingMinutes } from '@/domain/services/reading-time';

function entry(overrides: Partial<BlogManifestEntry> = {}): BlogManifestEntry {
	return {
		title: 'A post',
		description: 'A description.',
		publishedAt: '2026-01-02',
		slug: 'a-post',
		locale: 'en',
		translationKey: 'a-post',
		tags: ['TypeScript'],
		featured: false,
		path: '/content/blog/en/a-post.md',
		...overrides,
	};
}

function feed(posts: readonly BlogManifestEntry[]): string {
	return renderAtomFeed({
		locale: 'en',
		title: 'Blog',
		subtitle: 'Notes',
		posts,
	});
}

describe('feedPath', () => {
	it('lives under the locale blog route', () => {
		expect(feedPath('de')).toBe('/de/blog/feed.xml');
		expect(feedPath('en')).toBe('/en/blog/feed.xml');
	});
});

describe('renderAtomFeed', () => {
	it('renders a well-formed Atom document', () => {
		const xml = feed([entry()]);
		expect(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>')).toBe(true);
		expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
		expect(xml).toContain(
			'<link rel="self" type="application/atom+xml" href="https://josunlp.de/en/blog/feed.xml"/>',
		);
		expect(xml).toContain(
			'<link rel="alternate" type="text/html" href="https://josunlp.de/en/blog/a-post/"/>',
		);
		expect(xml).toContain('<category term="TypeScript"/>');
	});

	it('uses RFC 3339 timestamps and stable tag URIs', () => {
		const xml = feed([entry({ updatedAt: '2026-03-04' })]);
		expect(xml).toContain('<published>2026-01-02T00:00:00Z</published>');
		expect(xml).toContain('<updated>2026-03-04T00:00:00Z</updated>');
		expect(xml).toContain('<id>tag:josunlp.de,2026-01-02:en/a-post</id>');
	});

	it('takes the feed timestamp from the most recently touched post', () => {
		const xml = feed([
			entry({ slug: 'old', publishedAt: '2026-01-01' }),
			entry({
				slug: 'new',
				publishedAt: '2025-06-01',
				updatedAt: '2026-05-05',
			}),
		]);
		expect(xml).toContain('<updated>2026-05-05T00:00:00Z</updated>');
	});

	it('escapes content that would otherwise break the XML', () => {
		const xml = feed([
			entry({ title: 'Tags & <script>', description: '"quoted" & bare' }),
		]);
		expect(xml).toContain('<title>Tags &amp; &lt;script&gt;</title>');
		expect(xml).not.toContain('<script>');
	});

	it('stays valid with no posts at all', () => {
		const xml = feed([]);
		expect(xml).toContain('<updated>1970-01-01T00:00:00Z</updated>');
		expect(xml).not.toContain('<entry>');
	});
});

describe('estimateReadingMinutes', () => {
	it('never returns less than a minute', () => {
		expect(estimateReadingMinutes('')).toBe(1);
		expect(estimateReadingMinutes('One short sentence.')).toBe(1);
	});

	it('scales with prose length', () => {
		const words = Array.from({ length: 1000 }, () => 'word').join(' ');
		expect(estimateReadingMinutes(words)).toBe(5);
	});

	it('counts fenced code faster than prose', () => {
		const code = `\`\`\`ts\n${Array.from({ length: 1200 }, () => 'x').join(' ')}\n\`\`\``;
		const prose = Array.from({ length: 1200 }, () => 'word').join(' ');
		expect(estimateReadingMinutes(code)).toBeLessThan(
			estimateReadingMinutes(prose),
		);
	});
});
