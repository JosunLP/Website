import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { registerSiteNav } from '@/components/site-nav';
import { registerThemeToggle } from '@/components/theme-toggle';
import { registerBlogList } from '@/components/blog-list';
import { registerTagFilter } from '@/components/tag-filter';
import type { BlogManifestEntry } from '@/domain/models/blog';
import type { FetchLike } from '@/domain/services/blog-manifest-service';
import { messagesFor } from '@/features/i18n';
import { blogCard } from '@/render/ui';

function tick(ms = 30): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const MANIFEST = {
	version: 1,
	generatedAt: 'x',
	posts: [
		{
			title: 'Uploaded later',
			description: 'A post that was not part of the build.',
			publishedAt: '2026-07-01',
			slug: 'uploaded-later',
			locale: 'en',
			translationKey: 'uploaded-later',
			tags: ['TypeScript'],
			featured: false,
			readingMinutes: 4,
			path: '/content/blog/en/uploaded-later.md',
		},
	],
};

const manifestFetch: FetchLike = () =>
	Promise.resolve({
		ok: true,
		status: 200,
		json: () => Promise.resolve(MANIFEST),
		text: () => Promise.resolve(''),
	});

beforeAll(() => {
	registerThemeToggle();
	registerSiteNav();
	registerBlogList(manifestFetch);
	registerTagFilter();
});

describe('jp-theme-toggle', () => {
	it('renders a labelled button and flips the resolved theme on click', async () => {
		document.documentElement.classList.remove('dark');
		localStorage.clear();
		document.body.innerHTML = `<jp-theme-toggle data-label="Color scheme" data-light="Light" data-dark="Dark" data-system="System"></jp-theme-toggle>`;
		await tick();
		const button = document.querySelector('jp-theme-toggle button');
		expect(button).not.toBeNull();
		expect(button?.textContent).toContain('Color scheme');
		expect(button?.textContent).toContain('System');
		// The icon is a CSS-masked span; inline <svg> would be stripped by
		// bQuery's render sanitizer, so guard that the icon element survives.
		expect(button?.querySelector('.jp-theme-icon--system')).not.toBeNull();

		(button as HTMLButtonElement).click();
		await tick();
		// system (resolves light in the test env) → dark: stored explicitly.
		expect(localStorage.getItem('jp:theme')).toBe('dark');
		expect(document.documentElement.classList.contains('dark')).toBe(true);

		document
			.querySelector<HTMLButtonElement>('jp-theme-toggle button')!
			.click();
		await tick();
		// dark → light.
		expect(localStorage.getItem('jp:theme')).toBe('light');
		expect(document.documentElement.classList.contains('dark')).toBe(false);

		document
			.querySelector<HTMLButtonElement>('jp-theme-toggle button')!
			.click();
		await tick();
		// light → dark again: every click visibly flips the theme.
		expect(localStorage.getItem('jp:theme')).toBe('dark');
		expect(document.documentElement.classList.contains('dark')).toBe(true);
	});

	it('replaces the icon element on each swap so the animation replays', async () => {
		document.documentElement.classList.remove('dark');
		localStorage.clear();
		document.body.innerHTML = `<jp-theme-toggle data-label="Color scheme" data-light="Light" data-dark="Dark" data-system="System"></jp-theme-toggle>`;
		await tick();
		const button = document.querySelector<HTMLButtonElement>(
			'jp-theme-toggle button',
		)!;
		const before = button.querySelector('.jp-theme-icon')!;

		button.click();
		await tick();
		const after = button.querySelector('.jp-theme-icon')!;
		expect(after.classList.contains('jp-theme-icon--dark')).toBe(true);
		// A CSS animation does not restart while the same element keeps the
		// same animation-name, so the glyph must be a fresh node.
		expect(after).not.toBe(before);
	});
});

