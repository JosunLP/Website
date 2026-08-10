import { sanitizeHtml } from '@bquery/bquery/security';
import { announceToScreenReader } from '@bquery/bquery/a11y';
import {
	BlogManifestService,
	type FetchLike,
} from '@/domain/services/blog-manifest-service';
import { isLocale } from '@/domain/models/locale';
import { formatMessage, messagesFor } from '@/features/i18n';
import { blogCard } from '@/render/ui';

/**
 * jp-blog-list — enhances the pre-rendered blog index with the runtime
 * manifest so posts uploaded to the server after the build appear too.
 *
 * Progressive enhancement contract: the server-rendered list stays
 * untouched unless the manifest loads successfully and differs. On
 * failure the static content remains and an error is announced only when
 * there is no static content to fall back to.
 */

/**
 * True when the rendered cards already match the manifest exactly — same
 * posts, same order. Comparing slugs rather than counts matters when a
 * post is replaced instead of added: an equal count would otherwise be
 * read as "nothing changed" and the stale card would stay on the page.
 */
function sameSlugs(grid: Element, posts: readonly { slug: string }[]): boolean {
	const rendered = [...grid.querySelectorAll('article')].map(
		(card) => card.getAttribute('data-slug') ?? '',
	);
	return (
		rendered.length === posts.length &&
		rendered.every((slug, index) => slug === posts[index]?.slug)
	);
}

export function registerBlogList(fetchFn: FetchLike = fetch): void {
	if (customElements.get('jp-blog-list') != null) {
		return;
	}
	customElements.define(
		'jp-blog-list',
		class extends HTMLElement {
			connectedCallback(): void {
				// Defer so server-rendered children are attached (parser-driven
				// upgrades, happy-dom) before the refresh inspects them.
				queueMicrotask(() => {
					void this.refresh();
				});
			}

			private async refresh(): Promise<void> {
				const localeAttr = this.getAttribute('locale') ?? '';
				if (!isLocale(localeAttr)) {
					return;
				}
				const messages = messagesFor(localeAttr);
				const grid = this.querySelector('[data-post-grid]');
				const countEl = this.querySelector('[data-post-count]');
				try {
					const manifest = await new BlogManifestService(fetchFn).load();
					const posts = BlogManifestService.postsForLocale(
						manifest,
						localeAttr,
					);
					if (grid === null || sameSlugs(grid, posts)) {
						return;
					}
					const cards = posts
						.map((post) => blogCard(post, localeAttr, messages).value)
						.join('');
					grid.innerHTML = String(sanitizeHtml(cards));
					this.querySelector('[data-empty-state]')?.remove();
					if (countEl !== null) {
						countEl.textContent = formatMessage(messages.blog.postCount, {
							count: posts.length,
						});
					}
					announceToScreenReader(
						formatMessage(messages.blog.postCount, { count: posts.length }),
					);
				} catch {
					// Static content remains authoritative. Surface the failure
					// only when the page would otherwise be empty.
					const staticCount = grid?.querySelectorAll('article').length ?? 0;
					if (staticCount === 0) {
						const empty = this.querySelector('[data-empty-state]');
						if (empty !== null) {
							empty.textContent = messages.blog.loadError;
						}
						announceToScreenReader(messages.blog.loadError, 'assertive');
					}
				}
			}
		},
	);
}
