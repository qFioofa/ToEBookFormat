<script>
	import { createEventDispatcher } from "svelte";

	export let isDark;
	const dispatch = createEventDispatcher();

	function toggle() {
		dispatch("toggle");
	}
</script>

<button class="theme-toggle" on:click={toggle} type="button" aria-label="Toggle theme">
	{#if isDark}
		<span class="theme-icon">☀️</span>
	{:else}
		<span class="theme-icon">🌙</span>
	{/if}
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.theme-toggle:hover {
		background: var(--bg-muted);
		border-color: var(--accent);
	}

	.theme-icon {
		font-size: 16px;
	}
</style>
