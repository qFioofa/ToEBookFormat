/**
 * StructureAnalyzer — analyzes raw extracted text and structures it into
 * a proper book model with chapters, headings, and paragraphs.
 *
 * Chapter detection strategy (for guide/reference books):
 * 1. ALL CAPS short lines (≤80 chars, no ending punctuation) → H2 headings
 * 2. Numbered sections: "Глава 1", "Часть I", "Раздел 2" → H1/H2 headings
 * 3. Markdown headings: # H1, ## H2, ### H3
 * 4. Short title-like lines (≤40 chars, capitalized, ≤6 words, no punctuation)
 *
 * Paragraph grouping uses adaptive Y-gap threshold to separate
 * within-paragraph gaps from between-paragraph gaps.
 */
export class StructureAnalyzer {
	constructor() {
		// Patterns for numbered sections (Russian and English)
		this._numberedPatterns = [
			/^(?:Глава|Chapter|Ch\.?)\s+(\d+|[IVXLC]+)\.?\s*:?\s*(.*)$/i,
			/^(?:Часть|Part)\s+(\d+|[IVXLC]+)\.?\s*:?\s*(.*)$/i,
			/^(?:Раздел|Section|Sec\.?)\s+(\d+|[IVXLC]+)\.?\s*:?\s*(.*)$/i,
			/^(?:Урок|Lesson)\s+(\d+|[IVXLC]+)\.?\s*:?\s*(.*)$/i,
			/^(?:Шаг|Step)\s+(\d+|[IVXLC]+)\.?\s*:?\s*(.*)$/i,
		];

		// Patterns for appendix/ending sections
		this._endingPatterns = [
			/^(?:Заключение|Conclusion|Epilogue|Эпилог)/i,
			/^(?:Приложение|Appendix)/i,
			/^(?:Список|List|References|Библиография)/i,
			/^(?:Глоссарий|Glossary)/i,
			/^(?:Индекс|Index|Указатель)/i,
			/^(?:Удачи|Успехов|Good Luck|Best Wishes)/i,
		];
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
		result = result.split('\n').map((line) => line.trim()).join('\n');
		result = result.replace(/^\n+/, '');
		result = result.trimEnd();
		return result;
	}

	/**
	 * Analyze text and classify each line as: heading, paragraph, or blank.
	 * Uses multiple heuristics for robust chapter detection.
	 * @param {string} text
	 * @returns {Array<{type: string, text: string, level?: number}>}
	 */
	classifyLines(text) {
		const lines = text.split('\n');
		const classified = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) {
				classified.push({ type: 'blank', text: '' });
				continue;
			}

