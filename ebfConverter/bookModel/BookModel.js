/**
 * BookModel — intermediate representation of a structured book.
 * Bridges raw extracted text and format-specific generators.
 *
 * Pipeline:
 *   PDF → PdfReader → StructureAnalyzer → BookModel → [EpubGenerator | Fb2Generator | …]
 */
import { StructureAnalyzer } from '../structureAnalyzer/StructureAnalyzer.js';

export class BookModel {
	constructor() {
		this.title = 'Untitled Book';
		this.author = 'Unknown Author';
		this.language = 'en';
		this.description = '';
		this.publisher = '';
		this.pubDate = '';
		this.isbn = '';
		this.chapters = [];  // [{ title, paragraphs }]
		this.images = [];    // [{ data, width, height, page }]
		this.coverImage = null;
	}

	/**
	 * Create a BookModel from raw text using StructureAnalyzer.
	 * @param {string} text - Raw extracted text from PDF
	 * @param {object} [metadata]
	 * @param {string} [metadata.title]
	 * @param {string} [metadata.author]
	 * @param {string} [metadata.language]
	 * @param {Array} [metadata.images]
	 * @returns {BookModel}
	 */
	static fromText(text, metadata = {}) {
		const book = new BookModel();
		if (metadata.title) book.title = metadata.title;
		if (metadata.author) book.author = metadata.author;
		if (metadata.language) book.language = metadata.language;
		if (metadata.images) book.images = metadata.images;

		const analyzer = new StructureAnalyzer();
		const { chapters } = analyzer.analyze(text, book.title);

		for (const ch of chapters) {
			const paragraphs = [];
			for (const block of ch.blocks) {
				for (const item of block.items) {
					if (item.type === 'paragraph') {
						paragraphs.push(item.text);
					}
				}
			}
			if (paragraphs.length > 0 || ch.title) {
				book.chapters.push({
					title: ch.title || book.title,
					paragraphs,
				});
			}
		}

		if (book.chapters.length === 0) {
			const paragraphs = text
				.split('\n\n')
				.map((p) => p.trim())
				.filter(Boolean);
			book.chapters.push({
				title: book.title,
				paragraphs,
			});
		}

		return book;
	}

	getParagraphCount() {
		return this.chapters.reduce((sum, ch) => sum + ch.paragraphs.length, 0);
	}

	getWordCount() {
		return this.chapters.reduce((sum, ch) => {
			return sum + ch.paragraphs.reduce((s, p) => s + p.split(/\s+/).filter(Boolean).length, 0);
		}, 0);
	}

	renderText() {
		const parts = [];
		for (const chapter of this.chapters) {
			if (chapter.title && chapter.title !== this.title) {
				parts.push(`\n\n${chapter.title}\n\n`);
			}
			for (const para of chapter.paragraphs) {
				parts.push(para + '\n\n');
			}
		}
		return parts.join('').trim();
	}

	renderHtml() {
		const parts = [];
		for (const chapter of this.chapters) {
			if (chapter.title && chapter.title !== this.title) {
				parts.push(`<h1>${this._escapeHtml(chapter.title)}</h1>\n`);
			}
			for (const para of chapter.paragraphs) {
				parts.push(`<p>${this._escapeHtml(para)}</p>\n`);
			}
		}
		return parts.join('');
	}

	/**
	 * Render FB2 body with proper structure:
	 * - Each chapter is a <section>
	 * - Chapter title in <title><p>…</p></title>
	 * - <empty-line/> between paragraphs
	 */
	renderFb2Body() {
		const parts = [];
		for (const chapter of this.chapters) {
			parts.push('    <section>');
			if (chapter.title) {
				parts.push(`      <title><p>${this._escapeXml(chapter.title)}</p></title>`);
			}
			for (let i = 0; i < chapter.paragraphs.length; i++) {
				parts.push(`      <p>${this._escapeXml(chapter.paragraphs[i])}</p>`);
				// Add empty-line between paragraphs (not after the last one)
				if (i < chapter.paragraphs.length - 1) {
					parts.push('      <empty-line/>');
				}
			}
			parts.push('    </section>');
		}
		return parts.join('\n');
	}

	_escapeHtml(str) {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	_escapeXml(str) {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');
	}
}
