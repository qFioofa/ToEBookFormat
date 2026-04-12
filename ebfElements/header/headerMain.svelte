<script>
	import { onMount } from "svelte";
	import { GlobalTranslater } from "$lib/store/translater";

	let isVisible = false;

	export let convertSection = null;
	export let formatsSection = null;
	export let howToUseSection = null;
	export let aboutSection = null;

	$: navLinks = [
		convertSection || {
			text: GlobalTranslater.t("nav_convert"),
			href: "#convert",
		},
		formatsSection || {
			text: GlobalTranslater.t("nav_formats"),
			href: "#formats",
		},
		howToUseSection || {
			text: GlobalTranslater.t("nav_howToUse"),
			href: "#how-to-use",
		},
		aboutSection || {
			text: GlobalTranslater.t("nav_about"),
			href: "#about",
		},
	].filter(Boolean);

	onMount(() => {
		isVisible = true;
	});
</script>

<header class="header-main">
	<div class="header-content">
		<div class="header-top">
			<div class="header-left">
				<slot name="Logo" />
			</div>
			<div class="header-right">
				<nav class="nav-links">
					{#each navLinks as link}
						<a href={link.href} class="nav-link">{link.text}</a>
					{/each}
				</nav>
				<slot name="Options" />
			</div>
		</div>
	</div>
</header>

<style>
	.header-main {
		width: 100%;
		padding: 0;
		background: var(--bg-card);
		border-bottom: 1px solid var(--border);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		opacity: 0;
		animation: fadeInUp 0.5s ease-out forwards;
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 32px;
		width: 100%;
		padding: 16px 32px;
	}

	.header-left {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 24px;
		flex-shrink: 0;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.nav-link {
		font-size: 0.9rem;
		color: var(--fg-accent);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s ease;
		position: relative;
		padding: 6px 2px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.nav-link::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 2px;
		background: var(--accent);
		transition: all 0.3s ease;
		border-radius: 1px;
	}

	.nav-link:hover {
		color: var(--fg-accent-hover);
	}

	.nav-link:hover::after {
		width: 100%;
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
		.header-top {
			padding: 12px 16px;
			gap: 12px;
		}

		.header-right {
			gap: 12px;
		}

		.nav-links {
			gap: 12px;
		}

		.nav-link {
			font-size: 0.85rem;
		}
	}

	@media (max-width: 600px) {
		.header-content {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.header-top {
			flex-direction: column;
			align-items: center;
			gap: 10px;
			padding: 12px 16px 8px;
		}

		.header-left {
			order: 1;
		}

		.header-right {
			order: 2;
			width: 100%;
			flex-direction: column;
			align-items: center;
			gap: 10px;
		}

		.nav-links {
			order: 1;
			width: 100%;
			justify-content: center;
			gap: 10px;
			padding-bottom: 10px;
			border-bottom: 1px solid var(--border);
		}

		.header-controls {
			order: 2;
			justify-content: center;
		}

		.nav-link {
			font-size: 0.85rem;
			padding: 4px 2px;
		}
	}

	@media (max-width: 480px) {
		.header-top {
			padding: 10px 12px 6px;
		}

		.nav-links {
			gap: 8px;
		}

		.nav-link {
			font-size: 0.8rem;
		}
	}
</style>
