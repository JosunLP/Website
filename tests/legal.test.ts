import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/domain/models/locale';
import { ACCESSIBILITY, IMPRINT, PRIVACY } from '@/content/pages/legal';
import type { AssetResolver } from '@/render/layout';
import { buildRoutes } from '@/render/site';

/**
 * The legal pages carry copy the owner fills in over time, so parts of
 * them are legitimately empty until then. What must never happen is an
 * unanswered item shipping as a visible-but-empty section: a heading such
 * as "VAT / register entries" with nothing under it reads as a defect on
 * a page whose whole job is to look trustworthy.
 */

const ASSETS: AssetResolver = {
	script: (entry) => `/assets/${entry}.js`,
	styles: () => ['/assets/styles.css'],
	extraHead: () => '',
};

const routes = buildRoutes(ASSETS, { entries: [], articles: new Map() });

const LEGAL_PATHS = LOCALES.flatMap((locale) => [
	`/${locale}/imprint/`,
	`/${locale}/privacy/`,
	`/${locale}/accessibility/`,
]);

function renderPage(path: string): string {
	const render = routes.get(path);
	expect(render, `route ${path} must exist`).toBeDefined();
	return render!();
}

/** The `<main>` element, so the shared header/footer stay out of scope. */
function mainOf(html: string): string {
	return /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? '';
}

describe('legal pages', () => {
	for (const path of LEGAL_PATHS) {
		describe(path, () => {
			const main = mainOf(renderPage(path));

			it('renders no empty paragraph', () => {
				const empty = [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].filter(
					(match) => (match[1] ?? '').trim() === '',
				);
				expect(empty).toHaveLength(0);
			});

			it('gives every section heading a paragraph', () => {
				const bare = [...main.matchAll(/<section\b[\s\S]*?<\/section>/g)]
					.map((match) => match[0])
					.filter((section) => !/<p\b/.test(section))
					.map((section) =>
						(/<h2[^>]*>([\s\S]*?)<\/h2>/.exec(section)?.[1] ?? '').trim(),
					);
				expect(bare).toEqual([]);
			});
		});
	}

	// The footer links to this fragment on every page, and the section it
	// names is picked by an explicit anchor rather than its position.
	for (const locale of LOCALES) {
		it(`/${locale}/privacy/ keeps the #local-preferences anchor`, () => {
			expect(renderPage(`/${locale}/privacy/`)).toContain(
				'id="local-preferences"',
			);
		});
	}

	it('declares the anchor the footer link points at', () => {
		const anchored = PRIVACY.sections.filter(
			(section) => section.anchor === 'local-preferences',
		);
		expect(anchored).toHaveLength(1);
	});

	// Empty copy is allowed; a section with no copy in one locale but copy
	// in the other would silently ship a page that says less in one
	// language than the other.
	it('keeps both locales in sync on which sections have content', () => {
		for (const content of [IMPRINT, PRIVACY, ACCESSIBILITY]) {
			for (const section of content.sections) {
				const filled = LOCALES.map((locale) =>
					section.paragraphs[locale].some(
						(paragraph) => paragraph.trim() !== '',
					),
				);
				expect(new Set(filled).size, `"${section.heading.en}"`).toBe(1);
			}
		}
	});
});
