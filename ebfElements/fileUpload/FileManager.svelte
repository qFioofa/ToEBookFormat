<script>
	import { FilePage } from "@ebfElements";
	import { createEventDispatcher } from "svelte";

	export let uploadedFiles = [];
	export let formatOptions = [];
	export let foldedFiles = new Set();
	export let translator;

	const dispatch = createEventDispatcher();

	function handleFormatChange(id, format) {
		dispatch("formatChange", { id, format });
	}

	function handleRemove(id) {
		dispatch("remove", id);
	}

	function handleRetry(id) {
		dispatch("retry", id);
	}

	function handleConvert(id) {
		dispatch("convert", id);
	}

	function handleFold(id) {
		dispatch("fold", id);
	}

	function handleUnfold(id) {
		dispatch("unfold", id);
	}

	function handleClose(id) {
		dispatch("close", id);
	}
</script>

<div class="files-list">
	{#each uploadedFiles as file (file.id)}
		<div data-file-id={file.id}>
			<FilePage
				file={file}
				{formatOptions}
				selectedFormat={file.format}
				folded={foldedFiles.has(file.id)}
				{translator}
				on:formatChange={(e) =>
					handleFormatChange(e.detail.id, e.detail.format)}
				on:remove={() => handleRemove(file.id)}
				on:retry={() => handleRetry(file.id)}
				on:convert={(e) => handleConvert(e.detail)}
				on:fold={(e) => handleFold(e.detail)}
				on:unfold={(e) => handleUnfold(e.detail)}
				on:close={(e) => handleClose(e.detail)}
			/>
		</div>
	{/each}
</div>

<style>
	.files-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.files-list > div {
		width: 100%;
	}

	@media (max-width: 768px) {
		.files-list {
			gap: 8px;
		}
	}
</style>
