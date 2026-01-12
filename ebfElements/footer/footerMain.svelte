<script>
	import { onMount } from "svelte";

	let isVisible = false;

	export let repoLink = {
		text: "GitHub Repository",
		href: "https://github.com/qFioofa/ToEBookFormat",
	};

	onMount(() => {
		isVisible = true;
	});
</script>

<footer class="footer-main">
	<div class="footer-content">
		<nav class="footer-links">
			<a
				href={repoLink.href}
				class="footer-link"
				target="_blank"
				rel="noopener noreferrer"
			>
				{repoLink.text}
			</a>
		</nav>

		<p class="copyright">
			&copy; {new Date().getFullYear()} ToEBookFormat
		</p>
	</div>
</footer>

<style>
	.footer-main {
		width: 100%;
		padding: var(--spacing-xl) var(--spacing-md);
		background: var(--bg-muted);
		border-top: var(--border-width) solid var(--border);
		box-shadow: var(--shadow-sm);
	}

	.footer-content {
		max-width: 800px;
		margin: 0 auto;
		opacity: 0;
		animation: fadeInUp 0.6s ease-out forwards;
		text-align: center;
	}

	.footer-links {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
	}

	.footer-link {
		font-size: var(--font-size-base);
		color: var(--fg-accent);
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.footer-link:hover {
		color: var(--fg-accent-hover);
		text-decoration: underline;
	}

	.copyright {
		font-size: var(--font-size-sm);
		color: var(--fg-muted);
		margin: 0 0 var(--spacing-md) 0;
		line-height: var(--line-height-base);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 1200px) and (min-width: 769px) {
		.footer-main {
			padding: var(--spacing-lg) var(--spacing-md);
		}
	}

	@media (max-width: 768px) {
		.footer-main {
			padding: var(--spacing-lg) var(--spacing-sm);
		}

		.footer-links {
			gap: var(--spacing-md);
		}
	}

	@media (max-width: 480px) {
		.footer-main {
			padding: var(--spacing-md) var(--spacing-xs);
		}

		.copyright {
			font-size: var(--font-size-xs);
		}
	}
</style>
