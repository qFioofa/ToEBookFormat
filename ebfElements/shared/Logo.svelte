<script>
	export let size = "normal";

	$: fontSize =
		size === "small"
			? "1.1rem"
			: size === "large"
				? "1.4rem"
				: "1.2rem";
</script>

<div class="logo-container">
	<h1 class="logo-title" style="font-size: {fontSize};">
		📚 To eBook Converter
	</h1>
</div>

<style>
	.logo-container {
		flex-shrink: 0;
	}

	.logo-title {
		font-weight: 700;
		color: var(--fg-heading);
		line-height: 1.2;
		letter-spacing: -0.01em;
		margin: 0;
		white-space: nowrap;
	}
</style>
