/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE_NAME = `cache-${version}`;
const ASSETS = [...build, ...files];

// Install event
sw.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE_NAME);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
	sw.skipWaiting();
});

// Activate event
sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		const cacheNames = await caches.keys();
		const oldCaches = cacheNames.filter((name) => name !== CACHE_NAME);
		await Promise.all(oldCaches.map((name) => caches.delete(name)));
	}

	event.waitUntil(deleteOldCaches());
	sw.clients.claim();
});

// Fetch event
sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function handleFetch(): Promise<Response> {
		const cache = await caches.open(CACHE_NAME);
		const cached = await cache.match(event.request);

		// Return cached version if available
		if (cached) {
			// Try to update cache in background for next time
			fetch(event.request)
				.then((response) => {
					if (response.ok) {
						cache.put(event.request, response.clone());
					}
				})
				.catch(() => {
					// Fail silently - we have cached version
				});

			return cached;
		}

		// Try to fetch from network
		try {
			const response = await fetch(event.request);

			// Cache successful responses
			if (response.ok) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (error) {
			// Network failed, try to return a fallback
			if (event.request.destination === 'document') {
				const fallback = await cache.match('/offline.html');
				if (fallback) return fallback;
			}

			throw error;
		}
	}

	event.respondWith(handleFetch());
});

// Push event for future notifications
sw.addEventListener('push', (event) => {
	const options = {
		body: event.data?.text() || 'New update available!',
		icon: '/android-chrome-192x192.png',
		badge: '/android-chrome-192x192.png',
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1
		},
		actions: [
			{
				action: 'explore',
				title: 'View',
				icon: '/android-chrome-192x192.png'
			},
			{
				action: 'close',
				title: 'Close',
				icon: '/android-chrome-192x192.png'
			}
		]
	};

	event.waitUntil(sw.registration.showNotification('JosunLP.de', options));
});

// Background sync for future offline functionality
sw.addEventListener('sync', (event) => {
	const syncEvent = event as unknown as {
		tag: string;
		waitUntil: (promise: Promise<unknown>) => void;
	};
	if (syncEvent.tag === 'background-sync') {
		syncEvent.waitUntil(backgroundSync());
	}
});

async function backgroundSync() {
	// Implement background sync logic here
	console.log('Background sync triggered');
}
