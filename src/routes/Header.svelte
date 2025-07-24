<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import github from '$lib/images/github.svg';
	import lintree from '$lib/images/linktree-seeklogo.svg';
	import type { Page } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import PageNavigation from '../classes/pageNavigation';
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
	align-items: center
	position: sticky
	top: 0
	z-index: 100
	background: linear-gradient(135deg, rgba(156, 39, 39, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)
	backdrop-filter: blur(15px)
	border-bottom: 2px solid rgba(156, 39, 39, 0.2)
	padding: 0.5rem 1rem
	transition: all 0.3s ease

	&::before
		content: ''
		position: absolute
		bottom: 0
		left: 0
		right: 0
		height: 1px
		background: linear-gradient(90deg, transparent 0%, rgba(156, 39, 39, 0.4) 50%, transparent 100%)

.corner
	width: 3.5em
	height: 3.5em
	z-index: 100

	a
		display: flex
		align-items: center
		justify-content: center
		width: 100%
		height: 100%
		border-radius: 50%
		background: rgba(156, 39, 39, 0.1)
		border: 1px solid rgba(156, 39, 39, 0.3)
		transition: all 0.3s ease
		backdrop-filter: blur(5px)

		&:hover
			background: rgba(156, 39, 39, 0.2)
			border-color: rgba(156, 39, 39, 0.5)
			transform: scale(1.05)

	img
		width: 1.8em
		height: 1.8em
		object-fit: contain
		filter: brightness(1.1)

svg
	width: 2em
	height: 3em
	display: block

path
	fill: var(--background)

nav
	display: flex
	justify-content: center
	--background: linear-gradient(135deg, rgba(156, 39, 39, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)

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
			padding: 0.7em
			background: rgba(156, 39, 39, 0.15)
			border: 1px solid rgba(156, 39, 39, 0.3)
			border-radius: 8px
			color: rgba(255, 255, 255, 0.9)
			font-weight: 600
			font-size: 0.9rem
			margin-left: 37vw
			transition: all 0.3s ease
			backdrop-filter: blur(5px)

			&:hover
				background: rgba(156, 39, 39, 0.25)
				border-color: rgba(156, 39, 39, 0.5)
				color: #ffffff

		.open
			display: block
			opacity: 1
			pointer-events: all
			transition: opacity 0.3s ease



	ul
		@include respond-to(tablet)
			position: relative
			padding: 0
			margin: 0
			height: 3.5em
			display: flex
			justify-content: center
			align-items: center
			list-style: none
			background: var(--background)
			backdrop-filter: blur(10px)
			border-radius: 25px
			border: 1px solid rgba(156, 39, 39, 0.3)

		@include respond-to(desktop)
			position: relative
			padding: 0
			margin: 0
			height: 3.5em
			display: flex
			justify-content: center
			align-items: center
			list-style: none
			background: var(--background)
			backdrop-filter: blur(10px)
			border-radius: 25px
			border: 1px solid rgba(156, 39, 39, 0.3)

		@include respond-to(smartphone)
			position: absolute
			display: none
			text-decoration: none
			overflow: hidden
			top: 3em
			left: 10%
			right: 10%
			padding: 0
			background: var(--background)
			backdrop-filter: blur(15px)
			border-radius: 15px
			border: 1px solid rgba(156, 39, 39, 0.4)
			box-shadow: 0 8px 32px rgba(156, 39, 39, 0.3)

		&.open
			@include respond-to(smartphone)
				display: block
				animation: slideDown 0.3s ease-out

	@keyframes slideDown
		from
			opacity: 0
			transform: translateY(-10px)
		to
			opacity: 1
			transform: translateY(0)

	li
		list-style-type: none
		text-align: center
		@include respond-to(desktop)
			position: relative
			height: 100%
			margin: 0 0.5rem

		@include respond-to(tablet)
			position: relative
			height: 100%
			margin: 0 0.5rem

			@include respond-to(smartphone)
			position: relative
			display: block
			height: 3.5em
			width: 100%
			margin: 0
			border-top: 1px solid rgba(156, 39, 39, 0.3)
			transition: background 0.3s ease

			&:first-child
				border-top: none

			&:hover
				background: rgba(156, 39, 39, 0.1)

			button
				width: 100%
				text-align: center

	li[aria-current='page']
		@include respond-to(desktop)
			&::before
				--size: 4px
				content: ''
				width: 0
				height: 0
				position: absolute
				top: -2px
				left: calc(50% - var(--size))
				border: var(--size) solid transparent
				border-top: var(--size) solid rgba(156, 39, 39, 0.8)

		@include respond-to(tablet)
			&::before
				--size: 4px
				content: ''
				width: 0
				height: 0
				position: absolute
				top: -2px
				left: calc(50% - var(--size))
				border: var(--size) solid transparent
				border-top: var(--size) solid rgba(156, 39, 39, 0.8)

		@include respond-to(smartphone)
			background: rgba(156, 39, 39, 0.2)

			&::before
				content: ''
				position: absolute
			left: 0
			top: 0
			bottom: 0
			width: 3px
			background: rgba(156, 39, 39, 0.8)
	.menuSelectButton
		display: flex
		height: 100%
		align-items: center
		justify-content: center
		padding: 0 1.5rem
		color: rgba(255, 255, 255, 0.85)
		font-weight: 600
		font-size: 0.85rem
		text-transform: uppercase
		letter-spacing: 0.5px
		text-decoration: none
		transition: all 0.3s ease
		background-color: transparent
		background-repeat: no-repeat
		border: none
		cursor: pointer
		overflow: hidden
		outline: none
		border-radius: 20px
		position: relative

		@include respond-to(smartphone)
			padding: 1rem 1.5rem
			border-radius: 0

		&::before
			content: ''
			position: absolute
			top: 0
			left: 0
			right: 0
			bottom: 0
			background: rgba(156, 39, 39, 0.2)
			opacity: 0
			transition: opacity 0.3s ease
			border-radius: 20px

		&:hover
			color: #ffffff
			transform: translateY(-1px)

			&::before
				opacity: 1

		&:active
			transform: translateY(0px)

.github
	width: 1.8em
	height: 1.8em
	object-fit: contain
	filter: brightness(1.1)
	transition: filter 0.3s ease

	&:hover
		filter: brightness(1.3) contrast(1.2)
</style>
