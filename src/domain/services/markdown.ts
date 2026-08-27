import { marked, type Tokens } from 'marked';
import { sanitizeHtml } from '@bquery/bquery/security';
import { escape } from '@/utils/html';

/**
 * Safe Markdown rendering for blog posts.
 *
 * Markdown files are treated as untrusted content even though they are
 * owner-authored. The pipeline is: `marked` (parsing only, HTML
 * passthrough disabled by escaping) → bQuery `sanitizeHtml` allow-list →
 * post-processing (responsive table wrappers).
 *
 * The same module runs at build time (prerendered posts, with happy-dom
 * globals) and in the browser (posts uploaded after deployment).
 */

export interface TocEntry {
	readonly id: string;
	readonly text: string;
	readonly level: 2 | 3;
}

export interface RenderedMarkdown {
	readonly html: string;
	readonly toc: readonly TocEntry[];
}

export interface MarkdownRenderOptions {
	/**
	 * Optional code highlighter (e.g. highlight.js). Receives raw code and
	 * the requested language, returns HTML. Output is sanitized afterwards
	 * like everything else.
	 */
	readonly highlight?: (code: string, language: string) => string;
	/** Accessible suffix label for external links. */
	readonly externalLinkLabel: string;
}

/** Attributes the sanitizer allows beyond its safe defaults. */
const EXTRA_ALLOWED_ATTRIBUTES = ['checked', 'disabled'];

const HEADING_ID_SANITIZE = /[^a-z0-9\s-]/g;

export function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(HEADING_ID_SANITIZE, '')
		.trim()
		.replace(/\s+/g, '-')
		.slice(0, 80);
}

function isExternalHref(href: string): boolean {
	return /^https?:\/\//.test(href);
}

function isSafeHref(href: string): boolean {
	return (
		/^https?:\/\//.test(href) ||
		href.startsWith('/') ||
		href.startsWith('#') ||
		href.startsWith('mailto:')
	);
}

/**
 * Renders Markdown to sanitized HTML plus a table of contents.
 * Malformed Markdown never throws — `marked` is forgiving — but unsafe
 * constructs are removed by the sanitizer.
 */
export function renderMarkdown(
	markdown: string,
	options: MarkdownRenderOptions,
): RenderedMarkdown {
	const toc: TocEntry[] = [];
	const usedIds = new Set<string>();

	const renderer = new marked.Renderer();

	renderer.heading = ({ tokens, depth }: Tokens.Heading): string => {
		const text = tokens
			.map((token) => ('text' in token ? String(token.text) : ''))
			.join('');
		let id = slugifyHeading(text) || `section-${String(toc.length + 1)}`;
		while (usedIds.has(id)) {
			id = `${id}-x`;
		}
		usedIds.add(id);
		if (depth === 2 || depth === 3) {
			toc.push({ id, text, level: depth });
		}
		return `<h${String(depth)} id="${escape(id)}">${escape(text)}</h${String(depth)}>\n`;
	};

	renderer.link = ({ href, text }: Tokens.Link): string => {
		if (!isSafeHref(href)) {
			return escape(text);
		}
		if (isExternalHref(href)) {
			return `<a href="${escape(href)}" rel="noopener noreferrer">${escape(text)}</a>`;
		}
		return `<a href="${escape(href)}">${escape(text)}</a>`;
	};

	renderer.image = ({ href, text }: Tokens.Image): string => {
		// Images without meaningful alt text are dropped: the authoring
		// contract requires alt text, and shipping images that violate it
		// would fail the accessibility target silently.
		if (!isSafeHref(href) || href.startsWith('#') || text.trim() === '') {
			return '';
		}
		return `<img src="${escape(href)}" alt="${escape(text)}" loading="lazy" decoding="async">`;
	};

	renderer.code = ({ text, lang }: Tokens.Code): string => {
		const language = (lang ?? '').split(/\s+/)[0] ?? '';
		const body =
			options.highlight !== undefined && language !== ''
				? options.highlight(text, language)
				: escape(text);
		const classAttr =
			language !== '' ? ` class="language-${escape(language)}"` : '';
		return `<pre><code${classAttr}>${body}</code></pre>\n`;
	};

	// Raw HTML inside Markdown is emitted as visible text, never as markup.
	renderer.html = ({ text }: Tokens.HTML | Tokens.Tag): string => escape(text);

	const rawHtml = marked.parse(markdown, {
		renderer,
		gfm: true,
		breaks: false,
		async: false,
	});

	let safeHtml = String(
		sanitizeHtml(rawHtml, { allowAttributes: EXTRA_ALLOWED_ATTRIBUTES }),
	);

	// Responsive tables: wrap so wide tables scroll inside their own box.
	safeHtml = safeHtml
		.replaceAll('<table>', '<div class="jp-table-wrap"><table>')
		.replaceAll('</table>', '</table></div>');

	// GFM task lists: mark items for styling and keep the read-only
	// checkboxes out of the tab order (runs after sanitization).
	safeHtml = safeHtml.replace(
		/<li><input ([^>]*type="checkbox"[^>]*)>/g,
		'<li class="jp-task-item"><input $1 tabindex="-1">',
	);

	return { html: safeHtml, toc };
}
