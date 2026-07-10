import { describe, expect, it } from 'vitest';
import { alternatePaths, equivalentPath, localeFromPath } from '@/app/routes';
import { blogPostPath, pagePath } from '@/app/configuration';

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
