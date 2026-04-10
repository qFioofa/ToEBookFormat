<script>
	import { createEventDispatcher } from "svelte";
	import { ThemeToggle, LanguageSelector } from "@ebfElements";

	export let GlobalTranslater;
	export let isDark;
	export let locale;
	export let showLangMenu = false;

	const dispatch = createEventDispatcher();

	function handleToggleTheme() {
		dispatch("toggleTheme");
	}

	function handleToggleLangMenu() {
		dispatch("toggleLangMenu");
	}

	function handleSwitchLang(lang) {
		dispatch("switchLang", lang);
	}
</script>

<div class="header-controls">
	<ThemeToggle {isDark} on:toggle={handleToggleTheme} />
	<LanguageSelector
		{GlobalTranslater}
		{locale}
		bind:showLangMenu
		on:toggleMenu={handleToggleLangMenu}
		on:switchLang={(e) => handleSwitchLang(e.detail)}
	/>
</div>

<style>
	.header-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	@media (max-width: 480px) {
		.header-controls {
			gap: 6px;
		}
	}
</style>
