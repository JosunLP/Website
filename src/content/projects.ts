import type { Project } from '@/domain/models/project';

/**
 * Curated project catalog. Descriptions are verified against each
 * repository (last review: 2026-07-10). Keep this data honest — it feeds
 * visible copy and structured data.
 */
export const PROJECTS: readonly Project[] = [
	{
		slug: 'bquery',
		name: 'bQuery.js',
		category: 'framework',
		status: 'active',
		description: {
			en: 'A full-stack TypeScript framework with a jQuery-inspired API: fine-grained signals, typed Web Components, routing, i18n, accessibility utilities, and runtime-agnostic SSR — with zero mandatory build step and security-by-default HTML handling.',
			de: 'Ein Full-Stack-TypeScript-Framework mit jQuery-inspirierter API: feingranulare Signals, typisierte Web Components, Routing, i18n, Accessibility-Werkzeuge und laufzeitunabhängiges SSR — ohne verpflichtenden Build-Schritt und mit sicherem HTML-Handling ab Werk.',
		},
		technologies: ['TypeScript', 'Web Components', 'Signals', 'SSR'],
		repositoryUrl: 'https://github.com/bQuery/bQuery',
		websiteUrl: 'https://bquery.js.org/',
		license: 'MIT',
		featured: true,
		flagship: true,
	},
	{
		slug: 'threadts-universal',
		name: 'ThreadTS Universal',
		category: 'library',
		status: 'active',
		description: {
			en: 'True parallel execution for JavaScript with an async/await-style API. One codebase runs on Web Workers, Node.js worker threads, Deno, and Bun — with a parallel array API, auto-scaling worker pools, and decorators.',
			de: 'Echte parallele Ausführung für JavaScript mit einer async/await-artigen API. Eine Codebasis läuft auf Web Workers, Node.js Worker Threads, Deno und Bun — mit paralleler Array-API, automatisch skalierenden Worker-Pools und Decorators.',
		},
		technologies: ['TypeScript', 'Web Workers', 'Node.js', 'Deno', 'Bun'],
		repositoryUrl: 'https://github.com/JosunLP/ThreadTS-Universal',
		license: 'MIT',
		featured: true,
	},
	{
		slug: 'sort-it-now',
		name: 'Sort It Now',
		category: 'application',
		status: 'active',
		description: {
			en: 'A physics-aware 3D bin-packing service written in Rust. Optimizes how objects fit into containers — considering weight distribution and stability — with real-time 3D visualization, a REST API, and an offline CLI.',
			de: 'Ein physikbewusster 3D-Packungsoptimierer in Rust. Berechnet, wie Objekte in Container passen — inklusive Gewichtsverteilung und Stabilität — mit 3D-Visualisierung in Echtzeit, REST-API und Offline-CLI.',
		},
		technologies: ['Rust', 'Axum', 'Three.js', 'Docker'],
		repositoryUrl: 'https://github.com/JosunLP/sort-it-now',
		license: 'See repository',
		featured: true,
	},
	{
		slug: 'userscript-project-template',
		name: 'UserScript Project Template',
		category: 'template',
		status: 'active',
		description: {
			en: 'A production-ready TypeScript starter for building UserScripts for Tampermonkey, Greasemonkey, and Violentmonkey — typed storage and DOM utilities, an event-driven module system, and builds around 6 KB.',
			de: 'Ein produktionsreifes TypeScript-Starterprojekt für UserScripts in Tampermonkey, Greasemonkey und Violentmonkey — typisierte Storage- und DOM-Utilities, ein ereignisbasiertes Modulsystem und Builds um 6 KB.',
		},
		technologies: ['TypeScript', 'Vite', 'bQuery.js'],
		repositoryUrl: 'https://github.com/JosunLP/UserScriptProjectTemplate',
		license: 'MIT',
		featured: false,
	},
	{
		slug: 'browser-extension-template',
		name: 'Browser Extension Template',
		category: 'template',
		status: 'active',
		description: {
			en: 'A starter kit for cross-browser extensions: TypeScript with strict checks, Chrome Manifest V3 and Firefox support, reactive state via bQuery.js, and an opinionated build setup with Vite.',
			de: 'Ein Starter-Kit für Cross-Browser-Extensions: TypeScript mit strikten Checks, Unterstützung für Chrome Manifest V3 und Firefox, reaktiver State über bQuery.js und ein durchdachtes Build-Setup mit Vite.',
		},
		technologies: ['TypeScript', 'Vite', 'bQuery.js', 'WebExtensions'],
		repositoryUrl: 'https://github.com/JosunLP/BrowserExtensionTemplate',
		license: 'MIT',
		featured: false,
	},
	{
		slug: 'checkai',
		name: 'CheckAI',
		category: 'application',
		status: 'active',
		description: {
			en: 'A chess engine and server written in Rust, built for AI agents playing against each other under FIDE rules — with REST and WebSocket APIs, a terminal client, a web UI, and WebAssembly support.',
			de: 'Eine Schach-Engine samt Server in Rust, gebaut für KI-Agenten, die nach FIDE-Regeln gegeneinander spielen — mit REST- und WebSocket-APIs, Terminal-Client, Web-UI und WebAssembly-Unterstützung.',
		},
		technologies: ['Rust', 'WebAssembly', 'TypeScript', 'WebSocket'],
		repositoryUrl: 'https://github.com/JosunLP/checkai',
		websiteUrl: 'https://josunlp.github.io/checkai/',
		license: 'MIT',
		featured: true,
	},
	{
		slug: 'planning-poker',
		name: 'Planning Poker',
		category: 'application',
		status: 'active',
		description: {
			en: 'A real-time estimation tool for agile teams: Fibonacci-scale voting, automatic consensus detection, vote statistics, and an observer mode — responsive and self-hostable.',
			de: 'Ein Echtzeit-Schätzwerkzeug für agile Teams: Abstimmung auf der Fibonacci-Skala, automatische Konsens-Erkennung, Statistiken und ein Beobachtermodus — responsiv und selbst hostbar.',
		},
		technologies: ['Nuxt', 'TypeScript', 'Tailwind CSS'],
		repositoryUrl: 'https://github.com/JosunLP/planning-poker',
		websiteUrl: 'https://planning-poker.flausch-code.de/',
		license: 'MIT',
		featured: false,
	},
	{
		slug: 'retro-rumble',
		name: 'Retro Rumble',
		category: 'application',
		status: 'active',
		description: {
			en: 'A real-time retrospective tool for scrum teams: anonymous cards, grouping, voting, and action items — sessions live in memory only, with no data persistence, in twelve languages.',
			de: 'Ein Echtzeit-Retrospektive-Tool für Scrum-Teams: anonyme Karten, Gruppierung, Abstimmung und Action Items — Sitzungen existieren nur im Arbeitsspeicher, ohne Datenpersistenz, in zwölf Sprachen.',
		},
		technologies: ['Nuxt', 'TypeScript', 'Tailwind CSS', 'WebSocket'],
		repositoryUrl: 'https://github.com/JosunLP/retro-rumble',
		license: 'MIT',
		featured: false,
	},
];

/** Projects shown in the home page "Selected work" section. */
export function featuredProjects(): readonly Project[] {
	return PROJECTS.filter((project) => project.featured);
}

/** The flagship project (bQuery.js), highlighted separately. */
export function flagshipProject(): Project | undefined {
	return PROJECTS.find((project) => project.flagship === true);
}
