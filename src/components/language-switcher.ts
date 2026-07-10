import { isLocale } from '@/domain/models/locale';
import { storeLocale } from '@/features/i18n';

/**
 * jp-language-switcher — progressive enhancer around the server-rendered
 * locale links. Without JavaScript the links simply navigate; with
 * JavaScript an explicit click additionally persists the choice so the
 * root route respects it on future visits.
 *
 * Deliberately a plain custom element instead of a bQuery `component()`:
 * it must never re-render the crawlable server markup it wraps.
 */
export function registerLanguageSwitcher(): void {
	if (customElements.get('jp-language-switcher') != null) {
		return;
	}
	customElements.define(
		'jp-language-switcher',
		class extends HTMLElement {
			connectedCallback(): void {
				this.addEventListener('click', (event) => {
					const target = event.target as HTMLElement | null;
					const link = target?.closest<HTMLAnchorElement>('a[data-locale]');
					const locale = link?.dataset.locale;
					if (locale !== undefined && isLocale(locale)) {
						storeLocale(locale);
						// Navigation proceeds natively.
					}
				});
			}
		},
	);
}
