<script>
	import { createEventDispatcher } from "svelte";
	import { slide } from "svelte/transition";

	export let GlobalTranslater;
	export let uploadedFiles = [];
	export let globalFormat = "epub";
	export let formatOptions = [];
	export let zipDownloading = false;
	export let allCompleted = false;
	export let anyConverting = false;
	export let allFolded = false;
	export let panelFolded = false;

	const sticky = true;

	const dispatch = createEventDispatcher();

	function handleGlobalFormatChange(format) {
		dispatch("globalFormatChange", format);
	}

	function handleConvertAll() {
		dispatch("convertAll");
	}

	function handleDownloadZip() {
		dispatch("downloadZip");
	}

	function handleDownloadAllSeparate() {
		dispatch("downloadAllSeparate");
	}

	function handleFoldAll() {
		dispatch("foldAll");
	}

	function handleUnfoldAll() {
		dispatch("unfoldAll");
	}

	function handleTogglePanelFold() {
		dispatch("togglePanelFold");
	}

	function handleRemoveAll() {
		dispatch("removeAll");
	}

	$: hasFiles = uploadedFiles.length > 0;
	$: completedCount = uploadedFiles.filter(
		(f) => f.status === "completed" && !f.needsConversion
	).length;
	$: totalCount = uploadedFiles.length;
	$: needsConversionCount = uploadedFiles.filter(
		(f) => f.needsConversion
	).length;
</script>

