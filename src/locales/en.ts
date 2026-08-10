import type { AppMessages } from '@/features/i18n/messages';

export const en: AppMessages = {
	siteName: 'Jonas Pfalzgraf',
	siteTagline: 'Full-stack developer & open-source maintainer',
	skipToContent: 'Skip to main content',
	nav: {
		home: 'Home',
		about: 'About',
		projects: 'Projects',
		blog: 'Blog',
		contact: 'Contact',
		imprint: 'Imprint',
		privacy: 'Privacy',
		accessibility: 'Accessibility',
		openMenu: 'Open menu',
		closeMenu: 'Close menu',
		mainNavLabel: 'Main navigation',
		legalNavLabel: 'Legal',
	},
	language: {
		switcherLabel: 'Language',
		de: 'Deutsch',
		en: 'English',
		current: 'current language',
	},
	theme: {
		toggleLabel: 'Color scheme',
		light: 'Light',
		dark: 'Dark',
		system: 'System',
	},
	footer: {
		privacyPreferences: 'Privacy preferences',
		sourceNote: 'Source code on GitHub',
		socialLabel: 'Profiles elsewhere',
		exploreLabel: 'Explore',
		feed: 'Atom feed',
		backToTop: 'Back to top',
	},
	breadcrumbLabel: 'Breadcrumb',
	externalLink: 'opens an external site',
	home: {
		title: 'Jonas Pfalzgraf — Full-Stack Developer & Open Source',
		description:
			'Jonas Pfalzgraf (JosunLP) builds web applications and open-source tools with TypeScript — including bQuery.js, templates, and developer tooling.',
		heroHeading: 'Software that stays understandable.',
		heroIntro:
			'I am Jonas Pfalzgraf — full-stack developer from northern Germany. I build web applications and open-source tools with TypeScript, with a focus on maintainability, accessibility, and honest engineering.',
		flagshipChip: 'Flagship project: {name}',
		statsProjects: 'open-source project | open-source projects',
		statsTech: 'technology | technologies',
		statsPosts: 'article | articles',
		ctaProjects: 'Explore projects',
		ctaContact: 'Get in touch',
		selectedWorkHeading: 'Selected work',
		selectedWorkIntro:
			'Open-source libraries, templates, and applications I build and maintain.',
		allProjects: 'All projects',
		aboutHeading: 'About me',
		aboutText:
			'I work across the stack — from typed front-end architectures to APIs and tooling. Open source is where I test ideas in public: small, focused tools with clear documentation and honest trade-offs.',
		aboutMore: 'More about me',
		focusHeading: 'Technical focus',
		focusIntro: 'The areas I work in most, not a logo wall.',
		writingHeading: 'Latest writing',
		writingIntro: 'Notes on TypeScript, tooling, and the open web.',
		allPosts: 'All posts',
		contactHeading: 'Get in touch',
		contactText:
			'Questions about a project, a library, or collaboration? One e-mail is enough — no forms, no tracking.',
	},
	about: {
		title: 'About — Jonas Pfalzgraf',
		description:
			'Background, areas of expertise, and engineering values of Jonas Pfalzgraf (JosunLP), full-stack developer and open-source maintainer.',
		heading: 'About me',
		intro: [
			'I am Jonas Pfalzgraf, a full-stack developer working under the handle JosunLP. My daily work spans TypeScript, php, and C#/.NET applications, modern web front ends, APIs, and the tooling in between.',
			'In recent years my focus has been the web platform: typed component architectures, build tooling, accessibility, and performance. I care about software that other people can read, extend, and trust — which shapes how I design APIs, write documentation, and review code.',
			'I maintain a range of open-source projects, from the bQuery.js framework to project templates and developer tools. Most of them started as a concrete need in a real project and grew into something reusable.',
		],
		valuesHeading: 'How I work',
		values: [
			{
				heading: 'Clarity over cleverness',
				text: 'Code is read far more often than it is written. I prefer explicit, typed designs over abstractions that need explaining.',
			},
			{
				heading: 'Accessible by default',
				text: 'Semantics, keyboard support, and contrast are part of the definition of done — not an afterthought.',
			},
			{
				heading: 'Privacy first',
				text: 'No tracking by default, local assets, and honest documentation of what a system does with data.',
			},
			{
				heading: 'Documented trade-offs',
				text: 'Every architecture has costs. I would rather document a limitation than hide it.',
			},
		],
		ossHeading: 'Open source',
		ossText:
			'My projects are developed in the open on GitHub under MIT-style licenses wherever possible. Bug reports, questions, and contributions are welcome — the repositories document how.',
	},
	projects: {
		title: 'Projects — Jonas Pfalzgraf',
		description:
			'Open-source projects by Jonas Pfalzgraf (JosunLP): the bQuery.js framework, TypeScript libraries, project templates, and applications.',
		heading: 'Projects',
		intro:
			'A curated overview of the open-source work I build and maintain. Metadata is curated by hand — no live API calls, no surprises.',
		flagshipHeading: 'Flagship project',
		logoAlt: '{name} logo',
		repository: 'Repository',
		website: 'Website',
		categoryLabel: 'Category',
		statusLabel: 'Status',
		technologiesLabel: 'Technologies',
		licenseLabel: 'License',
		category: {
			framework: 'Framework',
			library: 'Library',
			tool: 'Tool',
			template: 'Template',
			application: 'Application',
		},
		status: {
			active: 'Active',
			maintained: 'Maintained',
			archived: 'Archived',
		},
	},
	blog: {
		title: 'Blog — Jonas Pfalzgraf',
		description:
			'Articles by Jonas Pfalzgraf on TypeScript, web engineering, open source, and developer experience.',
		heading: 'Blog',
		intro: 'Notes on TypeScript, tooling, and the open web.',
		readPost: 'Read article',
		publishedOn: 'Published on {date}',
		updatedOn: 'Updated on {date}',
		tagsLabel: 'Topics',
		tocHeading: 'On this page',
		empty: 'No articles have been published yet — check back soon.',
		loading: 'Loading articles …',
		loadError: 'The article list could not be loaded. Please try again later.',
		notFound: 'This article does not exist or has not been published yet.',
		backToBlog: 'Back to the blog',
		postCount: '{count} article | {count} articles',
		availableIn: 'Also available in: ',
		readingTime: '{count} min read',
		feedTitle: 'Jonas Pfalzgraf — Blog',
		feedLink: 'Subscribe to the feed',
		copyCode: 'Copy code',
		copiedCode: 'Copied',
		copyCodeFailed: 'Copy failed',
		headingLink: 'Link to this section',
		readingProgress: 'Reading progress',
	},
	contact: {
		title: 'Contact — Jonas Pfalzgraf',
		description:
			'How to reach Jonas Pfalzgraf (JosunLP) — direct e-mail contact, no forms, no tracking.',
		heading: 'Contact',
		intro:
			'The fastest way to reach me is e-mail. I read every message; replies can take a few days.',
		generalHeading: 'General inquiries',
		generalText: 'Questions, collaboration, or anything else — write to',
		supportHeading: 'Project support',
		supportText:
			'Bug reports and technical questions about my projects are best filed as GitHub issues in the respective repository. Alternatively:',
		privacyNote:
			'E-mails are used solely to answer your inquiry. Details are described in the privacy policy.',
	},
	notFound: {
		title: 'Page not found — JosunLP.de',
		heading: 'Page not found',
		text: 'The requested page does not exist or has been moved.',
		backHome: 'Back to the home page',
	},
};
