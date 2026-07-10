import { beforeAll, describe, expect, it } from 'vitest';
import { registerSiteNav } from '@/components/site-nav';
import { registerThemeToggle } from '@/components/theme-toggle';
import { registerBlogList } from '@/components/blog-list';
import type { FetchLike } from '@/domain/services/blog-manifest-service';

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
});

describe('jp-theme-toggle', () => {
	it('renders a labelled button and cycles modes on click', async () => {
		document.documentElement.classList.remove('dark');
		localStorage.clear();
		document.body.innerHTML = `<jp-theme-toggle data-label="Color scheme" data-light="Light" data-dark="Dark" data-system="System"></jp-theme-toggle>`;
		await tick();
		const button = document.querySelector('jp-theme-toggle button');
		expect(button).not.toBeNull();
		expect(button?.textContent).toContain('Color scheme');
		expect(button?.textContent).toContain('System');

		(button as HTMLButtonElement).click();
		await tick();
		// system → light: stored explicitly.
		expect(localStorage.getItem('jp:theme')).toBe('light');
		expect(document.documentElement.classList.contains('dark')).toBe(false);

		document
			.querySelector<HTMLButtonElement>('jp-theme-toggle button')!
			.click();
		await tick();
		// light → dark.
		expect(localStorage.getItem('jp:theme')).toBe('dark');
		expect(document.documentElement.classList.contains('dark')).toBe(true);

		document
			.querySelector<HTMLButtonElement>('jp-theme-toggle button')!
			.click();
		await tick();
		// dark → system: stored value cleared.
		expect(localStorage.getItem('jp:theme')).toBeNull();
	});
});

describe('jp-site-nav', () => {
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
});

describe('jp-blog-list', () => {
	it('replaces the static grid with manifest posts', async () => {
		document.body.innerHTML = `
			<jp-blog-list locale="en">
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
});
