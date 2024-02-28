<section class="text-column greeting">
	<h1>Moin</h1>

	<div>
		<p>
			Welcome to my space, where I showcase my work and projects. If you have any inquiries about me
			or the projects mentioned, feel free to reach out using the contact form. I'm also available
			on various social media platforms.
		</p>
	</div>

</section>

<style lang="sass">
	.text-column
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		flex: 0.6

	h1
		width: 100%

	.greeting
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		width: 100%
		height: 60vh
		padding: 10rem 0 calc(100% * 495 / 2048) 0
		overflow: hidden
		animation: wave 4s infinite linear

		@keyframes wave
			0%
				transform: translate(0, 0)
			50%
				transform: translate(0, 1%)
			100%
				transform: translate(0, 0)
</style>
