import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Vite builds the client-side assets (interactive islands + styles) with
 * hashed file names and a manifest. Static HTML pages are generated
 * afterwards by `scripts/prerender.ts`, which reads the manifest to
 * reference the hashed assets.
 */
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	plugins: [tailwindcss()],
	publicDir: 'public',
	build: {
		outDir: 'dist',
		manifest: true,
		rolldownOptions: {
			input: {
				bootstrap: 'src/app/bootstrap.ts',
				article: 'src/app/article.ts',
				'blog-index': 'src/app/blog-index.ts',
				'article-tools': 'src/app/article-tools.ts',
				'locale-redirect': 'src/app/locale-redirect.ts',
				styles: 'src/styles/main.css',
			},
			output: {
				/**
				 * Third-party code gets explicit chunk boundaries.
				 *
				 * Left to itself, the bundler grouped shared framework modules into
				 * the same chunk as highlight.js — so the blog index, which
				 * only wanted a signal and an announcer, statically imported
				 * 59 kB of syntax highlighting it never runs. Pinning each
				 * dependency to its own chunk makes that class of accident
				 * impossible: a heavy library can only ever be pulled in by
				 * something that actually imports it.
				 *
				 * bQuery is split along its own entry points rather than
				 * bundled as one vendor chunk, so a page that needs
				 * `announceToScreenReader` does not also download the
				 * component runtime and the sanitizer.
				 */
				codeSplitting: {
					groups: [
						{
							name: 'vendor-highlight',
							test: /node_modules[\\/]highlight\.js/,
						},
						{ name: 'vendor-marked', test: /node_modules[\\/]marked/ },
					],
				},
			},
		},
	},
	test: {
		environment: 'happy-dom',
		include: ['tests/**/*.test.ts'],
	},
});
