<script>
	export let size = "normal";

	$: fontSize =
		size === "small"
			? "var(--font-size-lg)"
			: size === "large"
				? "var(--font-size-xxl)"
				: "var(--font-size-xl)";
	$: margin =
		size === "small"
			? "var(--spacing-sm)"
			: size === "large"
				? "var(--spacing-md)"
				: "var(--spacing-md)";
</script>

<div class="logo-container">
	<h1
		class="logo-title"
		style="font-size: {fontSize}; margin-bottom: {margin};"
	>
		To eBook Converter
	</h1>
</div>

<style>
	.logo-container {
		flex-shrink: 0;
	}

	.logo-title {
		font-weight: var(--font-weight-bold);
		color: var(--fg-heading);
		line-height: var(--line-height-tight);
		letter-spacing: var(--letter-spacing-wide);
		margin: 0;
	}
</style>
