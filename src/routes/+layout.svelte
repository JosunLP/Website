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
			<a href="./impressum" class="imprint">Imprint</a>
			|
			<a href="./datenschutz" class="datasecurity">Datasecurity</a>
			|
			<a href="./disclaimer" class="disclaimer">Disclaimer</a>
			|
			<a href="./kontakt" class="contact">Contact</a>
			|
			<a href="https://profile.josunlp.de/" target="_blank" class="projects">Projects</a>
			|
			<a href="https://forsaken-ashbirds.net/" target="_blank" class="forsaken">Forsaken Ashbirds</a>
		</div>
		<p>©{year} Jonas Pfalzgraf</p>
	</footer>
</div>

<style lang="sass">


</style>
