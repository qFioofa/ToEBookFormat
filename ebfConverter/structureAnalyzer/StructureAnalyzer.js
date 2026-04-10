/**
 * StructureAnalyzer — analyzes raw extracted text and structures it into
 * a proper book model with chapters, headings, and paragraphs.
 * Also provides text cleaning utilities.
 */
export class StructureAnalyzer {
	constructor() {
		this._headingPatterns = {
			h1: /^(#{1}\s+)?(.+)$/,
			h2: /^(#{2}\s+)?(.+)$/,
			h3: /^(#{3}\s+)?(.+)$/,
		};
	}

	/**
	 * Clean the full document text extracted from PDF.
	 * @param {string} text
	 * @returns {string}
	 */
	cleanDocumentText(text) {
		let result = text;
		// Remove decorative borders
		result = result.replace(/^[═─]{3,}\s*$/gm, '');
		result = result.replace(/^[•·]+(\s+[•·]+)*\s*$/gm, '');
		// Remove page number patterns (Russian and English)
		result = result.replace(/—?\s*Страница\s+\d+\s+из\s+\d+\s*—?/gi, '');
		result = result.replace(/—?\s*Page\s+\d+\s+of\s+\d+\s*—?/gi, '');
		// Remove orphaned standalone numbers
		result = result.replace(/^\s*\d{1,4}\s*$/gm, '');
		// Remove spaces before punctuation
		result = result.replace(/\s+([.,;:!?])/g, '$1');
		// Fix hyphenated words split across lines
		result = result.replace(/([а-яА-Яa-zA-Z])\s+-\s+([а-яА-Яa-zA-Z])/g, '$1-$2');
		// Fix quotes
		result = result.replace(/"\s+([^"]+?)\s+"/g, '"$1"');
		// Remove multiple consecutive blank lines
		result = result.replace(/\n{4,}/g, '\n\n\n');
		// Trim lines
		result = result.split('\n').map(line => line.trim()).join('\n');
		result = result.replace(/^\n+/, '');
		result = result.trimEnd();
		return result;
	}

	/**
	 * Analyze text and classify each line as: heading, paragraph, or blank.
	 * @param {string} text
	 * @returns {Array<{type: string, text: string, level?: number}>}
	 */
	classifyLines(text) {
		const lines = text.split('\n');
		const classified = [];

		for (const rawLine of lines) {
			const line = rawLine.trim();
			if (!line) {
				classified.push({ type: 'blank', text: '' });
				continue;
			}

			// Check for markdown-style headings
			const h1Match = line.match(/^#\s+(.+)/);
			const h2Match = line.match(/^##\s+(.+)/);
			const h3Match = line.match(/^###\s+(.+)/);

			if (h1Match) {
				classified.push({ type: 'heading', text: h1Match[1].trim(), level: 1 });
			} else if (h2Match) {
				classified.push({ type: 'heading', text: h2Match[1].trim(), level: 2 });
			} else if (h3Match) {
				classified.push({ type: 'heading', text: h3Match[1].trim(), level: 3 });
			} else if (this._isLikelyHeading(line)) {
				classified.push({ type: 'heading', text: line, level: 2 });
			} else {
				classified.push({ type: 'paragraph', text: line });
			}
		}

		return classified;
	}

	/**
	 * Heuristic: is this line likely a heading?
	 * Short lines without ending punctuation and with title-case are candidates.
	 */
	_isLikelyHeading(text) {
		if (text.length > 80) return false;
		if (text.length < 3) return false;
		// If it ends with sentence-ending punctuation, it's probably not a heading
		if (/[.!?]$/.test(text)) return false;
		// If it's very short and capitalized, likely a heading
		if (text.length <= 40 && /^[A-ZА-ЯЁ]/.test(text) && text.split(' ').length <= 6) {
			return true;
		}
		return false;
	}

	/**
	 * Group classified lines into blocks (headings + following paragraphs).
	 * @param {Array<{type: string, text: string, level?: number}>} classified
	 * @returns {Array<{type: string, items: Array}>}
	 */
	groupIntoBlocks(classified) {
		const blocks = [];
		let currentBlock = null;

		for (const item of classified) {
			if (item.type === 'heading') {
				if (currentBlock) blocks.push(currentBlock);
				currentBlock = { type: 'section', heading: item, items: [item] };
			} else if (item.type === 'paragraph') {
				if (!currentBlock) {
					currentBlock = { type: 'section', heading: null, items: [] };
				}
				currentBlock.items.push(item);
			}
			// blank lines are skipped during grouping
		}

		if (currentBlock) blocks.push(currentBlock);
		return blocks;
	}

	/**
	 * Group blocks into chapters. A new chapter starts at each h1 heading.
	 * @param {Array} blocks
	 * @returns {Array<{title: string, blocks: Array}>}
	 */
	groupIntoChapters(blocks) {
		const chapters = [];
		let currentChapter = null;

		for (const block of blocks) {
			const hasH1 = block.heading && block.heading.level === 1;

			if (hasH1) {
				if (currentChapter) chapters.push(currentChapter);
				currentChapter = { title: block.heading.text, blocks: [block] };
			} else {
				if (!currentChapter) {
					currentChapter = { title: 'Beginning', blocks: [] };
				}
				currentChapter.blocks.push(block);
			}
		}

		if (currentChapter) chapters.push(currentChapter);
		return chapters;
	}

	/**
	 * Full pipeline: raw text -> classified -> blocks -> chapters.
	 * @param {string} text
	 * @returns {{chapters: Array, blocks: Array, classified: Array}}
	 */
	analyze(text) {
		const classified = this.classifyLines(text);
		const blocks = this.groupIntoBlocks(classified);
		const chapters = this.groupIntoChapters(blocks);
		return { classified, blocks, chapters };
	}

	/**
	 * Render the analyzed text as plain text with chapter separators.
	 * @param {string} text
	 * @returns {string}
	 */
	renderText(text) {
		const { chapters } = this.analyze(text);
		const parts = [];

		for (const chapter of chapters) {
			if (chapter.title && chapter.title !== 'Beginning') {
				parts.push(`\n\n${chapter.title}\n\n`);
			}
			for (const block of chapter.blocks) {
				for (const item of block.items) {
					if (item.type === 'heading') {
						parts.push(`\n${item.text}\n\n`);
					} else if (item.type === 'paragraph') {
						parts.push(item.text + '\n\n');
					}
				}
			}
		}

		return parts.join('').trim();
	}

	/**
	 * Render the analyzed text as HTML with proper heading tags.
	 * @param {string} text
	 * @returns {string}
	 */
	renderHtml(text) {
		const { chapters } = this.analyze(text);
		const parts = [];

		for (const chapter of chapters) {
			if (chapter.title && chapter.title !== 'Beginning') {
				parts.push(`<h1>${this._escapeHtml(chapter.title)}</h1>\n`);
			}
			for (const block of chapter.blocks) {
				for (const item of block.items) {
					if (item.type === 'heading') {
						const tag = item.level === 1 ? 'h1' : item.level === 2 ? 'h2' : 'h3';
						parts.push(`<${tag}>${this._escapeHtml(item.text)}</${tag}>\n`);
					} else if (item.type === 'paragraph') {
						parts.push(`<p>${this._escapeHtml(item.text)}</p>\n`);
					}
				}
			}
		}

		return parts.join('');
	}

	/**
	 * Render the analyzed text as FB2 body sections.
	 * @param {string} text
	 * @returns {string}
	 */
	renderFb2Sections(text) {
		const { chapters } = this.analyze(text);
		const parts = [];

		for (const chapter of chapters) {
			parts.push('    <section>');
			if (chapter.title && chapter.title !== 'Beginning') {
				parts.push(`      <title><p>${this._escapeXml(chapter.title)}</p></title>`);
			}
			for (const block of chapter.blocks) {
				for (const item of block.items) {
					if (item.type === 'heading') {
						parts.push(`      <title><p>${this._escapeXml(item.text)}</p></title>`);
					} else if (item.type === 'paragraph') {
						parts.push(`      <p>${this._escapeXml(item.text)}</p>`);
					}
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
