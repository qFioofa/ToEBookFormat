<script>
	import { page } from "$app/stores";
	import { LogoMain } from "@ebfElements";
</script>

<svelte:head>
	<title>Ошибка — ToEBookFormat</title>
	<meta name="description" content="Страница не найдена или произошла ошибка" />
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<LogoMain size="small" />
		<h1 class="error-code">{$page.status || 500}</h1>
		<h2 class="error-title">
			{#if $page.status === 404}
				Страница не найдена
			{:else}
				Произошла ошибка
			{/if}
		</h2>
		<p class="error-description">
			{#if $page.status === 404}
				К сожалению, страница, которую вы ищете, не существует.
			{:else}
				Что-то пошло не так на сервере. Попробуйте обновить страницу или вернитесь на главную.
			{/if}
		</p>
		<a href="/" class="error-btn">
			← Вернуться на главную
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
