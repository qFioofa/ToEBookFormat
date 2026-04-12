<script>
	export let GlobalTranslater;
</script>

<section id="hero" class="hero-section">
	<div class="hero-bg"></div>
	<div class="hero-content">
		<span class="hero-badge">{GlobalTranslater.t("hero_badge")}</span>
		<h1 class="hero-title">{GlobalTranslater.t("hero_title")}</h1>
		<p class="hero-subtitle">{GlobalTranslater.t("hero_subtitle")}</p>
		<p class="hero-description">
			{GlobalTranslater.t("hero_description")}
		</p>
		<a href="#convert" class="cta-button">
			{GlobalTranslater.t("hero_cta")}
			<span class="cta-arrow">→</span>
		</a>
	</div>
</section>

<style>
	.hero-section {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100px 24px 80px;
		position: relative;
		overflow: hidden;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.hero-bg::before {
		content: "";
		position: absolute;
		top: -120px;
		right: -120px;
		width: 500px;
		height: 500px;
		background: radial-gradient(
			circle,
			var(--accent-muted) 0%,
			transparent 70%
		);
		border-radius: 50%;
		opacity: 0.6;
		animation: float 15s ease-in-out infinite;
	}

	.hero-bg::after {
		content: "";
		position: absolute;
		bottom: -100px;
		left: -100px;
		width: 350px;
		height: 350px;
		background: radial-gradient(
			circle,
			rgba(81, 207, 102, 0.08) 0%,
			transparent 70%
		);
		border-radius: 50%;
		opacity: 0.5;
		animation: float 20s ease-in-out infinite reverse;
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(30px, -20px) scale(1.05);
		}
	}

	.hero-content {
		text-align: center;
		max-width: 640px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		position: relative;
		z-index: 1;
	}

	.hero-badge {
		display: inline-block;
		padding: 6px 18px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--fg-muted);
		box-shadow: var(--shadow-sm);
	}

	.hero-title {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 800;
		margin: 0;
		line-height: 1.1;
		letter-spacing: -0.03em;
		background: linear-gradient(
			135deg,
			var(--fg-heading) 0%,
			var(--accent) 60%,
			var(--accent-dark) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		color: var(--accent);
		font-weight: 500;
		margin: 0;
		line-height: 1.4;
	}

	.hero-description {
		font-size: clamp(0.95rem, 2vw, 1.05rem);
		color: var(--fg-muted);
		margin: 0;
		max-width: 480px;
		line-height: 1.7;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 32px;
		background: linear-gradient(
			135deg,
			var(--accent) 0%,
			var(--accent-dark) 100%
		);
		color: #fff;
		text-decoration: none;
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 700;
		transition: all 0.3s ease;
		box-shadow: var(--shadow-lg);
		margin-top: 8px;
		position: relative;
		overflow: hidden;
	}

	.cta-button::before {
		content: "";
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.2) 50%,
			transparent 100%
		);
		transition: left 0.5s ease;
	}

	.cta-button:hover::before {
		left: 100%;
	}

	.cta-button:hover {
		background: linear-gradient(
			135deg,
			var(--accent-hover) 0%,
			var(--accent) 100%
		);
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(81, 207, 102, 0.3);
	}

	.cta-button:hover .cta-arrow {
		transform: translateX(4px);
	}

	.cta-arrow {
		transition: transform 0.3s ease;
		font-size: 1.1rem;
	}

	@media (max-width: 768px) {
		.hero-section {
			padding: 72px 20px 56px;
		}

		.hero-content {
			gap: 12px;
		}

		.cta-button {
			padding: 12px 28px;
			font-size: 0.95rem;
		}
	}

	@media (max-width: 480px) {
		.hero-section {
			padding: 56px 16px 40px;
		}

		.hero-badge {
			font-size: 0.75rem;
			padding: 4px 12px;
		}
	}
</style>
