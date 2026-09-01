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

// Formatting helpers are dictionary-free and live in their own module so
// client islands can format without importing every locale's messages.
export { formatIsoDate, formatMessage } from './format';

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
