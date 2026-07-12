/**
 * Cross-document navigation feedback. The next page is render-blocked
 * (`<link rel="expect">`) so the cross-document view transition can
 * capture a complete snapshot — but until that page is ready the old
 * page just sits there. Without feedback a slow navigation feels like
 * the click was swallowed, and a second click cancels and restarts the
 * in-flight navigation, making everything worse.
 *
 * This module tags `<html>` with `jp-navigating` while a same-origin
 * navigation is in flight; main.css renders a thin indeterminate
 * progress bar whose 150ms animation delay keeps it invisible on
 * instant (prerendered) navigations. Browsers without the Navigation
 * API simply keep their native loading indicator.
 */

interface NavigateEventLike extends Event {
	readonly hashChange: boolean;
	readonly downloadRequest: string | null;
	readonly destination: { readonly url: string };
}

interface NavigationLike extends EventTarget {
	addEventListener(
		type: 'navigate',
		listener: (event: NavigateEventLike) => void,
	): void;
	addEventListener(type: string, listener: (event: Event) => void): void;
}

const NAVIGATING_CLASS = 'jp-navigating';

export function initNavProgress(): void {
	const navigation = (window as { navigation?: NavigationLike }).navigation;
	if (navigation === undefined) {
		return;
	}
	const root = document.documentElement;
	const clear = (): void => {
		root.classList.remove(NAVIGATING_CLASS);
	};
	navigation.addEventListener('navigate', (event) => {
		if (event.hashChange || event.downloadRequest !== null) {
			return;
		}
		if (!event.destination.url.startsWith(window.location.origin)) {
			return;
		}
		root.classList.add(NAVIGATING_CLASS);
	});
	// Same-document completions and cancelled navigations (second click,
	// Escape) end here; successful cross-document ones unload the page.
	navigation.addEventListener('navigatesuccess', clear);
	navigation.addEventListener('navigateerror', clear);
	// A bfcache restore revives the page exactly as captured — possibly
	// with the class still set.
	window.addEventListener('pageshow', clear);
}
