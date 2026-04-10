<script>
	export let GlobalTranslater;
</script>

<section id="features" class="features-section">
	<div class="section-inner">
		<h2 class="section-title">{GlobalTranslater.t("features_title")}</h2>
		<div class="features-grid">
			<div class="feature-card">
				<span class="feature-icon">📚</span>
				<h3 class="feature-title">
					{GlobalTranslater.t("feature_formats_title")}
				</h3>
				<p class="feature-description">
					{GlobalTranslater.t("feature_formats_desc")}
				</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">🔒</span>
				<h3 class="feature-title">
					{GlobalTranslater.t("feature_private_title")}
				</h3>
				<p class="feature-description">
					{GlobalTranslater.t("feature_private_desc")}
				</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">⚡</span>
				<h3 class="feature-title">
					{GlobalTranslater.t("feature_fast_title")}
				</h3>
				<p class="feature-description">
					{GlobalTranslater.t("feature_fast_desc")}
				</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">🌐</span>
				<h3 class="feature-title">
					{GlobalTranslater.t("feature_offline_title")}
				</h3>
				<p class="feature-description">
					{GlobalTranslater.t("feature_offline_desc")}
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.features-section {
		padding: 80px 0;
	}

	.section-inner {
		width: 100%;
		max-width: 960px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.section-title {
		text-align: center;
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 40px;
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

	.features-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		justify-content: center;
	}

	.feature-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 32px 20px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		gap: 12px;
	}

	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--accent);
	}

	.feature-icon {
		font-size: 2rem;
		display: block;
		margin-bottom: 4px;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
	}

	.feature-title {
		font-size: 0.95rem;
		font-weight: 700;
		margin: 0;
		line-height: 1.3;
		color: var(--fg-heading);
	}

	.feature-description {
		font-size: 0.8rem;
		color: var(--fg-muted);
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 900px) {
		.features-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 16px;
		}
	}

	@media (max-width: 520px) {
		.features-section {
			padding: 48px 0;
		}

		.section-title {
			font-size: 1.35rem;
			margin-bottom: 28px;
		}

		.features-grid {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.feature-card {
			padding: 24px 16px;
		}
	}
</style>
