import type { Readable } from 'svelte/store';
import { derived, writable } from 'svelte/store';

export interface NavigationState {
	currentSection: string;
	isScrolling: boolean;
	scrollProgress: number;
	deviceType: 'mobile' | 'tablet' | 'desktop';
	isMenuOpen: boolean;
}

export const navigationState = writable<NavigationState>({
	currentSection: '',
	isScrolling: false,
	scrollProgress: 0,
	deviceType: 'desktop',
	isMenuOpen: false
});

export const isMenuOpen = writable(false);

export const shouldShowBackToTop: Readable<boolean> = derived(
	navigationState,
	($state) => $state.scrollProgress > 0.3
);

export const currentDeviceType: Readable<'mobile' | 'tablet' | 'desktop'> = derived(
	navigationState,
	($state) => $state.deviceType
);

// Actions for updating navigation state
export const navigationActions = {
	setCurrentSection: (section: string) => {
		navigationState.update((state) => ({ ...state, currentSection: section }));
	},

	setScrolling: (isScrolling: boolean) => {
		navigationState.update((state) => ({ ...state, isScrolling }));
	},

	setScrollProgress: (progress: number) => {
		navigationState.update((state) => ({ ...state, scrollProgress: progress }));
	},

	setDeviceType: (deviceType: 'mobile' | 'tablet' | 'desktop') => {
		navigationState.update((state) => ({ ...state, deviceType }));
	},

	toggleMenu: () => {
		navigationState.update((state) => ({ ...state, isMenuOpen: !state.isMenuOpen }));
		isMenuOpen.update((open) => !open);
	},

	closeMenu: () => {
		navigationState.update((state) => ({ ...state, isMenuOpen: false }));
		isMenuOpen.set(false);
	}
};
