import {
	decideLocale,
	readStoredLocale,
} from '@/features/i18n/locale-preference';

/**
 * Root route (`/`) locale decision: stored explicit preference →
 * browser language negotiation → German. Uses `location.replace` so the
 * root page does not pollute history. Without JavaScript the visible
 * language links on the page do the same job.
 */
if (location.pathname === '/' || location.pathname === '/index.html') {
	const locale = decideLocale(readStoredLocale(), navigator.languages);
	location.replace(`/${locale}/`);
}
