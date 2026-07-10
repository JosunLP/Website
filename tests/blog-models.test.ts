import { describe, expect, it } from 'vitest';
import {
	toFrontMatter,
	validateFrontMatter,
	validateManifest,
} from '@/domain/models/blog';

const VALID_FRONT_MATTER = {
	title: 'A post',
	description: 'Description.',
	publishedAt: '2026-07-09',
	slug: 'a-post',
	locale: 'en',
	translationKey: 'a-post',
	tags: ['TypeScript'],
	draft: false,
	featured: false,
};

describe('validateFrontMatter', () => {
	it('accepts valid front matter', () => {
		expect(validateFrontMatter(VALID_FRONT_MATTER)).toEqual([]);
	});

	it('rejects missing required fields', () => {
		const errors = validateFrontMatter({ title: 'x' });
		expect(errors.length).toBeGreaterThan(0);
	});

	it('rejects malformed dates', () => {
		expect(
			validateFrontMatter({ ...VALID_FRONT_MATTER, publishedAt: '9.7.2026' }),
		).toContainEqual(expect.stringContaining('publishedAt'));
	});

	it('rejects unsupported locales', () => {
		expect(
			validateFrontMatter({ ...VALID_FRONT_MATTER, locale: 'fr' }),
		).toContainEqual(expect.stringContaining('locale'));
	});

	it('rejects non-kebab-case slugs', () => {
		expect(
			validateFrontMatter({ ...VALID_FRONT_MATTER, slug: 'A Post!' }),
		).toContainEqual(expect.stringContaining('slug'));
	});

	it('requires alt text when a cover image is set', () => {
		expect(
			validateFrontMatter({ ...VALID_FRONT_MATTER, coverImage: '/x.webp' }),
		).toContainEqual(expect.stringContaining('coverImageAlt'));
	});
});

describe('toFrontMatter', () => {
	it('normalizes optional fields', () => {
		const meta = toFrontMatter({ ...VALID_FRONT_MATTER });
		expect(meta.updatedAt).toBeUndefined();
		expect(meta.coverImage).toBeUndefined();
		expect(meta.tags).toEqual(['TypeScript']);
	});

	it('throws on invalid data', () => {
		expect(() => toFrontMatter({})).toThrow(/invalid front matter/);
	});
});

describe('validateManifest', () => {
	const entry = {
		title: 'A post',
		description: 'Description.',
		publishedAt: '2026-07-09',
		slug: 'a-post',
		locale: 'en',
		translationKey: 'a-post',
		tags: ['TypeScript'],
		featured: false,
		path: '/content/blog/en/a-post.md',
	};

	it('accepts a valid manifest', () => {
		expect(
			validateManifest({ version: 1, generatedAt: 'x', posts: [entry] }),
		).toEqual([]);
	});

	it('rejects wrong versions', () => {
		expect(validateManifest({ version: 2, posts: [] })).toContainEqual(
			expect.stringContaining('version'),
		);
	});

	it('rejects entries with traversal-style paths', () => {
		expect(
			validateManifest({
				version: 1,
				posts: [{ ...entry, path: '/../secret.md' }],
			}),
		).toContainEqual(expect.stringContaining('path'));
	});

	it('rejects non-object posts', () => {
		expect(validateManifest({ version: 1, posts: ['x'] })).toContainEqual(
			expect.stringContaining('not an object'),
		);
	});
});
