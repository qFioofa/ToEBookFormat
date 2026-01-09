<script>
	import { GlobalTranslater } from "$lib/store/translater";

	import { onMount } from "svelte";

	onMount(() => {
		console.log("Hello");
	});
</script>

<p>Welcome to converter!</p>

<style>
	p {
		color: var(--accent);
	}
</style>
