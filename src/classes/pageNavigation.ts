import { goto, replaceState } from '$app/navigation';
import type { Page } from '@sveltejs/kit';
import { DeviceType } from '../enums/deviceType.enum';

export default class PageNavigation {
	public static getDeviceType(): DeviceType {
		const userAgent = navigator.userAgent;
		const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
		const isTablet = /iPad|Android|Touch/i.test(userAgent);

		if (isMobile) {
			return DeviceType.MOBILE;
		} else if (isTablet) {
			return DeviceType.TABLET;
		} else {
			return DeviceType.DESKTOP;
		}
	}

	private constructor() {
		console.log('PageNavigation constructor');
	}

	public static updateUrl(sectionId: string) {
		replaceState('', `/#${sectionId}`);
		history.replaceState(null, '', `/#${sectionId}`);
	}

	public static updateTitle(sectionId: string, $page: Page<Record<string, string>, string | null>) {
		if ($page.url.pathname === '/') {
			document.title = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
		}
	}

	public static async scrollToSection(
		sectionId: string,
		$page: Page<Record<string, string>, string | null>,
		callback?: () => void
	) {
		const section = document.getElementById(sectionId);

		if ($page.url.pathname !== '/') {
			await goto(`/#${sectionId}`)
				.then(() => {
					PageNavigation.trackScrollSectionPosition($page);
					$page.state = `/#${sectionId}`;
					$page.route = { id: `/#${sectionId}` };
					$page.url = new URL($page.url.origin + `/#${sectionId}` + $page.url.search);
				})
				.catch((error) => {
					console.error(error);
				});
			document.title = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
		}

		if (section) {
			section.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
		}

		await PageNavigation.trackScrollSectionPosition($page);

		if (callback) {
			callback();
		}
	}

	public static async navigateToSection(sectionId: string, callback?: () => void) {
		const sections = document.querySelectorAll('section');
		const sectionObserver = new IntersectionObserver(() => {}, { threshold: 0.5 });

		sections.forEach((section) => {
			sectionObserver.unobserve(section);
		});
		goto(`/${sectionId}`);

		if (callback) {
			callback();
		}
	}

	public static async trackScrollSectionPosition(
		$page: Page<Record<string, string>, string | null>
	) {
		const isBasePath = $page.url.pathname === '/';

		if (isBasePath) {
			const sections = document.querySelectorAll('section');
			const sectionObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						const sectionId = entry.target.id;
						if (entry.isIntersecting) {
							PageNavigation.updateUrl(sectionId);
							PageNavigation.updateTitle(sectionId, $page);
						}
					});
				},
				{ threshold: 0.5 }
			);

			sections.forEach((section) => {
				sectionObserver.unobserve(section);
			});

			sections.forEach((section) => {
				sectionObserver.observe(section);
			});
		}
	}
}
