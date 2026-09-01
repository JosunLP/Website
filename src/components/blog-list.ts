import { announceToScreenReader } from '@bquery/bquery/a11y';
import {
	BlogManifestService,
	type FetchLike,
} from '@/domain/services/blog-manifest-service';
import type { BlogManifestEntry } from '@/domain/models/blog';
import { isLocale, type Locale } from '@/domain/models/locale';
import { formatIsoDate, formatMessage } from '@/features/i18n/format';
import * as css from '@/render/classes';
import { whenIdle } from '@/utils/schedule';

/**
 * jp-blog-list — enhances the pre-rendered blog index with the runtime
 * manifest so posts uploaded to the server after the build appear too.
 *
 * Progressive enhancement contract: the server-rendered list stays
 * untouched unless the manifest loads successfully and differs. On
 * failure the static content remains and an error is announced only when
 * there is no static content to fall back to.
 *
 * This island used to import the server renderer (`blogCard`) so the two
 * renderings could not drift. That guarantee cost 26 kB — the whole
 * render layer plus both locale dictionaries — on every visit to the
 * blog index, to cover a case that only occurs between a content upload
 * and the next build. It now builds the rows itself from the shared
 * class names in `@/render/classes` and the shared formatters in
 * `@/features/i18n/format`, with every user-visible string passed in as a
 * `data-*` attribute so no dictionary is needed. `tests/components.test.ts`
 * asserts the two renderings still match.
 */

/**
 * True when the rendered rows already match the manifest exactly — same
 * posts, same order. Comparing slugs rather than counts matters when a
 * post is replaced instead of added: an equal count would otherwise be
 * read as "nothing changed" and the stale row would stay on the page.
 */
function sameSlugs(grid: Element, posts: readonly { slug: string }[]): boolean {
	const rendered = [...grid.querySelectorAll('article')].map(
		(row) => row.getAttribute('data-slug') ?? '',
	);
	return (
		rendered.length === posts.length &&
		rendered.every((slug, index) => slug === posts[index]?.slug)
	);
}

/** Mirrors {@link import('@/render/ui').tagAttribute}. */
function tagAttribute(tags: readonly string[]): string {
	return tags.length === 0 ? '' : `|${tags.join('|')}|`;
}

function element<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className: string,
	text?: string,
): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	// An empty string would still emit `class=""`, which the server does
	// not — and the parity test compares attributes, as it should.
	if (className !== '') {
		node.className = className;
	}
	if (text !== undefined) {
		node.textContent = text;
	}
	return node;
}

interface RowLabels {
	readonly readingTime: string;
	readonly tagsLabel: string;
}

/**
 * Builds one row. Deliberately constructed from elements and text nodes
 * rather than an HTML string: nothing here can inject markup, so the
 * sanitizer this island used to depend on is not needed at all.
 */
function buildRow(
	post: BlogManifestEntry,
	locale: Locale,
	labels: RowLabels,
): HTMLElement {
	const row = element('article', css.ROW);
	row.dataset.slug = post.slug;
	row.dataset.tags = tagAttribute(post.tags);

	const grid = element('div', css.ROW_GRID);
	const aside = element('div', css.ROW_ASIDE);
	const main = element('div', css.ROW_MAIN);

	const meta = element('p', css.META);
	const time = document.createElement('time');
	time.dateTime = post.publishedAt;
	time.textContent = formatIsoDate(post.publishedAt, locale);
	meta.append(time);
	if (post.readingMinutes !== undefined && post.readingMinutes >= 1) {
		const separator = element('span', css.SEPARATOR, '·');
		separator.setAttribute('aria-hidden', 'true');
		meta.append(
			separator,
			element(
				'span',
				'',
				formatMessage(labels.readingTime, { count: post.readingMinutes }),
			),
		);
	}
	aside.append(meta);

	const heading = element('h2', css.ROW_TITLE);
	const link = element('a', css.ROW_LINK, post.title);
	link.href = `/${locale}/blog/${post.slug}/`;
	heading.append(link);
	main.append(heading, element('p', css.ROW_TEXT, post.description));

	if (post.tags.length > 0) {
		const list = element('ul', css.TAGLIST);
		list.setAttribute('aria-label', labels.tagsLabel);
		for (const tag of post.tags) {
			list.append(element('li', '', tag));
		}
		main.append(list);
	}

	grid.append(aside, main);
	row.append(grid);
	return row;
}

export function registerBlogList(fetchFn: FetchLike = fetch): void {
	if (customElements.get('jp-blog-list') != null) {
		return;
	}
	customElements.define(
		'jp-blog-list',
		class extends HTMLElement {
			connectedCallback(): void {
				// The manifest is a correction, not the page: fetching it during
				// load would compete with the paint of content that is already
				// on screen and correct. Deferring to idle costs nothing in the
				// common case, where the answer is "no change".
				whenIdle(() => {
					void this.refresh();
				});
			}

			private label(name: string, fallback: string): string {
				return this.dataset[name] ?? fallback;
			}

			private async refresh(): Promise<void> {
				const localeAttr = this.getAttribute('locale') ?? '';
				if (!isLocale(localeAttr)) {
					return;
				}
				const grid = this.querySelector('[data-post-grid]');
				const countEl = this.querySelector('[data-post-count]');
				const countLabel = this.label('countLabel', '{count}');
				try {
					const manifest = await new BlogManifestService(fetchFn).load();
					const posts = BlogManifestService.postsForLocale(
						manifest,
						localeAttr,
					);
					if (grid === null || sameSlugs(grid, posts)) {
						return;
					}
					const labels: RowLabels = {
						readingTime: this.label('readingTime', '{count} min'),
						tagsLabel: this.label('tagsLabel', 'Tags'),
					};
					grid.replaceChildren(
						...posts.map((post) => buildRow(post, localeAttr, labels)),
					);
					this.querySelector('[data-empty-state]')?.remove();
					const count = formatMessage(countLabel, { count: posts.length });
					if (countEl !== null) {
						countEl.textContent = count;
					}
					// The list changed under a reader who did not ask for it;
					// say so rather than letting focus land somewhere new.
					announceToScreenReader(count);
					this.dispatchEvent(
						new CustomEvent('jp-blog-list:updated', { bubbles: true }),
					);
				} catch {
					// Static content remains authoritative. Surface the failure
					// only when the page would otherwise be empty.
					const staticCount = grid?.querySelectorAll('article').length ?? 0;
					if (staticCount === 0) {
						const empty = this.querySelector('[data-empty-state]');
						const message = this.label('errorLabel', '');
						if (empty !== null && message !== '') {
							empty.textContent = message;
						}
						if (message !== '') {
							announceToScreenReader(message, 'assertive');
						}
					}
				}
			}
		},
	);
}
