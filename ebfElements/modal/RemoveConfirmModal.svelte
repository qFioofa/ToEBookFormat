<script>
	import { createEventDispatcher } from "svelte";

	export let GlobalTranslater;

	const dispatch = createEventDispatcher();

	function handleCancel() {
		dispatch("cancel");
	}

	function handleConfirm() {
		dispatch("confirm");
	}
</script>

<div
	class="modal"
	on:click|stopPropagation
	on:keydown|stopPropagation={(e) =>
		e.key === "Escape" && handleCancel()}
	role="button"
	tabindex="0"
>
	<div class="modal-icon">⚠️</div>
	<h3 class="modal-title">
		{GlobalTranslater.t("remove_all_confirm")}
	</h3>
	<div class="modal-actions">
		<button class="btn-modal-cancel" on:click={handleCancel} type="button">
			{GlobalTranslater.t("remove_all_cancel") || "Cancel"}
		</button>
		<button
			class="btn-modal-confirm"
			on:click={handleConfirm}
			type="button"
		>
			{GlobalTranslater.t("remove_all_confirm_btn") || "Remove"}
		</button>
	</div>
</div>

<style>
	.modal {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 32px;
		max-width: 380px;
		width: 90%;
		text-align: center;
		box-shadow: var(--shadow-xl);
	}

	.modal-icon {
		font-size: 40px;
		margin-bottom: 16px;
	}

	.modal-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--fg-heading);
		margin: 0 0 24px;
		line-height: 1.4;
	}

	.modal-actions {
		display: flex;
		gap: 10px;
		justify-content: center;
	}

	.btn-modal-cancel,
	.btn-modal-confirm {
		padding: 8px 20px;
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.btn-modal-cancel {
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--border);
	}

	.btn-modal-cancel:hover {
		background: var(--bg-muted);
	}

	.btn-modal-confirm {
		background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
		color: #fff;
		border: none;
	}

	.btn-modal-confirm:hover {
		background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
		transform: translateY(-1px);
	}

	@media (max-width: 480px) {
		.modal {
			padding: 24px 20px;
		}

		.modal-actions {
			flex-direction: column;
		}

		.btn-modal-cancel,
		.btn-modal-confirm {
			width: 100%;
		}
	}
</style>
