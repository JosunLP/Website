import { goto, replaceState } from '$app/navigation';
import type { Page } from '@sveltejs/kit';
import { DeviceType } from '../enums/deviceType.enum';
import { ErrorHandler } from '../lib/services/errorHandler';
import { navigationActions } from '../lib/stores/navigation';

export default class PageNavigation {
	private static observers: IntersectionObserver[] = [];
	private static scrollTimeout: ReturnType<typeof setTimeout> | null = null;

	public static getDeviceType(): DeviceType {
		try {
			const userAgent = navigator.userAgent;
			const screenWidth = window.innerWidth;

			// More accurate device detection using screen width
			if (screenWidth <= 480) {
				return DeviceType.MOBILE;
			} else if (screenWidth <= 1024) {
				return DeviceType.TABLET;
			} else {
				return DeviceType.DESKTOP;
			}
		} catch (error) {
			ErrorHandler.handleComponentError(error as Error, 'PageNavigation.getDeviceType');
			return DeviceType.DESKTOP;
		}
	}

	private constructor() {
		console.log('PageNavigation constructor');
	}

	public static updateUrl(sectionId: string) {
		try {
			replaceState('', `/#${sectionId}`);
			history.replaceState(null, '', `/#${sectionId}`);
			navigationActions.setCurrentSection(sectionId);
		} catch (error) {
			ErrorHandler.handleNavError(error as Error, sectionId);
		}
	}

	public static updateTitle(sectionId: string, $page: Page<Record<string, string>, string | null>) {
		try {
			if ($page?.url?.pathname === '/') {
				const formattedTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
				document.title = `${formattedTitle} | JosunLP.de`;
			}
		} catch (error) {
			ErrorHandler.handleNavError(error as Error, sectionId);
		}
	}

	public static async scrollToSection(
		sectionId: string,
		$page: Page<Record<string, string>, string | null>,
		callback?: () => void
	) {
		try {
			navigationActions.setScrolling(true);

			const section = document.getElementById(sectionId);

			if ($page?.url?.pathname !== '/') {
				await goto(`/#${sectionId}`)
					.then(() => {
						PageNavigation.trackScrollSectionPosition($page);
						$page.state = `/#${sectionId}`;
						$page.route = { id: `/#${sectionId}` };
						if ($page.url) {
							$page.url = new URL($page.url.origin + `/#${sectionId}` + $page.url.search);
						}
					})
					.catch((error) => {
						ErrorHandler.handleNavError(error, sectionId);
					});
				document.title = `${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} | JosunLP.de`;
			}

			if (section) {
				// Add focus management for accessibility
				const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

				section.scrollIntoView({
					behavior: isReducedMotion ? 'auto' : 'smooth',
					block: 'start',
					inline: 'nearest'
				});

				// Set focus for screen readers
				section.setAttribute('tabindex', '-1');
				section.focus();

				// Remove tabindex after focus
				setTimeout(() => {
					section.removeAttribute('tabindex');
				}, 100);
			}

			await PageNavigation.trackScrollSectionPosition($page);

			if (callback) {
				callback();
			}

			// Update scroll progress
			PageNavigation.updateScrollProgress();

			setTimeout(() => {
				navigationActions.setScrolling(false);
			}, 1000);
		} catch (error) {
			ErrorHandler.handleScrollError(error as Error, sectionId);
			navigationActions.setScrolling(false);
		}
	}

	public static async navigateToSection(sectionId: string, callback?: () => void) {
		try {
			const sections = document.querySelectorAll('section');
			PageNavigation.cleanupObservers();

			await goto(`/${sectionId}`);

			if (callback) {
				callback();
			}
		} catch (error) {
			ErrorHandler.handleNavError(error as Error, sectionId);
		}
	}

	public static async trackScrollSectionPosition(
		$page: Page<Record<string, string>, string | null>
	) {
		try {
			const isBasePath = $page?.url?.pathname === '/';

			if (isBasePath) {
				const sections = document.querySelectorAll('section');

				// Clean up existing observers
				PageNavigation.cleanupObservers();

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
					{
						threshold: 0.5,
						rootMargin: '-10% 0px -10% 0px' // Better detection with margins
					}
				);

				sections.forEach((section) => {
					sectionObserver.observe(section);
				});

				PageNavigation.observers.push(sectionObserver);
			}
		} catch (error) {
			ErrorHandler.handleNavError(error as Error, 'trackScrollSectionPosition');
		}
	}

	public static initScrollTracking() {
		if (typeof window === 'undefined') return;

		try {
			// Track scroll progress
			const handleScroll = () => {
				if (PageNavigation.scrollTimeout) {
					clearTimeout(PageNavigation.scrollTimeout);
				}

				PageNavigation.scrollTimeout = setTimeout(() => {
					PageNavigation.updateScrollProgress();
				}, 10);
			};

			window.addEventListener('scroll', handleScroll, { passive: true });

			// Update device type on resize
			const handleResize = () => {
				const deviceType = PageNavigation.getDeviceType();
				const mappedType =
					deviceType === DeviceType.MOBILE
						? 'mobile'
						: deviceType === DeviceType.TABLET
							? 'tablet'
							: 'desktop';
				navigationActions.setDeviceType(mappedType);
			};

			window.addEventListener('resize', handleResize, { passive: true });

			// Initial device type setting
			handleResize();
		} catch (error) {
			ErrorHandler.handleComponentError(error as Error, 'PageNavigation.initScrollTracking');
		}
	}

	private static updateScrollProgress() {
		try {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
			const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

			navigationActions.setScrollProgress(Math.min(Math.max(progress, 0), 1));
		} catch (error) {
			ErrorHandler.handleComponentError(error as Error, 'PageNavigation.updateScrollProgress');
		}
	}

	private static cleanupObservers() {
		PageNavigation.observers.forEach((observer) => {
			observer.disconnect();
		});
		PageNavigation.observers = [];
	}

	public static cleanup() {
		PageNavigation.cleanupObservers();
		if (PageNavigation.scrollTimeout) {
			clearTimeout(PageNavigation.scrollTimeout);
			PageNavigation.scrollTimeout = null;
		}
	}
}
