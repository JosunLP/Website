import { describe, expect, it } from 'vitest';
import { alternatePaths, equivalentPath, localeFromPath } from '@/app/routes';
import { HEADER_NAV, blogPostPath, pagePath } from '@/app/configuration';
import { VIEW_TRANSITION_TYPES_SNIPPET } from '@/features/navigation/view-transition-types';

describe('localeFromPath', () => {
	it('extracts supported locales', () => {
		expect(localeFromPath('/de/projects/')).toBe('de');
		expect(localeFromPath('/en/')).toBe('en');
	});

	it('returns undefined for unknown prefixes', () => {
		expect(localeFromPath('/fr/page/')).toBeUndefined();
		expect(localeFromPath('/')).toBeUndefined();
		expect(localeFromPath('/assets/x.js')).toBeUndefined();
	});
});

describe('equivalentPath', () => {
	it('preserves the route across locales', () => {
		expect(equivalentPath('/de/projects/', 'en')).toBe('/en/projects/');
		expect(equivalentPath('/en/blog/my-post/', 'de')).toBe('/de/blog/my-post/');
	});

	it('maps locale roots onto each other', () => {
		expect(equivalentPath('/de/', 'en')).toBe('/en/');
	});

	it('maps unprefixed paths to the target home page', () => {
		expect(equivalentPath('/', 'en')).toBe('/en/');
	});
});

describe('alternatePaths', () => {
	it('produces one path per locale', () => {
		expect(alternatePaths('/en/about/')).toEqual({
			de: '/de/about/',
			en: '/en/about/',
		});
	});
});

describe('path helpers', () => {
	it('builds localized page paths', () => {
		expect(pagePath('de', 'home')).toBe('/de/');
		expect(pagePath('en', 'privacy')).toBe('/en/privacy/');
	});

	it('builds blog post paths', () => {
		expect(blogPostPath('en', 'my-post')).toBe('/en/blog/my-post/');
	});
});

describe('view-transition direction snippet', () => {
	/**
	 * The snippet decides whether a navigation slides forwards or
	 * backwards by ranking the first path segment. It is an inlined string
	 * and cannot import HEADER_NAV, so the order is asserted here — a
	 * mismatch silently sends half the navigations the wrong way.
	 */
	it('ranks pages in header-navigation order', () => {
		const expected = HEADER_NAV.map((page) =>
			pagePath('de', page)
				.replace(/^\/de\/?/, '')
				.replace(/\/$/, ''),
		);
		expect(VIEW_TRANSITION_TYPES_SNIPPET).toContain(JSON.stringify(expected));
	});
});
