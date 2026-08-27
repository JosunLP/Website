import { isLocale, LOCALES, type Locale } from '@/domain/models/locale';

/**
 * Route helpers shared by the language switcher and the prerender
 * pipeline. Path segments are identical across locales, so the equivalent
 * route in another locale is the same path with a different prefix.
 */

/** Extracts the locale prefix from a path, if present. */
export function localeFromPath(path: string): Locale | undefined {
	const match = /^\/([a-z]{2})(?:\/|$)/.exec(path);
	if (match !== null) {
		const candidate = match[1] ?? '';
		if (isLocale(candidate)) {
			return candidate;
		}
	}
	return undefined;
}

/**
 * Returns the equivalent path in the target locale, preserving the rest of
 * the route. Paths without a locale prefix map to the target home page.
 */
export function equivalentPath(path: string, target: Locale): string {
	const current = localeFromPath(path);
	if (current === undefined) {
		return `/${target}/`;
	}
	const rest = path.slice(current.length + 1);
	return `/${target}${rest === '' ? '/' : rest}`;
}

/** All locale variants of a path, used for hreflang alternates. */
export function alternatePaths(path: string): Record<Locale, string> {
	const entries = LOCALES.map(
		(locale) => [locale, equivalentPath(path, locale)] as const,
	);
	return Object.fromEntries(entries) as Record<Locale, string>;
}
