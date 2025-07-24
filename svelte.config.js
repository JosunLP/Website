import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess({
		scss: {
			// includePaths: ['./src/sass'],
			// OR
			importer: [
				// Import globally available mixins, functions, etc.
				{
					find: /^mixins$/,
					replacement: resolve(__dirname, 'src/sass/mixins/_index.sass')
				}
			]
		}
	}),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore font files and other static assets that might not exist during prerendering
				if (
					path.includes('/fonts/') ||
					path.includes('.woff') ||
					path.includes('.woff2') ||
					path.includes('.ttf')
				) {
					return;
				}
				throw new Error(message);
			},
			handleMissingId: ({ path, id, referrers }) => {
				// Ignore missing IDs that are related to anchor links, especially for fonts directory
				if (path.includes('/fonts/') || id === 'contact') {
					return;
				}
				throw new Error(`Missing element with id="${id}" on page "${path}"`);
			}
		}
	}
};

export default config;
