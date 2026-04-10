<script>
	export let GlobalTranslater;
</script>

<section id="about" class="about-section">
	<div class="section-inner">
		<div class="about-card">
			<div class="about-text-area">
				<h2 class="section-title">{GlobalTranslater.t("about_title")}</h2>
				<p class="about-text">
					{GlobalTranslater.t("about_description")}
				</p>
				<p class="about-text about-text-muted">
					{GlobalTranslater.t("about_features")}
				</p>
			</div>
			<div class="about-meta">
				<span class="about-dev-tag">
					{GlobalTranslater.t("about_dev")}
					<a
						href="https://github.com/qFioofa"
						target="_blank"
						rel="noopener noreferrer"
					>
						qFioofa
					</a>
				</span>
				<span class="license-badge">
					{GlobalTranslater.t("about_license")}
				</span>
			</div>
		</div>
	</div>
</section>

<style>
	.about-section {
		padding: 80px 0;
	}

	.section-inner {
		width: 100%;
		max-width: 960px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.about-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 40px 32px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		text-align: center;
	}

	.about-text-area {
		max-width: 600px;
	}

	.section-title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 16px;
		line-height: 1.3;
		letter-spacing: -0.01em;
		background: linear-gradient(
			135deg,
			var(--fg-heading) 0%,
			var(--accent) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.about-text {
		font-size: 0.95rem;
		color: var(--fg);
		margin: 0 0 12px;
		line-height: 1.7;
	}

	.about-text:last-child {
		margin-bottom: 0;
	}

	.about-text-muted {
		color: var(--fg-muted);
		font-size: 0.85rem;
	}

	.about-meta {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.about-dev-tag {
		font-size: 0.85rem;
		color: var(--fg-muted);
	}

	.about-dev-tag a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 600;
	}

	.about-dev-tag a:hover {
		text-decoration: underline;
	}

	.license-badge {
		padding: 4px 14px;
		background: var(--bg-muted);
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 0.85rem;
		color: var(--fg-muted);
	}

	@media (max-width: 520px) {
		.about-section {
			padding: 48px 0;
		}

		.about-card {
			padding: 28px 20px;
		}

		.section-title {
			font-size: 1.35rem;
			margin-bottom: 12px;
		}

		.about-meta {
			flex-direction: column;
			align-items: center;
			gap: 8px;
		}
	}
</style>
