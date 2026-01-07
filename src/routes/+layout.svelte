<script>
	import { GlobalStyleHandler, DefaultTheme } from "@ebfStyle";
	import "@ebfStyle/css/style.css";
	import "@ebfStyle/css/theme.css";

	import { onMount } from "svelte";

	onMount(() => {
		GlobalStyleHandler.setTheme(DefaultTheme);
	});
</script>

<slot />

<svelte:head></svelte:head>
