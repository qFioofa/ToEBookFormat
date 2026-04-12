<script>
	import { createEventDispatcher } from "svelte";

	export let file = null;
	export let formatOptions = [];
	export let selectedFormat = "epub";

	const dispatch = createEventDispatcher();

	let downloading = false;

	function formatFileSize(bytes) {
		if (!bytes || bytes === 0) return "0 KB";
		const kb = bytes / 1024;
		return kb < 1024
			? kb.toFixed(1) + " KB"
			: (kb / 1024).toFixed(1) + " MB";
	}

	function handleFormatChange(e) {
		dispatch("formatChange", {
			id: file.id,
			format: e.target.value,
		});
	}

	function handleRemove() {
		dispatch("remove", file.id);
	}

	function handleRetry() {
		dispatch("retry", file.id);
	}

	function handleConvert() {
		dispatch("convert", file.id);
	}

	function handleDownload() {
		if (file.resultBlob) {
			downloading = true;
			const url = URL.createObjectURL(file.resultBlob);
			const a = document.createElement("a");
			a.href = url;
			a.download =
				file.resultName ||
				file.name.replace(/\.[^/.]+$/, "") + "." + selectedFormat;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			setTimeout(() => {
				downloading = false;
			}, 500);
		}
	}
</script>

<div class="file-card">
	<div class="file-card-header">
		<div class="file-icon">
			<span class="file-type-badge pdf">PDF</span>
		</div>
		<div class="file-name-area">
			<span class="file-name">{file.name}</span>
			<span class="file-meta-inline">
				{formatFileSize(file.size)} · {file.pages || "—"} pages
			</span>
		</div>
		<div class="file-actions">
			{#if file.status === "error"}
				<button
					class="btn-icon"
					on:click={handleRetry}
					title="Retry"
				>
					🔄
				</button>
			{/if}
			<button
				class="btn-icon btn-remove"
				on:click={handleRemove}
				title="Remove"
			>
				✕
			</button>
		</div>
	</div>

	<div class="file-card-body">
		<div class="format-select-area">
			<span class="format-label">Output</span>
			<select
				class="format-select"
				value={selectedFormat}
				on:change={handleFormatChange}
			>
				{#each formatOptions as opt}
					<option value={opt.value}>
						{opt.label}
					</option>
				{/each}
			</select>
		</div>

		{#if file.status === "uploading" || file.status === "converting"}
			<div class="progress-area">
				<div class="progress-bar">
					<div
						class="progress-fill"
						style="width: {file.progress}%"
					></div>
				</div>
				<span class="progress-text">{file.progress}%</span>
			</div>
		{:else if file.status === "completed" && !file.needsConversion}
			<div class="completed-area">
				<span class="status-text">✅ Conversion complete</span>
				<button
					class="btn-download"
					class:downloading
					on:click={handleDownload}
				>
					{#if downloading}
						<span class="dl-spinner"></span>
					{:else}
						⬇ Download {selectedFormat.toUpperCase()}
					{/if}
				</button>
			</div>
		{:else if file.status === "completed" && file.needsConversion}
			<div class="needs-conversion-area">
				<span class="status-text">
					⚠️ Format changed — not converted
				</span>
				<button class="btn-convert-single" on:click={handleConvert}>
					🔄 Convert to {selectedFormat.toUpperCase()}
				</button>
			</div>
		{:else if file.status === "error"}
			<div class="error-area">
				<span class="status-text">❌ Conversion failed</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.file-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.file-card:hover {
		box-shadow: var(--shadow-md);
	}

	.file-card-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-bottom: 1px solid var(--border);
	}

	.file-type-badge {
		display: inline-block;
		padding: 4px 8px;
		background: var(--bg-muted);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.05em;
		color: var(--fg-muted);
	}

	.file-type-badge.pdf {
		background: #fee;
		color: #c00;
		border-color: #fcc;
	}

	.file-name-area {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.file-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--fg-heading);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-meta-inline {
		font-size: 12px;
		color: var(--fg-muted);
	}

	.file-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.btn-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 14px;
		transition: background 0.15s ease;
	}
	.btn-icon:hover {
		background: var(--bg-muted);
	}
	.btn-remove:hover {
		background: #fee;
	}

	.file-card-body {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.format-select-area {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.format-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-muted);
		white-space: nowrap;
	}

	.format-select {
		flex: 1;
		padding: 6px 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--bg);
		color: var(--fg);
		font-size: 13px;
		font-family: inherit;
		cursor: pointer;
	}
	.format-select:focus {
		outline: none;
		border-color: var(--accent);
	}

	.progress-area {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.progress-bar {
		flex: 1;
		height: 6px;
		background: var(--bg-muted);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--accent) 0%,
			var(--accent-light) 100%
		);
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-muted);
		min-width: 36px;
		text-align: right;
	}

	.completed-area,
	.error-area,
	.needs-conversion-area {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.status-text {
		font-size: 13px;
		color: var(--fg);
		font-weight: 500;
	}

	.btn-download {
		margin-left: auto;
		padding: 6px 14px;
		background: linear-gradient(
			135deg,
			var(--accent) 0%,
			var(--accent-dark) 100%
		);
		color: #fff;
		border: none;
		border-radius: var(--radius-md);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.btn-download:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}
	.btn-download.downloading {
		background: var(--bg-muted);
		cursor: not-allowed;
		transform: none;
	}

	.btn-convert-single {
		margin-left: auto;
		padding: 6px 14px;
		background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
		color: #fff;
		border: none;
		border-radius: var(--radius-md);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.btn-convert-single:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.dl-spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
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
</style>
