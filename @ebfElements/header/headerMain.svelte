<script>
	import { onMount } from "svelte";

	let isVisible = false;

	onMount(() => {
		isVisible = true;
	});
</script>

<header class="header-main">
	<div class="header-content">
		<h1 class="main-title">To eBook Converter</h1>
		<p class="subtitle">
			Как пользоваться: просто перетащите файл в нужном формате (PDF,
			EPUB, FB2 и др.) в область загрузки, выберите желаемый формат вывода
			и начните конвертацию.
		</p>
	</div>
</header>

<style>
	.header-main {
		width: 100%;
		padding: var(--spacing-xl) var(--spacing-md);
		text-align: center;
		background: var(--bg-muted);
		border-bottom: 1px solid var(--border);
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
		opacity: 0;
		animation: fadeInUp 0.6s ease-out forwards;
	}

	.main-title {
		font-size: var(--font-size-xxl);
		font-weight: var(--font-weight-bold);
		color: var(--fg-heading);
		margin: 0 0 var(--spacing-md);
		line-height: var(--line-height-tight);
		letter-spacing: var(--letter-spacing-wide);
	}

	.subtitle {
		font-size: var(--font-size-lg);
		color: var(--fg-muted);
		margin: 0;
		line-height: var(--line-height-base);
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.header-main {
			padding: var(--spacing-lg) var(--spacing-sm);
		}

		.main-title {
			font-size: var(--font-size-xl);
		}

		.subtitle {
			font-size: var(--font-size-base, 16px);
		}
	}

	@media (max-width: 480px) {
		.header-main {
			padding: var(--spacing-md) var(--spacing-xs);
		}

		.main-title {
			font-size: var(--font-size-lg);
		}

		.subtitle {
			font-size: var(--font-size-sm);
		}
	}
</style>
