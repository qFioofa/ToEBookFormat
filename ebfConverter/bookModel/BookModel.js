/**
 * BookModel — represents a structured book document with metadata,
 * chapters, and content. Used as the intermediate representation
 * between extraction and format-specific generation.
 */
export class BookModel {
	constructor() {
		this.title = 'Untitled Book';
		this.author = 'Unknown Author';
		this.language = 'en';
		this.description = '';
		this.publisher = '';
		this.pubDate = '';
		this.isbn = '';
		this.chapters = [];
		this.images = [];
		this.coverImage = null;
	}

	/**
	 * Create a BookModel from raw text using the StructureAnalyzer.
	 * @param {string} text
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

		// Parse chapters from text
		const paragraphs = text.split('\n\n').filter(p => p.trim());
		let currentChapter = { title: book.title, paragraphs: [] };

		for (const para of paragraphs) {
			const trimmed = para.trim();
			if (!trimmed) continue;

			// Check if this paragraph looks like a chapter heading
			const h1Match = trimmed.match(/^#\s+(.+)/);
			const h2Match = trimmed.match(/^##\s+(.+)/);
			const isShortTitle = trimmed.length < 80 && !/[.!?]$/.test(trimmed) && trimmed.split(' ').length <= 8;

			if (h1Match || h2Match || (isShortTitle && currentChapter.paragraphs.length > 0)) {
				book.chapters.push(currentChapter);
				currentChapter = {
					title: h1Match ? h1Match[1].trim() : h2Match ? h2Match[1].trim() : trimmed,
					paragraphs: []
				};
			} else {
				currentChapter.paragraphs.push(trimmed);
			}
		}

		if (currentChapter.paragraphs.length > 0 || book.chapters.length === 0) {
			book.chapters.push(currentChapter);
		}

		// If no chapters were detected, treat entire text as one chapter
		if (book.chapters.length === 0) {
			book.chapters.push({
				title: book.title,
				paragraphs: paragraphs.map(p => p.trim()).filter(Boolean)
			});
		}

		return book;
	}

	/**
	 * Get the total paragraph count across all chapters.
	 * @returns {number}
	 */
	getParagraphCount() {
		return this.chapters.reduce((sum, ch) => sum + ch.paragraphs.length, 0);
	}

	/**
	 * Get the total word count.
	 * @returns {number}
	 */
	getWordCount() {
		return this.chapters.reduce((sum, ch) => {
			return sum + ch.paragraphs.reduce((s, p) => s + p.split(/\s+/).filter(Boolean).length, 0);
		}, 0);
	}

	/**
	 * Render the book as plain text.
	 * @returns {string}
	 */
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

	/**
	 * Render the book as HTML.
	 * @returns {string}
	 */
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
	 * Render the book as FB2 body sections.
	 * @returns {string}
	 */
	renderFb2Body() {
		const parts = [];
		for (const chapter of this.chapters) {
			parts.push('    <section>');
			if (chapter.title) {
				parts.push(`      <title><p>${this._escapeXml(chapter.title)}</p></title>`);
			}
			for (const para of chapter.paragraphs) {
				parts.push(`      <p>${this._escapeXml(para)}</p>`);
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
