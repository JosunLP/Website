import type { Locale } from '@/domain/models/locale';

/**
 * Message and date formatting, deliberately free of any dictionary
 * import.
 *
 * `@/features/i18n` pulls in every locale's messages, so a client island
 * that only needed `formatMessage` used to drag both dictionaries — and
 * with them the whole render layer — into its bundle. These helpers live
 * apart so the browser can have the formatting rules without the words,
 * and so client and server format identically instead of each keeping
 * their own copy.
 */

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

/**
 * One `Intl.DateTimeFormat` per locale, reused.
 *
 * Constructing a formatter is the expensive part of `Intl` — it resolves
 * locale data every time. The previous code built a fresh one per date,
 * which is once per row: invisible for the two posts that exist today,
 * and a real cost on a list of thirty.
 */
const DATE_FORMATTERS = new Map<Locale, Intl.DateTimeFormat>();

function dateFormatter(locale: Locale): Intl.DateTimeFormat {
	let formatter = DATE_FORMATTERS.get(locale);
	if (formatter === undefined) {
		formatter = new Intl.DateTimeFormat(locale, {
			dateStyle: 'long',
			timeZone: 'UTC',
		});
		DATE_FORMATTERS.set(locale, formatter);
	}
	return formatter;
}

/** Formats an ISO date for display in the given locale. */
export function formatIsoDate(isoDate: string, locale: Locale): string {
	const date = new Date(`${isoDate}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) {
		return isoDate;
	}
	return dateFormatter(locale).format(date);
}
