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
		sectionId: string,
		$page: Page<Record<string, string>, string | null>
	) => {};
	let navigateToSection = (sectionId: string) => {};
	let deviceType: DeviceType = DeviceType.UNKNOWN;

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
				on:click={() => {
					const nav = document.querySelector('ul');
					nav?.classList.toggle('open');
				}}
			>
				Menu
			</button>

			<ul>
				<li
					aria-current={$page.url.pathname === '/' &&
					($page.state === '/' || $page.state === '/#home')
						? 'page'
						: undefined}
				>
					<button on:click={() => scrollToSection('home', $page)}>Home</button>
				</li>
				<li
					aria-current={$page.url.pathname === '/' && $page.state === '/#about'
						? 'page'
						: undefined}
				>
					<button on:click={() => scrollToSection('about', $page)}>About</button>
				</li>
				<li
					aria-current={$page.url.pathname === '/' && $page.state === '/#contact'
						? 'page'
						: undefined}
				>
					<button on:click={() => scrollToSection('contact', $page)}>Contact</button>
				</li>
				<li aria-current={$page.url.pathname === '/imprint' ? 'page' : undefined}>
					<button on:click={() => navigateToSection('imprint')}>Imprint</button>
				</li>
			</ul>
		{/if}

		{#if deviceType === DeviceType.DESKTOP || deviceType === DeviceType.TABLET}
			<svg viewBox="0 0 2 3" aria-hidden="true">
				<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
			</svg>
			<ul>
				<li
					aria-current={$page.url.pathname === '/' &&
					($page.state === '/' || $page.state === '/#home')
						? 'page'
						: undefined}
				>
					<button on:click={() => scrollToSection('home', $page)}>Home</button>
				</li>
				<li
					aria-current={$page.url.pathname === '/' && $page.state === '/#about'
						? 'page'
						: undefined}
				>
					<button on:click={() => scrollToSection('about', $page)}>About</button>
				</li>
				<li
					aria-current={$page.url.pathname === '/' && $page.state === '/#contact'
						? 'page'
						: undefined}
				>
					<button on:click={() => scrollToSection('contact', $page)}>Contact</button>
				</li>
				<li aria-current={$page.url.pathname === '/imprint' ? 'page' : undefined}>
					<button on:click={() => navigateToSection('imprint')}>Imprint</button>
				</li>
			</ul>
			<svg viewBox="0 0 2 3" aria-hidden="true">
				<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
			</svg>
		{/if}
	</nav>

	<div class="corner">
		<a href="https://github.com/josunlp" target="_blank">
			<img src={github} alt="GitHub" class="github" />
		</a>
	</div>
</header>

<style lang="sass">

	@import '../sass/mixins/_mediaQ'

	header
		display: flex
		justify-content: space-between
		position: sticky
		top: 0
		z-index: 100
		background: var(--background)

	.open
		display: flex
		opacity: 1
		pointer-events: all

	.corner
		width: 3em
		height: 3em

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
				top: 3em
				left: 0
				width: 100%
				height: 100%
				flex-direction: column
				justify-content: flex-start
				align-items: center
				background: var(--background)
				background-size: contain
				opacity: 0
				pointer-events: none
				transition: opacity 0.3s ease-in-out

			li
				@include respond-to(tablet)
					position: relative
					height: 100%
					width: 100%
				@include respond-to(desktop)
					position: relative
					height: 100%
					width: 100%
				@include respond-to(smartphone)
					position: relative
					height: 3em
					width: 100%
					opacity: 0
					pointer-events: none
					transition: opacity 0.3s ease-in-out

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

		button
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
