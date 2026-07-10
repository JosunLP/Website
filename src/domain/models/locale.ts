/**
 * Locale model. Adding a locale means extending {@link LOCALES}, adding a
 * dictionary under `src/locales/`, project copy in
 * `src/content/projects.ts`, and legal page content — the compiler will
 * point at every place that needs it.
 */
export const LOCALES = ['de', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Default locale used when negotiation yields no match. */
export const DEFAULT_LOCALE: Locale = 'de';

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}

/** A value that exists once per supported locale. */
export type Localized<T> = Readonly<Record<Locale, T>>;
