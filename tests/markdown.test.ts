import { describe, expect, it } from 'vitest';
import { renderMarkdown, slugifyHeading } from '@/domain/services/markdown';

const OPTIONS = { externalLinkLabel: 'opens an external site' };

describe('renderMarkdown security', () => {
	it('escapes raw HTML instead of rendering it', () => {
		const { html } = renderMarkdown('<script>alert(1)</script>', OPTIONS);
		expect(html).not.toContain('<script>');
	});

	it('removes javascript: links but keeps their text', () => {
		const { html } = renderMarkdown('[click](javascript:alert(1))', OPTIONS);
		expect(html).not.toContain('javascript:');
		expect(html).toContain('click');
	});

	it('renders raw HTML as inert text, never as markup', () => {
		const { html } = renderMarkdown(
			'text <img src=x onerror=alert(1)> and <iframe src="https://evil.example"></iframe>',
			OPTIONS,
		);
		// The dangerous input survives only as escaped, visible text.
		expect(html).not.toContain('<img');
		expect(html).not.toContain('<iframe');
		expect(html).not.toMatch(/<[^>]+onerror/);
	});

	it('never emits inline styles or style-carrying elements', () => {
		const { html } = renderMarkdown(
			'<div style="position:fixed">x</div>',
			OPTIONS,
		);
		expect(html).not.toContain('<div');
		expect(html).not.toMatch(/<[^>]+style=/);
	});

	it('drops images without alt text', () => {
		const { html } = renderMarkdown('![](/decorative.png)', OPTIONS);
		expect(html).not.toContain('<img');
	});

	it('keeps images with alt text, lazy by default', () => {
		const { html } = renderMarkdown('![A diagram](/diagram.png)', OPTIONS);
		expect(html).toContain('alt="A diagram"');
		expect(html).toContain('loading="lazy"');
	});

	it('hardens external links', () => {
		const { html } = renderMarkdown(
			'[bQuery](https://bquery.js.org/)',
			OPTIONS,
		);
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it('survives malformed markdown without throwing', () => {
		expect(() =>
			renderMarkdown('# \n\n``` \nunclosed\n\n| broken | table\n|', OPTIONS),
		).not.toThrow();
	});
});

describe('renderMarkdown formatting', () => {
	it('assigns stable, unique heading ids and builds a toc', () => {
		const { html, toc } = renderMarkdown(
			'## Setup\n\n### Setup\n\n## Usage',
			OPTIONS,
		);
		expect(html).toContain('<h2 id="setup">');
		expect(html).toContain('<h3 id="setup-x">');
		expect(toc).toEqual([
			{ id: 'setup', text: 'Setup', level: 2 },
			{ id: 'setup-x', text: 'Setup', level: 3 },
			{ id: 'usage', text: 'Usage', level: 2 },
		]);
	});

	it('wraps tables for horizontal scrolling', () => {
		const { html } = renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |', OPTIONS);
		expect(html).toContain('<div class="jp-table-wrap"><table>');
		expect(html).toContain('</table></div>');
	});

	it('renders task lists with inert checkboxes', () => {
		const { html } = renderMarkdown('- [x] done\n- [ ] open', OPTIONS);
		expect(html).toContain('jp-task-item');
		expect(html).toContain('tabindex="-1"');
		expect(html).toContain('checked');
	});

	it('applies the injected code highlighter', () => {
		const { html } = renderMarkdown('```ts\nconst x = 1;\n```', {
			...OPTIONS,
			highlight: (code, lang) => `HL(${lang}):${code.trim()}`,
		});
		expect(html).toContain('HL(ts):const x = 1;');
		expect(html).toContain('class="language-ts"');
	});

	it('renders blockquotes, lists, hr, and inline code', () => {
		const { html } = renderMarkdown(
			'> quote\n\n1. one\n2. two\n\n---\n\n`code`',
			OPTIONS,
		);
		expect(html).toContain('<blockquote>');
		expect(html).toContain('<ol>');
		expect(html).toContain('<hr>');
		expect(html).toContain('<code>code</code>');
	});
});

describe('slugifyHeading', () => {
	it('produces url-safe slugs', () => {
		expect(slugifyHeading('Hello, World! Ümlauts?')).toBe('hello-world-mlauts');
	});
});
