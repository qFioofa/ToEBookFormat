<script>
	export let GlobalTranslater;

	const formats = [
		{
			icon: '📖',
			name: 'EPUB',
			version: '3.0 / 3.1',
			description: GlobalTranslater.t('format_epub_desc'),
			useCases: GlobalTranslater.t('format_epub_usecases'),
			pros: [
				GlobalTranslater.t('format_epub_pro_1'),
				GlobalTranslater.t('format_epub_pro_2'),
				GlobalTranslater.t('format_epub_pro_3'),
				GlobalTranslater.t('format_epub_pro_4'),
			],
			cons: [
				GlobalTranslater.t('format_epub_con_1'),
				GlobalTranslater.t('format_epub_con_2'),
			],
			color: '#00acc1',
		},
		{
			icon: '📄',
			name: 'FB2',
			version: '2.0 / 2.1',
			description: GlobalTranslater.t('format_fb2_desc'),
			useCases: GlobalTranslater.t('format_fb2_usecases'),
			pros: [
				GlobalTranslater.t('format_fb2_pro_1'),
				GlobalTranslater.t('format_fb2_pro_2'),
				GlobalTranslater.t('format_fb2_pro_3'),
				GlobalTranslater.t('format_fb2_pro_4'),
			],
			cons: [
				GlobalTranslater.t('format_fb2_con_1'),
				GlobalTranslater.t('format_fb2_con_2'),
			],
			color: '#66bb6a',
		},
		{
			icon: '📱',
			name: 'MOBI',
			version: 'KF8 / MOBI 7',
			description: GlobalTranslater.t('format_mobi_desc'),
			useCases: GlobalTranslater.t('format_mobi_usecases'),
			pros: [
				GlobalTranslater.t('format_mobi_pro_1'),
				GlobalTranslater.t('format_mobi_pro_2'),
				GlobalTranslater.t('format_mobi_pro_3'),
			],
			cons: [
				GlobalTranslater.t('format_mobi_con_1'),
				GlobalTranslater.t('format_mobi_con_2'),
				GlobalTranslater.t('format_mobi_con_3'),
			],
			color: '#ffa726',
		},
		{
			icon: '🔥',
			name: 'AZW3',
			version: 'KF8 (Kindle Format 8)',
			description: GlobalTranslater.t('format_azw3_desc'),
			useCases: GlobalTranslater.t('format_azw3_usecases'),
			pros: [
				GlobalTranslater.t('format_azw3_pro_1'),
				GlobalTranslater.t('format_azw3_pro_2'),
				GlobalTranslater.t('format_azw3_pro_3'),
				GlobalTranslater.t('format_azw3_pro_4'),
			],
			cons: [
				GlobalTranslater.t('format_azw3_con_1'),
				GlobalTranslater.t('format_azw3_con_2'),
			],
			color: '#ef5350',
		},
		{
			icon: '📝',
			name: 'TXT',
			version: 'UTF-8',
			description: GlobalTranslater.t('format_txt_desc'),
			useCases: GlobalTranslater.t('format_txt_usecases'),
			pros: [
				GlobalTranslater.t('format_txt_pro_1'),
				GlobalTranslater.t('format_txt_pro_2'),
				GlobalTranslater.t('format_txt_pro_3'),
				GlobalTranslater.t('format_txt_pro_4'),
			],
			cons: [
				GlobalTranslater.t('format_txt_con_1'),
				GlobalTranslater.t('format_txt_con_2'),
				GlobalTranslater.t('format_txt_con_3'),
			],
			color: '#ab47bc',
		},
	];
</script>

<section id="formats" class="formats-section">
	<div class="section-inner">
		<h2 class="section-title">{GlobalTranslater.t("formats_title")}</h2>
		<p class="section-subtitle">{GlobalTranslater.t("formats_subtitle")}</p>

		<div class="formats-grid">
			{#each formats as format}
				<div class="format-card">
					<div class="format-header">
						<span class="format-icon">{format.icon}</span>
						<div class="format-title-group">
							<h3 class="format-name">{format.name}</h3>
							<span class="format-version">{format.version}</span>
						</div>
					</div>

					<p class="format-description">{format.description}</p>

					<div class="format-usecases">
						<span class="usecase-label">{GlobalTranslater.t("formats_bestFor")}</span>
						<p class="usecase-text">{format.useCases}</p>
					</div>

					<div class="format-pros">
						<span class="pros-label">{GlobalTranslater.t("formats_pros")}</span>
						<ul class="pros-list">
							{#each format.pros as pro}
								<li class="pro-item">
									<span class="pro-check">✓</span>
									<span>{pro}</span>
								</li>
							{/each}
						</ul>
					</div>

					<div class="format-cons">
						<span class="cons-label">{GlobalTranslater.t("formats_cons")}</span>
						<ul class="cons-list">
							{#each format.cons as con}
								<li class="con-item">
									<span class="con-cross">✕</span>
									<span>{con}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.formats-section {
		padding: 80px 0;
	}

	.section-inner {
		width: 100%;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.section-title {
		text-align: center;
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 12px;
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

	.section-subtitle {
		text-align: center;
		font-size: 0.95rem;
		color: var(--fg-muted);
		margin: 0 0 48px;
		line-height: 1.5;
	}

	.formats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.format-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 24px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.format-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.format-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.format-icon {
		font-size: 2rem;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
	}

	.format-title-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.format-name {
		font-size: 1.2rem;
		font-weight: 700;
		margin: 0;
		color: var(--fg-heading);
	}

	.format-version {
		font-size: 0.75rem;
		color: var(--fg-subtle);
		font-weight: 500;
	}

	.format-description {
		font-size: 0.85rem;
		color: var(--fg-muted);
		margin: 0;
		line-height: 1.6;
	}

	.format-usecases {
		background: var(--bg-muted);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
	}

	.usecase-label {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--fg-subtle);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 4px;
	}

	.usecase-text {
		font-size: 0.8rem;
		color: var(--fg);
		margin: 0;
		line-height: 1.5;
	}

	.format-pros,
	.format-cons {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.pros-label,
	.cons-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.pros-label {
		color: var(--accent);
	}

	.cons-label {
		color: var(--danger);
	}

	.pros-list,
	.cons-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.pro-item,
	.con-item {
		display: flex;
		align-items: flex-start;
		gap: 6px;
		font-size: 0.8rem;
		line-height: 1.4;
	}

	.pro-check {
		color: var(--accent);
		font-weight: 700;
		flex-shrink: 0;
	}

	.con-cross {
		color: var(--danger);
		font-weight: 700;
		flex-shrink: 0;
	}

	.pro-item span:last-child {
		color: var(--fg);
	}

	.con-item span:last-child {
		color: var(--fg-muted);
	}

	/* Last card spans full width if odd number */
	.format-card:last-child:nth-child(odd) {
		grid-column: 1 / -1;
		max-width: 50%;
		justify-self: center;
	}

	@media (max-width: 900px) {
		.formats-grid {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.format-card:last-child:nth-child(odd) {
			max-width: 100%;
		}
	}

	@media (max-width: 520px) {
		.formats-section {
			padding: 48px 0;
		}

		.section-title {
			font-size: 1.35rem;
			margin-bottom: 8px;
		}

		.section-subtitle {
			font-size: 0.85rem;
			margin-bottom: 32px;
		}

		.format-card {
			padding: 20px;
		}

		.format-icon {
			font-size: 1.5rem;
		}

		.format-name {
			font-size: 1rem;
		}
	}
</style>
