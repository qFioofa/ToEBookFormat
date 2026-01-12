<script>
	import { onMount } from "svelte";

	export let fileName = null;
	export let uploadProgress = null;
	export let status = null;
	export let fileSize = null;
	export let fileType = null;
	export let onRetry = () => {};
	export let onDelete = () => {};
	export let onInfo = () => {};
	export let translations = {
		noFile: "No file",
		uploading: "In progress",
		completed: "Completed",
		error: "Erro",
		retry: "Retry",
		close: "Close",
	};

	let isCompleted = false;
	let isError = false;
	let isEmpty = false;

	$: isCompleted = status === "completed";
	$: isError = status === "error";
	$: isEmpty = !fileName && !fileSize && !fileType;
</script>

<div class="file-card">
	{#if isEmpty}
		<div class="empty-state">
			<span class="empty-text">{translations.noFile}</span>
			<button class="close-button" on:click={onDelete}>
				{translations.close}
			</button>
		</div>
	{:else}
		<div class="card-header">
			<span class="file-name">{fileName}</span>
			{#if isError}
				<button class="icon-button error-icon" on:click={onDelete}>
					✕
				</button>
			{:else if isCompleted}
				<button class="icon-button info-icon" on:click={onInfo}>
					(i)
				</button>
			{:else}
				<span class="progress-text">{uploadProgress}%</span>
			{/if}
		</div>

		<div class="file-meta">
			<span class="file-size">{fileSize}</span>
			<span class="file-type">{fileType}</span>
		</div>

		<div class="status-bar">
			{#if isError}
				<span class="status error">{translations.error}</span>
				<button class="retry-button" on:click={onRetry}>
					<span class="spinner"></span>
					{translations.retry}
				</button>
			{:else if isCompleted}
				<span class="status completed">{translations.completed}</span>
			{:else}
				<span class="status uploading">{translations.uploading}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.file-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-md);
		width: 300px;
		font-family: var(--font-family-base);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-sm);
	}

	.file-name {
		font-weight: var(--font-weight-bold);
		color: var(--fg);
		max-width: 70%;
		word-break: break-word;
	}

	.progress-text {
		font-size: var(--font-size-sm);
		color: var(--fg-muted);
		font-weight: var(--font-weight-medium);
	}

	.icon-button {
		background: none;
		border: none;
		font-size: var(--font-size-lg);
		cursor: pointer;
		padding: var(--spacing-xs);
		border-radius: var(--radius-full);
	}

	.info-icon {
		color: var(--info);
	}

	.error-icon {
		color: var(--danger);
	}

	.file-meta {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
		color: var(--fg-muted);
	}

	.status-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.status {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	.uploading {
		background: var(--bg-muted);
		color: var(--accent);
	}

	.completed {
		background: var(--success);
		color: white;
	}

	.error {
		background: var(--danger);
		color: white;
	}

	.retry-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: var(--bg-muted);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-sm);
		color: var(--fg);
		cursor: pointer;
	}

	.spinner {
		width: 12px;
		height: 12px;
		border: 2px solid transparent;
		border-top: 2px solid var(--fg);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 120px;
		text-align: center;
	}

	.empty-text {
		color: var(--fg-muted);
		margin-bottom: var(--spacing-sm);
		font-size: var(--font-size-sm);
	}

	.close-button {
		background: var(--danger);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-sm);
		cursor: pointer;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 1200px) and (min-width: 769px) {
		.file-card {
			width: calc(50% - var(--spacing-md));
		}
	}

	@media (max-width: 768px) {
		.file-card {
			width: 100%;
		}

		.file-name {
			max-width: 60%;
		}
	}

	@media (max-width: 480px) {
		.file-card {
			padding: var(--spacing-sm);
		}

		.card-header {
			margin-bottom: var(--spacing-xs);
		}

		.file-meta {
			margin-bottom: var(--spacing-sm);
		}

		.empty-state {
			height: 100px;
		}
	}
</style>
