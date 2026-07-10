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
