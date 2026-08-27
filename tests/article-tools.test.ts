import { beforeAll, describe, expect, it } from 'vitest';
import { registerArticleTools } from '@/components/article-tools';

function tick(ms = 20): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const ARTICLE = `
	<jp-article-tools
		data-copy="Copy code"
		data-copied="Copied"
		data-copy-failed="Copy failed"
		data-heading-link="Link to this section"
		data-progress="Reading progress"
	>
		<nav data-toc>
			<ol>
				<li><a class="jp-toc-link" href="#one">One</a></li>
				<li><a class="jp-toc-link" href="#two">Two</a></li>
			</ol>
		</nav>
		<div class="jp-prose" data-article-body>
			<h2 id="one">One</h2>
			<p>Text.</p>
			<pre><code>const x = 1;</code></pre>
			<h3 id="two">Two</h3>
		</div>
	</jp-article-tools>`;

beforeAll(() => {
	registerArticleTools();
});

describe('jp-article-tools', () => {
	it('adds a permalink and a named link to every heading with an id', async () => {
		document.body.innerHTML = ARTICLE;
		await tick();
		const heading = document.querySelector('#one')!;
		const decorative = heading.querySelector('.jp-heading-anchor')!;
		expect(decorative.getAttribute('href')).toBe('#one');
		// Decorative: the visible "#" must not reach the accessibility tree.
		expect(decorative.getAttribute('aria-hidden')).toBe('true');
		// …and the heading text is captured before the "#" is appended.
		const named = heading.querySelector('a.sr-only')!;
		expect(named.textContent).toBe('Link to this section: One');
	});

	it('adds a copy button per code block, labelled from the host', async () => {
		document.body.innerHTML = ARTICLE;
		await tick();
		const button = document.querySelector<HTMLButtonElement>('.jp-code-copy');
		expect(button).not.toBeNull();
		expect(button?.textContent).toBe('Copy code');
		expect(button?.type).toBe('button');
	});

	it('exposes reading progress as a progressbar', async () => {
		document.body.innerHTML = ARTICLE;
		await tick();
		const bar = document.querySelector('.jp-reading-progress')!;
		expect(bar.getAttribute('role')).toBe('progressbar');
		expect(bar.getAttribute('aria-label')).toBe('Reading progress');
		expect(bar.getAttribute('aria-valuenow')).not.toBeNull();
	});

	it('enhances nothing twice when re-run', async () => {
		document.body.innerHTML = ARTICLE;
		await tick();
		const host = document.querySelector('jp-article-tools')!;
		// Reconnecting re-runs connectedCallback; duplicated anchors and
		// buttons would pile up on every view transition.
		host.remove();
		document.body.append(host);
		await tick();
		expect(document.querySelectorAll('.jp-heading-anchor')).toHaveLength(2);
		expect(document.querySelectorAll('.jp-code-copy')).toHaveLength(1);
		expect(document.querySelectorAll('.jp-reading-progress')).toHaveLength(1);
	});

	it('waits for an article body that arrives later', async () => {
		document.body.innerHTML = `
			<jp-article-tools data-heading-link="Link to this section">
				<div data-placeholder>Loading…</div>
			</jp-article-tools>`;
		await tick();
		expect(document.querySelector('.jp-heading-anchor')).toBeNull();

		const host = document.querySelector('jp-article-tools')!;
		host.innerHTML =
			'<div class="jp-prose" data-article-body><h2 id="late">Late</h2></div>';
		await tick(40);
		expect(document.querySelector('#late .jp-heading-anchor')).not.toBeNull();
	});
});