describe('jp-site-nav', () => {
	/**
	 * happy-dom hands out a fresh MediaQueryList per `matchMedia` call, so
	 * a test cannot reach the one the component captured. This swaps in a
	 * single shared, dispatchable stub for the desktop query.
	 */
	function stubDesktopQuery(): { setMatches(value: boolean): void } {
		const target = new EventTarget() as EventTarget & {
			matches: boolean;
			media: string;
		};
		target.matches = false;
		target.media = '(min-width: 48rem)';
		const original = window.matchMedia.bind(window);
		window.matchMedia = ((query: string) =>
			query === target.media
				? target
				: original(query)) as typeof window.matchMedia;
		return {
			setMatches(value: boolean): void {
				target.matches = value;
				target.dispatchEvent(new Event('change'));
			},
		};
	}

	function mount(): void {
		document.body.innerHTML = `
			<jp-site-nav>
				<button type="button" data-nav-toggle aria-expanded="false" aria-controls="main-nav" hidden>
					<span class="sr-only" data-open-label="Open menu" data-close-label="Close menu">Open menu</span>
				</button>
				<nav aria-label="Main navigation">
					<ul id="main-nav" class="flex flex-wrap items-center"><li><a href="/en/">Home</a></li></ul>
				</nav>
			</jp-site-nav>`;
	}

	it('reveals the toggle and collapses the list', async () => {
		mount();
		await tick();
		const toggle =
			document.querySelector<HTMLButtonElement>('[data-nav-toggle]')!;
		const list = document.querySelector('#main-nav')!;
		expect(toggle.hidden).toBe(false);
		expect(list.classList.contains('hidden')).toBe(true);
	});

	it('opens, updates labels, and closes on Escape', async () => {
		mount();
		await tick();
		const toggle =
			document.querySelector<HTMLButtonElement>('[data-nav-toggle]')!;
		toggle.click();
		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		expect(
			document.querySelector('#main-nav')!.classList.contains('hidden'),
		).toBe(false);
		expect(toggle.textContent).toContain('Close menu');

		document
			.querySelector('jp-site-nav')!
			.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
			);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
		expect(
			document.querySelector('#main-nav')!.classList.contains('hidden'),
		).toBe(true);
	});

	it('closes when a navigation link is clicked', async () => {
		mount();
		await tick();
		const toggle =
			document.querySelector<HTMLButtonElement>('[data-nav-toggle]')!;
		toggle.click();
		const link = document.querySelector('#main-nav a')!;
		link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes the panel when the viewport grows past the md breakpoint', async () => {
		const desktop = stubDesktopQuery();
		mount();
		await tick();
		const toggle =
			document.querySelector<HTMLButtonElement>('[data-nav-toggle]')!;
		toggle.click();
		expect(toggle.getAttribute('aria-expanded')).toBe('true');

		// Past `md` the toggle is hidden by CSS, so an open panel could no
		// longer be closed and its focus trap would keep swallowing Tab.
		desktop.setMatches(true);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
		expect(
			document.querySelector('#main-nav')!.classList.contains('hidden'),
		).toBe(true);
	});
});

/**
 * The labels the island reads off its host. They replace the message
 * dictionaries it used to import — see src/components/blog-list.ts.
 */
const LIST_LABELS = [
	`data-reading-time="{count} min read"`,
	`data-tags-label="Topics"`,
	`data-count-label="{count} article | {count} articles"`,
	`data-error-label="Could not load"`,
].join(' ');

describe('jp-blog-list', () => {
	it('replaces the static grid with manifest posts', async () => {
		document.body.innerHTML = `
			<jp-blog-list locale="en" ${LIST_LABELS}>
				<div data-blog-status aria-live="polite" class="sr-only"></div>
				<p data-post-count>0 articles</p>
				<div data-post-grid></div>
				<p data-empty-state>No articles have been published yet.</p>
			</jp-blog-list>`;
		await tick(80);
		const grid = document.querySelector('[data-post-grid]')!;
		expect(grid.querySelectorAll('article')).toHaveLength(1);
		expect(grid.textContent).toContain('Uploaded later');
		expect(document.querySelector('[data-empty-state]')).toBeNull();
		expect(document.querySelector('[data-post-count]')!.textContent).toContain(
			'1 article',
		);
	});

	it('refreshes when a post was replaced rather than added', async () => {
		// Same count as the manifest, different post: comparing counts alone
		// would read this as "nothing changed" and leave the stale card up.
		document.body.innerHTML = `
			<jp-blog-list locale="en" ${LIST_LABELS}>
				<p data-post-count>1 article</p>
				<div data-post-grid>
					<article data-slug="removed-since-build"><h2>Removed since build</h2></article>
				</div>
			</jp-blog-list>`;
		await tick(80);
		const grid = document.querySelector('[data-post-grid]')!;
		expect(grid.querySelectorAll('article')).toHaveLength(1);
		expect(grid.textContent).toContain('Uploaded later');
		expect(grid.textContent).not.toContain('Removed since build');
	});
});

