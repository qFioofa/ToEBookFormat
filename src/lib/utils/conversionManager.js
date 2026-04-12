/**
 * conversionManager.js — Manages file conversions using ebfConverter classes.
 * Wraps startConversion and extractPdfMetadata from @ebfConverter.
 */
import { generateId, extractPdfMetadata, startConversion } from "@ebfConverter";
import JSZip from "jszip";

export class ConversionManager {
	constructor() {
		this.conversionHandlers = {};
	}

	createFileEntry(file, globalFormat) {
		return {
			id: generateId(),
			name: file.name,
			size: file.size,
			type: file.type || "application/pdf",
			file: file,
			format: globalFormat,
			progress: 0,
			status: "pending",
			resultBlob: null,
			resultName: null,
			pages: "—",
			author: null,
			title: null,
			lastModified: file.lastModified,
			needsConversion: true,
			error: null,
		};
	}

	async handleFilesDrop(files, uploadedFiles, globalFormat, updateCallback) {
		const newFiles = files.map((f) => this.createFileEntry(f, globalFormat));
		const updatedFiles = [...uploadedFiles, ...newFiles];

		newFiles.forEach((file) => {
			extractPdfMetadata(file).then(() => {
				const idx = updatedFiles.findIndex((f) => f.id === file.id);
				if (idx !== -1) {
					updatedFiles[idx] = {
						...updatedFiles[idx],
						pages: file.pages || "—",
					};
					updateCallback(updatedFiles);
				}
			});

			(async () => {
				this.conversionHandlers[file.id] = await startConversion(
					file,
					(changes) => {
						const idx = updatedFiles.findIndex(
							(f) => f.id === file.id
						);
						if (idx !== -1) {
							updatedFiles[idx] = {
								...updatedFiles[idx],
								...changes,
							};
							updateCallback(updatedFiles);
						}
					}
				);
			})();
		});

		return updatedFiles;
	}

	removeFile(id, uploadedFiles) {
		if (this.conversionHandlers[id]) {
			if (this.conversionHandlers[id].cancel) {
				this.conversionHandlers[id].cancel();
			}
			delete this.conversionHandlers[id];
		}
		return uploadedFiles.filter((f) => f.id !== id);
	}

	async retryFile(id, uploadedFiles, updateCallback) {
		const file = uploadedFiles.find((f) => f.id === id);
		if (!file) return uploadedFiles;

		if (this.conversionHandlers[id]) {
			if (this.conversionHandlers[id].cancel) {
				this.conversionHandlers[id].cancel();
			}
			delete this.conversionHandlers[id];
		}

		const idx = uploadedFiles.findIndex((f) => f.id === id);
		if (idx === -1) return uploadedFiles;

		uploadedFiles[idx] = {
			...uploadedFiles[idx],
			status: "pending",
			progress: 0,
			resultBlob: null,
			resultName: null,
			needsConversion: true,
			error: null,
		};
		updateCallback(uploadedFiles);

		this.conversionHandlers[id] = await startConversion(
			uploadedFiles[idx],
			(changes) => {
				const fileIdx = uploadedFiles.findIndex(
					(f) => f.id === id
				);
				if (fileIdx !== -1) {
					uploadedFiles[fileIdx] = {
						...uploadedFiles[fileIdx],
						...changes,
					};
					updateCallback(uploadedFiles);
				}
			}
		);

		return uploadedFiles;
	}

	updateFileFormat(id, uploadedFiles, format) {
		const idx = uploadedFiles.findIndex((f) => f.id === id);
		if (idx === -1) return uploadedFiles;
		const file = uploadedFiles[idx];
		// If the file was completed, changing format means it needs re-conversion
		const needsConversion = file.status === "completed" && file.format !== format;
		uploadedFiles[idx] = {
			...file,
			format,
			needsConversion,
			// Clear old result and set to pending if format changed
			resultBlob: needsConversion ? null : file.resultBlob,
			resultName: needsConversion ? null : file.resultName,
			status: needsConversion ? "pending" : file.status,
		};
		return uploadedFiles;
	}

	updateGlobalFormat(globalFormat, uploadedFiles) {
		return uploadedFiles.map((f) => {
			const isProcessing = f.status === "uploading" || f.status === "converting";
			const isCompleted = f.status === "completed" && !f.needsConversion;
			const formatChanged = f.format !== globalFormat;

			return {
				...f,
				// Always update format to the new global format
				format: globalFormat,
				// Completed files need re-conversion if their format differs
				// Reset to pending so they are clearly marked as needing reconversion
				status: isCompleted && formatChanged ? "pending" : f.status,
				needsConversion: isCompleted && formatChanged ? true : f.needsConversion,
				// Clear old results
				resultBlob: isCompleted && formatChanged ? null : f.resultBlob,
				resultName: isCompleted && formatChanged ? null : f.resultName,
			};
		});
	}

	async convertAll(uploadedFiles, updateCallback) {
		for (const file of uploadedFiles) {
			if (
				file.status === "completed" ||
				file.status === "error" ||
				file.needsConversion
			) {
				if (this.conversionHandlers[file.id]) {
					if (this.conversionHandlers[file.id].cancel) {
						this.conversionHandlers[file.id].cancel();
					}
					delete this.conversionHandlers[file.id];
				}

				const idx = uploadedFiles.findIndex(
					(f) => f.id === file.id
				);
				uploadedFiles[idx] = {
					...uploadedFiles[idx],
					status: "uploading",
					progress: 0,
					resultBlob: null,
					resultName: null,
					needsConversion: false,
					error: null,
				};
				updateCallback(uploadedFiles);

				this.conversionHandlers[file.id] = await startConversion(
					uploadedFiles[idx],
					(changes) => {
						const fileIdx = uploadedFiles.findIndex(
							(f) => f.id === file.id
						);
						if (fileIdx !== -1) {
							uploadedFiles[fileIdx] = {
								...uploadedFiles[fileIdx],
								...changes,
							};
							updateCallback(uploadedFiles);
						}
					}
				);
			}
		}
		return uploadedFiles;
	}

	async downloadAllZip(uploadedFiles) {
		const completedFiles = uploadedFiles.filter(
			(f) => f.status === "completed" && f.resultBlob
		);
		if (completedFiles.length === 0) return;

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
	}

	removeAll(uploadedFiles) {
		Object.values(this.conversionHandlers).forEach((handler) => {
			if (handler.cancel) handler.cancel();
		});
		Object.keys(this.conversionHandlers).forEach(
			(k) => delete this.conversionHandlers[k]
		);
		return [];
	}

	cleanup() {
		Object.values(this.conversionHandlers).forEach((handler) => {
			if (handler.cancel) handler.cancel();
		});
		this.conversionHandlers = {};
	}
}