{#if hasFiles}
	<div class="file-control-panel" class:sticky>
		<div class="panel-inner">
			<!-- Format Section -->
			<div class="format-section">
				<div class="info-panel format-panel">
					<div class="panel-header">
						<span class="panel-icon"></span>
						<span class="panel-title">{GlobalTranslater.t("convert_selectFormat")}</span>
					</div>
					<div class="format-grid" class:compact={panelFolded}>
						{#each formatOptions as opt}
							<button
								class="format-btn"
								class:active={globalFormat === opt.value}
								on:click={() => handleGlobalFormatChange(opt.value)}
								type="button"
							>
								<img class="format-icon" src={opt.icon} alt={opt.label} />
								<span class="format-text">{opt.label}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Actions Section -->
			<div class="actions-section">
				<div class="info-panel action-panel">
					<div class="panel-header">
						<span class="panel-icon">⚡</span>
						<span class="panel-title">Actions</span>
					</div>
					<div class="actions-list">
						<!-- Convert All - always visible -->
						<button
							class="action-btn btn-convert"
							on:click={handleConvertAll}
							disabled={anyConverting}
							type="button"
						>
							<span class="btn-icon">🔄</span>
							<span class="btn-text">{GlobalTranslater.t("convert_btn")}</span>
						</button>

						<!-- Download ZIP - always visible -->
						<button
							class="action-btn btn-download"
							class:downloading={zipDownloading}
							on:click={handleDownloadZip}
							disabled={!allCompleted}
							type="button"
						>
							{#if zipDownloading}
								<span class="zip-spinner"></span>
							{:else}
								<span class="btn-icon">📦</span>
							{/if}
							<span class="btn-text">{GlobalTranslater.t("download_zip_btn")}</span>
						</button>

						{#if !panelFolded}
							<div in:slide={{ duration: 200, axis: "y" }}>
								<!-- Download Separate - hidden when folded -->
								<button
									class="action-btn btn-download-separate"
									on:click={handleDownloadAllSeparate}
									disabled={!allCompleted}
									type="button"
								>
									<span class="btn-icon">⬇️</span>
									<span class="btn-text">{GlobalTranslater.t("download_all_separate")}</span>
								</button>
							</div>

							<div in:slide={{ duration: 200, axis: "y" }}>
								<!-- Clear All - hidden when folded -->
								<button
									class="action-btn btn-clear"
									on:click={handleRemoveAll}
									type="button"
								>
									<span class="btn-icon">🗑️</span>
									<span class="btn-text">{GlobalTranslater.t("remove_all_btn")}</span>
								</button>
							</div>
						{/if}

						<!-- Fold/Unfold all files info - always visible -->
						<button
							class="action-btn btn-fold-files"
							on:click={allFolded ? handleUnfoldAll : handleFoldAll}
							type="button"
						>
							<span class="btn-icon">{allFolded ? '🔼' : '🔽'}</span>
							<span class="btn-text">
								{allFolded ? GlobalTranslater.t("unfold_all_btn") : GlobalTranslater.t("fold_all_btn")}
							</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Fold Button -->
			<div class="fold-section">
				<button
					class="fold-btn"
					on:click={handleTogglePanelFold}
					type="button"
					title={panelFolded ? GlobalTranslater.t("unfold_all_btn") : GlobalTranslater.t("fold_all_btn")}
				>
					<span class="fold-icon">
						{#if panelFolded}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="15 3 21 3 21 9"></polyline>
								<polyline points="9 21 3 21 3 15"></polyline>
								<line x1="21" y1="3" x2="14" y2="10"></line>
								<line x1="3" y1="21" x2="10" y2="14"></line>
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="4 14 10 14 10 20"></polyline>
								<polyline points="20 10 14 10 14 4"></polyline>
								<line x1="14" y1="10" x2="21" y2="3"></line>
								<line x1="3" y1="21" x2="10" y2="14"></line>
							</svg>
						{/if}
					</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.file-control-panel {
		background: var(--bg-card);
		border: 3px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: border-color 0.3s ease, box-shadow 0.3s ease;
	}

	.file-control-panel:hover {
		box-shadow: var(--shadow-md);
	}

	.file-control-panel.sticky {
		position: sticky;
		top: 80px;
		z-index: 100;
	}

	.panel-inner {
		display: flex;
		gap: 0;
		align-items: stretch;
	}

	/* Format Section */
	.format-section {
		flex: 1;
		min-width: 0;
		padding: 12px;
		border-right: 1px solid var(--border);
	}

	.info-panel {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 10px;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
	}

	.panel-icon {
		font-size: 16px;
	}

	.panel-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-heading);
	}

	.format-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 6px;
		flex: 1;
		align-content: start;
	}

	.format-grid.compact {
		grid-template-columns: repeat(3, 1fr);
	}

	.format-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 6px 8px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--bg-card);
		color: var(--fg);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		white-space: nowrap;
	}

	.format-btn:hover:not(.active) {
		border-color: var(--accent);
	}

	.format-btn.active {
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
		color: #fff;
		border: none;
		box-shadow: var(--shadow-sm);
	}

	.format-icon {
		width: 20px;
		height: 20px;
		object-fit: contain;
	}

	.format-text {
		font-weight: 600;
	}

	/* Actions Section */
	.actions-section {
		flex: 1;
		min-width: 0;
		padding: 12px;
		border-right: 1px solid var(--border);
	}

	.action-panel {
		display: flex;
		flex-direction: column;
	}

	.actions-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 16px;
		border: none;
		border-radius: var(--radius-md);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		white-space: nowrap;
		width: 100%;
		color: #fff;
	}

	.action-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--bg-muted) !important;
		color: var(--fg-disabled);
		transform: none;
		box-shadow: none;
	}

	.action-btn.downloading {
		background: var(--bg-muted);
		cursor: not-allowed;
	}

	.btn-icon {
		font-size: 14px;
	}

	.btn-text {
		font-weight: 600;
	}

	/* Convert button - deep cyan gradient */
	.btn-convert {
		background: linear-gradient(135deg, #00acc1 0%, #006064 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2);
	}

	.btn-convert:hover:not(:disabled) {
		background: linear-gradient(135deg, #00bcd4 0%, #00838f 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15);
	}

	/* Download zip - deep forest green gradient */
	.btn-download {
		background: linear-gradient(135deg, #1b5e20 0%, #0a2e0f 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.btn-download:hover:not(:disabled) {
		background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
	}

	.btn-download.downloading {
		background: var(--bg-muted);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	/* Download separate - deep emerald gradient */
	.btn-download-separate {
		background: linear-gradient(135deg, #2e7d32 0%, #145218 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
	}

	.btn-download-separate:hover:not(:disabled) {
		background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2);
	}

	/* Clear button - deep crimson gradient */
	.btn-clear {
		background: linear-gradient(135deg, #d32f2f 0%, #8b0000 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.btn-clear:hover:not(:disabled) {
		background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
	}

	/* Fold/Unfold files - deep magenta gradient */
	.btn-fold-files {
		background: linear-gradient(135deg, #c2185b 0%, #7a0038 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.btn-fold-files:hover:not(:disabled) {
		background: linear-gradient(135deg, #d81b60 0%, #ad1457 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
	}

	.zip-spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: var(--radius-full);
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Fold Button */
	.fold-section {
		flex: 0 0 40px;
		max-width: 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 4px;
		padding: 8px 4px;
		border-left: 1px solid var(--border);
		background: var(--bg);
	}

	.fold-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--bg-card);
		color: var(--fg-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.fold-btn:hover {
		background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
		color: #c2185b;
		border-color: #e91e63;
	}

	.fold-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.fold-icon svg {
		width: 16px;
		height: 16px;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.panel-inner {
			flex-direction: column;
			gap: 0;
		}

		.format-section {
			border-right: none;
			border-bottom: 1px solid var(--border);
		}

		.actions-section {
			width: 100%;
			min-width: auto;
			border-right: none;
			border-bottom: 1px solid var(--border);
		}

		.format-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.format-grid.compact {
			grid-template-columns: repeat(3, 1fr);
		}

		.fold-section {
			flex: none;
			max-width: 100%;
			flex-direction: row;
			justify-content: center;
			border-left: none;
			border-top: 1px solid var(--border);
			padding: 6px;
		}

		.fold-btn {
			width: 100%;
			height: auto;
			padding: 8px;
		}
	}

	@media (max-width: 480px) {
		.file-control-panel {
			border-radius: var(--radius-md);
		}

		.format-section,
		.actions-section {
			padding: 8px;
		}

		.format-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 4px;
		}

		.format-grid.compact {
			grid-template-columns: repeat(2, 1fr);
		}

		.format-btn {
			padding: 5px 6px;
			font-size: 10px;
		}

		.action-btn {
			padding: 8px 12px;
			font-size: 12px;
		}
	}
</style>
