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

				// console.log('Layout initialized successfully');
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
				<a href="./datasecurity" class="datasecurity">Data Security</a>
				<a href="./#contact" class="contact">Contact</a>
				<a
					href="https://profile.josunlp.de/"
					target="_blank"
					rel="noopener noreferrer"
					class="projects"
				>
					Projects
					<span class="sr-only">(opens in new tab)</span>
				</a>
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
	padding: 3rem 1rem 2rem
	text-align: center
	background: linear-gradient(135deg, rgba(156, 39, 39, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)
	border-top: 2px solid rgba(156, 39, 39, 0.3)
	backdrop-filter: blur(10px)
	position: relative

	&::before
		content: ''
		position: absolute
		top: 0
		left: 0
		right: 0
		height: 1px
		background: linear-gradient(90deg, transparent 0%, rgba(156, 39, 39, 0.6) 50%, transparent 100%)

	@include respond-to(smartphone)
		padding: 2rem 1rem 1.5rem

	p
		+noTouch()
		margin: 1.5rem 0 0
		color: rgba(255, 255, 255, 0.7)
		font-size: 0.85rem
		font-weight: 300
		letter-spacing: 0.5px

	.footerLinks
		display: flex
		flex-wrap: wrap
		justify-content: center
		align-items: center
		gap: 0.5rem
		margin-bottom: 0

		@include respond-to(smartphone)
			flex-direction: column
			gap: 0.75rem

		a
			position: relative
			text-decoration: none
			padding: 0.5rem 0.75rem
			transition: all 0.3s ease
			font-weight: 500
			font-size: 0.9rem
			color: rgba(255, 255, 255, 0.85)
			letter-spacing: 0.3px
			border-radius: 4px
			@include touch-target()
			@include touch-feedback()
			@include focus-visible()

			&:hover
				color: #ffffff
				text-decoration: underline
				text-decoration-color: rgba(156, 39, 39, 0.8)
				text-underline-offset: 4px

			&:active
				color: rgba(156, 39, 39, 1)

			&[rel*="noopener"]
				&::after
					content: " ↗"
					font-size: 0.75em
					opacity: 0.8
					margin-left: 0.3em
					color: rgba(156, 39, 39, 0.8)

.sr-only
	@include screen-reader-only()

// Back to top button
.back-to-top
	position: fixed
	bottom: 2rem
	right: 2rem
	width: 52px
	height: 52px
	background: linear-gradient(135deg, rgba(156, 39, 39, 0.9) 0%, rgba(156, 39, 39, 0.7) 100%)
	color: #ffffff
	border: 2px solid rgba(156, 39, 39, 0.5)
	border-radius: 50%
	cursor: pointer
	z-index: 1000
	display: flex
	align-items: center
	justify-content: center
	font-size: 1.3rem
	font-weight: bold
	box-shadow: 0 6px 20px rgba(156, 39, 39, 0.4)
	backdrop-filter: blur(10px)
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
	@include touch-feedback()
	@include focus-visible()

	@include respond-to(smartphone)
		bottom: 1.5rem
		right: 1.5rem
		width: 48px
		height: 48px

	&.hidden
		opacity: 0
		pointer-events: none
		transform: translateY(15px) scale(0.9)

	&:hover
		background: linear-gradient(135deg, rgba(156, 39, 39, 1) 0%, rgba(156, 39, 39, 0.9) 100%)
		border-color: rgba(156, 39, 39, 0.8)
		transform: translateY(-3px) scale(1.05)
		box-shadow: 0 8px 25px rgba(156, 39, 39, 0.6)
</style>
