<script>
	import { DropFiles } from "@ebfElements";
	import { createEventDispatcher } from "svelte";

	export let GlobalTranslater;
	export let uploadedFiles = [];
	export let globalFormat = "epub";
	export let formatOptions = [];
	export let zipDownloading = false;
	export let allCompleted = false;
	export let anyConverting = false;

	const dispatch = createEventDispatcher();

	function handleFilesDrop(files) {
		dispatch("filesDrop", files);
	}

	function handleGlobalFormatChange(format) {
		dispatch("globalFormatChange", format);
	}

	function handleRemoveAll() {
		dispatch("removeAll");
	}

	function handleConvertAll() {
		dispatch("convertAll");
	}

	function handleDownloadZip() {
		dispatch("downloadZip");
	}

	$: hasFiles = uploadedFiles.length > 0;
	$: completedCount = uploadedFiles.filter(
		(f) => f.status === "completed" && !f.needsConversion
	).length;
	$: totalCount = uploadedFiles.length;
	$: needsConversionCount = uploadedFiles.filter(
		(f) => f.needsConversion
	).length;
	$: pendingCount = uploadedFiles.filter(
		(f) => f.status === "pending"
	).length;
</script>

<div class="convert-panel">
	<div class="drop-zone-area">
		<DropFiles
			onFilesDrop={handleFilesDrop}
			translations={{ dropFiles: GlobalTranslater.t("upload_dropFiles") }}
		/>
	</div>

	{#if hasFiles}
		<div class="panel-divider"></div>

		<div class="toolbar">
			<div class="toolbar-left">
				<span class="format-label">
					{GlobalTranslater.t("convert_selectFormat")}
				</span>
				<div class="format-buttons">
					{#each formatOptions as opt}
						<button
							class="format-btn"
							class:active={globalFormat === opt.value}
							on:click={() => handleGlobalFormatChange(opt.value)}
							type="button"
						>
							<span>{opt.icon}</span>
							<span>{opt.label}</span>
						</button>
					{/each}
				</div>
			</div>
			<div class="toolbar-right">
				<button class="btn-clear" on:click={handleRemoveAll} type="button">
					🗑️ {GlobalTranslater.t("remove_all_btn")}
				</button>
				<button
					class="btn-convert"
					on:click={handleConvertAll}
					disabled={anyConverting}
					type="button"
				>
					🔄 {GlobalTranslater.t("convert_btn")}
				</button>
				<button
					class="btn-zip"
					class:downloading={zipDownloading}
					on:click={handleDownloadZip}
					disabled={!allCompleted}
					type="button"
				>
					{#if zipDownloading}
						<span class="zip-spinner"></span>
					{:else}
						📦
					{/if}
					{GlobalTranslater.t("download_zip_btn")}
				</button>
			</div>
		</div>

		<div class="files-header">
			<span class="files-count">
				{totalCount} {GlobalTranslater.t("files_count")}
			</span>
			{#if needsConversionCount > 0}
				<span class="files-warning">
					⚠️ {needsConversionCount} needs conversion
				</span>
			{:else if completedCount > 0}
				<span class="files-done">
					{completedCount}/{totalCount} ✅
				</span>
			{/if}
		</div>

		<slot name="files" {uploadedFiles} {formatOptions} />
	{/if}
</div>

<style>
	.convert-panel {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		box-shadow: var(--shadow);
	}

	.panel-divider {
		width: 100%;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			var(--border) 50%,
			transparent 100%
		);
	}

	.drop-zone-area {
		width: 100%;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		position: sticky;
		top: 0;
		z-index: 10;
		padding: 12px;
		margin: -12px;
		background: var(--bg-card);
		border-radius: 10px;
	}

	.toolbar-left {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
		min-width: 200px;
	}

	.format-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-muted);
	}

	.format-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.format-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--fg);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.format-btn:hover {
		border-color: var(--accent);
	}

	.format-btn.active {
		border-color: var(--accent);
		background: linear-gradient(
			135deg,
			var(--accent) 0%,
			var(--accent-dark) 100%
		);
		color: #fff;
	}

	.toolbar-right {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.btn-clear,
	.btn-convert,
	.btn-zip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 16px;
		border: none;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		white-space: nowrap;
	}

	.btn-clear {
		background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
		color: #fff;
		box-shadow: 0 2px 8px rgba(231, 76, 60, 0.25);
	}

	.btn-clear:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(231, 76, 60, 0.35);
	}

	.btn-convert {
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--border);
	}

	.btn-convert:hover:not(:disabled) {
		border-color: var(--accent);
	}

	.btn-convert:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-zip {
		background: linear-gradient(
			135deg,
			var(--accent) 0%,
			var(--accent-dark) 100%
		);
		color: #fff;
		position: relative;
	}

	.btn-zip:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.btn-zip:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.zip-spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.files-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 4px 0;
	}

	.files-count,
	.files-done {
		font-size: 13px;
		color: var(--fg-muted);
		font-weight: 500;
	}

	.files-warning {
		font-size: 13px;
		color: #f39c12;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.convert-panel {
			padding: 16px;
		}

		.toolbar {
			flex-direction: column;
			align-items: stretch;
		}

		.toolbar-right {
			width: 100%;
			justify-content: center;
		}

		.btn-clear,
		.btn-convert,
		.btn-zip {
			flex: 1;
			justify-content: center;
		}

		.toolbar {
			padding: 8px;
			margin: -8px;
		}

		.format-buttons {
			justify-content: center;
		}

		.format-label {
			text-align: center;
		}

		.toolbar-left {
			align-items: center;
		}
	}

	@media (max-width: 480px) {
		.convert-panel {
			padding: 12px;
			gap: 12px;
		}

		.btn-clear,
		.btn-convert,
		.btn-zip {
			padding: 8px 12px;
			font-size: 12px;
		}

		.format-btn {
			padding: 4px 8px;
			font-size: 12px;
		}

		.toolbar-right {
			flex-direction: column;
		}

		.btn-clear,
		.btn-convert,
		.btn-zip {
			width: 100%;
			justify-content: center;
		}

		.toolbar-left {
			align-items: center;
			text-align: center;
		}

		.format-buttons {
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>
