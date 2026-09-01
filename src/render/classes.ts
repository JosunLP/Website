/**
 * Class names shared between the server renderer and the client islands.
 *
 * The blog index is rendered twice: once at build time by
 * {@link import('./ui').blogCard}, and once in the browser by
 * `jp-blog-list` when the runtime manifest lists posts the build did not
 * know about. The island used to guarantee identical markup by importing
 * the renderer itself — which dragged the whole render layer and both
 * locale dictionaries into the page bundle.
 *
 * Sharing the class strings instead keeps the two renderings visually
 * identical for a few hundred bytes. This module must stay
 * dependency-free; that is the entire point of it.
 */

/**
 * A ruled content row. Carries the page gutter as its own padding — the
 * enclosing {@link ROW_LIST} carries the matching negative margin, so the
 * rules and the pointer highlight span the full width while the text
 * still lines up with everything above.
 */
export const ROW =
	'jp-row border-line dark:border-night-line border-t px-4 py-8 sm:px-6 sm:py-10';

/**
 * Container for a run of rows. `:not(:empty)` keeps the closing rule from
 * drawing a stray hairline when the island finds no posts at all.
 */
export const ROW_LIST =
	'border-line dark:border-night-line -mx-4 sm:-mx-6 [&:not(:empty)]:border-b';

/** Two-column row body: label column left, content column right. */
export const ROW_GRID = 'grid gap-x-10 gap-y-5 md:grid-cols-12';

/** Left (metadata) column of a blog row. */
export const ROW_ASIDE = 'md:col-span-3';

/** Right (content) column of a blog row. */
export const ROW_MAIN = 'md:col-span-8 md:col-start-5';

/** Monospace metadata line. */
export const META =
	'jp-meta text-ink-muted dark:text-snow-muted flex flex-wrap items-baseline gap-x-2';

/** Row heading. */
export const ROW_TITLE = 'jp-title text-2xl';

/** The heading's link: underlined when the row is hovered. */
export const ROW_LINK = 'jp-row-link text-ink dark:text-snow';

/** Body copy inside a row. */
export const ROW_TEXT =
	'text-ink-muted dark:text-snow-muted mt-4 leading-relaxed';

/** Inline technology/tag list. */
export const TAGLIST =
	'jp-taglist jp-meta text-ink-muted dark:text-snow-muted mt-4';

/** Decorative separator between metadata items. */
export const SEPARATOR = 'text-line-strong dark:text-night-line-strong';
