import { negotiateLocale } from '@bquery/bquery/i18n';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/domain/models/locale';
import { STORAGE_KEYS } from '@/app/configuration';

/**
 * Client-side locale preference helpers, kept deliberately free of the
 * message {@link import('./index').DICTIONARIES dictionaries}. The
 * interactive islands (language switcher, root locale redirect) only need
 * these tiny storage/negotiation utilities; keeping them in their own
 * module means the ~14 KB of `de`/`en` UI strings never end up in the
 * global `bootstrap` chunk that loads on every page — they stay in the
 * blog-only `article` chunk that actually renders messages client-side.
 */

/**
 * Client-side locale decision for the root route:
 * 1. explicitly stored preference (set only on user action),
 * 2. browser language negotiation,
 * 3. default locale (German).
 */
export function decideLocale(
	storedValue: string | null,
	navigatorLanguages: readonly string[],
): Locale {
	if (
		storedValue !== null &&
		(LOCALES as readonly string[]).includes(storedValue)
	) {
		return storedValue as Locale;
	}
	return negotiateLocale(navigatorLanguages, LOCALES, {
		fallback: DEFAULT_LOCALE,
	}) as Locale;
}

/** Reads the stored locale preference, tolerating unavailable storage. */
export function readStoredLocale(): string | null {
	try {
		return localStorage.getItem(STORAGE_KEYS.locale);
	} catch {
		return null;
	}
}

/** Persists an explicitly chosen locale (user action only). */
export function storeLocale(locale: Locale): void {
	try {
		localStorage.setItem(STORAGE_KEYS.locale, locale);
	} catch {
		// Storage unavailable (private mode, disabled) — preference simply
		// does not persist; the site keeps working.
	}
}
