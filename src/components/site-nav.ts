import type { FocusTrapHandle } from '@bquery/bquery/a11y';

/**
 * jp-site-nav — mobile navigation enhancer.
 *
 * Server markup: a toggle button plus a `<nav>` list already rendered in
 * its collapsed, small-screen state — the state this element would
 * otherwise have to put it in after the first paint, which cost a large
 * layout shift on every mobile load. Without scripting the `.no-js` rules
 * in main.css invert that (list open, toggle hidden), so navigation still
 * works. This element only wires the behaviour up. Focus is trapped while
 * the menu is open; Escape closes it and returns focus to the toggle.
 *
 * Plain custom element on purpose: it enhances crawlable server markup
 * and must never re-render it.
 *
 * bQuery's focus trap is imported on first open rather than at module
 * load. It is 1.8 kB gzip of code that only runs on a narrow viewport
 * after a deliberate tap, and this module is in the bundle every page
 * loads — so paying for it upfront taxes every desktop visit for a
 * control those visits never show.
 */

/**
 * Tailwind's `md` breakpoint — the width at which the toggle button is
 * hidden and the list renders inline again. Must stay in sync with the
 * `md:` variants in the server markup and in {@link OPEN_CLASSES}.
 */
const DESKTOP_QUERY = '(min-width: 48rem)';

const CLOSED_MOBILE_CLASSES = ['hidden', 'md:flex'];
// Open state: a full-width panel dropping below the header. Positioned
// against the header's inner container (`relative`), so it spans the whole
// width instead of the narrow controls cluster it lives in.
const OPEN_CLASSES = [
	// Entry fade via @starting-style; see main.css.
	'jp-nav-panel',
	'absolute',
	'left-0',
	'right-0',
	'top-full',
	'z-40',
	'flex',
	'w-full',
	'flex-col',
	'items-stretch',
	'border-line',
	'dark:border-night-line',
	'border-b',
	'bg-paper',
	'dark:bg-night',
	'px-4',
	'py-2',
	'max-h-[calc(100vh_-_4rem)]',
	'overflow-y-auto',
];

export function registerSiteNav(): void {
	if (customElements.get('jp-site-nav') != null) {
		return;
	}
	customElements.define(
		'jp-site-nav',
		class extends HTMLElement {
			private trap: FocusTrapHandle | null = null;
			// connectedCallback re-runs whenever the element is reconnected;
			// duplicated toggle listeners would open and immediately re-close
			// the menu on a single click.
			private initialized = false;
			private readonly desktop = matchMedia(DESKTOP_QUERY);
			// Growing past `md` hides the toggle button, so an open panel
			// could no longer be closed — and its focus trap would keep
			// swallowing Tab across a nav that is visually inline again.
			private readonly onDesktopChange = (): void => {
				if (this.desktop.matches && this.isOpen()) {
					this.setOpen(false);
				}
			};

			private get toggle(): HTMLButtonElement | null {
				return this.querySelector('button[data-nav-toggle]');
			}

			private get list(): HTMLElement | null {
				return this.querySelector('#main-nav');
			}

			connectedCallback(): void {
				// Re-registered on every reconnect, unlike the listeners in
				// init(), which sit on child elements that move with the DOM.
				this.desktop.addEventListener('change', this.onDesktopChange);
				// Children may not be attached yet when the element upgrades
				// (parser-driven upgrades, happy-dom); defer setup one tick.
				queueMicrotask(() => {
					this.init();
				});
			}

			private init(): void {
				if (this.initialized) {
					return;
				}
				const toggle = this.toggle;
				const list = this.list;
				if (toggle === null || list === null) {
					return;
				}
				this.initialized = true;
				// The server already renders the closed state; re-applying it is
				// a no-op there and repairs the classes after an open panel was
				// carried across a view transition.
				toggle.hidden = false;
				list.classList.remove('flex');
				list.classList.add(...CLOSED_MOBILE_CLASSES);

				toggle.addEventListener('click', () => {
					this.setOpen(toggle.getAttribute('aria-expanded') !== 'true');
				});
				this.addEventListener('keydown', (event) => {
					if (event.key === 'Escape' && this.isOpen()) {
						this.setOpen(false);
						this.toggle?.focus();
					}
				});
				list.addEventListener('click', (event) => {
					if ((event.target as HTMLElement | null)?.closest('a') !== null) {
						this.setOpen(false);
					}
				});
			}

			disconnectedCallback(): void {
				this.desktop.removeEventListener('change', this.onDesktopChange);
				this.trap?.release();
				this.trap = null;
			}

			private isOpen(): boolean {
				return this.toggle?.getAttribute('aria-expanded') === 'true';
			}

			/**
			 * Loads and applies the focus trap. Guarded against the menu
			 * being closed again before the import resolves — otherwise a
			 * fast open/close leaves a trap installed over a hidden menu.
			 */
			private async trapWhileOpen(): Promise<void> {
				try {
					const { trapFocus } = await import('@bquery/bquery/a11y');
					if (!this.isOpen() || this.trap !== null) {
						return;
					}
					this.trap = trapFocus(this);
				} catch {
					// The chunk can fail to load — offline, or a stale HTML
					// document asking for a hash that a redeploy has replaced.
					// The menu itself is server markup and stays usable: Escape
					// still closes it, links still work. Losing the trap is worth
					// strictly less than an unhandled rejection in the console.
				}
			}

			private setOpen(open: boolean): void {
				const toggle = this.toggle;
				const list = this.list;
				if (toggle === null || list === null) {
					return;
				}
				toggle.setAttribute('aria-expanded', String(open));
				const srLabel = toggle.querySelector('.sr-only');
				if (srLabel instanceof HTMLElement) {
					const { openLabel, closeLabel } = srLabel.dataset;
					srLabel.textContent =
						(open ? closeLabel : openLabel) ?? srLabel.textContent;
				}
				if (open) {
					list.classList.remove('hidden');
					list.classList.add(...OPEN_CLASSES);
					list.classList.remove('flex-wrap', 'items-center');
					// Trap focus inside the component while the menu is open
					// (mobile only; the trap covers button + menu).
					void this.trapWhileOpen();
				} else {
					list.classList.add('hidden');
					list.classList.remove(...OPEN_CLASSES);
					list.classList.add('flex-wrap', 'items-center');
					this.trap?.release();
					this.trap = null;
				}
			}
		},
	);
}
