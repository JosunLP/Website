<script lang="ts">
	import { onMount } from 'svelte';
	import { ErrorHandler } from '../services/errorHandler';

	export let src: string;
	export let alt: string;
	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let loading: 'lazy' | 'eager' = 'lazy';
	export let sizes: string = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px';
	export let quality: number = 85;
	export let priority: boolean = false;
	export let className: string = '';
	export let placeholder: string = '';

	let imgElement: HTMLImageElement;
	let loaded = false;
	let error = false;
	let observer: IntersectionObserver;

	// Generate optimized image URLs for different formats and sizes
	$: webpSrc = generateOptimizedUrl(src, 'webp', quality);
	$: avifSrc = generateOptimizedUrl(src, 'avif', quality);
	$: fallbackSrc = generateOptimizedUrl(src, 'original', quality);

	// Generate srcset for responsive images
	$: srcSet = generateSrcSet(src, quality);
	$: webpSrcSet = generateSrcSet(src, quality, 'webp');
	$: avifSrcSet = generateSrcSet(src, quality, 'avif');

	function generateOptimizedUrl(
		url: string,
		format: 'webp' | 'avif' | 'original' = 'original',
		q: number = 85
	): string {
		if (format === 'original') return url;

		// In a real implementation, this would call an image optimization service
		// For now, return the original URL
		return url;
	}

	function generateSrcSet(
		url: string,
		q: number = 85,
		format: 'webp' | 'avif' | 'original' = 'original'
	): string {
		const widths = [320, 640, 768, 1024, 1280, 1536];

		return widths.map((w) => `${generateOptimizedUrl(url, format, q)}?w=${w} ${w}w`).join(', ');
	}

	function handleLoad() {
		loaded = true;
		error = false;
	}

	function handleError(e: Event) {
		error = true;
		loaded = false;
		ErrorHandler.handleComponentError(new Error(`Failed to load image: ${src}`), 'OptimizedImage');
	}

	onMount(() => {
		// Implement intersection observer for lazy loading
		if (loading === 'lazy' && !priority) {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							// Start loading the image
							if (imgElement) {
								imgElement.src = imgElement.dataset.src || '';
							}
							observer.unobserve(entry.target);
						}
					});
				},
				{
					rootMargin: '50px 0px',
					threshold: 0.01
				}
			);

			if (imgElement) {
				observer.observe(imgElement);
			}
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});
</script>

<div class="image-container {className}" class:loaded class:error>
	{#if placeholder && !loaded && !error}
		<div class="placeholder" style="background-image: url({placeholder})">
			<div class="placeholder-shimmer"></div>
		</div>
	{/if}

	<picture>
		<!-- AVIF format for modern browsers -->
		{#if avifSrcSet}
			<source srcset={avifSrcSet} {sizes} type="image/avif" />
		{/if}

		<!-- WebP format for most browsers -->
		{#if webpSrcSet}
			<source srcset={webpSrcSet} {sizes} type="image/webp" />
		{/if}

		<!-- Fallback format -->
		<img
			bind:this={imgElement}
			src={priority || loading === 'eager' ? fallbackSrc : ''}
			data-src={!priority && loading === 'lazy' ? fallbackSrc : undefined}
			srcset={priority || loading === 'eager' ? srcSet : ''}
			data-srcset={!priority && loading === 'lazy' ? srcSet : undefined}
			{alt}
			{width}
			{height}
			{sizes}
			loading={priority ? 'eager' : loading}
			decoding="async"
			on:load={handleLoad}
			on:error={handleError}
			class="optimized-image"
			class:fade-in={loaded}
		/>
	</picture>

	{#if error}
		<div class="error-placeholder">
			<span>⚠️</span>
			<p>Image failed to load</p>
		</div>
	{/if}
</div>

<style>
	.optimized-image {
		max-width: 100%;
		height: auto;
		transition: opacity 0.3s ease-in-out;
		opacity: 0;
		object-fit: cover;
	}

	.optimized-image.fade-in {
		opacity: 1;
	}

	/* Responsive image sizing */
	.image-container {
		position: relative;
		overflow: hidden;
		max-width: 800px;
		margin: 0 auto;
	}

	.image-container.loaded .placeholder {
		opacity: 0;
	}

	.image-container.error .optimized-image {
		display: none;
	}

	.placeholder {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-size: cover;
		background-position: center;
		filter: blur(10px);
		transform: scale(1.1);
		transition: opacity 0.3s ease-in-out;
	}

	.placeholder::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.1);
	}

	.placeholder-shimmer {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		animation: shimmer 2s infinite;
	}

	.error-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #f5f5f5;
		color: #666;
		text-align: center;
		min-height: 200px;
	}

	.error-placeholder span {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.error-placeholder p {
		margin: 0;
		font-size: 0.9rem;
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	/* Touch optimizations */
	@media (hover: none) and (pointer: coarse) {
		.optimized-image:hover {
			transform: none;
		}
	}
</style>
