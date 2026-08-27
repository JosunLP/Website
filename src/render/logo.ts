import { raw, type SafeHtml } from '@/utils/html';

/**
 * The site mark, inlined once per document as an SVG `<symbol>` and
 * referenced with `<use>` wherever it appears.
 *
 * It used to ship as two `<img>` elements per placement — a light and a
 * dark file, one hidden by CSS. Browsers fetch both regardless of
 * `display:none`, so every page paid two render-blocking-adjacent image
 * requests for a mark that is a few hundred bytes of path data. Inlining
 * removes the requests entirely, and lets the wordmark follow
 * `currentColor` instead of needing a second file to change colour.
 *
 * Geometry is copied verbatim from `public/images/logo-jonas-*.svg`. Those
 * files stay in place as the canonical brand assets: the social-card
 * generator rasterizes the dark one, and both are linkable by URL.
 */
const LOGO_ID = 'jp-logo';

/** Brand red of the two triangles, unchanged between themes. */
const MARK_RED = 'rgb(170,53,53)';

const TRIANGLE =
	'M550.485,685.376L776.668,975.946L324.303,975.946L550.485,685.376Z';
const WORDMARK =
	'M369.696,541.176L324.303,482.861L776.668,482.861L584.757,729.404L776.668,975.946L324.303,975.946L663.25,541.176L369.696,541.176ZM550.485,772.766L437.721,917.631L663.25,917.631L550.485,772.766Z';

/**
 * The symbol definition. Rendered once per document, before anything that
 * references it. Hidden by collapsing the element rather than with
 * `display:none`, which is the variant of the sprite pattern that does
 * not depend on how an engine treats `<use>` into a non-rendered tree.
 */
export const LOGO_SPRITE: SafeHtml = raw(
	`<svg xmlns="http://www.w3.org/2000/svg" class="absolute h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false"><symbol id="${LOGO_ID}" viewBox="0 0 1084 1084" fill-rule="evenodd" clip-rule="evenodd"><g transform="matrix(1.28571,0,0,1.35762,-154.762,-193.71)"><g transform="matrix(1.28952,0,0,-1.1178,-168.195,1356.36)"><path d="${TRIANGLE}" fill="${MARK_RED}"/></g><g transform="matrix(1.28952,0,0,1.1178,-168.195,-273.032)"><path d="${TRIANGLE}" fill="${MARK_RED}"/></g><g transform="matrix(1.28952,0,0,1.12037,-168.195,-275.536)"><path d="${WORDMARK}" fill="currentColor"/></g></g></symbol></svg>`,
);

/**
 * A placement of the mark. Decorative by default: every use so far sits
 * inside a link that already carries the site name as text.
 */
export function siteLogo(size: number, classes: string): SafeHtml {
	return raw(
		`<svg class="text-ink dark:text-snow ${classes}" width="${String(size)}" height="${String(size)}" aria-hidden="true" focusable="false"><use href="#${LOGO_ID}"/></svg>`,
	);
}
