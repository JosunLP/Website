<script lang="ts">
	import AboutMe from './../components/AboutMe.svelte';
	import Greeting from './../components/Greeting.svelte';
	import logo3d from '../lib/images/Logo-Jonas_3d.svg';
	import Contact from '../components/Contact.svelte';
	import '../sass/mixins/_notouch.sass';
	import '../sass/mixins/_shadow.sass';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Page } from '@sveltejs/kit';
	import PageNavigation from '../classes/pageNavigation';
	import { page } from '$app/stores';

	let scrollToSection = (sectionId: string, $page: Page<Record<string, string>, string | null>) => {};

	if (browser) {
		scrollToSection = PageNavigation.scrollToSection;
	}

	onMount(() => {
		const home = document.getElementById('home') as HTMLTableSectionElement;
		home.classList.add('home');
		home.scrollIntoView({ behavior: 'smooth' });
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section id="home">
	<h1>
		<span class="welcome">
			<img src={logo3d} alt="Logo" />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<svg on:click={() => scrollToSection('greeting', $page)}
					fill="#000000"
					height="200px"
					width="200px"
					version="1.1"
					id="Capa_1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					viewBox="0 0 490 490"
					xml:space="preserve"
					data-darkreader-inline-fill=""
					style="--darkreader-inline-fill: #0d0d0d;"
					><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
						id="SVGRepo_tracerCarrier"
						stroke-linecap="round"
						stroke-linejoin="round"
					></g><g id="SVGRepo_iconCarrier">
						<path
							d="M320.953,78.043L245,159.24l-75.953-81.197l-34.582,35.377L91.341,67.315L0,160.754l245,261.932l245-261.932l-91.341-93.439 l-43.124,46.105L320.953,78.043z M168.568,122.455L245,204.162l76.432-81.707l13.11,13.41L245,231.597l-89.542-95.732 L168.568,122.455z M399.138,111.727l48.398,49.506L245,377.764L42.464,161.233l48.398-49.506l32.458,34.701L245,276.533 l121.681-130.106L399.138,111.727z"
						></path>
					</g></svg
				>
		</span>
	</h1>
</section>

<Greeting />
<AboutMe />
<Contact />

<style lang="sass">

	@import '../sass/mixins/_flickering.sass'

	section
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		flex: 0.6

	h1
		width: 100%

	.welcome
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		width: 100%
		height: 5vh
		padding: 50vh 0 calc(100% * 495 / 2048) 0
		overflow: hidden
		animation: wave 4s infinite linear
		@keyframes wave
			0%
				transform: translate(0, 0)
			50%
				transform: translate(0, 1%)
			100%
				transform: translate(0, 0)

		svg
			width: 5rem
			height: 5rem
			fill: var(--background)
			z-index: -1
			position: absolute
			top: 35rem
			animation: wave 4s infinite linear
			cursor: pointer
			@keyframes wave
				0%
					transform: translate(0, 0)
				50%
					transform: translate(0, 1%)
				100%
					transform: translate(0, 0)

		img
			position: absolute
			top: 7rem
			width: 40%
			height: auto
			animation: wave 4s infinite linear
			@keyframes wave
				0%
					transform: translate(0, 0)
				50%
					transform: translate(0, 1%)
				100%
					transform: translate(0, 0)

</style>
