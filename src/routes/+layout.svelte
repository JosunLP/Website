<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import PageNavigation from '../classes/pageNavigation';
	import { ErrorHandler } from '../lib/services/errorHandler';
	import { WebVitalsService } from '../lib/services/webVitals';
	import { generatePersonSchema, generateWebsiteSchema } from '../lib/utils/schema';
	import '../sass/index.sass';
	import Header from './Header.svelte';

	const year = new Date().getFullYear();
	let backToTopButton: HTMLButtonElement;

	function scrollToTop() {
		if (browser) {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
	}

	function handleScroll() {
		if (browser && backToTopButton) {
			const scrollY = window.scrollY;
			const shouldShow = scrollY > 300;

			if (shouldShow) {
				backToTopButton.classList.remove('hidden');
			} else {
				backToTopButton.classList.add('hidden');
			}
		}
	}

	onMount(() => {
		if (browser) {
			try {
				// Initialize web vitals tracking
				WebVitalsService.init();

				// Initialize navigation tracking
				PageNavigation.initScrollTracking();

				// Set up back to top button
				window.addEventListener('scroll', handleScroll);
				handleScroll(); // Initial check

				// Add structured data
				const personSchema = generatePersonSchema();
				const websiteSchema = generateWebsiteSchema();

				const scriptElement = document.createElement('script');
				scriptElement.type = 'application/ld+json';
				scriptElement.textContent = JSON.stringify([personSchema, websiteSchema]);
				document.head.appendChild(scriptElement);

				console.log('Layout initialized successfully');
			} catch (error) {
				ErrorHandler.handleComponentError(error as Error, 'Layout');
			}
		}

		// Cleanup function
		return () => {
			if (browser) {
				PageNavigation.cleanup();
				window.removeEventListener('scroll', handleScroll);
			}
		};
	});
</script>

<svelte:head>
	<!-- Preconnect to external domains -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link rel="preconnect" href="https://www.google-analytics.com" />
</svelte:head>

<div class="app">
	<Header />

	<main id="main-content" tabindex="-1">
		<slot />
	</main>

	<footer>
		<nav aria-label="Footer navigation">
			<div class="footerLinks">
				<a href="./imprint" class="imprint">Imprint</a>
				<span aria-hidden="true">-</span>
				<a href="./datasecurity" class="datasecurity">Data Security</a>
				<span aria-hidden="true">-</span>
				<a href="./#contact" class="contact">Contact</a>
				<span aria-hidden="true">-</span>
				<a
					href="https://profile.josunlp.de/"
					target="_blank"
					rel="noopener noreferrer"
					class="projects"
				>
					Projects
					<span class="sr-only">(opens in new tab)</span>
				</a>
				<span aria-hidden="true">-</span>
				<a
					href="https://forsaken-ashbirds.net/"
					target="_blank"
					rel="noopener noreferrer"
					class="forsaken"
				>
					Forsaken Ashbirds
					<span class="sr-only">(opens in new tab)</span>
				</a>
			</div>
		</nav>
		<p>©{year} Jonas Pfalzgraf. All rights reserved.</p>
	</footer>

	<!-- Back to top button -->
	<button
		bind:this={backToTopButton}
		class="back-to-top hidden"
		on:click={scrollToTop}
		aria-label="Scroll to top"
	>
		↑
	</button>
</div>

<style lang="sass">
@use '../sass/mixins/_notouch' as *
@use '../sass/mixins/_mediaQ' as *
@use '../sass/mixins/_touch' as *

.app
	min-height: 100vh
	display: flex
	flex-direction: column

main
	flex: 1

	&:focus
		outline: none

footer
	margin-top: auto
	padding: 2rem 1rem 1rem
	text-align: center
	background: rgba(255, 255, 255, 0.05)
	border-top: 1px solid rgba(255, 255, 255, 0.1)

	@include respond-to(smartphone)
		padding: 1.5rem 1rem 1rem

	p
		+noTouch()
		margin: 0
		color: rgba(255, 255, 255, 0.8)
		font-size: 0.9rem

	.footerLinks
		display: flex
		flex-wrap: wrap
		justify-content: center
		align-items: center
		gap: 0.5rem
		margin-bottom: 1rem

		@include respond-to(smartphone)
			flex-direction: column
			gap: 0.75rem

		span[aria-hidden="true"]
			color: rgba(255, 255, 255, 0.4)
			@include respond-to(smartphone)
				display: none

		a
			text-decoration: none
			padding: 0.5rem 0.75rem
			border-radius: 6px
			transition: all 0.2s ease
			font-weight: 500
			color: var(--color-theme-1)
			border: 1px solid transparent
			@include touch-target()
			@include touch-feedback()
			@include focus-visible()

			&:hover
				background-color: rgba(255, 255, 255, 0.1)
				border-color: rgba(255, 255, 255, 0.2)
				text-decoration: underline

			&:active
				transform: translateY(1px)

			&[rel*="noopener"]
				&::after
					content: " ↗"
					font-size: 0.8em
					opacity: 0.7
					margin-left: 0.2em

.sr-only
	@include screen-reader-only()

// Back to top button
.back-to-top
	position: fixed
	bottom: 2rem
	right: 2rem
	width: 48px
	height: 48px
	background: var(--color-bg-0)
	color: var(--color-theme-1)
	border: 2px solid rgba(255, 255, 255, 0.2)
	border-radius: 50%
	cursor: pointer
	z-index: 1000
	display: flex
	align-items: center
	justify-content: center
	font-size: 1.2rem
	font-weight: bold
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
	transition: all 0.3s ease
	@include touch-feedback()
	@include focus-visible()

	@include respond-to(smartphone)
		bottom: 1rem
		right: 1rem
		width: 44px
		height: 44px

	&.hidden
		opacity: 0
		pointer-events: none
		transform: translateY(10px)

	&:hover
		background: rgba(156, 39, 39, 0.9)
		border-color: rgba(255, 255, 255, 0.4)
		transform: translateY(-2px)
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4)
</style>
