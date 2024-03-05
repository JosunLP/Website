import { goto, replaceState } from '$app/navigation';
import type { Page } from '@sveltejs/kit';

export default class PageNavigation {
	private constructor() {
		console.log('PageNavigation constructor');
	}

	public static updateUrl(sectionId: string) {
		history.pushState(null, '', `/#${sectionId}`);
	}

	public static async scrollToSection(
		sectionId: string,
		$page: Page<Record<string, string>, string | null>
	) {
		const section = document.getElementById(sectionId);

		if ($page.url.pathname !== '/') {
			await goto(`/#${sectionId}`);
			document.title = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
		}

		if (section) {
			section.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
			document.title = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
		}
		PageNavigation.updateUrl(sectionId);
		replaceState({ sectionId });
	}

	public static async navigateToSection(sectionId: string) {
		goto(`/${sectionId}`);
	};
}
