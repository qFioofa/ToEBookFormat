/**
 * bookParser.js — Uses BookModel and StructureAnalyzer from ebfConverter
 * to parse and structure extracted book text.
 */
import { BookModel, StructureAnalyzer } from "@ebfConverter";

export { BookModel, StructureAnalyzer };

/**
 * Parse raw text into a structured BookModel.
 * @param {string} text — Raw text extracted from PDF
 * @param {object} metadata — { title, author, language }
 * @returns {BookModel}
 */
export function parseBookText(text, metadata = {}) {
	return BookModel.fromText(text, {
		title: metadata.title || "Untitled Book",
		author: metadata.author || "Unknown Author",
		language: metadata.language || "en",
	});
}

/**
 * Analyze text structure and render as HTML.
 * @param {string} text
 * @returns {string}
 */
export function textToHtml(text) {
	const analyzer = new StructureAnalyzer();
	return analyzer.renderHtml(text);
}

/**
 * Analyze text structure and render as FB2 body sections.
 * @param {string} text
 * @returns {string}
 */
export function textToFb2(text) {
	const analyzer = new StructureAnalyzer();
	return analyzer.renderFb2Sections(text);
}

/**
 * Clean raw PDF-extracted text.
 * @param {string} text
 * @returns {string}
 */
export function cleanDocumentText(text) {
	const analyzer = new StructureAnalyzer();
	return analyzer.cleanDocumentText(text);
}