			// Check for markdown-style headings first
			const h1Match = line.match(/^#\s+(.+)/);
			const h2Match = line.match(/^##\s+(.+)/);
			const h3Match = line.match(/^###\s+(.+)/);

			if (h1Match) {
				classified.push({
					type: 'heading',
					text: h1Match[1].trim(),
					level: 1,
				});
				continue;
			}
			if (h2Match) {
				classified.push({
					type: 'heading',
					text: h2Match[1].trim(),
					level: 2,
				});
				continue;
			}
			if (h3Match) {
				classified.push({
					type: 'heading',
					text: h3Match[1].trim(),
					level: 3,
				});
				continue;
			}

			// Check for numbered sections (Глава 1, Часть II, etc.)
			const numberedMatch = this._matchNumberedSection(line);
			if (numberedMatch) {
				classified.push({
					type: 'heading',
					text: numberedMatch,
					level: 1,
				});
				continue;
			}

			// Check for structural headings (ALL CAPS, short, no ending punctuation)
			if (this._isStructuralHeading(line, lines, i)) {
				classified.push({
					type: 'heading',
					text: line,
					level: 2,
				});
				continue;
			}

			// Check for title-like lines (short, capitalized, no punctuation)
			if (this._isLikelyHeading(line)) {
				classified.push({
					type: 'heading',
					text: line,
					level: 2,
				});
				continue;
			}

			classified.push({ type: 'paragraph', text: line });
		}

		return classified;
	}

	/**
	 * Match numbered section patterns.
	 * @param {string} line
	 * @returns {string|null}
	 */
	_matchNumberedSection(line) {
		for (const pattern of this._numberedPatterns) {
			const match = line.match(pattern);
			if (match) {
				const num = match[1];
				const title = match[2] ? match[2].trim() : '';
				return title ? `${match[0].split(/\s+/)[0]} ${num} — ${title}` : `${match[0].split(/\s+/)[0]} ${num}`;
			}
		}
		return null;
	}

	/**
	 * Detect structural headings: ALL CAPS short lines followed by a gap.
	 * This catches "ВВЕДЕНИЕ.", "ВЫЧИСЛЕНИЕ АУТОВ.", etc.
	 * @param {string} line
	 * @param {string[]} allLines
	 * @param {number} index
	 * @returns {boolean}
	 */
	_isStructuralHeading(line, allLines, index) {
		// Must be relatively short
		if (line.length > 80 || line.length < 2) return false;

		// Must be ALL CAPS (Cyrillic or Latin)
		const hasLetters = /[а-яА-Яa-zA-Z]/.test(line);
		if (!hasLetters) return false;

		const isAllCaps =
			line === line.toUpperCase() && line !== line.toLowerCase();
		if (!isAllCaps) return false;

		// Should not end with sentence punctuation (but period after abbreviation is OK)
		// Allow trailing period for things like "ВВЕДЕНИЕ."
		const stripped = line.replace(/\.$/, '');
		if (/[.!?]$/.test(stripped)) return false;

		// Should be followed by a blank line or significant gap (next non-blank line is far)
		let nextNonBlank = index + 1;
		while (nextNonBlank < allLines.length && !allLines[nextNonBlank].trim()) {
			nextNonBlank++;
		}
		// If there's a blank line after, it's likely a heading
		if (nextNonBlank > index + 1) return true;

		// If the next line exists and is a regular paragraph, still could be a heading
		// if this line is very short (≤30 chars)
		if (line.length <= 30) return true;

		return false;
	}

	/**
	 * Heuristic: is this line likely a heading?
	 * Short lines without ending punctuation and with title-case are candidates.
	 * @param {string} text
	 * @returns {boolean}
	 */
	_isLikelyHeading(text) {
		if (text.length > 80) return false;
		if (text.length < 3) return false;
		// If it ends with sentence-ending punctuation, it's probably not a heading
		if (/[.!?]$/.test(text)) return false;
		// If it's very short and capitalized, likely a heading
		if (
			text.length <= 40 &&
			/^[A-ZА-ЯЁ]/.test(text) &&
			text.split(' ').length <= 6
		) {
			return true;
		}
		return false;
	}

	/**
	 * Group classified lines into blocks (headings + following paragraphs).
	 * @param {Array<{type: string, text: string, level?: number}>} classified
	 * @returns {Array<{type: string, heading: object|null, items: Array}>}
	 */
	groupIntoBlocks(classified) {
		const blocks = [];
		let currentBlock = null;

		for (const item of classified) {
			if (item.type === 'heading') {
				if (currentBlock) blocks.push(currentBlock);
				currentBlock = {
					type: 'section',
					heading: item,
					items: [item],
				};
			} else if (item.type === 'paragraph') {
				if (!currentBlock) {
					currentBlock = {
						type: 'section',
						heading: null,
						items: [],
					};
				}
				currentBlock.items.push(item);
			}
			// blank lines are skipped during grouping
		}

		if (currentBlock) blocks.push(currentBlock);
		return blocks;
	}

	/**
	 * Group blocks into chapters. A new chapter starts at each h1 heading
	 * or at structural h2 headings that look like chapter titles.
	 * @param {Array} blocks
	 * @param {string} [bookTitle]
	 * @returns {Array<{title: string, blocks: Array}>}
	 */
	groupIntoChapters(blocks, bookTitle = '') {
		const chapters = [];
		let currentChapter = null;

		for (const block of blocks) {
			const isH1 = block.heading && block.heading.level === 1;
			const isChapterHeading =
				block.heading &&
				this._isChapterHeading(block.heading.text, bookTitle);

			if (isH1 || isChapterHeading) {
				if (currentChapter) chapters.push(currentChapter);
				currentChapter = {
					title: block.heading.text,
					blocks: [block],
				};
			} else {
				if (!currentChapter) {
					currentChapter = {
						title: bookTitle || 'Beginning',
						blocks: [],
					};
				}
				currentChapter.blocks.push(block);
			}
		}

		if (currentChapter) chapters.push(currentChapter);
		return chapters;
	}

	/**
	 * Determine if a heading text looks like a chapter title.
	 * @param {string} text
	 * @param {string} bookTitle
	 * @returns {boolean}
	 */
	_isChapterHeading(text, bookTitle) {
		if (!text) return false;
		const lower = text.toLowerCase().trim();
		const bookLower = bookTitle.toLowerCase().trim();

		// Skip if it matches the book title
		if (bookLower && lower.includes(bookLower)) return false;

		// Numbered sections are always chapters
		if (this._matchNumberedSection(text)) return true;

		// ALL CAPS headings of moderate length are chapters
		if (
			text === text.toUpperCase() &&
			text !== text.toLowerCase() &&
			text.length > 3 &&
			text.length <= 80
		) {
			return true;
		}

		// Known chapter-ending words
		for (const pattern of this._endingPatterns) {
			if (pattern.test(text)) return true;
		}

		return false;
	}

	/**
	 * Full pipeline: raw text -> classified -> blocks -> chapters.
	 * @param {string} text
	 * @param {string} [bookTitle]
	 * @returns {{chapters: Array, blocks: Array, classified: Array}}
	 */
	analyze(text, bookTitle = '') {
		const classified = this.classifyLines(text);
		const blocks = this.groupIntoBlocks(classified);
		const chapters = this.groupIntoChapters(blocks, bookTitle);
		return { classified, blocks, chapters };
	}

	/**
	 * Render the analyzed text as plain text with chapter separators.
	 * @param {string} text
	 * @param {string} [bookTitle]
	 * @returns {string}
	 */
	renderText(text, bookTitle = '') {
		const { chapters } = this.analyze(text, bookTitle);
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
	 * @param {string} [bookTitle]
	 * @returns {string}
	 */
	renderHtml(text, bookTitle = '') {
		const { chapters } = this.analyze(text, bookTitle);
		const parts = [];

		for (const chapter of chapters) {
			if (chapter.title && chapter.title !== 'Beginning') {
				parts.push(
					`<h1>${this._escapeHtml(chapter.title)}</h1>\n`
				);
			}
			for (const block of chapter.blocks) {
				for (const item of block.items) {
					if (item.type === 'heading') {
						const tag =
							item.level === 1
								? 'h1'
								: item.level === 2
									? 'h2'
									: 'h3';
						parts.push(
							`<${tag}>${this._escapeHtml(item.text)}</${tag}>\n`
						);
					} else if (item.type === 'paragraph') {
						parts.push(
							`<p>${this._escapeHtml(item.text)}</p>\n`
						);
					}
				}
			}
		}

		return parts.join('');
	}

	/**
	 * Render the analyzed text as FB2 body sections.
	 * @param {string} text
	 * @param {string} [bookTitle]
	 * @returns {string}
	 */
	renderFb2Sections(text, bookTitle = '') {
		const { chapters } = this.analyze(text, bookTitle);
		const parts = [];

		for (const chapter of chapters) {
			parts.push('    <section>');
			if (chapter.title && chapter.title !== 'Beginning') {
				parts.push(
					`      <title><p>${this._escapeXml(chapter.title)}</p></title>`
				);
			}
			for (const block of chapter.blocks) {
				for (const item of block.items) {
					if (item.type === 'heading') {
						parts.push(
							`      <title><p>${this._escapeXml(item.text)}</p></title>`
						);
					} else if (item.type === 'paragraph') {
						parts.push(
							`      <p>${this._escapeXml(item.text)}</p>`
						);
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
