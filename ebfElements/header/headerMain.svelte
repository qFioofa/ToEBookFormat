<script>
	import { onMount } from "svelte";

	let isVisible = false;

	export let howToUseSection = {
		text: "How to use",
		href: "#how-to-use",
	};

	export let aboutSection = {
		text: "About",
		href: "#about",
	};

	$: navLinks = [howToUseSection, aboutSection];

	onMount(() => {
		isVisible = true;
	});
</script>

<header class="header-main">
	<div class="header-content">
		<div class="logo-and-nav">
			<slot name="Logo" />
			<nav class="nav-links">
				<slot name="Options" />
				{#each navLinks as link}
					<a href={link.href} class="nav-link">{link.text}</a>
				{/each}
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
		padding: var(--spacing-xl) var(--spacing-md);
		background: var(--bg-muted);
		border-bottom: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
		opacity: 0;
		animation: fadeInUp 0.6s ease-out forwards;
	}

	.logo-and-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.nav-links {
		display: flex;
		gap: var(--spacing-lg);
		flex-shrink: 0;
	}

	.nav-link {
		font-size: var(--font-size-base);
		color: var(--fg-accent);
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.nav-link:hover {
		color: var(--fg-accent-hover);
		text-decoration: underline;
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

	@media (max-width: 1200px) and (min-width: 769px) {
		.header-main {
			padding: var(--spacing-lg) var(--spacing-md);
		}
	}

	@media (max-width: 768px) {
		.header-main {
			padding: var(--spacing-lg) var(--spacing-sm);
		}

		.logo-and-nav {
			flex-direction: column;
			align-items: flex-start;
		}

		.nav-links {
			order: 2;
			width: 100%;
			justify-content: flex-end;
		}

		.subtitle {
			font-size: var(--font-size-base);
		}
	}

	@media (max-width: 480px) {
		.header-main {
			padding: var(--spacing-md) var(--spacing-xs);
		}

		.nav-links {
			justify-content: center;
			gap: var(--spacing-md);
		}

		.subtitle {
			font-size: var(--font-size-sm);
		}
	}
</style>
