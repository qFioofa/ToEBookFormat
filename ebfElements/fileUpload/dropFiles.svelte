<script>
	export let onFilesDrop = () => {};
	export let translations = {};

	let draggedOver = false;
	let inputElement;

	function handleDragOver(e) {
		e.preventDefault();
		draggedOver = true;
	}

	function handleDragLeave() {
		draggedOver = false;
	}

	function handleDrop(e) {
		e.preventDefault();
		draggedOver = false;
		const droppedFiles = Array.from(e.dataTransfer.files);
		if (droppedFiles.length > 0) {
			onFilesDrop(droppedFiles);
		}
	}

	function handleClick() {
		inputElement.click();
	}

	function handleFileInput(e) {
		const selectedFiles = Array.from(e.target.files);
		if (selectedFiles.length > 0) {
			onFilesDrop(selectedFiles);
		}
	}

	function handleKeyDown(e) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleClick();
		}
	}
</script>

<div
	class="drop-area"
	class:dragged-over={draggedOver}
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:click={handleClick}
	on:keydown={handleKeyDown}
	role="button"
	tabindex="0"
>
	<div class="drop-content">
		<div class="upload-icon-wrapper">
			<span class="upload-icon">📁</span>
		</div>
		<p class="drop-text">
			{translations.dropFiles ||
				"Drop PDF files here or click to select"}
		</p>
		<input
			type="file"
			multiple
			bind:this={inputElement}
			on:change={handleFileInput}
			class="file-input"
			accept=".pdf,.epub,.fb2,.txt,.doc,.docx"
		/>
	</div>
</div>

<style>
	.drop-area {
		width: 100%;
		min-height: 140px;
		border: 2px dashed var(--border);
		border-radius: 10px;
		padding: 24px;
		background: var(--bg);
		transition: all 0.3s ease;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-family: inherit;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	.drop-area:hover {
		border-color: var(--accent-hover);
		background: var(--bg-muted);
	}

	.drop-area.dragged-over {
		border-color: var(--accent);
		background: var(--accent-muted);
		transform: scale(1.01);
	}

	.drop-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.upload-icon-wrapper {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--accent-muted);
		transition: all 0.3s ease;
	}

	.drop-area:hover .upload-icon-wrapper,
	.drop-area.dragged-over .upload-icon-wrapper {
		background: var(--accent);
	}

	.upload-icon {
		font-size: 22px;
	}

	.drop-text {
		color: var(--fg-heading);
		font-size: 0.9rem;
		font-weight: 500;
		margin: 0;
		user-select: none;
	}

	.file-input {
		display: none;
	}

	@media (max-width: 768px) {
		.drop-area {
			min-height: 110px;
			padding: 20px;
		}

		.upload-icon-wrapper {
			width: 38px;
			height: 38px;
		}

		.upload-icon {
			font-size: 18px;
		}

		.drop-text {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.drop-area {
			min-height: 90px;
			padding: 16px;
		}
	}
</style>
