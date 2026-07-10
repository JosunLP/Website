import { component } from '@bquery/bquery/component';
import { usePreferredColorScheme } from '@bquery/bquery/media';
import { STORAGE_KEYS } from '@/app/configuration';
import { escape } from '@/utils/html';

/**
 * jp-theme-toggle — cycles color scheme: system → light → dark.
 *
 * Rendered as an empty island (theme switching needs JavaScript). The
 * preference is persisted only when the user explicitly picks light or
 * dark; "system" clears the stored value. Renders into the light DOM so
 * the design system's Tailwind classes apply.
 */

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeToggleProps extends Record<string, unknown> {
	readonly 'data-label': string;
	readonly 'data-light': string;
	readonly 'data-dark': string;
	readonly 'data-system': string;
}

const MODE_ORDER: readonly ThemeMode[] = ['system', 'light', 'dark'];

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

const ICONS: Record<ThemeMode, string> = {
	system:
		'<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M9 20h6M12 16v4"/>',
	light:
		'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
	dark: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
};

export function registerThemeToggle(): void {
	const systemScheme = usePreferredColorScheme();

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
			this.addEventListener('click', (event: Event) => {
				const target = event.target as HTMLElement | null;
				if (target?.closest('button') === null || target === null) {
					return;
				}
				const current = this.getState('mode');
				const next =
					MODE_ORDER[(MODE_ORDER.indexOf(current) + 1) % MODE_ORDER.length] ??
					'system';
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
				class="border-line dark:border-night-line hover:border-accent hover:text-accent dark:hover:border-accent-dark dark:hover:text-accent-dark inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border"
			>
				<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">${ICONS[state.mode]}</svg>
				<span class="sr-only">${escape(props['data-label'])}: ${escape(String(props[modeLabelKey]))}</span>
			</button>`;
		},
	});
}
