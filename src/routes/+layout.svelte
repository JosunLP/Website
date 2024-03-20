<script>
	import Header from './Header.svelte';
	import '../sass/index.sass';

	const year = new Date().getFullYear();
</script>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>

	<footer>
		<div class="footerLinks">
			<a href="./imprint" class="imprint">Imprint</a>
			-
			<a href="./datasecurity" class="datasecurity">Datasecurity</a>
			-
			<a href="./#contact" class="contact">Contact</a>
			-
			<a href="https://profile.josunlp.de/" target="_blank" class="projects">Projects</a>
			-
			<a href="https://forsaken-ashbirds.net/" target="_blank" class="forsaken">Forsaken Ashbirds</a
			>
		</div>
		<p>©{year} Jonas Pfalzgraf</p>
	</footer>
</div>

<style lang="sass">
	@import '../sass/mixins/_notouch.sass'
	@import '../sass/mixins/_mediaQ.sass'

	footer
		p
			@include noTouch
		@include respond-to(smartphone)
			.footerLinks
				text-align: center

				a
					margin: 0 0.5rem
					&:last-child
						margin-right: 0
</style>
