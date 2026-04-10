<script>
	import { onMount } from "svelte";
	import { GlobalTranslater } from "$lib/store/translater";

	let isVisible = false;

	export let howToUseSection = null;
	export let aboutSection = null;

	$: navLinks = [
		howToUseSection || {
			text: GlobalTranslater.t("nav_howToUse"),
			href: "#how-to-use",
		},
		aboutSection || {
			text: GlobalTranslater.t("nav_about"),
			href: "#about",
		},
	];

	onMount(() => {
		isVisible = true;
	});
</script>

<header class="header-main">
	<div class="header-content">
		<div class="header-top">
			<slot name="Logo" />
			<nav class="nav-links">
				{#each navLinks as link}
					<a href={link.href} class="nav-link">{link.text}</a>
				{/each}
				<slot name="Options" />
			</nav>
		</div>
		<p class="subtitle">
			<slot name="Subtitle" />
		</p>
	</div>
</header>

<style>
	.header-main {
		width: 100%;
		padding: 16px 24px;
		background: var(--bg-card);
		border-bottom: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	.header-content {
		max-width: 960px;
		margin: 0 auto;
		opacity: 0;
		animation: fadeInUp 0.5s ease-out forwards;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 8px;
		width: 100%;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-shrink: 0;
	}

	.nav-link {
		font-size: 0.85rem;
		color: var(--fg-accent);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s ease;
		position: relative;
		padding: 4px 0;
	}

	.nav-link::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 0;
		height: 2px;
		background: var(--accent);
		transition: all 0.3s ease;
		transform: translateX(-50%);
		border-radius: 1px;
	}

	.nav-link:hover {
		color: var(--fg-accent-hover);
	}

	.nav-link:hover::after {
		width: 100%;
	}

	.subtitle {
		font-size: 0.8rem;
		color: var(--fg-muted);
		margin: 0;
		line-height: 1.5;
		max-width: 500px;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.header-main {
			padding: 12px 16px;
		}

		.header-top {
			flex-direction: row;
			gap: 12px;
		}

		.nav-links {
			gap: 14px;
			margin-left: auto;
		}

		.subtitle {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.header-main {
			padding: 10px 12px;
		}

		.header-top {
			flex-direction: column;
			gap: 8px;
		}

		.nav-links {
			gap: 12px;
			margin-left: 0;
		}
	}
</style>
