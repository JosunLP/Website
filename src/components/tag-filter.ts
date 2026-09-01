import { announceToScreenReader } from '@bquery/bquery/a11y';
import { effect, signal } from '@bquery/bquery/reactive';
import { formatMessage } from '@/features/i18n/format';

/**
 * jp-tag-filter — filters the blog index by topic.
 *
 * The tags on a post used to be a dead end: shown on every row, actionable
 * nowhere. This island turns them into the index's navigation.
 *
 * Rendered as an empty element on the server. Filtering cannot work
 * without JavaScript, so the control must not exist without it — a row of
 * inert buttons is worse than no buttons. For the same reason the island
 * removes itself when there is nothing worth filtering: fewer than two
 * topics, or fewer posts than the threshold, and the control never
 * appears.
 *
 * Tags are read out of the rows rather than passed in, so the filter
 * cannot disagree with the list it filters — including after `jp-blog-list`
 * replaces the rows with posts uploaded after the build.
 *
 * bQuery's `signal`/`effect` carry the selection: buttons, row visibility,
 * the URL and the announcement are four views of one value, and an effect
 * is what keeps them from drifting apart as they did when each handler
 * updated its own piece.
 */

/** Below this many posts, scanning the list beats filtering it. */
const MIN_POSTS = 4;

/** Query parameter used to make a filtered view linkable. */
const PARAM = 'tag';

const BUTTON_BASE =
	'jp-filter jp-meta inline-flex min-h-9 items-center transition-colors';

function parseTags(row: Element): readonly string[] {
	const raw = row.getAttribute('data-tags') ?? '';
	return raw.split('|').filter((tag) => tag !== '');
}

export function registerTagFilter(): void {
	if (customElements.get('jp-tag-filter') != null) {
		return;
	}
	customElements.define(
		'jp-tag-filter',
		class extends HTMLElement {
			private built = false;
			private stop: (() => void) | null = null;
			private readonly active = signal<string | null>(null);
			/**
			 * jp-blog-list can replace every row after the manifest loads.
			 * Both the topics on offer and the rows this filter hides come
			 * from those rows, so the control has to be rebuilt when they
			 * change — otherwise it offers topics that no longer exist and
			 * leaves newly inserted rows visible under an active filter. The
			 * event bubbles to the document, so it is listened for there
			 * rather than on an ancestor this element need not have.
			 */
			private readonly onListUpdated = (): void => {
				this.stop?.();
				this.stop = null;
				this.built = false;
				this.replaceChildren();
				this.build();
			};

			connectedCallback(): void {
				document.addEventListener('jp-blog-list:updated', this.onListUpdated);
				// Built immediately, not at idle. This element sits above the
				// list, so filling it later pushes the whole list down — a
				// layout shift traded for a few microseconds of DOM work. The
				// microtask is only to let the rows finish parsing; the entry
				// is a deferred module, so this still runs before the first
				// paint. (The manifest *fetch* in jp-blog-list stays at idle:
				// that is network work nothing on screen is waiting for.)
				queueMicrotask(() => {
					this.build();
				});
			}

			disconnectedCallback(): void {
				document.removeEventListener(
					'jp-blog-list:updated',
					this.onListUpdated,
				);
				this.stop?.();
				this.stop = null;
			}

			private label(name: string, fallback: string): string {
				return this.dataset[name] ?? fallback;
			}

			/**
			 * The row container this filter belongs to: the nearest ancestor
			 * that contains one. Deliberately not keyed to a specific parent
			 * element — the filter should work wherever it is placed above a
			 * list of rows, not only inside `jp-blog-list`.
			 */
			private get grid(): Element | null {
				let scope: Element | null = this.parentElement;
				while (scope !== null) {
					const grid = scope.querySelector('[data-post-grid]');
					if (grid !== null) {
						return grid;
					}
					scope = scope.parentElement;
				}
				return null;
			}

			private build(): void {
				if (this.built) {
					return;
				}
				const grid = this.grid;
				if (grid === null) {
					return;
				}
				const rows = [...grid.querySelectorAll('article')];
				const tags = [...new Set(rows.flatMap((row) => parseTags(row)))].sort(
					(a, b) => a.localeCompare(b),
				);
				if (rows.length < MIN_POSTS || tags.length < 2) {
					return;
				}
				this.built = true;

				// A rebuild keeps the reader's choice if that topic survived;
				// otherwise the URL decides, and failing that nothing is active.
				const requested =
					this.active.value ?? new URLSearchParams(location.search).get(PARAM);
				this.active.value =
					requested !== null && tags.includes(requested) ? requested : null;

				const heading = document.createElement('p');
				heading.className = 'jp-label text-ink-muted dark:text-snow-muted';
				heading.id = 'tag-filter-label';
				heading.textContent = this.label('label', 'Filter');

				const group = document.createElement('div');
				group.className = 'mt-4 flex flex-wrap gap-x-5 gap-y-1';
				group.setAttribute('role', 'group');
				group.setAttribute('aria-labelledby', heading.id);

				const buttons = [null, ...tags].map((tag) => {
					const button = document.createElement('button');
					button.type = 'button';
					button.className = BUTTON_BASE;
					button.textContent = tag ?? this.label('all', 'All');
					button.addEventListener('click', () => {
						// Re-selecting the active topic clears it, so the control
						// can always undo itself without hunting for "All".
						this.active.value = this.active.value === tag ? null : tag;
					});
					return { tag, button };
				});
				group.append(...buttons.map((entry) => entry.button));

				const wrapper = document.createElement('div');
				wrapper.className =
					'border-line dark:border-night-line mt-20 border-t pt-6';
				wrapper.append(heading, group);
				this.replaceChildren(wrapper);

				// One effect, four views of the same value.
				let first = true;
				this.stop = effect(() => {
					const active = this.active.value;
					let visible = 0;
					for (const row of grid.querySelectorAll('article')) {
						const match = active === null || parseTags(row).includes(active);
						row.hidden = !match;
						if (match) {
							visible += 1;
						}
					}
					for (const { tag, button } of buttons) {
						const pressed = tag === active;
						button.setAttribute('aria-pressed', String(pressed));
						button.className = pressed
							? `${BUTTON_BASE} text-ink dark:text-snow decoration-accent dark:decoration-accent-dark underline decoration-1 underline-offset-[0.4rem]`
							: `${BUTTON_BASE} text-ink-muted hover:text-ink dark:text-snow-muted dark:hover:text-snow`;
					}
					this.syncUrl(active);
					if (first) {
						// The first run only reflects the state the page loaded
						// with; announcing it would talk over the page itself.
						first = false;
						return;
					}
					announceToScreenReader(
						formatMessage(this.label('result', '{count}'), { count: visible }),
					);
				});
			}

			/**
			 * Keeps the address bar in step so a filtered view can be linked
			 * and reloaded. `replaceState`, not `pushState`: Back should leave
			 * the blog index, not walk backwards through filter changes.
			 */
			private syncUrl(active: string | null): void {
				const url = new URL(location.href);
				if (active === null) {
					url.searchParams.delete(PARAM);
				} else {
					url.searchParams.set(PARAM, active);
				}
				if (url.href !== location.href) {
					history.replaceState(history.state, '', url);
				}
			}
		},
	);
}
