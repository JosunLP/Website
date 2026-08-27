/**
 * jp-article-tools — reading affordances for blog articles.
 *
 * Everything here is strictly additive to the prerendered article, and
 * every piece is skipped when the DOM it needs is absent:
 *
 *  - a reading-progress bar across the top of the viewport,
 *  - permalink anchors on the headings the table of contents links to,
 *  - a copy button on every code block,
 *  - "you are here" highlighting in the table of contents.
 *
 * A plain custom element rather than a bQuery `component()`: it decorates
 * server markup (and, on the client-rendered shell, markup produced by
 * jp-blog-article) and must never re-render it.
 *
 * Loaded by the blog-only `article` chunk and by the much smaller
 * `article-tools` entry that prerendered articles use, so none of this
 * reaches pages without articles.
 */

/** Headings that carry an id — the ones `renderMarkdown` puts in the TOC. */
const HEADING_SELECTOR = 'h2[id], h3[id]';

const COPIED_FEEDBACK_MS = 2000;

/**
 * Copy button styling. Revealed on hover of the enclosing `pre` (which
 * gets Tailwind's `group`) and on keyboard focus, so it never covers the
 * code while reading but is always reachable.
 */
const COPY_BUTTON_CLASS = [
	'jp-code-copy absolute top-2.5 right-2.5 inline-flex min-h-9 items-center',
	'rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs',
	'font-medium text-snow opacity-0 transition-opacity duration-swift',
	'hover:bg-white/20 focus-visible:opacity-100 group-hover:opacity-100',
].join(' ');

