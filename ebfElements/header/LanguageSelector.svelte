<script>
	import { createEventDispatcher } from "svelte";

	export let GlobalTranslater;
	export let locale;
	export let showLangMenu = false;

	const dispatch = createEventDispatcher();

	function toggleMenu() {
		showLangMenu = !showLangMenu;
		dispatch("toggleMenu", showLangMenu);
	}

	function switchLang(lang) {
		GlobalTranslater.setLocale(lang);
		dispatch("switchLang", lang);
		showLangMenu = false;
	}
</script>

<div class="lang-selector">
	<button class="lang-btn" on:click={toggleMenu} type="button">
		🌐 {GlobalTranslater.t("lang_current")}
	</button>
	{#if showLangMenu}
		<div class="lang-dropdown">
			<div class="lang-dropdown-header">
				{GlobalTranslater.t("lang_menu_title")}
			</div>
			<button
				class="lang-option"
				class:active={locale === "en"}
				on:click={() => switchLang("en")}
				type="button"
			>
				🇬🇧 {GlobalTranslater.t("lang_en")}
			</button>
			<button
				class="lang-option"
				class:active={locale === "ru"}
				on:click={() => switchLang("ru")}
				type="button"
			>
				🇷🇺 {GlobalTranslater.t("lang_ru")}
			</button>
		</div>
	{/if}
</div>

<style>
	.lang-selector {
		position: relative;
	}

	.lang-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--fg-accent);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.25s ease;
		font-family: inherit;
	}

	.lang-btn:hover {
		background: linear-gradient(
			135deg,
			var(--accent) 0%,
			var(--accent-dark) 100%
		);
		color: #fff;
		border-color: var(--accent);
	}

	.lang-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		min-width: 160px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 10px;
		box-shadow: var(--shadow-xl);
		overflow: hidden;
		z-index: 200;
		animation: dropdownFade 0.2s ease-out;
	}

	@keyframes dropdownFade {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.lang-dropdown-header {
		padding: 8px 14px;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border);
		background: var(--bg-muted);
	}

	.lang-option {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 14px;
		border: none;
		background: none;
		color: var(--fg);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: inherit;
		text-align: left;
	}

	.lang-option:hover {
		background: linear-gradient(
			90deg,
			var(--accent-muted) 0%,
			transparent 100%
		);
	}

	.lang-option.active {
		background: linear-gradient(
			90deg,
			var(--accent-muted) 0%,
			transparent 100%
		);
		color: var(--accent);
		font-weight: 600;
	}
</style>
