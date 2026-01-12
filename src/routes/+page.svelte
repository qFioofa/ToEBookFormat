<script>
	import {
		HeaderMain,
		FooterMain,
		LogoMain,
		DropFiles,
		FileInfo,
	} from "@ebfElements";
	import { GlobalTranslater } from "$lib/store/translater";
	import { onMount } from "svelte";

	onMount(() => {});
</script>

<HeaderMain />

<DropFiles InfoFile={FileInfo} />

<FooterMain />

<style>
	:global(body) {
		font-family: var(--font-family-base);
		background-color: var(--bg);
		color: var(--fg);
		margin: 0;
		padding: 0;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		overflow-x: hidden;
		overflow-y: auto;
	}

	:global(html) {
		overflow-y: hidden;
	}

	@media (max-width: 768px) {
		:global(body) {
			overflow-y: auto;
		}
	}
</style>
