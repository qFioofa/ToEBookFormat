<script>
	export let GlobalTranslater;
</script>

<section id="how-to-use" class="howto-section">
	<div class="section-inner">
		<h2 class="section-title">{GlobalTranslater.t("howToUse_title")}</h2>
		<div class="steps-container">
			<div class="step-card">
				<span class="step-number">1</span>
				<h3 class="step-title">
					{GlobalTranslater.t("howToUse_step1_title")}
				</h3>
				<p class="step-description">
					{GlobalTranslater.t("howToUse_step1_desc")}
				</p>
			</div>
			<div class="step-card">
				<span class="step-number">2</span>
				<h3 class="step-title">
					{GlobalTranslater.t("howToUse_step2_title")}
				</h3>
				<p class="step-description">
					{GlobalTranslater.t("howToUse_step2_desc")}
				</p>
			</div>
			<div class="step-card">
				<span class="step-number">3</span>
				<h3 class="step-title">
					{GlobalTranslater.t("howToUse_step3_title")}
				</h3>
				<p class="step-description">
					{GlobalTranslater.t("howToUse_step3_desc")}
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.howto-section {
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

	.steps-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		justify-content: center;
	}

	.step-card {
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

	.step-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--accent);
	}

	.step-number {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(
			135deg,
			var(--accent) 0%,
			var(--accent-dark) 100%
		);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		font-weight: 700;
		flex-shrink: 0;
		box-shadow: 0 2px 8px rgba(81, 207, 102, 0.3);
	}

	.step-title {
		font-size: 0.95rem;
		font-weight: 700;
		margin: 0;
		line-height: 1.3;
		color: var(--fg-heading);
	}

	.step-description {
		font-size: 0.8rem;
		color: var(--fg-muted);
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 700px) {
		.howto-section {
			padding: 48px 0;
		}

		.section-title {
			font-size: 1.35rem;
			margin-bottom: 28px;
		}

		.steps-container {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.step-card {
			padding: 24px 16px;
		}
	}
</style>
