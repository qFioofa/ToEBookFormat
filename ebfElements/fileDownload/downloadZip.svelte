<script>
	export let fileName = "ebook";
	export let fileFormat = "epub";
	export let fileSize = "0 KB";
	export let onDownload = () => {};
	export let translations = {
		download: "Download",
		downloadReady: "Ready to download",
		filePreparing: "Preparing file...",
	};

	let isDownloading = false;

	function handleDownload() {
		isDownloading = true;
		onDownload();
		setTimeout(() => {
			isDownloading = false;
		}, 500);
	}

	$: icon = isDownloading ? "⏳" : "📥";
	$: label = isDownloading ? translations.filePreparing : translations.download;
</script>

<div class="download-zone">
	<div class="download-info">
		<span class="download-icon">{icon}</span>
		<div class="download-details">
			<span class="download-filename">{fileName}.{fileFormat}</span>
			<span class="download-size">{fileSize}</span>
		</div>
	</div>
	<button
		class="download-btn"
		class:downloading={isDownloading}
		on:click={handleDownload}
		type="button"
	>
		{label}
	</button>
</div>

<style>
	.download-zone {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		width: 100%;
	}

	.download-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.download-icon {
		font-size: var(--font-size-xxl);
		line-height: 1;
	}

	.download-details {
		display: flex;
		flex-direction: column;
	}

	.download-filename {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		color: var(--fg-heading);
		word-break: break-all;
	}

	.download-size {
		font-size: var(--font-size-xs);
		color: var(--fg-muted);
	}

	.download-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-bold);
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		white-space: nowrap;
	}

	.download-btn:hover:not(.downloading) {
		background: var(--accent-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.download-btn:active {
		transform: translateY(0);
	}

	.download-btn.downloading {
		background: var(--bg-muted);
		color: var(--fg-muted);
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.download-zone {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}

		.download-info {
			justify-content: center;
		}

		.download-btn {
			width: 100%;
		}
	}
</style>
