<section class="text-column" id="contact">
	<h1>Contact</h1>

	<div>
		<p>
			Feel free to reach out to me using either <a
				href="mailto:info@josunlp.de?subject=Kontaktaufnahme über die Website">info@josunlp.de</a
			>
			for general inquiries or
			<a href="mailto:support@josunlp.de?subject=Kontaktaufnahme über die Website"
				>support@josunlp.de</a
			>
			for technical support and bug reports for my projects.
		</p>
	</div>
</section>

<style lang="sass">
	@use "sass:meta"

	=respond-to($device)
		@if $device == smartphone
			@media only screen and (max-width: 480px)
				@content

		@else if $device == tablet
			@media only screen and (min-width: 481px) and (max-width: 1024px)
				@content

		@else if $device == desktop
			@media only screen and (min-width: 1025px)
				@content

		@else
			@warn "Ungültiges Gerät '$device'. Verwende 'smartphone', 'tablet' oder 'desktop'."

	.text-column
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		flex: 0.6

	h1
		width: 100%

	#contact
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		width: 100%
		height: 60vh
		padding: 10rem 0 calc(100% * 495 / 2048) 0
		overflow: hidden
		+respond-to(smartphone)
			padding-bottom: 15rem

		div
			width: 100%
			max-width: 40rem
			text-align: center
			margin-top: 2rem
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
