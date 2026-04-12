<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { formatFileSize } from '@ebfConverter';
	import { fade } from 'svelte/transition';

	export let file = null;
	export let formatOptions = [];
	export let selectedFormat = "epub";
	export let folded = false;
	export let translator = null;

	const dispatch = createEventDispatcher();

	let downloading = false;
	let previews = [];
	let logMessages = [];
	let removing = false;
	let folding = false;

	$: safeFormat = (() => {
		const fmt = typeof selectedFormat === 'string' ? selectedFormat.toLowerCase() : 'epub';
		const validFormats = ['epub', 'fb2', 'mobi', 'azw3', 'txt'];
		return validFormats.includes(fmt) ? fmt : 'epub';
	})();

	function t(key, params = {}) {
		if (!translator) return key;
		let text = translator.t(key);
		Object.keys(params).forEach(k => {
			text = text.replace(`{${k}}`, params[k]);
		});
		return text;
	}

	$: statusBorderClass = (() => {
		if (!file) return '';
		if (file.status === 'completed' && !file.needsConversion) return 'status-converted';
		if (file.status === 'completed' && file.needsConversion) return 'status-needs-conversion';
		if (file.status === 'error') return 'status-error';
		if (file.status === 'pending') return 'status-pending';
		return '';
	})();

	let pdfjsLib = null;
	async function getPDFjsLib() {
		if (!pdfjsLib) {
			pdfjsLib = await import('pdfjs-dist');
			pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
				'pdfjs-dist/build/pdf.worker.min.mjs',
				import.meta.url
			).toString();
		}
		return pdfjsLib;
	}

	async function generatePreviews() {
		if (!file || !file.file || file.file.type !== 'application/pdf') return;
		try {
			const lib = await getPDFjsLib();
			const arrayBuffer = await file.file.arrayBuffer();
			const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
			const numPages = Math.min(pdf.numPages, 3);
			const newPreviews = [];
			for (let i = 1; i <= numPages; i++) {
				const page = await pdf.getPage(i);
				const viewport = page.getViewport({ scale: 0.5 });
				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				await page.render({ canvasContext: context, viewport }).promise;
				newPreviews.push(canvas.toDataURL('image/jpeg', 0.7));
			}
			previews = newPreviews;
		} catch (e) {
			console.error('Error generating previews:', e);
		}
	}

	$: if (file) {
		const newMsgs = [];
		if (file.status === 'pending') newMsgs.push({ type: 'info', text: t('filepage_waiting') });
		if (file.status === 'uploading') newMsgs.push({ type: 'info', text: `${t('filepage_uploading')} ${file.progress || 0}%` });
		if (file.status === 'converting') newMsgs.push({ type: 'info', text: t('filepage_converting', { format: safeFormat.toUpperCase(), progress: file.progress }) });
		if (file.status === 'completed') newMsgs.push({ type: 'success', text: t('filepage_complete') });
		if (file.status === 'error') newMsgs.push({ type: 'error', text: file.error || t('filepage_failed') });
		logMessages = newMsgs;
	}

	onMount(() => {
		generatePreviews();
	});

	function handleFormatChange(e) {
		dispatch('formatChange', { id: file.id, format: e.target.value });
	}

	function handleRemove() {
		removing = true;
		setTimeout(() => {
			dispatch('remove', file.id);
		}, 500);
	}

	function handleRetry() {
		dispatch('retry', file.id);
	}

	function handleConvert() {
		dispatch('convert', file.id);
	}

	function handleDownload() {
		if (file.resultBlob) {
			downloading = true;
			const url = URL.createObjectURL(file.resultBlob);
			const a = document.createElement("a");
			a.href = url;
			a.download = file.resultName || file.name.replace(/\.[^/.]+$/, "") + "." + safeFormat;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			setTimeout(() => { downloading = false; }, 500);
		}
	}

	function handleDownloadOriginal() {
		if (file.file) {
			const url = URL.createObjectURL(file.file);
			const a = document.createElement("a");
			a.href = url;
			a.download = file.name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	}

	function handleFold() {
		folding = true;
		setTimeout(() => {
			folded = true;
			folding = false;
			dispatch('fold', file.id);
		}, 300);
	}

	function handleUnFold() {
		folding = true;
		setTimeout(() => {
			folded = false;
			folding = false;
			dispatch('unfold', file.id);
		}, 300);
	}

	function handleClose() {
		handleRemove();
	}
</script>

<div class="file-page {statusBorderClass}" class:folded class:removing class:folding>
	<div class="page-inner">

		{#if folded}
			<div class="folded-layout" transition:fade={{ duration: 300 }}>
				<div class="folded-preview">
					{#if previews.length > 0}
						<img src={previews[0]} alt={t('filepage_pages') + ' 1'} />
					{:else}
						<span class="folded-placeholder">📄</span>
					{/if}
				</div>

				<div class="folded-body">
					<div class="folded-header">
						<span class="folded-name">{file?.name || '—'}</span>
						<span class="folded-meta">{formatFileSize(file?.size)} · {file?.pages || '—'} pages</span>
					</div>
					<div class="folded-controls">
						<div class="folded-format">
							<span class="folded-format-label">{t('filepage_formatLabel')}</span>
							<select class="folded-format-select" value={safeFormat} on:change={handleFormatChange}>
								{#each formatOptions as opt}
									<option value={opt.value}>{opt.icon} {opt.label}</option>
								{/each}
							</select>
						</div>
						<div class="folded-action">
							<button class="btn-dl-orig-sm" on:click={handleDownloadOriginal} title={t('filepage_downloadOriginal')}>
								📥
							</button>
							{#if file?.status === "completed" && !file?.needsConversion}
								<button class="btn-dl-sm" class:downloading on:click={handleDownload}>
									{#if downloading}<span class="dl-spinner"></span>{:else}⬇ {safeFormat.toUpperCase()}{/if}
								</button>
							{:else if file?.status === "completed" && file?.needsConversion}
								<button class="btn-convert-sm" on:click={handleConvert}>🔄 Convert</button>
							{:else if file?.status === "error"}
								<button class="btn-retry-sm" on:click={handleRetry}>🔄 {t('filepage_retry')}</button>
							{:else if file?.status === "pending"}
								<button class="btn-convert-sm" on:click={handleConvert}>🔄 Convert</button>
							{:else}
								<button class="btn-convert-sm" disabled={file?.status === 'converting' || file?.status === 'uploading'} on:click={handleConvert}>
									{#if file?.status === 'converting' || file?.status === 'uploading'}<span class="btn-spinner"></span>{/if}
									{t('filepage_convert')}
								</button>
							{/if}
						</div>
					</div>
					{#if file?.status === 'uploading' || file?.status === 'converting'}
						<div class="folded-progress">
							<div class="folded-progress-bar">
								<div class="folded-progress-fill" style="width: {file?.progress || 0}%"></div>
							</div>
							<span class="folded-progress-text">{file?.progress || 0}%</span>
						</div>
					{/if}
					{#if file?.status === 'error' && file?.error}
						<div class="folded-error">
							<span class="folded-error-text">❌ {file.error}</span>
						</div>
					{/if}
				</div>

				<div class="folded-tools">
					<button class="tool-btn" on:click={handleRemove} title={t('filepage_remove')}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="3 6 5 6 21 6"></polyline>
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
						</svg>
					</button>
					<button class="tool-btn" on:click={handleUnFold} title={t('filepage_unfold')}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="15 3 21 3 21 9"></polyline>
							<polyline points="9 21 3 21 3 15"></polyline>
							<line x1="21" y1="3" x2="14" y2="10"></line>
							<line x1="3" y1="21" x2="10" y2="14"></line>
						</svg>
					</button>
				</div>
			</div>
		{:else}
			<div class="page-layout" transition:fade={{ duration: 300 }}>
				<div class="col-preview">
					{#if previews.length > 0}
						<div class="preview-main">
							<img src={previews[0]} alt={t('filepage_pages') + ' 1'} class="preview-img" />
						</div>
						{#if previews.length > 1}
							<div class="preview-thumbnails">
								{#each previews.slice(1) as preview, i}
									<div class="preview-thumb">
										<img src={preview} alt={t('filepage_pages') + ' ' + (i + 2)} />
									</div>
								{/each}
							</div>
						{/if}
					{:else}
						<div class="preview-placeholder">
							<span class="placeholder-icon">📄</span>
							<span class="placeholder-text">{t('filepage_noPreview')}</span>
						</div>
					{/if}
				</div>

				<div class="col-info">
					<div class="info-panel file-info">
						<div class="info-header">
							<span class="info-icon">📄</span>
							<span class="info-title">{t('filepage_fileInfo')}</span>
						</div>
						<div class="info-body">
							<div class="info-row">
								<span class="info-label">{t('filepage_name')}</span>
								<span class="info-value">{file?.name || '—'}</span>
							</div>
							<div class="info-row">
								<span class="info-label">{t('filepage_size')}</span>
								<span class="info-value">{formatFileSize(file?.size)}</span>
							</div>
							<div class="info-row">
								<span class="info-label">{t('filepage_pages')}</span>
								<span class="info-value">{file?.pages || '—'}</span>
							</div>
							{#if file?.title}
								<div class="info-row">
									<span class="info-label">{t('filepage_title')}</span>
									<span class="info-value">{file.title}</span>
								</div>
							{/if}
							{#if file?.author}
								<div class="info-row">
									<span class="info-label">{t('filepage_author')}</span>
									<span class="info-value">{file.author}</span>
								</div>
							{/if}
						</div>
					</div>

					<div class="info-panel format-panel">
						<span class="panel-label">📄 {t('filepage_formatLabel')}</span>
						<select class="format-select" value={safeFormat} on:change={handleFormatChange}>
							{#each formatOptions as opt}
								<option value={opt.value}>{opt.icon} {opt.label}</option>
							{/each}
						</select>
					</div>

					<div class="info-panel action-panel">
						{#if file?.status === "completed" && !file?.needsConversion}
							<button class="btn-download" class:downloading on:click={handleDownload}>
								{#if downloading}<span class="dl-spinner"></span>{:else}⬇ Download {safeFormat.toUpperCase()}{/if}
							</button>
						{:else if file?.status === "completed" && file?.needsConversion}
							<button class="btn-convert" on:click={handleConvert}>🔄 Convert to {safeFormat.toUpperCase()}</button>
						{:else if file?.status === "error"}
							<button class="btn-retry" on:click={handleRetry}>🔄 {t('filepage_retry')}</button>
						{:else if file?.status === "pending"}
							<button class="btn-convert" on:click={handleConvert}>🔄 Convert to {safeFormat.toUpperCase()}</button>
						{:else}
							<button class="btn-convert" disabled={file?.status === 'converting' || file?.status === 'uploading'} on:click={handleConvert}>
								{#if file?.status === 'converting' || file?.status === 'uploading'}<span class="btn-spinner"></span>{/if}
								{t('filepage_convert')}
							</button>
						{/if}
						<button class="btn-download-original" on:click={handleDownloadOriginal}>
							📥 {t('filepage_downloadOriginal')}
						</button>
					</div>

					<div class="info-panel log-panel">
						<span class="panel-label">{t('filepage_logInfo')}</span>
						<div class="log-content">
							{#if logMessages.length > 0}
								{#each logMessages as msg}
									<div class="log-entry" class:log-info={msg.type === 'info'} class:log-success={msg.type === 'success'} class:log-error={msg.type === 'error'}>
										{msg.text}
									</div>
								{/each}
							{:else}
								<span class="log-empty">{t('filepage_waiting')}</span>
							{/if}
						</div>
					</div>
				</div>

				<div class="col-tools">
					<button class="tool-btn" on:click={handleClose} title={t('filepage_close')}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
					<button class="tool-btn" on:click={handleFold} title={t('filepage_fold')}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="4 14 10 14 10 20"></polyline>
							<polyline points="20 10 14 10 14 4"></polyline>
							<line x1="14" y1="10" x2="21" y2="3"></line>
							<line x1="3" y1="21" x2="10" y2="14"></line>
						</svg>
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.file-page {
		background: var(--bg-card);
		border: 3px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
	}

	.file-page:hover {
		box-shadow: var(--shadow-md);
	}

	.file-page.status-converted { border-color: var(--accent); }
	.file-page.status-needs-conversion { border-color: #f39c12; }
	.file-page.status-error { border-color: #e74c3c; }
	.file-page.status-pending { border-color: #3498db; }

	.file-page.removing {
		opacity: 0;
		transform: translateX(100%);
		pointer-events: none;
		transition: opacity 0.5s ease, transform 0.5s ease;
	}

	.file-page.folding {
		opacity: 0.5;
		pointer-events: none;
	}

	.page-inner {
		padding: 8px;
	}

	.page-layout {
		display: flex;
		gap: 0;
	}

	.col-preview {
		flex: 0 0 30%;
		max-width: 30%;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-right: 1px solid var(--border);
	}

	.preview-main {
		width: 100%;
		aspect-ratio: 3/4;
		background: var(--bg-muted);
		border-radius: var(--radius-md);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.preview-thumbnails {
		display: flex;
		gap: 6px;
	}

	.preview-thumb {
		flex: 1;
		aspect-ratio: 3/4;
		background: var(--bg-muted);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.preview-thumb img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.preview-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 180px;
		gap: 8px;
	}

	.placeholder-icon { font-size: 40px; opacity: 0.5; }
	.placeholder-text { font-size: 11px; color: var(--fg-muted); }

	.col-info {
		flex: 1;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.info-panel {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 10px;
	}

	.info-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
	}

	.info-icon { font-size: 16px; }
	.info-title { font-size: 13px; font-weight: 600; color: var(--fg-heading); }

	.info-body { display: flex; flex-direction: column; gap: 6px; }

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	.info-label { font-size: 11px; color: var(--fg-muted); font-weight: 500; }

	.info-value {
		font-size: 11px;
		color: var(--fg);
		font-weight: 600;
		text-align: right;
		max-width: 55%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.panel-label {
		display: block;
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-muted);
		margin-bottom: 6px;
	}

	.format-select {
		width: 100%;
		padding: 6px 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--bg-card);
		color: var(--fg);
		font-size: 12px;
		font-family: inherit;
		cursor: pointer;
	}

	.format-select:focus { outline: none; border-color: var(--accent); }

	.action-panel { display: flex; flex-direction: column; gap: 6px; justify-content: center; }

	.btn-download-original {
		width: 100%;
		padding: 8px 16px;
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: transparent;
		color: var(--fg-muted);
	}

	.btn-download-original:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-muted);
	}

	.btn-convert, .btn-download, .btn-retry {
		width: 100%;
		padding: 10px 16px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: var(--bg);
		color: var(--fg);
	}

	.btn-convert:hover:not(:disabled) {
		border-color: var(--accent);
	}

	.btn-convert:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-download {
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
		color: #fff;
		border: none;
	}

	.btn-download:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
	.btn-download.downloading { background: var(--bg-muted); cursor: not-allowed; transform: none; }

	.btn-retry {
		background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
		color: #fff;
		border: none;
	}

	.btn-retry:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }

	.log-panel { flex: 1; min-height: 60px; display: flex; flex-direction: column; }

	.log-content {
		flex: 1;
		max-height: 80px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.log-entry {
		font-size: 10px;
		padding: 3px 6px;
		border-radius: var(--radius-sm);
		font-family: 'JetBrains Mono', monospace;
	}

	.log-info { background: var(--bg-muted); color: var(--fg-muted); }
	.log-success { background: rgba(88, 214, 141, 0.15); color: var(--accent); }
	.log-error { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }
	.log-empty { font-size: 10px; color: var(--fg-muted); opacity: 0.6; }

	.col-tools {
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

	.tool-btn {
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

	.tool-btn:hover { background: var(--bg-muted); color: var(--fg); border-color: var(--accent); }
	.tool-btn svg { width: 16px; height: 16px; }

	.btn-spinner, .dl-spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin { to { transform: rotate(360deg); } }

	.file-page.folded {
		border-radius: var(--radius-md);
	}

	.file-page.folded .page-inner {
		padding: 4px;
	}

	.folded-layout {
		display: flex;
		align-items: stretch;
		gap: 0;
		min-height: 72px;
	}

	.folded-preview {
		flex: 0 0 56px;
		width: 56px;
		min-height: 100%;
		background: var(--bg-muted);
		border-radius: var(--radius-sm);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 4px 0 4px 4px;
	}

	.folded-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.folded-placeholder {
		font-size: 24px;
		opacity: 0.4;
	}

	.folded-body {
		flex: 1;
		padding: 8px 12px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 6px;
		min-width: 0;
	}

	.folded-header {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.folded-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-heading);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.folded-meta {
		font-size: 11px;
		color: var(--fg-muted);
	}

	.folded-controls {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.folded-format {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.folded-format-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-muted);
		white-space: nowrap;
	}

	.folded-format-select {
		padding: 4px 8px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--bg-card);
		color: var(--fg);
		font-size: 11px;
		font-family: inherit;
		cursor: pointer;
	}

	.folded-format-select:focus { outline: none; border-color: var(--accent); }

	.folded-action {
		display: flex;
		align-items: center;
		margin-left: auto;
	}

	.btn-convert-sm, .btn-dl-sm, .btn-retry-sm {
		padding: 5px 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		white-space: nowrap;
		background: var(--bg);
		color: var(--fg);
	}

	.btn-convert-sm:hover:not(:disabled) {
		border-color: var(--accent);
	}

	.btn-convert-sm:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-dl-sm {
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
		color: #fff;
		border: none;
	}

	.btn-dl-sm:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
	.btn-dl-sm.downloading { background: var(--bg-muted); cursor: not-allowed; transform: none; }

	.btn-retry-sm {
		background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
		color: #fff;
		border: none;
	}

	.btn-retry-sm:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }

	.btn-dl-orig-sm {
		padding: 5px 10px;
		border: 1px dashed var(--border);
		border-radius: var(--radius-sm);
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: var(--fg-muted);
	}

	.btn-dl-orig-sm:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-muted);
	}

	.folded-progress {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 2px;
	}

	.folded-progress-bar {
		flex: 1;
		height: 4px;
		background: var(--bg-muted);
		border-radius: 2px;
		overflow: hidden;
	}

	.folded-progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%);
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.folded-progress-text {
		font-size: 10px;
		font-weight: 600;
		color: var(--fg-muted);
		min-width: 28px;
		text-align: right;
	}

	.folded-error {
		margin-top: 2px;
	}

	.folded-error-text {
		font-size: 10px;
		color: #e74c3c;
		font-weight: 500;
	}

	.folded-tools {
		flex: 0 0 36px;
		width: 36px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 4px 2px;
		border-left: 1px solid var(--border);
		background: var(--bg);
	}

	.folded-tools .tool-btn {
		width: 28px;
		height: 28px;
	}

	.folded-tools .tool-btn svg {
		width: 14px;
		height: 14px;
	}

	@media (max-width: 768px) {
		.page-layout {
			flex-direction: column;
		}

		.col-preview {
			flex: none;
			max-width: 100%;
			border-right: none;
			border-bottom: 1px solid var(--border);
		}

		.col-tools {
			flex: none;
			max-width: 100%;
			flex-direction: row;
			justify-content: center;
			border-left: none;
			border-top: 1px solid var(--border);
			padding: 6px;
		}

		.preview-main { max-height: 180px; }

		.folded-layout {
			flex-direction: row;
		}

		.folded-tools {
			flex-direction: column;
			border-left: 1px solid var(--border);
			border-top: none;
		}
	}

	@media (max-width: 480px) {
		.folded-layout {
			flex-wrap: wrap;
		}

		.folded-preview {
			flex: 0 0 48px;
			width: 48px;
			margin: 3px 0 3px 3px;
		}

		.folded-body {
			padding: 6px 8px;
		}

		.folded-controls {
			flex-direction: column;
			align-items: stretch;
			gap: 6px;
		}

		.folded-format {
			justify-content: space-between;
		}

		.folded-action {
			margin-left: 0;
		}

		.folded-action button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
