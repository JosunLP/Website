import { readFileSync, existsSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { join } from 'node:path';
import { createServer as createViteServer } from 'vite';
import { installDomGlobals } from './lib/dom-globals';
import type * as SiteModule from '@/render/site';
import type * as MarkdownModule from '@/domain/services/markdown';
import type * as HighlightModule from '@/features/blog/highlight';
import type * as I18nModule from '@/features/i18n';

installDomGlobals();

/**
 * Minimal extension → MIME map for static public assets. Without an
 * explicit `Content-Type`, browsers refuse to render SVGs inside `<img>`
 * (the logos) and may mis-sniff other assets. Production web servers set
 * this by extension; the dev server must do the same.
 */
const MIME_TYPES: Record<string, string> = {
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.json': 'application/json',
	'.webmanifest': 'application/manifest+json',
	'.xml': 'application/xml',
	// The Atom feeds are the only .xml files a reader subscribes to; the
	// sitemaps are fetched by crawlers that do not care about the subtype.
	'/feed.xml': 'application/atom+xml; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.woff2': 'font/woff2',
	'.css': 'text/css; charset=utf-8',
};

function contentTypeFor(path: string): string | undefined {
	const lower = path.toLowerCase();
	if (lower.endsWith('/feed.xml')) {
		return MIME_TYPES['/feed.xml'];
	}
	const dot = lower.lastIndexOf('.');
	if (dot === -1) {
		return undefined;
	}
	return MIME_TYPES[lower.slice(dot)];
}

/**
 * Development server: renders pages on the fly through Vite's SSR module
 * graph (so edits to render code apply on reload) and serves client
 * assets through the regular Vite dev pipeline.
 */
const vite = await createViteServer({
	server: { middlewareMode: true },
	appType: 'custom',
});

const DEV_ASSETS = {
	script: (entry: string): string => `/src/app/${entry}.ts`,
	styles: (): readonly string[] => ['/src/styles/main.css'],
	extraHead: (): string => '',
};

async function renderPath(path: string): Promise<string | null> {
	const site = (await vite.ssrLoadModule(
		'/src/render/site.ts',
	)) as typeof SiteModule;
	const markdown = (await vite.ssrLoadModule(
		'/src/domain/services/markdown.ts',
	)) as typeof MarkdownModule;
	const highlight = (await vite.ssrLoadModule(
		'/src/features/blog/highlight.ts',
	)) as typeof HighlightModule;
	const i18n = (await vite.ssrLoadModule(
		'/src/features/i18n/index.ts',
	)) as typeof I18nModule;
	const { loadAllPosts, toManifestEntries } = await import('./lib/blog-files');

	const loaded = loadAllPosts();
	const entries = toManifestEntries(loaded);
	const articles = new Map<
		string,
		{
			post: (typeof loaded)[number]['post'];
			rendered: ReturnType<typeof markdown.renderMarkdown>;
		}
	>();
	for (const { post, locale } of loaded) {
		if (post.meta.draft) {
			continue;
		}
		articles.set(`${locale}:${post.meta.slug}`, {
			post,
			rendered: markdown.renderMarkdown(post.markdown, {
				externalLinkLabel: i18n.messagesFor(locale).externalLink,
				highlight: highlight.highlightCode,
			}),
		});
	}
	const routes = site.buildRoutes(DEV_ASSETS, { entries, articles });
	const render = routes.get(path);
	return render === undefined ? null : render();
}

const server = createHttpServer((req, res) => {
	const url = (req.url ?? '/').split('?')[0] ?? '/';

	// Public blog content (Markdown + manifest) straight from the repo.
	if (url.startsWith('/content/blog/')) {
		const file = join(process.cwd(), url.slice(1));
		if (existsSync(file)) {
			res.setHeader(
				'content-type',
				url.endsWith('.json') ? 'application/json' : 'text/markdown',
			);
			res.end(readFileSync(file));
			return;
		}
	}

	// Static public assets.
	const publicFile = join(process.cwd(), 'public', url.slice(1));
	if (url !== '/' && !url.endsWith('/') && existsSync(publicFile)) {
		const type = contentTypeFor(url);
		if (type !== undefined) {
			res.setHeader('content-type', type);
		}
		res.end(readFileSync(publicFile));
		return;
	}

	// Only URLs that look like pages go through the SSR pipeline; module
	// and asset requests go straight to Vite.
	if (!url.endsWith('/') && !url.endsWith('.html')) {
		vite.middlewares(req, res, () => {
			res.statusCode = 404;
			res.end('Not found');
		});
		return;
	}

	const path = url;
	renderPath(path)
		.then(async (html) => {
			if (html !== null) {
				const transformed = await vite.transformIndexHtml(path, html);
				res.setHeader('content-type', 'text/html; charset=utf-8');
				res.end(transformed);
				return;
			}
			// Not a page — let Vite serve module/asset requests.
			vite.middlewares(req, res, () => {
				res.statusCode = 404;
				res.end('Not found');
			});
		})
		.catch((error: unknown) => {
			res.statusCode = 500;
			res.end(String(error));
		});
});

const PORT = Number(process.env.PORT ?? 5173);
server.listen(PORT, () => {
	console.log(`Dev server running at http://localhost:${String(PORT)}/`);
});
