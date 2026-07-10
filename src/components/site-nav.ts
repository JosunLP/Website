import { trapFocus } from '@bquery/bquery/a11y';
import type { FocusTrapHandle } from '@bquery/bquery/a11y';

/**
 * jp-site-nav — mobile navigation enhancer.
 *
 * Server markup: a hidden toggle button plus an always-visible `<nav>`
 * list, so navigation works fully without JavaScript. When this element
 * upgrades, the button appears and the list becomes a collapsible menu on
 * small screens. Focus is trapped only while the menu is open; Escape
 * closes it and returns focus to the toggle.
 *
 * Plain custom element on purpose: it enhances crawlable server markup
 * and must never re-render it.
 */

const CLOSED_MOBILE_CLASSES = ['hidden', 'md:flex'];
const OPEN_CLASSES = ['flex', 'w-full', 'flex-col', 'items-stretch', 'pt-3'];

export function registerSiteNav(): void {
	if (customElements.get('jp-site-nav') != null) {
		return;
	}
	customElements.define(
		'jp-site-nav',
		class extends HTMLElement {
			private trap: FocusTrapHandle | null = null;

			private get toggle(): HTMLButtonElement | null {
				return this.querySelector('button[data-nav-toggle]');
			}

			private get list(): HTMLElement | null {
				return this.querySelector('#main-nav');
			}

			connectedCallback(): void {
				// Children may not be attached yet when the element upgrades
				// (parser-driven upgrades, happy-dom); defer setup one tick.
				queueMicrotask(() => {
					this.init();
				});
			}

			private init(): void {
				const toggle = this.toggle;
				const list = this.list;
				if (toggle === null || list === null) {
					return;
				}
				toggle.hidden = false;
				// `hidden` must win over the server-rendered `flex` on mobile.
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
				this.trap?.release();
				this.trap = null;
			}

			private isOpen(): boolean {
				return this.toggle?.getAttribute('aria-expanded') === 'true';
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
					this.trap = trapFocus(this);
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
