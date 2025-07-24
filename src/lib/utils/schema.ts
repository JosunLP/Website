export interface PersonSchema {
	'@context': string;
	'@type': string;
	name: string;
	jobTitle: string;
	url: string;
	sameAs: string[];
	knowsAbout: string[];
	worksFor?: Organization;
	address?: PostalAddress;
	email?: string;
	telephone?: string;
	image?: string;
	description?: string;
}

export interface Organization {
	'@type': string;
	name: string;
	url?: string;
}

export interface PostalAddress {
	'@type': string;
	addressCountry: string;
	addressRegion?: string;
	addressLocality?: string;
}

export interface WebsiteSchema {
	'@context': string;
	'@type': string;
	name: string;
	url: string;
	description: string;
	author: PersonSchema;
	inLanguage: string;
	copyrightYear: number;
	copyrightHolder: PersonSchema;
}

export function generatePersonSchema(): PersonSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Jonas Pfalzgraf',
		jobTitle: 'Full-Stack Developer & Designer',
		url: 'https://josunlp.de',
		sameAs: [
			'https://github.com/josunlp',
			'https://profile.josunlp.de',
			'https://linktr.ee/josunlp'
		],
		knowsAbout: [
			'TypeScript',
			'SvelteKit',
			'Azure',
			'Node.js',
			'Web Development',
			'UI/UX Design',
			'Progressive Web Apps',
			'Cloud Computing'
		],
		address: {
			'@type': 'PostalAddress',
			addressCountry: 'DE'
		},
		email: 'mailto:contact@josunlp.de',
		image: 'https://josunlp.de/images/lang.png',
		description:
			'Full-Stack Developer and Designer specializing in modern web technologies, TypeScript, SvelteKit, and Azure cloud solutions.'
	};
}

export function generateWebsiteSchema(): WebsiteSchema {
	const person = generatePersonSchema();

	return {
		'@context': 'https://schema.org',
		'@type': 'Website',
		name: 'JosunLP.de - Full-Stack Developer Portfolio',
		url: 'https://josunlp.de',
		description:
			'Portfolio and professional website of Jonas Pfalzgraf, showcasing web development projects, skills, and contact information.',
		author: person,
		inLanguage: 'en',
		copyrightYear: new Date().getFullYear(),
		copyrightHolder: person
	};
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

export function generateWebPageSchema(
	title: string,
	description: string,
	url: string,
	section?: string
) {
	const person = generatePersonSchema();

	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: title,
		description: description,
		url: url,
		author: person,
		publisher: person,
		inLanguage: 'en',
		isPartOf: {
			'@type': 'Website',
			name: 'JosunLP.de',
			url: 'https://josunlp.de'
		},
		...(section && {
			mainEntity: {
				'@type': 'Thing',
				name: section,
				description: `${section} section of Jonas Pfalzgraf's portfolio`
			}
		})
	};
}