export function registerArticleTools(): void {
	if (customElements.get('jp-article-tools') != null) {
		return;
	}
	customElements.define(
		'jp-article-tools',
		class extends HTMLElement {
			private observer: IntersectionObserver | null = null;
			private pending: MutationObserver | null = null;
			private progress: HTMLElement | null = null;
			private frame = 0;
			private scrollable = 0;
			private readonly onScroll = (): void => {
				if (this.frame !== 0) {
					return;
				}
				this.frame = requestAnimationFrame(() => {
					this.frame = 0;
					this.updateProgress();
				});
			};
			private readonly onResize = (): void => {
				this.measure();
				this.updateProgress();
			};

			connectedCallback(): void {
				queueMicrotask(() => {
					this.enhance();
				});
			}

			disconnectedCallback(): void {
				this.observer?.disconnect();
				this.observer = null;
				this.pending?.disconnect();
				this.pending = null;
				cancelAnimationFrame(this.frame);
				this.frame = 0;
				removeEventListener('scroll', this.onScroll);
				removeEventListener('resize', this.onResize);
				this.progress?.remove();
				this.progress = null;
			}

			private label(name: string, fallback: string): string {
				return this.dataset[name] ?? fallback;
			}

			private enhance(): void {
				const body = this.querySelector('[data-article-body]');
				if (body === null) {
					this.waitForBody();
					return;
				}
				this.pending?.disconnect();
				this.pending = null;
				this.addProgressBar();
				this.addHeadingAnchors(body);
				this.addCopyButtons(body);
				this.trackHeadings(body);
			}

			/**
			 * On the client-rendered shell (posts uploaded after the build)
			 * jp-blog-article injects the article asynchronously, so there is
			 * nothing to enhance on the first pass.
			 */
			private waitForBody(): void {
				if (this.pending !== null) {
					return;
				}
				this.pending = new MutationObserver(() => {
					this.enhance();
				});
				this.pending.observe(this, { childList: true, subtree: true });
			}

			/* ---------------------------------------------------------------- */

			private addProgressBar(): void {
				if (this.progress !== null) {
					return;
				}
				const bar = document.createElement('div');
				bar.className = 'jp-reading-progress';
				bar.setAttribute('role', 'progressbar');
				bar.setAttribute('aria-label', this.label('progress', 'Progress'));
				bar.setAttribute('aria-valuemin', '0');
				bar.setAttribute('aria-valuemax', '100');
				bar.setAttribute('aria-valuenow', '0');
				// The bar reports a value screen readers can query on demand;
				// announcing every scroll step would be unusable noise.
				bar.setAttribute('aria-live', 'off');
				this.prepend(bar);
				this.progress = bar;
				addEventListener('scroll', this.onScroll, { passive: true });
				addEventListener('resize', this.onResize, { passive: true });
				this.measure();
				this.updateProgress();
			}

			/**
			 * Document height is read once per resize rather than per scroll
			 * event: reading `scrollHeight` forces layout, and doing that on
			 * every frame of a scroll is exactly the cost this bar must not add.
			 */
			private measure(): void {
				this.scrollable =
					document.documentElement.scrollHeight - window.innerHeight;
			}

			private updateProgress(): void {
				const bar = this.progress;
				if (bar === null) {
					return;
				}
				const ratio =
					this.scrollable <= 0
						? 1
						: Math.min(1, Math.max(0, window.scrollY / this.scrollable));
				bar.style.setProperty('--jp-progress', String(ratio));
				bar.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
			}

			/* ---------------------------------------------------------------- */

			/**
			 * Appends a permalink to each heading. The `#` is decorative; the
			 * accessible name repeats the heading text so a link list stays
			 * meaningful out of context.
			 */
			private addHeadingAnchors(body: Element): void {
				const linkLabel = this.label('headingLink', 'Link to this section');
				for (const heading of body.querySelectorAll(HEADING_SELECTOR)) {
					if (heading.querySelector('.jp-heading-anchor') !== null) {
						continue;
					}
					// Captured before the anchors are appended, so the label
					// quotes the heading and not the decoration added to it.
					const headingText = heading.textContent.trim();

					const anchor = document.createElement('a');
					anchor.className = 'jp-heading-anchor';
					anchor.href = `#${heading.id}`;
					anchor.textContent = '#';
					anchor.setAttribute('aria-hidden', 'true');
					anchor.tabIndex = -1;
					heading.append(' ', anchor);

					const label = document.createElement('a');
					label.className = 'sr-only';
					label.href = `#${heading.id}`;
					label.textContent = `${linkLabel}: ${headingText}`;
					heading.append(label);
				}
			}

			/* ---------------------------------------------------------------- */

			private addCopyButtons(body: Element): void {
				// `navigator.clipboard` is typed as always present but is
				// genuinely undefined outside secure contexts — a button that
				// can only fail is worse than no button.
				const clipboard = navigator.clipboard as Clipboard | undefined;
				if (clipboard === undefined) {
					return;
				}
				for (const pre of body.querySelectorAll('pre')) {
					if (pre.querySelector('.jp-code-copy') !== null) {
						continue;
					}
					const code = pre.querySelector('code');
					if (code === null) {
						continue;
					}
					pre.classList.add('group', 'relative');
					const button = document.createElement('button');
					button.type = 'button';
					button.className = COPY_BUTTON_CLASS;
					button.textContent = this.label('copy', 'Copy');
					button.addEventListener('click', () => {
						void this.copy(button, code.textContent);
					});
					pre.append(button);
				}
			}

			private async copy(
				button: HTMLButtonElement,
				text: string,
			): Promise<void> {
				const idle = this.label('copy', 'Copy');
				try {
					await navigator.clipboard.writeText(text);
					button.textContent = this.label('copied', 'Copied');
				} catch {
					button.textContent = this.label('copyFailed', 'Copy failed');
				}
				setTimeout(() => {
					button.textContent = idle;
				}, COPIED_FEEDBACK_MS);
			}

			/* ---------------------------------------------------------------- */

			/**
			 * Marks the table-of-contents entry for the heading closest to the
			 * top of the viewport. `rootMargin` pulls the detection line just
			 * under the sticky header so the highlight matches what the reader
			 * sees rather than what technically intersects the viewport.
			 */
			private trackHeadings(body: Element): void {
				const toc = this.querySelector('[data-toc]');
				if (toc === null || this.observer !== null) {
					return;
				}
				const links = new Map<string, HTMLAnchorElement>();
				for (const link of toc.querySelectorAll('a[href^="#"]')) {
					if (link instanceof HTMLAnchorElement) {
						links.set(decodeURIComponent(link.hash.slice(1)), link);
					}
				}
				if (links.size === 0) {
					return;
				}
				const visible = new Set<string>();
				this.observer = new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (entry.isIntersecting) {
								visible.add(entry.target.id);
							} else {
								visible.delete(entry.target.id);
							}
						}
						const headings = [...body.querySelectorAll(HEADING_SELECTOR)];
						const current = headings.find((heading) =>
							visible.has(heading.id),
						)?.id;
						for (const [id, link] of links) {
							const active = id === current;
							link.classList.toggle('jp-toc-link--active', active);
							if (active) {
								link.setAttribute('aria-current', 'true');
							} else {
								link.removeAttribute('aria-current');
							}
						}
					},
					{ rootMargin: '-72px 0px -70% 0px' },
				);
				for (const heading of body.querySelectorAll(HEADING_SELECTOR)) {
					this.observer.observe(heading);
				}
			}
		},
	);
}
