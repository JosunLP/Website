import { STORAGE_KEYS } from '@/app/configuration';

/**
 * jp-theme-toggle — flips the *resolved* color scheme: light ⇄ dark.
 *
 * Every click has a visible effect: it inverts whatever theme is currently
 * showing (including the system-derived one) and persists the explicit
 * choice. "system" only exists as the initial, unstored state.
 *
 * Rendered as an empty island (theme switching needs JavaScript) and built
 * with plain DOM APIs rather than a bQuery `component()`. The two other
 * islands are already plain custom elements, and this button is the sole
 * reason the `component` runtime plus its `sanitize` dependency would load
 * on every page — keeping it dependency-free trims ~5 KB gzip from the
 * global bootstrap chunk and speeds up the interactive-ready state. Labels
 * come from data attributes so the element stays locale-agnostic.
 *
 * The icon lives in CSS (`.jp-theme-icon--*` mask images): a masked
 * `<span>` colored via `currentColor` inherits the button's hover color.
 * The glyph swaps without an animation — a rotating sun/moon is a stock
 * flourish, and the button already reads as pressed through the change
 * of icon and of the whole page behind it.
 */

type ThemeMode = 'system' | 'light' | 'dark';

const BUTTON_CLASS =
	'text-ink-muted hover:text-ink dark:text-snow-muted dark:hover:text-snow duration-swift inline-flex min-h-11 min-w-11 items-center justify-center transition-colors';

function readStoredTheme(): ThemeMode {
	try {
		const value = localStorage.getItem(STORAGE_KEYS.theme);
		return value === 'light' || value === 'dark' ? value : 'system';
	} catch {
		return 'system';
	}
}

function persistTheme(mode: ThemeMode): void {
	try {
		if (mode === 'system') {
			localStorage.removeItem(STORAGE_KEYS.theme);
		} else {
			localStorage.setItem(STORAGE_KEYS.theme, mode);
		}
	} catch {
		// Storage unavailable — the choice still applies for this page view.
	}
}

function systemPrefersDark(): boolean {
	try {
		return matchMedia('(prefers-color-scheme: dark)').matches;
	} catch {
		return false;
	}
}

function isDark(mode: ThemeMode): boolean {
	return mode === 'dark' || (mode === 'system' && systemPrefersDark());
}

export function registerThemeToggle(): void {
	if (customElements.get('jp-theme-toggle') != null) {
		return;
	}
	customElements.define(
		'jp-theme-toggle',
		class extends HTMLElement {
			private mode: ThemeMode = readStoredTheme();
			private icon: HTMLSpanElement | null = null;
			private srLabel: HTMLSpanElement | null = null;
			// connectedCallback re-runs whenever the element is reconnected
			// (view transitions, DOM moves); build the button only once.
			private built = false;
			private readonly scheme = matchMedia('(prefers-color-scheme: dark)');
			private readonly onSchemeChange = (): void => {
				// Only the resolved theme changes in system mode; the icon still
				// reads "system", so just re-apply the class.
				if (this.mode === 'system') {
					this.applyTheme();
				}
			};

			connectedCallback(): void {
				this.applyTheme();
				if (!this.built) {
					this.build();
					this.built = true;
				}
				this.scheme.addEventListener('change', this.onSchemeChange);
			}

			disconnectedCallback(): void {
				this.scheme.removeEventListener('change', this.onSchemeChange);
			}

			private applyTheme(): void {
				document.documentElement.classList.toggle('dark', isDark(this.mode));
			}

			private label(mode: ThemeMode): string {
				const base = this.dataset.label ?? 'Theme';
				const modeLabel = this.dataset[mode] ?? mode;
				return `${base}: ${modeLabel}`;
			}

			private build(): void {
				const button = document.createElement('button');
				button.type = 'button';
				button.className = BUTTON_CLASS;

				const icon = this.createIcon(this.mode);

				const srLabel = document.createElement('span');
				srLabel.className = 'sr-only';
				srLabel.textContent = this.label(this.mode);

				button.append(icon, srLabel);
				this.icon = icon;
				this.srLabel = srLabel;
				this.replaceChildren(button);

				button.addEventListener('click', () => {
					// Invert the theme the user is actually seeing, so a click
					// never appears to do nothing.
					const next: ThemeMode = isDark(this.mode) ? 'light' : 'dark';
					this.mode = next;
					persistTheme(next);
					this.applyTheme();
					this.swapIcon(next);
					if (this.srLabel !== null) {
						this.srLabel.textContent = this.label(next);
					}
				});
			}

			private createIcon(mode: ThemeMode): HTMLSpanElement {
				const icon = document.createElement('span');
				icon.className = `jp-theme-icon jp-theme-icon--${mode}`;
				icon.setAttribute('aria-hidden', 'true');
				return icon;
			}

			/**
			 * Swaps the glyph by replacing the element rather than rewriting
			 * its class list. The two icon classes differ only in their mask
			 * image, and swapping a `mask-image` in place is the kind of
			 * change engines repaint inconsistently; replacing the node is
			 * the variant that always lands.
			 */
			private swapIcon(mode: ThemeMode): void {
				const previous = this.icon;
				if (previous === null) {
					return;
				}
				const next = this.createIcon(mode);
				previous.replaceWith(next);
				this.icon = next;
			}
		},
	);
}
