/**
 * Shape of a locale dictionary. Every locale must implement this interface
 * completely — missing keys are compile errors, which is the fallback
 * policy for UI copy: it cannot happen in a build that compiles.
 *
 * Values use bQuery i18n syntax: `{param}` interpolation and
 * `one | many` pluralization driven by a `count` parameter.
 */
export interface AppMessages {
	readonly siteName: string;
	readonly siteTagline: string;
	readonly skipToContent: string;
	readonly nav: {
		readonly home: string;
		readonly about: string;
		readonly projects: string;
		readonly blog: string;
		readonly contact: string;
		readonly imprint: string;
		readonly privacy: string;
		readonly accessibility: string;
		readonly openMenu: string;
		readonly closeMenu: string;
		readonly mainNavLabel: string;
		readonly legalNavLabel: string;
	};
	readonly language: {
		readonly switcherLabel: string;
		readonly de: string;
		readonly en: string;
		readonly current: string;
	};
	readonly theme: {
		readonly toggleLabel: string;
		readonly light: string;
		readonly dark: string;
		readonly system: string;
	};
	readonly footer: {
		readonly privacyPreferences: string;
		readonly sourceNote: string;
		readonly socialLabel: string;
	};
	readonly externalLink: string;
	readonly home: {
		readonly title: string;
		readonly description: string;
		readonly heroHeading: string;
		readonly heroIntro: string;
		readonly ctaProjects: string;
		readonly ctaContact: string;
		readonly selectedWorkHeading: string;
		readonly selectedWorkIntro: string;
		readonly allProjects: string;
		readonly aboutHeading: string;
		readonly aboutText: string;
		readonly aboutMore: string;
		readonly focusHeading: string;
		readonly focusIntro: string;
		readonly writingHeading: string;
		readonly writingIntro: string;
		readonly allPosts: string;
		readonly contactHeading: string;
		readonly contactText: string;
	};
	readonly about: {
		readonly title: string;
		readonly description: string;
		readonly heading: string;
		readonly intro: readonly string[];
		readonly valuesHeading: string;
		readonly values: readonly { heading: string; text: string }[];
		readonly ossHeading: string;
		readonly ossText: string;
	};
	readonly projects: {
		readonly title: string;
		readonly description: string;
		readonly heading: string;
		readonly intro: string;
		readonly flagshipHeading: string;
		readonly logoAlt: string;
		readonly repository: string;
		readonly website: string;
		readonly categoryLabel: string;
		readonly statusLabel: string;
		readonly technologiesLabel: string;
		readonly licenseLabel: string;
		readonly category: {
			readonly framework: string;
			readonly library: string;
			readonly tool: string;
			readonly template: string;
			readonly application: string;
		};
		readonly status: {
			readonly active: string;
			readonly maintained: string;
			readonly archived: string;
		};
	};
	readonly blog: {
		readonly title: string;
		readonly description: string;
		readonly heading: string;
		readonly intro: string;
		readonly readPost: string;
		readonly publishedOn: string;
		readonly updatedOn: string;
		readonly tagsLabel: string;
		readonly tocHeading: string;
		readonly empty: string;
		readonly loading: string;
		readonly loadError: string;
		readonly notFound: string;
		readonly backToBlog: string;
		readonly postCount: string;
		readonly availableIn: string;
	};
	readonly contact: {
		readonly title: string;
		readonly description: string;
		readonly heading: string;
		readonly intro: string;
		readonly generalHeading: string;
		readonly generalText: string;
		readonly supportHeading: string;
		readonly supportText: string;
		readonly privacyNote: string;
	};
	readonly notFound: {
		readonly title: string;
		readonly heading: string;
		readonly text: string;
		readonly backHome: string;
	};
	readonly legalDraftNotice: string;
}
