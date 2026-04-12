<script>
	import { page } from "$app/stores";
	import { LogoMain } from "@ebfElements";
	import { GlobalTranslater } from "$lib/store/translater";
</script>

<svelte:head>
	<title>{$page.status === 404 ? GlobalTranslater.t("error_404_title") : GlobalTranslater.t("error_500_title")} — ToEBookFormat</title>
	<meta name="description" content={$page.status === 404 ? GlobalTranslater.t("error_404_desc") : GlobalTranslater.t("error_500_desc")} />
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<LogoMain size="small" />
		<h1 class="error-code">{$page.status || 500}</h1>
		<h2 class="error-title">
			{#if $page.status === 404}
				{GlobalTranslater.t("error_404_title")}
			{:else}
				{GlobalTranslater.t("error_500_title")}
			{/if}
		</h2>
		<p class="error-description">
			{#if $page.status === 404}
				{GlobalTranslater.t("error_404_desc")}
			{:else}
				{GlobalTranslater.t("error_500_desc")}
			{/if}
		</p>
		<a href="/" class="error-btn">
			← {GlobalTranslater.t("error_backHome")}
		</a>
	</div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		padding: var(--spacing-xl);
	}

	.error-content {
		text-align: center;
		max-width: 500px;
	}

	.error-code {
		font-size: 96px;
		font-weight: var(--font-weight-bold);
		color: var(--accent);
		margin: var(--spacing-md) 0;
		line-height: 1;
	}

	.error-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--fg-heading);
		margin: 0 0 var(--spacing-md) 0;
	}

	.error-description {
		font-size: var(--font-size-base);
		color: var(--fg-muted);
		margin: 0 0 var(--spacing-xl) 0;
		line-height: var(--line-height-base);
	}

	.error-btn {
		display: inline-block;
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--accent);
		color: #fff;
		text-decoration: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-bold);
		transition: all 0.2s ease;
	}

	.error-btn:hover {
		background: var(--accent-hover);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}
</style>
