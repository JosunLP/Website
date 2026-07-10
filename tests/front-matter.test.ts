import { describe, expect, it } from 'vitest';
import { parseFrontMatter } from '@/domain/services/front-matter';

describe('parseFrontMatter', () => {
	it('parses scalars, booleans, and quoted strings', () => {
		const { data, body } = parseFrontMatter(
			`---\ntitle: "Hello: World"\ndraft: false\nfeatured: true\nslug: my-post\n---\n\nBody text.\n`,
		);
		expect(data).toEqual({
			title: 'Hello: World',
			draft: false,
			featured: true,
			slug: 'my-post',
		});
		expect(body.trim()).toBe('Body text.');
	});

	it('parses block lists of strings', () => {
		const { data } = parseFrontMatter(
			`---\ntags:\n  - "TypeScript"\n  - 'Open Source'\n  - Plain\ntitle: x\n---\nbody`,
		);
		expect(data.tags).toEqual(['TypeScript', 'Open Source', 'Plain']);
		expect(data.title).toBe('x');
	});

	it('ignores blank lines and comments', () => {
		const { data } = parseFrontMatter(
			`---\n# a comment\n\ntitle: x\n---\nbody`,
		);
		expect(data).toEqual({ title: 'x' });
	});

	it('rejects documents without front matter', () => {
		expect(() => parseFrontMatter('no front matter')).toThrow(/does not start/);
	});

	it('rejects unclosed front matter blocks', () => {
		expect(() => parseFrontMatter('---\ntitle: x\n')).toThrow(/not closed/);
	});

	it('rejects unsupported lines', () => {
		expect(() =>
			parseFrontMatter('---\nnested:\n  key: value\n---\nbody'),
		).toThrow(/unsupported|list/);
	});

	it('rejects list items without a list key', () => {
		expect(() => parseFrontMatter('---\n  - item\n---\nbody')).toThrow(
			/outside of a list/,
		);
	});

	it('handles CRLF line endings', () => {
		const { data, body } = parseFrontMatter(
			'---\r\ntitle: x\r\n---\r\nbody\r\n',
		);
		expect(data.title).toBe('x');
		expect(body.trim()).toBe('body');
	});
});
