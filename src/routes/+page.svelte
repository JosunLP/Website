<script lang="ts">
	import AboutMe from './../components/AboutMe.svelte';
	import Greeting from './../components/Greeting.svelte';
	import logo from '../lib/images/Logo-Jonas_1.svg';
	import arrowDown from '../lib/images/arrow-down.svg';
	import Contact from '../components/Contact.svelte';
	import '../sass/mixins/_notouch.sass';
	import '../sass/mixins/_shadow.sass';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Page } from '@sveltejs/kit';
	import PageNavigation from '../classes/pageNavigation';
	import { page } from '$app/stores';

	let scrollToSection = (
		_sectionId: string,
		_$page: Page<Record<string, string>, string | null>
	) => {};

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
	<meta name="description" content="JosunLP.de Home" />
</svelte:head>

<section id="home">
	<h1>
		<span class="welcome">
			<img class="logo" src={logo} alt="Logo" />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<img
				class="arrowDown"
				src={arrowDown}
				alt="Arrow Down"
				on:click={() => scrollToSection('greeting', $page)}
			/>
		</span>
	</h1>
</section>

<Greeting />
<AboutMe />
<Contact />

<style lang="sass">

@use '../sass/mixins/_flickering' as *
@use '../sass/mixins/_mediaQ' as *

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
	margin-top: 10vh
	overflow: hidden
	animation: wave 4s infinite linear
	@keyframes wave
		0%
			transform: translate(0, 0)
		50%
			transform: translate(0, 1%)
		100%
			transform: translate(0, 0)

	.logo
		position: relative
		@include respond-to(desktop)
			margin-top: -30vh
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
		@include respond-to('tablet')
			margin-top: -30vh
			width: 50vw
			height: auto
			animation: wave 4s infinite linear
			@keyframes wave
				0%
					transform: translate(0, 0)
				50%
					transform: translate(0, 1%)
				100%
					transform: translate(0, 0)
		@include respond-to(smartphone)
			margin-top: -50vh
			width: 50vw
			height: auto
			animation: wave 4s infinite linear
			@keyframes wave
				0%
					transform: translate(0, 0)
				50%
					transform: translate(0, 1%)
				100%
					transform: translate(0, 0)

	.arrowDown
		cursor: pointer
		animation: wave 4s infinite linear
		@keyframes wave
			0%
				transform: translate(0, 0)
			50%
				transform: translate(0, 1%)
			100%
				transform: translate(0, 0)
		@include respond-to(desktop)
			bottom: 0
			width: 20%
			height: auto
			top: 30rem
		@include respond-to(tablet)
			bottom: 0
			width: 30vw
			height: auto
			top: 30rem
		@include respond-to(smartphone)
			bottom: 0
			width: 40%
			height: auto
			top: 23rem

</style>
