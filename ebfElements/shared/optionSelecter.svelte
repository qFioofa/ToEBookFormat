<script>
	export let options = [];
	export let selectedOption = null;
	export let label = "";
	export let onOptionChange = () => {};

	function handleSelect(option) {
		selectedOption = option;
		onOptionChange(option);
	}
</script>

<div class="option-selecter">
	{#if label}
		<span class="option-label">{label}</span>
	{/if}
	<div class="options-grid">
		{#each options as option}
			<button
				class="option-btn"
				class:active={selectedOption === option.value}
				on:click={() => handleSelect(option.value)}
				type="button"
			>
				<span class="option-icon">{option.icon}</span>
				<span class="option-name">{option.label}</span>
				<span class="option-ext">{option.ext}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.option-selecter {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		width: 100%;
		align-items: center;
	}

	.option-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.options-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		justify-content: center;
	}

	.option-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--bg-card);
		color: var(--fg);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.option-btn:hover {
		border-color: var(--accent);
		background: var(--bg-muted);
		transform: translateY(-1px);
	}

	.option-btn.active {
		border-color: var(--accent);
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
		color: #fff;
		box-shadow: var(--shadow-md);
	}

	.option-btn.active .option-ext {
		color: rgba(255, 255, 255, 0.8);
	}

	.option-icon {
		font-size: var(--font-size-lg);
		line-height: 1;
	}

	.option-name {
		white-space: nowrap;
	}

	.option-ext {
		font-size: var(--font-size-xs);
		color: var(--fg-muted);
		margin-left: auto;
		padding-left: var(--spacing-xs);
		border-left: 1px solid var(--border);
	}

	@media (max-width: 768px) {
		.options-grid {
			gap: var(--spacing-xs);
		}

		.option-btn {
			flex: 1 1 calc(50% - var(--spacing-xs));
			justify-content: center;
		}
	}
</style>
