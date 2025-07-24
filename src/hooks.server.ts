import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Handle Chrome DevTools specific requests
	if (event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response('{}', {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	const response = await resolve(event);

	// Only add security headers for HTML responses
	if (response.headers.get('content-type')?.includes('text/html')) {
		// Content Security Policy
		response.headers.set(
			'Content-Security-Policy',
			"default-src 'self'; " +
				"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " +
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
				"img-src 'self' data: https: blob:; " +
				"font-src 'self' https://fonts.gstatic.com; " +
				"connect-src 'self' https://www.google-analytics.com; " +
				"frame-ancestors 'none'; " +
				"base-uri 'self'; " +
				"form-action 'self';"
		);

		// Security headers
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set('X-XSS-Protection', '1; mode=block');

		// HTTPS enforcement in production
		if (event.url.protocol === 'https:') {
			response.headers.set(
				'Strict-Transport-Security',
				'max-age=31536000; includeSubDomains; preload'
			);
		}

		// Permissions Policy
		response.headers.set(
			'Permissions-Policy',
			'camera=(), ' + 'microphone=(), ' + 'geolocation=(), ' + 'interest-cohort=()'
		);
	}

	// Performance headers
	if (
		event.url.pathname.startsWith('/images/') ||
		event.url.pathname.startsWith('/fonts/') ||
		event.url.pathname.endsWith('.css') ||
		event.url.pathname.endsWith('.js')
	) {
		// Cache static assets for 1 year
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else if (
		event.url.pathname === '/' ||
		event.url.pathname.startsWith('/imprint') ||
		event.url.pathname.startsWith('/datasecurity')
	) {
		// Cache HTML pages for 1 hour
		response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
	}

	return response;
};
