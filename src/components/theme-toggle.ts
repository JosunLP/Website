import { component } from '@bquery/bquery/component';
import { usePreferredColorScheme } from '@bquery/bquery/media';
import { STORAGE_KEYS } from '@/app/configuration';
import { escape } from '@/utils/html';

/**
 * jp-theme-toggle — flips the *resolved* color scheme: light ⇄ dark.
 *
 * Every click has a visible effect: it inverts whatever theme is currently
 * showing (including the system-derived one) and persists the explicit
 * choice. "system" only exists as the initial, unstored state.
 *
 * Rendered as an empty island (theme switching needs JavaScript). Renders
 * into the light DOM so the design system's Tailwind classes apply.
 */

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeToggleProps extends Record<string, unknown> {
	readonly 'data-label': string;
	readonly 'data-light': string;
	readonly 'data-dark': string;
	readonly 'data-system': string;
}

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

// The icon itself lives in CSS (.jp-theme-icon--* mask images): bQuery's
// component sanitizer hard-blocks <svg> in render output, so inline SVG
// would be stripped. A masked <span> colored via currentColor survives
// sanitization and inherits the button's hover colors.

export function registerThemeToggle(): void {
	const systemScheme = usePreferredColorScheme();

	// bQuery 1.15 runs the connected() hook twice when upgrading an element
	// that already sits in server markup with attributes (once via
	// attributeChangedCallback→mount, once via connectedCallback's
	// reconnect branch). Guard so the click listener is only bound once —
	// a doubled listener toggles the theme twice per click, i.e. never
	// visibly switches.
	const clickBound = new WeakSet<object>();

	const applyTheme = (mode: ThemeMode): void => {
		const dark =
			mode === 'dark' || (mode === 'system' && systemScheme.value === 'dark');
		document.documentElement.classList.toggle('dark', dark);
	};

	component<
		ThemeToggleProps,
		{ mode: ThemeMode },
		{ scheme: typeof systemScheme }
	>('jp-theme-toggle', {
		shadow: false,
		props: {
			'data-label': { type: String, default: 'Theme' },
			'data-light': { type: String, default: 'light' },
			'data-dark': { type: String, default: 'dark' },
			'data-system': { type: String, default: 'system' },
		},
		state: { mode: readStoredTheme() },
		signals: { scheme: systemScheme },
		connected() {
			applyTheme(this.getState('mode'));
			if (clickBound.has(this)) {
				return;
			}
			clickBound.add(this);
			this.addEventListener('click', (event: Event) => {
				const target = event.target as HTMLElement | null;
				if (target?.closest('button') === null || target === null) {
					return;
				}
				const current = this.getState('mode');
				// Invert the theme the user is actually seeing, so a click
				// never appears to do nothing (the old system→light→dark
				// cycle had a visually inert step).
				const currentlyDark =
					current === 'dark' ||
					(current === 'system' && systemScheme.value === 'dark');
				const next: ThemeMode = currentlyDark ? 'light' : 'dark';
				persistTheme(next);
				applyTheme(next);
				this.setState('mode', next);
			});
		},
		updated() {
			// Re-applies when the system scheme signal flips in system mode.
			applyTheme(this.getState('mode'));
		},
		render({ props, state }) {
			const modeLabelKey = `data-${state.mode}` as keyof ThemeToggleProps;
			return `<button
				type="button"
				class="text-ink-muted hover:bg-accent-soft/60 hover:text-accent dark:text-snow-muted dark:hover:bg-accent-dark-soft/40 dark:hover:text-accent-dark duration-swift inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-[color,background-color,transform] active:scale-95"
			>
				<span class="jp-theme-icon jp-theme-icon--${state.mode}" aria-hidden="true"></span>
				<span class="sr-only">${escape(props['data-label'])}: ${escape(String(props[modeLabelKey]))}</span>
			</button>`;
		},
	});
}
