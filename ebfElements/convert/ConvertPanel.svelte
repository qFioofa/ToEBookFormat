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
	export let allFolded = false;

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

	function handleDownloadAllSeparate() {
		dispatch("downloadAllSeparate");
	}

	function handleFoldAll() {
		dispatch("foldAll");
	}

	function handleUnfoldAll() {
		dispatch("unfoldAll");
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

	.drop-zone-area {
		width: 100%;
	}
</style>
