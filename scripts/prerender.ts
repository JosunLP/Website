import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { AssetResolver } from '@/render/layout';
import { installDomGlobals } from './lib/dom-globals';

installDomGlobals();

// Imported dynamically AFTER DOM globals are installed — the markdown
// pipeline touches bQuery's DOM-based sanitizer at call time, and the
// component modules must never be pulled into the Node process.
const { renderMarkdown } = await import('@/domain/services/markdown');
const { highlightCode } = await import('@/features/blog/highlight');
const { buildRoutes } = await import('@/render/site');
const { messagesFor } = await import('@/features/i18n');
const { validateProject } = await import('@/domain/models/project');
const { PROJECTS } = await import('@/content/projects');
const { loadAllPosts, toManifestEntries } = await import('./lib/blog-files');

const DIST = join(process.cwd(), 'dist');
const VITE_MANIFEST = join(DIST, '.vite', 'manifest.json');

interface ViteManifestChunk {
	file: string;
	css?: string[];
	imports?: string[];
}

/** Resolves hashed asset URLs from Vite's build manifest. */
function createAssetResolver(): AssetResolver {
	if (!existsSync(VITE_MANIFEST)) {
		throw new Error(
			'dist/.vite/manifest.json missing — run `vite build` first',
		);
	}
	const manifest = JSON.parse(readFileSync(VITE_MANIFEST, 'utf8')) as Record<
		string,
		ViteManifestChunk
	>;
	const chunk = (source: string): ViteManifestChunk => {
		const entry = manifest[source];
		if (entry === undefined) {
			throw new Error(`entry "${source}" missing from Vite manifest`);
		}
		return entry;
	};
	const styles = new Set<string>();
	styles.add(`/${chunk('src/styles/main.css').file}`);
	for (const entry of ['src/app/bootstrap.ts', 'src/app/article.ts']) {
		for (const css of manifest[entry]?.css ?? []) {
			styles.add(`/${css}`);
		}
	}
	// Shared chunks a page's entries import, collected transitively. Emitted
	// as <link rel="modulepreload"> so the browser does not discover them a
	// network round trip after the entry module.
	const modulePreloads = (entries: readonly string[]): readonly string[] => {
		const files = new Set<string>();
		const visit = (key: string): void => {
			for (const imported of manifest[key]?.imports ?? []) {
				const file = manifest[imported]?.file;
				if (file !== undefined && !files.has(file)) {
					files.add(file);
					visit(imported);
				}
			}
		};
		for (const entry of entries) {
			visit(`src/app/${entry}.ts`);
		}
		return [...files].map((file) => `/${file}`);
	};
	return {
		script: (entry: string): string => `/${chunk(`src/app/${entry}.ts`).file}`,
		styles: (): readonly string[] => [...styles],
		extraHead: (): string => '',
		modulePreloads,
	};
}

// Fail the build on invalid curated project data.
const projectErrors = PROJECTS.flatMap((project) => validateProject(project));
if (projectErrors.length > 0) {
	console.error('Invalid project data:');
	for (const error of projectErrors) {
		console.error(`  - ${error}`);
	}
	process.exit(1);
}

// Build-time blog data: parsed posts + rendered markdown.
const loaded = loadAllPosts();
const entries = toManifestEntries(loaded);
const articles = new Map<
	string,
	{
		post: (typeof loaded)[number]['post'];
		rendered: ReturnType<typeof renderMarkdown>;
	}
>();
for (const { post, locale } of loaded) {
	if (post.meta.draft) {
		continue;
	}
	const messages = messagesFor(locale);
	articles.set(`${locale}:${post.meta.slug}`, {
		post,
		rendered: renderMarkdown(post.markdown, {
			externalLinkLabel: messages.externalLink,
			highlight: highlightCode,
		}),
	});
}

const routes = buildRoutes(createAssetResolver(), { entries, articles });

/**
 * Directory-style routes ("/de/blog/") become `index.html`; routes that
 * already name a file ("/de/404.html", "/de/blog/feed.xml") are written
 * as-is.
 */
function outputPath(route: string): string {
	const isFile = /\.[a-z0-9]+$/i.test(route);
	return isFile
		? join(DIST, route.slice(1))
		: join(DIST, route.slice(1), 'index.html');
}

let count = 0;
for (const [path, render] of routes) {
	const filePath = outputPath(path);
	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, render());
	count += 1;
}
console.log(`Prerendered ${String(count)} routes into dist/.`);