/**
 * Structural signature of a subtree: tag names, class attributes, the
 * data/href attributes the design depends on, and the visible text with
 * whitespace collapsed. Whitespace-only text nodes are dropped because
 * the server renders from a template literal and the island from DOM
 * calls — that difference is not a difference in the result.
 */
function signature(node: Element): string {
	const parts: string[] = [];
	const walk = (el: Element, depth: number): void => {
		const attrs = [
			'class',
			'data-slug',
			'data-tags',
			'href',
			'datetime',
			'aria-label',
			'aria-hidden',
		]
			.map((name) =>
				el.hasAttribute(name) ? `${name}=${el.getAttribute(name) ?? ''}` : null,
			)
			.filter((entry) => entry !== null)
			.join(' ');
		parts.push(`${'  '.repeat(depth)}<${el.tagName.toLowerCase()} ${attrs}>`);
		for (const child of el.childNodes) {
			if (child.nodeType === 1) {
				walk(child as Element, depth + 1);
			} else if (child.nodeType === 3) {
				const text = (child.textContent ?? '').replace(/\s+/g, ' ').trim();
				if (text !== '') {
					parts.push(`${'  '.repeat(depth + 1)}"${text}"`);
				}
			}
		}
	};
	walk(node, 0);
	return parts.join('\n');
}

describe('blog row rendering parity', () => {
	/**
	 * jp-blog-list builds its rows itself instead of importing the server
	 * renderer, which is what keeps 26 kB of render layer and both locale
	 * dictionaries off the blog index. This test is the guarantee that
	 * replaces that import: the two renderings must stay identical.
	 */
	it('the island builds the same row the server renders', async () => {
		const post: BlogManifestEntry = {
			title: 'Uploaded later',
			description: 'A post that was not part of the build.',
			publishedAt: '2026-07-01',
			slug: 'uploaded-later',
			locale: 'en',
			translationKey: 'uploaded-later',
			tags: ['TypeScript'],
			featured: false,
			readingMinutes: 4,
			path: '/content/blog/en/uploaded-later.md',
		};
		const messages = messagesFor('en');

		const host = document.createElement('div');
		host.innerHTML = blogCard(post, 'en', messages, {
			headingLevel: 'h2',
		}).value;
		const server = host.querySelector('article')!;

		document.body.innerHTML = `
			<jp-blog-list locale="en"
				data-reading-time="${messages.blog.readingTime}"
				data-tags-label="${messages.blog.tagsLabel}"
				data-count-label="${messages.blog.postCount}"
				data-error-label="${messages.blog.loadError}">
				<p data-post-count>0</p>
				<div data-post-grid></div>
			</jp-blog-list>`;
		await tick(80);
		const client = document.querySelector('[data-post-grid] article')!;

		expect(signature(client)).toBe(signature(server));
	});
});

