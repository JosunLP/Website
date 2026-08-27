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
		rollupOptions: {
			input: {
				bootstrap: 'src/app/bootstrap.ts',
				article: 'src/app/article.ts',
				'blog-index': 'src/app/blog-index.ts',
				'article-tools': 'src/app/article-tools.ts',
				'locale-redirect': 'src/app/locale-redirect.ts',
				styles: 'src/styles/main.css',
			},
		},
	},
	test: {
		environment: 'happy-dom',
		include: ['tests/**/*.test.ts'],
	},
});
