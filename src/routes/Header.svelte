<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import lintree from '$lib/images/linktree-seeklogo.svg';
	import github from '$lib/images/github.svg';
	import type { Page } from '@sveltejs/kit';
	import PageNavigation from '../classes/pageNavigation';
	import { onMount } from 'svelte';
	import { DeviceType } from '../enums/deviceType.enum';

	let scrollToSection = (
		_sectionId: string,
		_$page: Page<Record<string, string>, string | null>,
		_callback?: () => void
	) => {};
	let navigateToSection = (_sectionId: string, _callback?: () => void) => {};
	let deviceType: DeviceType = DeviceType.UNKNOWN;
	let closeMenu = () => {
		const nav = document.querySelector('nav ul');
		nav?.classList.remove('open');
	};

	if (browser) {
		scrollToSection = PageNavigation.scrollToSection;
		navigateToSection = PageNavigation.navigateToSection;
	}

	onMount(() => {
		const currentURL = new URL(window.location.href);
		const hash = currentURL.hash;
		console.info(
			'%c If you read this and have a job for me, feel free to contact me at mailto://info@josunlp.de',
			'background: #222; color: #bada55; font-size: 1.5em; padding: 0.5em;'
		);
		console.info(
			'%c For Technical difficulties with the website or one of my projects, please contact me at mailto://support@josunlp.de',
			'background: #222; color: #bada55; font-size: 1.5em; padding: 0.5em;'
		);
		if (hash) {
			scrollToSection(hash.slice(1), $page);
		}

		deviceType = PageNavigation.getDeviceType();

		PageNavigation.trackScrollSectionPosition($page);
	});
</script>

<header>
	<div class="corner">
		<a href="https://linktr.ee/josunlp" target="_blank">
			<img src={lintree} alt="LinkTree" />
		</a>
	</div>

	<nav>
		{#if deviceType === DeviceType.MOBILE}
			<button
				class="openButton"
				on:click={() => {
					const nav = document.querySelector('nav ul');
					nav?.classList.toggle('open');
				}}
			>
				<svg
					style="margin-right: 0.5em"
					class="open"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M3 12h18M3 6h18M3 18h18"></path>
				</svg>
				Menu
			</button>
		{/if}

		<ul>
			<li
				aria-current={$page.url.pathname === '/' &&
				($page.state === '/' || $page.state === '/#home')
					? 'page'
					: undefined}
			>
				<button
					class="menuSelectButton"
					on:click={() =>
						scrollToSection('home', $page, () => {
							closeMenu();
						})}>Home</button
				>
			</li>
			<li
				aria-current={$page.url.pathname === '/' && $page.state === '/#about' ? 'page' : undefined}
			>
				<button
					class="menuSelectButton"
					on:click={() =>
						scrollToSection('about', $page, () => {
							closeMenu();
						})}>About</button
				>
			</li>
			<li
				aria-current={$page.url.pathname === '/' && $page.state === '/#contact'
					? 'page'
					: undefined}
			>
				<button
					class="menuSelectButton"
					on:click={() =>
						scrollToSection('contact', $page, () => {
							closeMenu();
						})}>Contact</button
				>
			</li>
			<li aria-current={$page.url.pathname === '/imprint' ? 'page' : undefined}>
				<button
					class="menuSelectButton"
					on:click={() =>
						navigateToSection('imprint', () => {
							closeMenu();
						})}>Imprint</button
				>
			</li>
		</ul>
	</nav>

	<div class="corner">
		<a href="https://github.com/josunlp" target="_blank">
			<img src={github} alt="GitHub" class="github" />
		</a>
	</div>
</header>

<style lang="sass">

@use '../sass/mixins/_mediaQ' as *

header
	display: flex
	justify-content: space-between
	position: sticky
	top: 0
	z-index: 100
	background: var(--background)

.corner
	width: 3em
	height: 3em
	z-index: 100

	a
		display: flex
		align-items: center
		justify-content: center
		width: 100%
		height: 100%

	img
		width: 2em
		height: 2em
		object-fit: contain

svg
	width: 2em
	height: 3em
	display: block

path
	fill: var(--background)

nav
	display: flex
	justify-content: center
	--background: rgba(238, 92, 92, 0.7)

	@include respond-to(desktop)
		.openButton
			display: none

	@include respond-to(tablet)
		.openButton
			display: none

	@include respond-to(smartphone)
		display: block
		position: absolute
		width: 100%

		.openButton
			left: 0
			right: 0
			display: flex
			align-items: center
			justify-content: center
			height: 3em
			margin: 0
			padding: 0
			background: transparent
			border: none
			color: var(--color-text)
			font-weight: 700
			font-size: 1rem
			padding: 0.7em
			padding-top: 0.8em
			margin-left: 37vw

		.open
			display: block
			opacity: 1
			pointer-events: all
			transition: opacity 0.2s linear


	ul
		@include respond-to(tablet)
			position: relative
			padding: 0
			margin: 0
			height: 3em
			display: flex
			justify-content: center
			align-items: center
			list-style: none
			background: var(--background)
			background-size: contain

		@include respond-to(desktop)
			position: relative
			padding: 0
			margin: 0
			height: 3em
			display: flex
			justify-content: center
			align-items: center
			list-style: none
			background: var(--background)
			background-size: contain

		@include respond-to(smartphone)
			position: absolute
			display: none
			text-decoration: none
			overflow: hidden
			top: 2em
			left: 0
			right: 0
			padding: 0

		li
			list-style-type: none
			text-align: center
			@include respond-to(desktop)
				position: relative
				height: 100%
				width: 100%
				margin: 0 1em
			@include respond-to(tablet)
				position: relative
				height: 100%
				width: 100%
			@include respond-to(smartphone)
				position: relative
				display: block
				height: 3em
				width: 100%
				margin: 0
				border-top: 1px solid var(--color-text)
				background: var(--background)
				transition: background 0.2s linear

				button
					width: 100%
					text-align: center

		li[aria-current='page']::before
			--size: 6px
			content: ''
			width: 0
			height: 0
			position: absolute
			top: 0
			left: calc(50% - var(--size))
			border: var(--size) solid transparent
			border-top: var(--size) solid var(--color-theme-1)

	.menuSelectButton
		display: flex
		height: 100%
		align-items: center
		padding: 0 0.4rem
		color: var(--color-text)
		font-weight: 700
		font-size: 0.8rem
		text-transform: uppercase
		letter-spacing: 0.1em
		text-decoration: none
		transition: color 0.2s linear
		background-color: transparent
		background-repeat: no-repeat
		border: none
		cursor: pointer
		overflow: hidden
		outline: none
		&:hover
			color: var(--color-theme-1)

.github
	width: 2em
	height: 2em
	object-fit: contain
	filter: invert(1)
</style>
