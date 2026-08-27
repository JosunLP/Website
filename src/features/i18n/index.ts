import { createI18n } from '@bquery/bquery/i18n';
import type { I18nInstance, Messages } from '@bquery/bquery/i18n';
import { DEFAULT_LOCALE, type Locale } from '@/domain/models/locale';
import { de } from '@/locales/de';
import { en } from '@/locales/en';
import type { AppMessages } from './messages';

// Client-safe preference helpers live in their own dictionary-free module
// so the global bootstrap chunk never pulls in the message dictionaries.
// Re-exported here for build-time and test callers that expect the full
// i18n surface at this path.
export {
	decideLocale,
	readStoredLocale,
	storeLocale,
} from './locale-preference';

/** All dictionaries, keyed by locale. */
export const DICTIONARIES: Readonly<Record<Locale, AppMessages>> = { de, en };

/**
 * Creates a bQuery i18n instance for a locale. Used by client-side
 * islands; the build-time renderer accesses {@link DICTIONARIES} directly
 * through typed accessors instead of string keys.
 */
export function createAppI18n(locale: Locale): I18nInstance {
	return createI18n({
		locale,
		fallbackLocale: DEFAULT_LOCALE,
		// Dictionaries are structurally compatible with bQuery's nested
		// string-record message type.
		messages: DICTIONARIES as unknown as Messages,
	});
}

/** Returns the typed dictionary for a locale. */
export function messagesFor(locale: Locale): AppMessages {
	return DICTIONARIES[locale];
}

/**
 * Interpolates `{param}` placeholders and `one | many` plurals the same
 * way bQuery's `t()` does, but on a typed message string. Keeps the
 * build-time renderer fully typed without dot-path string keys.
 */
export function formatMessage(
	message: string,
	params: Record<string, string | number> = {},
): string {
	let template = message;
	const count = params.count;
	if (typeof count === 'number' && template.includes('|')) {
		const forms = template.split('|').map((form) => form.trim());
		template = (count === 1 ? forms[0] : (forms[1] ?? forms[0])) ?? '';
	}
	return template.replace(/\{(\w+)\}/g, (match, key: string) => {
		const value = params[key];
		return value === undefined ? match : String(value);
	});
}

/** Formats an ISO date for display in the given locale. */
export function formatIsoDate(isoDate: string, locale: Locale): string {
	const date = new Date(`${isoDate}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) {
		return isoDate;
	}
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'long',
		timeZone: 'UTC',
	}).format(date);
}
