<script>
	import { GlobalStyleHandler, DefaultTheme } from "@ebfStyle";
	import "@ebfStyle/css/style.css";
	import "@ebfStyle/css/theme.css";

	import { onMount } from "svelte";

	onMount(() => {
		const savedTheme = GlobalStyleHandler.getCurrentTheme() || DefaultTheme;
		GlobalStyleHandler.setTheme(savedTheme);
	});
</script>

<slot />

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content="Convert PDF files to any ebook format - EPUB, FB2, and more. Fast, private, and free." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</svelte:head>

<style>
	:global(html[class^="theme-"]) {
		transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(html) {
		overflow-y: auto;
		height: auto;
	}
</style>