describe('jp-tag-filter', () => {
	// The filter writes the active topic into the URL, so each case has to
	// start from a clean one or it inherits the previous test's selection.
	beforeEach(() => {
		history.replaceState(null, '', '/en/blog/');
	});

	function mountList(posts: readonly { slug: string; tags: string[] }[]): void {
		// A plain wrapper, not <jp-blog-list>: the filter is tested on its
		// own, and the manifest island would otherwise replace these rows.
		document.body.innerHTML = `
			<div>
				<jp-tag-filter data-label="Filter by topic" data-all="All"
					data-result="{count} post | {count} posts"></jp-tag-filter>
				<div data-post-grid>
					${posts
						.map(
							(post) =>
								`<article data-slug="${post.slug}" data-tags="|${post.tags.join('|')}|"><h2>${post.slug}</h2></article>`,
						)
						.join('')}
				</div>
			</div>`;
	}

	const MANY = [
		{ slug: 'a', tags: ['TypeScript'] },
		{ slug: 'b', tags: ['Tooling'] },
		{ slug: 'c', tags: ['TypeScript', 'Tooling'] },
		{ slug: 'd', tags: ['Tooling'] },
	];

	it('stays absent while there is too little to filter', async () => {
		mountList([
			{ slug: 'a', tags: ['TypeScript'] },
			{ slug: 'b', tags: ['Tooling'] },
		]);
		await tick(80);
		// Two posts is a list you read, not one you filter — and an empty
		// control would only add noise above it.
		expect(document.querySelector('jp-tag-filter button')).toBeNull();
	});

	it('offers every topic once, alphabetically, behind an "All" reset', async () => {
		mountList(MANY);
		await tick(80);
		const labels = [...document.querySelectorAll('jp-tag-filter button')].map(
			(button) => button.textContent,
		);
		expect(labels).toEqual(['All', 'Tooling', 'TypeScript']);
	});

	it('hides non-matching rows and reflects the choice in the URL', async () => {
		mountList(MANY);
		await tick(80);
		const buttons = [
			...document.querySelectorAll<HTMLButtonElement>('jp-tag-filter button'),
		];
		const typescript = buttons.find((b) => b.textContent === 'TypeScript')!;
		typescript.click();

		const rows = [
			...document.querySelectorAll<HTMLElement>('[data-post-grid] article'),
		];
		expect(
			rows.filter((row) => !row.hidden).map((row) => row.dataset.slug),
		).toEqual(['a', 'c']);
		expect(typescript.getAttribute('aria-pressed')).toBe('true');
		expect(new URL(location.href).searchParams.get('tag')).toBe('TypeScript');
	});

	it('clears the filter when the active topic is chosen again', async () => {
		mountList(MANY);
		await tick(80);
		const typescript = [
			...document.querySelectorAll<HTMLButtonElement>('jp-tag-filter button'),
		].find((b) => b.textContent === 'TypeScript')!;
		typescript.click();
		typescript.click();

		const rows = [
			...document.querySelectorAll<HTMLElement>('[data-post-grid] article'),
		];
		expect(rows.every((row) => !row.hidden)).toBe(true);
		expect(typescript.getAttribute('aria-pressed')).toBe('false');
		expect(new URL(location.href).searchParams.get('tag')).toBeNull();
	});

	it('rebuilds when the manifest island replaces the rows', async () => {
		mountList(MANY);
		await tick(80);
		const grid = document.querySelector('[data-post-grid]')!;

		// A post uploaded after the build arrives with a topic that was not
		// on offer before; the control must notice.
		grid.innerHTML +=
			'<article data-slug="e" data-tags="|Rust|"><h2>e</h2></article>';
		document.dispatchEvent(
			new CustomEvent('jp-blog-list:updated', { bubbles: true }),
		);
		await tick(80);

		const labels = [...document.querySelectorAll('jp-tag-filter button')].map(
			(button) => button.textContent,
		);
		expect(labels).toEqual(['All', 'Rust', 'Tooling', 'TypeScript']);
	});

	it('applies a topic named in the URL on load', async () => {
		history.replaceState(null, '', '/en/blog/?tag=Tooling');
		mountList(MANY);
		await tick(80);
		const rows = [
			...document.querySelectorAll<HTMLElement>('[data-post-grid] article'),
		];
		expect(
			rows.filter((row) => !row.hidden).map((row) => row.dataset.slug),
		).toEqual(['b', 'c', 'd']);
		history.replaceState(null, '', '/en/blog/');
	});
});
