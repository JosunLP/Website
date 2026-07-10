import type { Localized } from '@/domain/models/locale';

/** One curated area of technical focus shown on the home page. */
export interface FocusArea {
	readonly heading: Localized<string>;
	readonly text: Localized<string>;
	readonly keywords: readonly string[];
}

export const FOCUS_AREAS: readonly FocusArea[] = [
	{
		heading: {
			en: 'TypeScript & web platform',
			de: 'TypeScript & Webplattform',
		},
		text: {
			en: 'Strictly typed application architectures, Web Components, and framework design close to the platform.',
			de: 'Strikt typisierte Anwendungsarchitekturen, Web Components und Framework-Design nah an der Plattform.',
		},
		keywords: ['TypeScript', 'Web Components', 'ESM', 'Signals'],
	},
	{
		heading: {
			en: 'Full-stack development',
			de: 'Full-Stack-Entwicklung',
		},
		text: {
			en: 'From front-end architecture to APIs and services — including C#/.NET, Node.js, and Rust where it fits.',
			de: 'Von Frontend-Architektur bis zu APIs und Services — inklusive C#/.NET, Node.js und Rust, wo es passt.',
		},
		keywords: ['C#/.NET', 'Node.js', 'Rust', 'REST'],
	},
	{
		heading: {
			en: 'Developer experience & tooling',
			de: 'Developer Experience & Tooling',
		},
		text: {
			en: 'Project templates, build pipelines, and small tools that make everyday development calmer and faster.',
			de: 'Projekt-Templates, Build-Pipelines und kleine Werkzeuge, die den Entwicklungsalltag ruhiger und schneller machen.',
		},
		keywords: ['Vite', 'CI/CD', 'Templates', 'Testing'],
	},
	{
		heading: {
			en: 'Accessibility & performance',
			de: 'Barrierefreiheit & Performance',
		},
		text: {
			en: 'Semantic HTML, keyboard support, and Core Web Vitals as engineering requirements, not afterthoughts.',
			de: 'Semantisches HTML, Tastaturbedienung und Core Web Vitals als Engineering-Anforderungen, nicht als Nachtrag.',
		},
		keywords: ['WCAG 2.2', 'Core Web Vitals', 'SEO'],
	},
];
