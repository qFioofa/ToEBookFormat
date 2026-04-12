<script>
	import {
		PageLayout,
		LogoMain,
		ConvertPanel,
		FileControlPanel,
		HeroSection,
		FeaturesGrid,
		HowToUseSteps,
		FormatDetails,
		AboutSection,
		RemoveConfirmModal,
		FileManager,
		HeaderControls,
	} from "@ebfElements";
	import { GlobalTranslater } from "$lib/store/translater";
	import { GlobalStyleHandler } from "@ebfStyle";
	import {
		FORMAT_OPTIONS,
		generateId,
		formatFileSize,
		extractPdfMetadata,
		startConversion,
	} from "@ebfConverter";
	import { EN, RU } from "$lib/utils/translations";
	import { onMount } from "svelte";
	import { fade, slide } from "svelte/transition";
	import JSZip from "jszip";

	let isDark = true;
	let locale = "en";
	let showLangMenu = false;
	let uploadedFiles = [];
	let globalFormat = "epub";
	let showRemoveConfirm = false;
	let zipDownloading = false;
	let foldedFiles = new Set();
	let isConvertingAll = false;
	let panelFolded = false;

	const conversionHandlers = {};

	function toggleTheme() {
		isDark = !isDark;
		GlobalStyleHandler.setTheme(isDark ? "ebf-dark" : "ebf-light");
	}

	function switchToLang(lang) {
		GlobalTranslater.setLocale(lang);
		locale = lang;
		showLangMenu = false;
	}

	function toggleLangMenu() {
		showLangMenu = !showLangMenu;
	}

	$: completedCount = uploadedFiles.filter(
		(f) => f.status === "completed" && !f.needsConversion
	).length;
	$: totalCount = uploadedFiles.length;
	$: allCompleted = totalCount > 0 && completedCount === totalCount;
	$: anyConverting = uploadedFiles.some(
		(f) => f.status === "uploading" || f.status === "converting"
	);
	$: hasFiles = totalCount > 0;
	$: needsConversionCount = uploadedFiles.filter(
		(f) => f.needsConversion
	).length;
	$: pendingCount = uploadedFiles.filter(
		(f) => f.status === "pending"
	).length;
	$: allFolded = totalCount > 0 && foldedFiles.size === totalCount;

	function updateFile(id, changes) {
		const idx = uploadedFiles.findIndex((f) => f.id === id);
		if (idx === -1) return;
		const updated = { ...uploadedFiles[idx], ...changes };
		uploadedFiles = [
			...uploadedFiles.slice(0, idx),
			updated,
			...uploadedFiles.slice(idx + 1),
		];
	}

	function handleFilesDrop(files) {
		const newFiles = files.map((f) => ({
			id: generateId(),
			name: f.name,
			size: f.size,
			type: f.type || "application/pdf",
			file: f,
			format: globalFormat,
			progress: 0,
			status: "pending",
			resultBlob: null,
			resultName: null,
			pages: "—",
			author: null,
			title: null,
			lastModified: f.lastModified,
			needsConversion: true,
			error: null,
		}));

		uploadedFiles = [...uploadedFiles, ...newFiles];

		newFiles.forEach((file) => {
			validatePdf(file);
		});
	}

	async function validatePdf(file) {
		try {
			const slice = file.file.slice(0, 5);
			const buffer = await slice.arrayBuffer();
			const bytes = new Uint8Array(buffer);
			const signature = String.fromCharCode(...bytes);

			if (!signature.startsWith("%PDF")) {
				updateFile(file.id, {
					status: "error",
					progress: 0,
					error: "Not a valid PDF file. Please upload a .pdf file.",
				});
				return;
			}

			extractPdfMetadata(file).then(() => {
				updateFile(file.id, { pages: file.pages || "—" });
			});

			updateFile(file.id, { status: "pending" });
		} catch (e) {
			console.error("Error processing file:", e);
			updateFile(file.id, {
				status: "error",
				progress: 0,
				error: e.message || "Failed to process file",
			});
		}
	}

	function handleRemoveFile(id) {
		if (conversionHandlers[id]) {
			if (conversionHandlers[id].cancel) {
				conversionHandlers[id].cancel();
			}
			delete conversionHandlers[id];
		}
		uploadedFiles = uploadedFiles.filter((f) => f.id !== id);
	}

	async function handleRetry(id) {
		if (conversionHandlers[id]) {
			if (conversionHandlers[id].cancel) {
				conversionHandlers[id].cancel();
			}
			delete conversionHandlers[id];
		}
		updateFile(id, {
			status: "pending",
			progress: 0,
			resultBlob: null,
			resultName: null,
			needsConversion: true,
			error: null,
		});
		const file = uploadedFiles.find((f) => f.id === id);
		if (file) {
			validatePdf(file);
		}
	}

	async function handleConvert(id) {
		const file = uploadedFiles.find((f) => f.id === id);
		if (!file) return;

		if (file.status === "uploading" || file.status === "converting") return;

		if (conversionHandlers[id]) {
			if (conversionHandlers[id].cancel) {
				conversionHandlers[id].cancel();
			}
			delete conversionHandlers[id];
		}
		updateFile(id, {
			status: "uploading",
			progress: 0,
			resultBlob: null,
			resultName: null,
			needsConversion: false,
			error: null,
		});
		const updatedFile = uploadedFiles.find((f) => f.id === id);
		if (updatedFile) {
			conversionHandlers[updatedFile.id] = await startConversion(
				updatedFile,
				(changes) => {
					if (changes.status === "completed") {
						changes.needsConversion = false;
					}
					updateFile(updatedFile.id, changes);
				}
			);
		}
	}

	function handleFoldFile(id) {
		foldedFiles.add(id);
		foldedFiles = new Set(foldedFiles);
	}

	function handleUnFoldFile(id) {
		foldedFiles.delete(id);
		foldedFiles = new Set(foldedFiles);
	}

	function handleCloseFile(id) {
		handleRemoveFile(id);
	}

	function handleFileFormatChange(id, format) {
		const idx = uploadedFiles.findIndex((f) => f.id === id);
		if (idx === -1) return;
		const file = uploadedFiles[idx];

		const wasCompleted = file.status === "completed" && !file.needsConversion;
		const formatChanged = file.format !== format;

		uploadedFiles = [
			...uploadedFiles.slice(0, idx),
			{
				...file,
				format,
				needsConversion: wasCompleted && formatChanged ? true : file.needsConversion,
				resultBlob: wasCompleted && formatChanged ? null : file.resultBlob,
				resultName: wasCompleted && formatChanged ? null : file.resultName,
				status: wasCompleted && formatChanged ? "pending" : file.status,
			},
			...uploadedFiles.slice(idx + 1),
		];
	}

	function handleGlobalFormatChange(format) {
		globalFormat = format;
		uploadedFiles = uploadedFiles.map((f) => {
			const isProcessing = f.status === "uploading" || f.status === "converting";
			const wasCompleted = f.status === "completed" && !f.needsConversion;
			const formatChanged = f.format !== format;

			return {
				...f,
				format: format,
				status: wasCompleted && formatChanged ? "pending" : f.status,
				needsConversion: wasCompleted && formatChanged ? true : f.needsConversion,
				resultBlob: wasCompleted && formatChanged ? null : f.resultBlob,
				resultName: wasCompleted && formatChanged ? null : f.resultName,
			};
		});
	}

	async function convertAll() {
		if (isConvertingAll) return;
		isConvertingAll = true;

		try {
			const filesToConvert = uploadedFiles.filter(
				(f) =>
					(f.status === "pending" ||
					f.status === "error" ||
					f.needsConversion) &&
					f.status !== "uploading" &&
					f.status !== "converting"
			);

			if (filesToConvert.length === 0) {
				isConvertingAll = false;
				return;
			}

			const fileIdsToReset = [];
			filesToConvert.forEach((file) => {
				if (conversionHandlers[file.id]) {
					if (conversionHandlers[file.id].cancel) {
						conversionHandlers[file.id].cancel();
					}
					delete conversionHandlers[file.id];
				}
				if (file.status === "completed" || file.status === "error") {
					fileIdsToReset.push(file.id);
				}
			});

			const updatedFiles = uploadedFiles.map((f) => {
				if (fileIdsToReset.includes(f.id)) {
					return {
						...f,
						status: "uploading",
						progress: 0,
						resultBlob: null,
						resultName: null,
						needsConversion: false,
						error: null,
					};
				}
				return f;
			});
			uploadedFiles = updatedFiles;

			const conversionPromises = filesToConvert.map(async (file) => {
				const currentFile = uploadedFiles.find(
					(f) => f.id === file.id
				);
				if (!currentFile) return;

				if (
					currentFile.status === "pending" ||
					currentFile.status === "uploading"
				) {
					conversionHandlers[currentFile.id] =
						await startConversion(currentFile, (changes) => {
							if (changes.status === "completed") {
								changes.needsConversion = false;
							}
							updateFile(currentFile.id, changes);
						});
				}
			});

			await Promise.all(conversionPromises);
		} finally {
			isConvertingAll = false;
		}
	}

	async function downloadAllZip() {
		const completedFiles = uploadedFiles.filter(
			(f) => f.status === "completed" && f.resultBlob
		);
		if (completedFiles.length === 0) {
			console.warn("No completed files to download");
			return;
		}

		zipDownloading = true;

		try {
			const zip = new JSZip();
			const names = new Set();
			completedFiles.forEach((file) => {
				let name =
					file.resultName ||
					file.name.replace(/\.[^/.]+$/, "") + "." + file.format;
				let finalName = name;
				let counter = 1;
				while (names.has(finalName)) {
					finalName = name.replace(
						/(\.[^.]+)$/,
						` (${counter})$1`
					);
					counter++;
				}
				names.add(finalName);
				zip.file(finalName, file.resultBlob);
			});

			const blob = await zip.generateAsync({ type: "blob" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "converted_ebooks.zip";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error creating ZIP file:", error);
		} finally {
			setTimeout(() => {
				zipDownloading = false;
			}, 500);
		}
	}

	async function downloadAllSeparate() {
		const completedFiles = uploadedFiles.filter(
			(f) => f.status === "completed" && f.resultBlob
		);
		if (completedFiles.length === 0) {
			console.warn("No completed files to download");
			return;
		}

		// Download each file separately with a small delay
		for (const file of completedFiles) {
			const url = URL.createObjectURL(file.resultBlob);
			const a = document.createElement("a");
			a.href = url;
			a.download = file.resultName || file.name.replace(/\.[^/.]+$/, "") + "." + file.format;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			await new Promise(resolve => setTimeout(resolve, 300));
		}
	}

	function foldAllFiles() {
		foldedFiles = new Set(uploadedFiles.map(f => f.id));
	}

	function unfoldAllFiles() {
		foldedFiles = new Set();
	}

	function togglePanelFold() {
		panelFolded = !panelFolded;
	}

	function confirmRemoveAll() {
		showRemoveConfirm = true;
	}

	function cancelRemoveAll() {
		showRemoveConfirm = false;
	}

	function executeRemoveAll() {
		Object.values(conversionHandlers).forEach((handler) => {
			if (handler.cancel) handler.cancel();
		});
		Object.keys(conversionHandlers).forEach(
			(k) => delete conversionHandlers[k]
		);
		uploadedFiles = [];
		showRemoveConfirm = false;
	}

	GlobalTranslater.registerLocale("en", EN);
	GlobalTranslater.registerLocale("ru", RU);

	onMount(() => {
		GlobalTranslater.initTranslator();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link
		rel="icon"
		type="image/png"
		sizes="192x192"
		href="/icon-192.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="512x512"
		href="/icon-512.png"
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#key locale}
	<PageLayout
		howToUseSection={{ text: GlobalTranslater.t("nav_howToUse"), href: "#how-to-use" }}
		formatsSection={{ text: GlobalTranslater.t("nav_formats"), href: "#formats" }}
		aboutSection={{ text: GlobalTranslater.t("nav_about"), href: "#about" }}
	>
		<svelte:fragment slot="Logo">
			<LogoMain size="large" />
		</svelte:fragment>
		<svelte:fragment slot="Subtitle">
			{GlobalTranslater.t("header_subtitle")}
		</svelte:fragment>
		<svelte:fragment slot="Options">
			<HeaderControls
				{GlobalTranslater}
				{isDark}
				{locale}
				bind:showLangMenu
				on:toggleTheme={toggleTheme}
				on:switchLang={(e) => switchToLang(e.detail)}
			/>
		</svelte:fragment>

		<HeroSection {GlobalTranslater} />

		<section id="convert" class="convert-section">
			<div class="section-inner">
				<h2 class="section-title">
					{GlobalTranslater.t("convert_title")}
				</h2>

				<ConvertPanel
					{GlobalTranslater}
					{uploadedFiles}
					{globalFormat}
					formatOptions={FORMAT_OPTIONS}
					on:filesDrop={(e) => handleFilesDrop(e.detail)}
				>
					<svelte:fragment slot="files">
						<FileControlPanel
							{GlobalTranslater}
							{uploadedFiles}
							{globalFormat}
							formatOptions={FORMAT_OPTIONS}
							{zipDownloading}
							{allCompleted}
							{anyConverting}
							{allFolded}
							{panelFolded}
							on:globalFormatChange={(e) => handleGlobalFormatChange(e.detail)}
							on:removeAll={confirmRemoveAll}
							on:convertAll={convertAll}
							on:downloadZip={downloadAllZip}
							on:downloadAllSeparate={downloadAllSeparate}
							on:foldAll={foldAllFiles}
							on:unfoldAll={unfoldAllFiles}
							on:togglePanelFold={togglePanelFold}
						/>
						<FileManager
							{uploadedFiles}
							formatOptions={FORMAT_OPTIONS}
							{foldedFiles}
							translator={GlobalTranslater}
							on:formatChange={(e) =>
								handleFileFormatChange(
									e.detail.id,
									e.detail.format
								)}
							on:remove={(e) =>
								handleRemoveFile(e.detail)}
							on:retry={(e) => handleRetry(e.detail)}
							on:convert={(e) =>
								handleConvert(e.detail)}
							on:fold={(e) =>
								handleFoldFile(e.detail)}
							on:unfold={(e) =>
								handleUnFoldFile(e.detail)}
							on:close={(e) =>
								handleCloseFile(e.detail)}
						/>
					</svelte:fragment>
				</ConvertPanel>
			</div>
		</section>

		{#if showRemoveConfirm}
			<div
				class="modal-overlay"
				on:click={cancelRemoveAll}
				on:keydown={(e) =>
					e.key === "Escape" && cancelRemoveAll()}
				role="dialog"
				aria-modal="true"
				tabindex="0"
				in:fade={{ duration: 200 }}
			>
				<div in:slide={{ duration: 250, axis: "y" }}>
					<RemoveConfirmModal
						{GlobalTranslater}
						on:cancel={cancelRemoveAll}
						on:confirm={executeRemoveAll}
					/>
				</div>
			</div>
		{/if}

		<FormatDetails {GlobalTranslater} />
		<HowToUseSteps {GlobalTranslater} />
		<FeaturesGrid {GlobalTranslater} />
		<AboutSection {GlobalTranslater} />
	</PageLayout>
{/key}

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	:global(section[id]) {
		scroll-margin-top: 80px;
	}

	.convert-section {
		padding: 64px 0;
	}

	.convert-section .section-inner {
		width: 100%;
		max-width: 960px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.convert-section .section-title {
		text-align: center;
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 32px;
		line-height: 1.3;
		letter-spacing: -0.01em;
		background: linear-gradient(
			135deg,
			var(--fg-heading) 0%,
			var(--accent) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	@media (max-width: 768px) {
		.convert-section {
			padding: 48px 0;
		}

		.convert-section .section-inner {
			padding: 0 16px;
		}

		.convert-section .section-title {
			font-size: 1.35rem;
			margin-bottom: 24px;
		}
	}

	@media (max-width: 480px) {
		.convert-section {
			padding: 36px 0;
		}
	}
</style>
