import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/domain/models/locale';
import type { AssetResolver } from '@/render/layout';
import { buildRoutes } from '@/render/site';
import { THEME_INIT_SNIPPET } from '@/features/theme/theme-init';

/**
 * Guards against the class of bug where the server renders one thing and
 * an island renders another after the first paint — which the reader sees
 * as the page rearranging itself a moment after it appears.
 *
 * Nothing else in the suite can catch this: the markup is valid, the
 * components behave correctly, and axe is happy either way. It only shows
 * up as movement in a real browser, so the contract is asserted here.
 */

const ASSETS: AssetResolver = {
	script: (entry) => `/assets/${entry}.js`,
	styles: () => ['/assets/styles.css'],
	extraHead: () => '',
};

const routes = buildRoutes(ASSETS, { entries: [], articles: new Map() });

function render(path: string): string {
	const route = routes.get(path);
	expect(route, `route ${path} must exist`).toBeDefined();
	return route!();
}

describe('first paint matches the upgraded page', () => {
	for (const locale of LOCALES) {
		const path = `/${locale}/`;

		it(`${path} renders the navigation already collapsed`, () => {
			const html = render(path);
			const list = /<ul\s+id="main-nav"\s+class="([^"]*)"/.exec(html)?.[1];
			expect(list, 'the nav list must be rendered').toBeDefined();
			// Expanded-then-hidden was a multi-line header collapsing on every
			// mobile load.
			expect(list).toContain('hidden');
			expect(list).toContain('md:flex');
		});

		it(`${path} renders the menu toggle visible, not hidden`, () => {
			const html = render(path);
			const button = /<button[^>]*data-nav-toggle[\s\S]*?>/.exec(html)?.[0];
			expect(button, 'the toggle must be rendered').toBeDefined();
			// `hidden` here would mean the button pops in on upgrade; the
			// `.no-js` rules hide it for non-scripting readers instead.
			expect(button).not.toMatch(/\shidden[\s>]/);
		});

		it(`${path} marks <html> as no-js for the head snippet to clear`, () => {
			expect(render(path)).toContain('class="no-js"');
		});
	}

	it('the inline head snippet clears no-js outside its try/catch', () => {
		// Inside the try, a browser with scripting on but localStorage
		// blocked would keep the no-script navigation for the whole visit.
		const beforeTry = THEME_INIT_SNIPPET.slice(
			0,
			THEME_INIT_SNIPPET.indexOf('try{'),
		);
		expect(beforeTry).toContain('classList.remove("no-js")');
	});
});
