/**
 * pdfExtractor.js — Uses PdfReader from ebfConverter for PDF text/image extraction.
 */
import { PdfReader } from "@ebfConverter";

export { PdfReader };

/**
 * Extract text and images from a PDF file.
 * @param {ArrayBuffer} arrayBuffer
 * @param {Function} [onProgress] — callback with 0-100 progress
 * @returns {Promise<{text: string, images: Array}>}
 */
export async function extractTextAndImages(arrayBuffer, onProgress) {
	const reader = new PdfReader();
	return reader.extractTextAndImages(arrayBuffer, onProgress);
}

/**
 * Extract PDF metadata (title, author, page count).
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<{title?: string, author?: string, numPages: number}|null>}
 */
export async function extractMetadata(arrayBuffer) {
	const reader = new PdfReader();
	return reader.getMetadata(arrayBuffer);
}
