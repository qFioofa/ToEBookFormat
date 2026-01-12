<script>
	import IconUpload from "./IconUpload.svelte";

	export let files = [];
	export let translations = {};
	export let InfoFile;
	export let onFileRemove;
	export let onFileRetry;
	export let onFileInfo;
	export let onFilesDrop = () => {
		console.log(files);
	};

	let draggedOver = false;
	let inputElement;

	let handleDragOver = (e) => {
		e.preventDefault();
		draggedOver = true;
	};

	let handleDragLeave = () => {
		draggedOver = false;
	};

	let handleDrop = (e) => {
		e.preventDefault();
		draggedOver = false;

		const droppedFiles = Array.from(e.dataTransfer.files);
		if (onFilesDrop) {
			onFilesDrop(droppedFiles);
		}
	};

	let handleClick = () => {
		inputElement.click();
	};

	let handleFileInput = (e) => {
		const selectedFiles = Array.from(e.target.files);
		if (onFilesDrop) {
			onFilesDrop(selectedFiles);
		}
	};
</script>

<div
	class="drop-area"
	class:dragged-over={draggedOver}
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:click={handleClick}
	role="region"
	aria-labelledby="drop-area-label"
	tabindex="0"
>
	<div class="drop-content">
		<div class="upload-icon-wrapper">
			<IconUpload class="upload-icon" />
		</div>

		<p id="drop-area-label" class="drop-text">
			{translations.dropFiles ||
				"Перетащите файлы сюда или нажмите для выбора"}
		</p>

		<input
			type="file"
			multiple
			bind:this={inputElement}
			on:change={handleFileInput}
			class="file-input"
			accept=".pdf,.epub,.fb2,.txt,.doc,.docx"
			aria-labelledby="drop-area-label"
			aria-describedby="files-list"
		/>

		<div id="files-list" class="files-container" role="list">
			{#each files as file, i}
				<div role="listitem">
					<svelte:component
						this={InfoFile}
						fileName={file.name}
						uploadProgress={file.progress}
						status={file.status}
						fileSize={file.size}
						fileType={file.type}
						onRetry={() => onFileRetry?.(file.id)}
						onDelete={() => onFileRemove?.(file.id)}
						onInfo={() => onFileInfo?.(file.id)}
						{translations}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.drop-area {
		width: 350px;
		height: 280px;
		border: 2px dashed var(--border);
		border-radius: var(--radius-xl);
		padding: var(--spacing-xl);
		background: var(--bg-card);
		transition: all 0.3s ease;
		position: relative;
		cursor: pointer;
		box-shadow: var(--shadow);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		background-image: radial-gradient(
				circle at top left,
				var(--accent-light) 0%,
				transparent 20%
			),
			radial-gradient(
				circle at bottom right,
				var(--accent) 0%,
				transparent 20%
			),
			var(--bg-card);
		background-blend-mode: screen;
	}

	.drop-area:hover {
		border-color: var(--accent-hover);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.drop-area.dragged-over {
		border-color: var(--accent);
		background: var(--bg-overlay);
		transform: scale(1.02);
		box-shadow: var(--shadow-xl);
		animation: pulse 0.5s ease-in-out infinite alternate;
		background-blend-mode: normal;
		background-color: var(--bg-muted);
	}

	.drop-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		width: 100%;
		max-width: 280px;
	}

	.upload-icon-wrapper {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		background-color: var(--accent-muted);
		transition: all 0.3s ease;
	}

	.drop-area:hover .upload-icon-wrapper {
		background-color: var(--accent);
		transform: scale(1.1);
	}

	.drop-area.dragged-over .upload-icon-wrapper {
		background-color: var(--accent);
		transform: scale(1.15);
	}

	.upload-icon {
		width: 24px;
		height: 24px;
		color: white;
	}

	.drop-text {
		color: var(--fg-heading);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		text-align: center;
		margin: 0;
		user-select: none;
		transition: all 0.3s ease;
		line-height: var(--line-height-tight);
	}

	.drop-area:hover .drop-text {
		color: var(--fg);
		transform: translateY(-1px);
	}

	.file-input {
		display: none;
	}

	.files-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		width: 100%;
		justify-content: center;
		margin-top: var(--spacing-md);
	}

	@keyframes pulse {
		0% {
			box-shadow: var(--shadow);
		}
		100% {
			box-shadow: var(--shadow-xl);
		}
	}

	@media (max-width: 1200px) and (min-width: 769px) {
		.drop-area {
			width: 320px;
			height: 260px;
			padding: var(--spacing-lg);
		}
		.upload-icon-wrapper {
			width: 44px;
			height: 44px;
		}
		.upload-icon {
			width: 22px;
			height: 22px;
		}
		.files-container {
			gap: var(--spacing-xs);
		}
	}

	@media (max-width: 768px) {
		.drop-area {
			width: 300px;
			height: 240px;
			padding: var(--spacing-md);
		}
		.upload-icon-wrapper {
			width: 40px;
			height: 40px;
		}
		.upload-icon {
			width: 20px;
			height: 20px;
		}
		.drop-text {
			font-size: var(--font-size-sm);
		}
		.files-container {
			gap: var(--spacing-xs);
		}
	}

	@media (max-width: 480px) {
		.drop-area {
			width: 280px;
			height: 220px;
			padding: var(--spacing-sm);
		}
		.upload-icon-wrapper {
			width: 36px;
			height: 36px;
		}
		.upload-icon {
			width: 18px;
			height: 18px;
		}
		.drop-text {
			font-size: var(--font-size-xs);
		}
		.files-container {
			gap: var(--spacing-xs);
		}
	}
</style>
