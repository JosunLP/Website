import type { AppMessages } from '@/features/i18n/messages';

export const de: AppMessages = {
	siteName: 'Jonas Pfalzgraf',
	siteTagline: 'Full-Stack-Entwickler & Open-Source-Maintainer',
	skipToContent: 'Zum Inhalt springen',
	nav: {
		home: 'Start',
		about: 'Über mich',
		projects: 'Projekte',
		blog: 'Blog',
		contact: 'Kontakt',
		imprint: 'Impressum',
		privacy: 'Datenschutz',
		accessibility: 'Barrierefreiheit',
		openMenu: 'Menü öffnen',
		closeMenu: 'Menü schließen',
		mainNavLabel: 'Hauptnavigation',
		legalNavLabel: 'Rechtliches',
	},
	language: {
		switcherLabel: 'Sprache',
		de: 'Deutsch',
		en: 'English',
		current: 'aktuelle Sprache',
	},
	theme: {
		toggleLabel: 'Farbschema',
		light: 'Hell',
		dark: 'Dunkel',
		system: 'System',
	},
	footer: {
		privacyPreferences: 'Privatsphäre-Einstellungen',
		sourceNote: 'Quellcode auf GitHub',
		socialLabel: 'Profile im Netz',
	},
	externalLink: 'öffnet eine externe Seite',
	home: {
		title: 'Jonas Pfalzgraf — Full-Stack-Entwickler & Open Source',
		description:
			'Jonas Pfalzgraf (JosunLP) entwickelt Webanwendungen und Open-Source-Werkzeuge mit TypeScript — darunter bQuery.js, Templates und Developer-Tooling.',
		heroHeading: 'Software, die verständlich bleibt.',
		heroIntro:
			'Ich bin Jonas Pfalzgraf — Full-Stack-Entwickler aus Norddeutschland. Ich baue Webanwendungen und Open-Source-Werkzeuge mit TypeScript, mit Fokus auf Wartbarkeit, Barrierefreiheit und ehrliches Engineering.',
		ctaProjects: 'Projekte ansehen',
		ctaContact: 'Kontakt aufnehmen',
		selectedWorkHeading: 'Ausgewählte Arbeiten',
		selectedWorkIntro:
			'Open-Source-Bibliotheken, Templates und Anwendungen, die ich entwickle und pflege.',
		allProjects: 'Alle Projekte',
		aboutHeading: 'Über mich',
		aboutText:
			'Ich arbeite über den gesamten Stack — von typisierten Frontend-Architekturen bis zu APIs und Tooling. Open Source ist mein öffentliches Labor: kleine, fokussierte Werkzeuge mit klarer Dokumentation und ehrlichen Kompromissen.',
		aboutMore: 'Mehr über mich',
		focusHeading: 'Technischer Fokus',
		focusIntro:
			'Die Bereiche, in denen ich am meisten arbeite — keine Logowand.',
		writingHeading: 'Aktuelle Artikel',
		writingIntro: 'Notizen zu TypeScript, Tooling und dem offenen Web.',
		allPosts: 'Alle Artikel',
		contactHeading: 'Kontakt aufnehmen',
		contactText:
			'Fragen zu einem Projekt, einer Bibliothek oder einer Zusammenarbeit? Eine E-Mail genügt — keine Formulare, kein Tracking.',
	},
	about: {
		title: 'Über mich — Jonas Pfalzgraf',
		description:
			'Werdegang, Schwerpunkte und Arbeitsweise von Jonas Pfalzgraf (JosunLP), Full-Stack-Entwickler und Open-Source-Maintainer.',
		heading: 'Über mich',
		intro: [
			'Ich bin Jonas Pfalzgraf, Full-Stack-Entwickler, im Netz unterwegs als JosunLP. Mein Arbeitsalltag umfasst TypeScript- und C#/.NET-Anwendungen, moderne Web-Frontends, APIs und das Tooling dazwischen.',
			'In den letzten Jahren liegt mein Schwerpunkt auf der Webplattform: typisierte Komponenten-Architekturen, Build-Tooling, Barrierefreiheit und Performance. Mir ist wichtig, dass Software für andere lesbar, erweiterbar und vertrauenswürdig ist — das prägt, wie ich APIs entwerfe, dokumentiere und Code reviewe.',
			'Ich pflege eine Reihe von Open-Source-Projekten, vom Framework bQuery.js über Projekt-Templates bis zu Entwickler-Werkzeugen. Die meisten sind aus einem konkreten Bedarf in echten Projekten entstanden und zu etwas Wiederverwendbarem gewachsen.',
		],
		valuesHeading: 'Wie ich arbeite',
		values: [
			{
				heading: 'Klarheit vor Cleverness',
				text: 'Code wird deutlich öfter gelesen als geschrieben. Ich bevorzuge explizite, typisierte Designs gegenüber Abstraktionen, die man erklären muss.',
			},
			{
				heading: 'Barrierefrei von Anfang an',
				text: 'Semantik, Tastaturbedienung und Kontrast gehören zur Definition of Done — nicht in den Nachtrag.',
			},
			{
				heading: 'Datenschutz zuerst',
				text: 'Kein Tracking als Standard, lokale Assets und ehrliche Dokumentation, was ein System mit Daten tut.',
			},
			{
				heading: 'Dokumentierte Kompromisse',
				text: 'Jede Architektur hat Kosten. Ich dokumentiere eine Einschränkung lieber, als sie zu verstecken.',
			},
		],
		ossHeading: 'Open Source',
		ossText:
			'Meine Projekte entstehen offen auf GitHub, wo immer möglich unter MIT-artigen Lizenzen. Bug-Reports, Fragen und Beiträge sind willkommen — die Repositories dokumentieren, wie.',
	},
	projects: {
		title: 'Projekte — Jonas Pfalzgraf',
		description:
			'Open-Source-Projekte von Jonas Pfalzgraf (JosunLP): das Framework bQuery.js, TypeScript-Bibliotheken, Projekt-Templates und Anwendungen.',
		heading: 'Projekte',
		intro:
			'Ein kuratierter Überblick über die Open-Source-Arbeit, die ich entwickle und pflege. Die Metadaten sind von Hand gepflegt — keine Live-API-Aufrufe, keine Überraschungen.',
		flagshipHeading: 'Flaggschiff-Projekt',
		logoAlt: '{name}-Logo',
		repository: 'Repository',
		website: 'Website',
		categoryLabel: 'Kategorie',
		statusLabel: 'Status',
		technologiesLabel: 'Technologien',
		licenseLabel: 'Lizenz',
		category: {
			framework: 'Framework',
			library: 'Bibliothek',
			tool: 'Werkzeug',
			template: 'Template',
			application: 'Anwendung',
		},
		status: {
			active: 'Aktiv',
			maintained: 'Gepflegt',
			archived: 'Archiviert',
		},
	},
	blog: {
		title: 'Blog — Jonas Pfalzgraf',
		description:
			'Artikel von Jonas Pfalzgraf über TypeScript, Web-Engineering, Open Source und Developer Experience.',
		heading: 'Blog',
		intro: 'Notizen zu TypeScript, Tooling und dem offenen Web.',
		readPost: 'Artikel lesen',
		publishedOn: 'Veröffentlicht am {date}',
		updatedOn: 'Aktualisiert am {date}',
		tagsLabel: 'Themen',
		tocHeading: 'Auf dieser Seite',
		empty:
			'Es wurden noch keine Artikel veröffentlicht — bald gibt es hier mehr.',
		loading: 'Artikel werden geladen …',
		loadError:
			'Die Artikelliste konnte nicht geladen werden. Bitte später erneut versuchen.',
		notFound:
			'Dieser Artikel existiert nicht oder wurde noch nicht veröffentlicht.',
		backToBlog: 'Zurück zum Blog',
		postCount: '{count} Artikel | {count} Artikel',
		availableIn: 'Auch verfügbar in: ',
	},
	contact: {
		title: 'Kontakt — Jonas Pfalzgraf',
		description:
			'So erreichen Sie Jonas Pfalzgraf (JosunLP) — direkter E-Mail-Kontakt, keine Formulare, kein Tracking.',
		heading: 'Kontakt',
		intro:
			'Am schnellsten erreichen Sie mich per E-Mail. Ich lese jede Nachricht; Antworten können ein paar Tage dauern.',
		generalHeading: 'Allgemeine Anfragen',
		generalText: 'Fragen, Zusammenarbeit oder alles andere — schreiben Sie an',
		supportHeading: 'Projekt-Support',
		supportText:
			'Fehlermeldungen und technische Fragen zu meinen Projekten sind am besten als GitHub-Issues im jeweiligen Repository aufgehoben. Alternativ:',
		privacyNote:
			'E-Mails werden ausschließlich zur Beantwortung Ihrer Anfrage verwendet. Details beschreibt die Datenschutzerklärung.',
	},
	notFound: {
		title: 'Seite nicht gefunden — Jonas Pfalzgraf',
		heading: 'Seite nicht gefunden',
		text: 'Die angeforderte Seite existiert nicht oder wurde verschoben.',
		backHome: 'Zur Startseite',
	},
	legalDraftNotice:
		'Entwurfsvorlage: Diese Seite muss noch durch den Seitenbetreiber und ggf. durch qualifizierte Rechtsberatung geprüft werden. Sie stellt keine Rechtsberatung dar.',
};
