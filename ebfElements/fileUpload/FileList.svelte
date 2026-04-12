<script>
	import { slide } from "svelte/transition";
	import { createEventDispatcher } from "svelte";
	import { FileCard } from "@ebfElements";

	export let uploadedFiles = [];
	export let formatOptions = [];
	export let translator = null;

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
</script>

<div class="files-list">
	{#each uploadedFiles as file (file.id)}
		<div
			data-file-id={file.id}
			transition:slide|local={{ duration: 300 }}
		>
			<FileCard
				file={file}
				{formatOptions}
				selectedFormat={file.format}
				{translator}
				onFormatChange={handleFormatChange}
				onRemove={handleRemove}
				onRetry={handleRetry}
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
</style>
