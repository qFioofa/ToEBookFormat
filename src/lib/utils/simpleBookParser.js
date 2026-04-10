/**
 * simpleBookParser.js — Simple text parsing using StructureAnalyzer from ebfConverter.
 * Delegates to the same underlying classes as bookParser.js.
 */
import { StructureAnalyzer } from "@ebfConverter";

export { StructureAnalyzer };

/**
 * Clean raw PDF text using the StructureAnalyzer.
 * @param {string} text
 * @returns {string}
 */
export function cleanPdfText(text) {
	const analyzer = new StructureAnalyzer();
	return analyzer.cleanDocumentText(text);
}

/**
 * Parse and render text as HTML.
 * @param {string} text
 * @returns {string}
 */
export function textToHtml(text) {
	const analyzer = new StructureAnalyzer();
	return analyzer.renderHtml(text);
}

/**
 * Parse and render text as FB2 sections.
 * @param {string} text
 * @returns {string}
 */
export function textToFb2(text) {
	const analyzer = new StructureAnalyzer();
	return analyzer.renderFb2Sections(text);
}
