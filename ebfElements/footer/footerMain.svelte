<script>
	import { onMount } from "svelte";
	import { GlobalTranslater } from "$lib/store/translater";

	let isVisible = false;

	export let repoLink = null;

	$: effectiveRepoLink = repoLink || {
		text: GlobalTranslater.t("footer_repo"),
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
				href={effectiveRepoLink.href}
				class="footer-link"
				target="_blank"
				rel="noopener noreferrer"
			>
				{effectiveRepoLink.text}
			</a>
		</nav>

		<p class="copyright">
			&copy; {new Date().getFullYear()}{" "}
			{GlobalTranslater.t("footer_copyright")}
		</p>
	</div>
</footer>

<style>
	.footer-main {
		width: 100%;
		padding: 32px 24px;
		background: var(--bg-muted);
		border-top: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
	}

	.footer-content {
		max-width: 800px;
		margin: 0 auto;
		opacity: 0;
		animation: fadeInDown 0.5s ease-out forwards;
		text-align: center;
	}

	.footer-links {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 20px;
		margin-bottom: 12px;
	}

	.footer-link {
		font-size: 0.85rem;
		color: var(--fg-accent);
		text-decoration: none;
		transition: color 0.3s ease;
		font-weight: 500;
	}

	.footer-link:hover {
		color: var(--fg-accent-hover);
		text-decoration: underline;
	}

	.copyright {
		font-size: 0.8rem;
		color: var(--fg-muted);
		margin: 0;
		line-height: 1.5;
	}

	@keyframes fadeInDown {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.footer-main {
			padding: 24px 16px;
		}

		.footer-links {
			gap: 14px;
		}
	}

	@media (max-width: 480px) {
		.footer-main {
			padding: 20px 12px;
		}

		.copyright {
			font-size: 0.75rem;
		}
	}
</style>
