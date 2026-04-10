/**
 * converter.js — Thin wrapper around ebfConverter classes.
 * Re-exports all conversion utilities from the ebfConverter package.
 */
export {
	FORMAT_OPTIONS,
	generateId,
	formatFileSize,
	startConversion,
	extractPdfMetadata,
} from "@ebfConverter";
