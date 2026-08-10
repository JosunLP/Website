/**
 * Reading-time estimation for blog posts.
 *
 * Runs on the raw Markdown body rather than the rendered HTML so the same
 * number can be produced at build time (manifest generation) and in the
 * browser (posts uploaded after the build) without a DOM.
 */

/** Average silent reading speed for technical prose, in words per minute. */
const WORDS_PER_MINUTE = 200;

/**
 * Code is scanned, not read: counting it at prose speed inflates the
 * estimate badly on posts that are mostly listings.
 */
const CODE_WORDS_PER_MINUTE = 600;

const FENCED_CODE = /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$/gm;

function countWords(text: string): number {
	const trimmed = text.trim();
	return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Estimates how many minutes a Markdown post takes to read. Always at
 * least one minute — "0 min read" reads like a rendering bug.
 */
export function estimateReadingMinutes(markdown: string): number {
	let codeWords = 0;
	const prose = markdown.replace(FENCED_CODE, (block) => {
		codeWords += countWords(block);
		return ' ';
	});
	const minutes =
		countWords(prose) / WORDS_PER_MINUTE + codeWords / CODE_WORDS_PER_MINUTE;
	return Math.max(1, Math.round(minutes));
}
