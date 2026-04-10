/**
 * textCleaner.js — Uses StructureAnalyzer from ebfConverter for text cleaning.
 */
import { StructureAnalyzer } from "@ebfConverter";

export { StructureAnalyzer };

/**
 * Clean raw PDF-extracted text.
 * @param {string} text
 * @returns {string}
 */
export function cleanPdfText(text) {
	const analyzer = new StructureAnalyzer();
	return analyzer.cleanDocumentText(text);
}
