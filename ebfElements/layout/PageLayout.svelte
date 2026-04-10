<script>
	import { HeaderMain, FooterMain } from "@ebfElements";

	export let howToUseSection = null;
	export let aboutSection = null;
</script>

<HeaderMain {howToUseSection} {aboutSection}>
	<svelte:fragment slot="Logo">
		<slot name="Logo" />
	</svelte:fragment>
	<svelte:fragment slot="Subtitle">
		<slot name="Subtitle" />
	</svelte:fragment>
	<svelte:fragment slot="Options">
		<slot name="Options" />
	</svelte:fragment>
</HeaderMain>

<main class="main-content">
	<slot />
</main>

<FooterMain />

<style>
	:global(body) {
		font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
			Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: var(--bg);
		color: var(--fg);
		margin: 0;
		padding: 0;
		min-height: 100vh;
		line-height: 1.6;
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(html) {
		overflow-y: auto;
		height: auto;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
