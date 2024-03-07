<section class="text-column" id="greeting">

	<div>
		<h1>Moin</h1>
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

	#greeting
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		width: 100%
		height: 60vh
		padding: 10rem 0 calc(100% * 495 / 2048) 0
		overflow: hidden

		div
			width: 100%
			max-width: 40rem
			text-align: center
			margin-top: 10vh
			margin-bottom: 5vh
			font-size: 1.5rem
			line-height: 1.5
			color: var(--text)
			font-weight: 300
			letter-spacing: 0.1rem
			opacity: 0.8
			transition: opacity 0.3s ease-in-out

			&:hover
				opacity: 1
				transition: opacity 0.3s ease-in-out
</style>
