<section class="text-column" id="about">
	<div>
		<h1>About Me</h1>
		<p>
			I'm a dedicated software developer proficient in C#.NET, NodeJS, Vue, Svelte, Angular,
			TypeScript, SASS, and PHP. My expertise spans web applications, desktop applications, and
			mobile applications, with a primary focus on web development in recent years.
		</p>
		<p>
			Outside of coding, I immerse myself in the gaming world. Join me on our Discord server at
			<a href="https://discord.com/invite/sdrzgp8SAq">discord.com/invite/sdrzgp8SAq</a> or catch my
			streams on Twitch at <a href="https://twitch.tv/josunlp">twitch.tv/josunlp</a>.
		</p>
		<p>
			All my social media links are available in the left upper corner of the page, there you can
			find my LinkTree with all the links.
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

	#about
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
		width: 100%
		height: 60vh
		padding: 5rem 0 calc(100% * 495 / 2048) 0
		overflow: hidden

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
