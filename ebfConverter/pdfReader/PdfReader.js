/**
 * PdfReader — PDF text extraction, image extraction, and metadata reading.
 * Wraps pdfjs-dist with proper Unicode/Cyrillic support and clean text output.
 */
export class PdfReader {
	constructor() {
		this._pdfjsLib = null;
	}

	async _getLib() {
		if (!this._pdfjsLib) {
			this._pdfjsLib = await import('pdfjs-dist');
			this._pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
				'pdfjs-dist/build/pdf.worker.min.mjs',
				import.meta.url
			).toString();
		}
		return this._pdfjsLib;
	}

	/**
	 * Extract PDF metadata: title, author, number of pages.
	 * @param {ArrayBuffer} arrayBuffer
	 * @returns {Promise<{title?: string, author?: string, numPages: number}|null>}
	 */
	async getMetadata(arrayBuffer) {
		const lib = await this._getLib();
		try {
			const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
			const metadata = await pdf.getMetadata();
			const info = { numPages: pdf.numPages };
			if (metadata?.info) {
				if (metadata.info.Title) info.title = metadata.info.Title;
				if (metadata.info.Author) info.author = metadata.info.Author;
			}
			return info;
		} catch (e) {
			console.error("Error extracting PDF metadata:", e);
			return null;
		}
	}

	/**
	 * Extract text and images from a PDF file.
	 * @param {ArrayBuffer} arrayBuffer
	 * @param {Function} [onProgress] — callback with 0-100 progress
	 * @returns {Promise<{text: string, images: Array<{page: number, data: Uint8Array, width: number, height: number, content_type: string}>}>}
	 */
	async extractTextAndImages(arrayBuffer, onProgress) {
		const lib = await this._getLib();
		try {
			const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
			const numPages = pdf.numPages;
			const allPageTexts = [];
			const images = [];

			for (let i = 1; i <= numPages; i++) {
				const page = await pdf.getPage(i);
				const textContent = await page.getTextContent();

				const pageText = this._extractTextFromPage(textContent, i);
				allPageTexts.push(pageText);

				try {
					const pageImages = await this._extractImagesFromPage(page, i);
					images.push(...pageImages);
				} catch (imgErr) {
					console.warn(`Warning: Could not extract images from page ${i}:`, imgErr.message);
				}

				if (onProgress) {
					onProgress(Math.round((i / numPages) * 100));
				}
			}

			let fullText = allPageTexts.join('\n\n');
			fullText = this._cleanTypography(fullText);

			return { text: fullText.trim(), images };
		} catch (error) {
			console.error("Error extracting text and images from PDF:", error);
			throw new Error("Failed to extract from PDF: " + error.message);
		}
	}

	_extractTextFromPage(textContent, pageNum) {
		const items = textContent.items.map(item => ({
			str: item.str,
			x: Math.round(item.transform[4]),
			y: Math.round(item.transform[5]),
			width: Math.round(item.width),
			height: Math.round(item.height),
			fontSize: item.transform[0],
			fontName: item.fontName || '',
			dir: item.dir || 'ltr'
		}));

		items.sort((a, b) => {
			const yDiff = b.y - a.y;
			if (Math.abs(yDiff) > 2) return yDiff;
			return a.x - b.x;
		});

		const lines = [];
		let currentLine = [];
		let lastY = null;

		for (const item of items) {
			if (!item.str.trim()) continue;
			const yGap = lastY !== null ? Math.abs(item.y - lastY) : 0;
			if (currentLine.length > 0 && yGap > item.height * 0.8) {
				lines.push(currentLine);
				currentLine = [];
			}
			currentLine.push(item);
			lastY = item.y;
		}
		if (currentLine.length > 0) lines.push(currentLine);

		const filteredLines = lines.filter(line => {
			const lineText = line.map(item => item.str).join(' ').trim();
			if (/^—?\s*Страница\s+\d+\s+из\s+\d+\s*—?$/i.test(lineText)) return false;
			if (/^•••/.test(lineText)) return false;
			if (/^\d+$/.test(lineText.trim()) && lineText.trim().length <= 4) return false;
			if (/^[═─•·\s\-]+$/.test(lineText) && lineText.length > 5) return false;
			return true;
		});

		const paragraphs = [];
		let currentParagraph = [];
		let lastLineY = null;

		for (const line of filteredLines) {
			if (line.length === 0) continue;
			const lineY = line[0].y;
			const lineFontSize = line.reduce((sum, item) => sum + item.fontSize, 0) / line.length;

			if (currentParagraph.length > 0 && lastLineY !== null) {
				const yGap = Math.abs(lineY - lastLineY);
				const prevLine = currentParagraph[currentParagraph.length - 1];
				const prevFontSize = prevLine.reduce((sum, item) => sum + item.fontSize, 0) / prevLine.length;
				const fontSizeChange = Math.abs(lineFontSize - prevFontSize);
				if (yGap > line[0].height * 1.5 || fontSizeChange > 1) {
					paragraphs.push(currentParagraph);
					currentParagraph = [];
				}
			}
			currentParagraph.push(line);
			lastLineY = lineY;
		}
		if (currentParagraph.length > 0) paragraphs.push(currentParagraph);

		let result = "";
		for (const para of paragraphs) {
			const paraLines = para.map(line => {
				line.sort((a, b) => a.x - b.x);
				let lineText = "";
				for (let i = 0; i < line.length; i++) {
					const item = line[i];
					if (i === 0) {
						lineText = item.str;
					} else {
						const prevItem = line[i - 1];
						const gap = item.x - (prevItem.x + prevItem.width);
						if (gap > 2 || (!prevItem.str.endsWith(' ') && !item.str.startsWith(' '))) {
							lineText += " " + item.str;
						} else {
							lineText += item.str;
						}
					}
				}
				return lineText.trim();
			}).filter(l => l.length > 0);

			const paraText = paraLines.join(' ').trim();
			if (!paraText) continue;

			const cleanText = this._cleanInlineTypography(paraText);
			if (result.length > 0 && !result.endsWith("\n\n")) {
				result += "\n\n";
			}
			result += cleanText + "\n";
		}

		return result;
	}

	_cleanInlineTypography(text) {
		let result = text;
		result = result.replace(/\s+([.,;:!?])/g, '$1');
		result = result.replace(/([а-яА-Яa-zA-Z])\s+-\s+([а-яА-Яa-zA-Z])/g, '$1-$2');
		result = result.replace(/"\s+([^"]+?)\s+"/g, '"$1"');
		result = result.replace(/\s+"([^"]+)"\s+/g, ' "$1" ');
		result = result.replace(/\s+"([^"]+)"$/g, ' "$1"');
		result = result.replace(/^"([^"]+)"\s+/g, '"$1" ');
		result = result.replace(/\s{2,}/g, ' ');
		result = result.split('\n').map(line => line.trim()).join('\n');
		return result.trim();
	}

	_cleanTypography(text) {
		let result = text;
		result = result.replace(/^[═─]{3,}\s*$/gm, '');
		result = result.replace(/^[•·]+(\s+[•·]+)*\s*$/gm, '');
		result = result.replace(/—?\s*Страница\s+\d+\s+из\s+\d+\s*—?/gi, '');
		result = result.replace(/^\s*\d{1,4}\s*$/gm, '');
		result = result.replace(/\s+([.,;:!?])/g, '$1');
		result = result.replace(/([а-яА-Яa-zA-Z])\s+-\s+([а-яА-Яa-zA-Z])/g, '$1-$2');
		result = result.replace(/"\s+([^"]+?)\s+"/g, '"$1"');
		result = result.replace(/\n{4,}/g, '\n\n\n');
		result = result.split('\n').map(line => line.trim()).join('\n');
		result = result.replace(/^\n+/, '');
		result = result.trimEnd();
		return result;
	}

	async _extractImagesFromPage(page, pageNum) {
		const images = [];
		try {
			const operatorList = await page.getOperatorList();
			const ops = operatorList.fnArray;
			const args = operatorList.argsArray;

			const paintImageXObject = 86;
			const paintJpegImg = 87;

			const imageNames = new Set();
			for (let i = 0; i < ops.length; i++) {
				if (ops[i] === paintImageXObject || ops[i] === paintJpegImg) {
					if (args[i] && args[i][0]) {
						imageNames.add(args[i][0]);
					}
				}
			}

			for (const imgName of imageNames) {
				try {
					const imgData = await page.objs.get(imgName);
					if (imgData && imgData.data && imgData.width && imgData.height) {
						// Filter out tiny/decorative images, keep only meaningful ones
						if (imgData.width > 50 && imgData.height > 50) {
							images.push({
								page: pageNum,
								data: this._normalizeImageData(imgData.data),
								width: imgData.width,
								height: imgData.height,
								content_type: this._detectImageContentType(imgData),
							});
						}
					}
				} catch (e) {
					console.warn(`Warning: Could not extract image ${imgName} from page ${pageNum}:`, e.message);
				}
			}
		} catch (e) {
			console.warn(`Warning: Could not process page ${pageNum} for images:`, e.message);
		}
		return images;
	}

	/**
	 * Normalize image data to Uint8Array for consistent handling.
	 */
	_normalizeImageData(data) {
		if (data instanceof Uint8Array) return data;
		if (data instanceof ArrayBuffer) return new Uint8Array(data);
		return new Uint8Array(data);
	}

	/**
	 * Detect image content type from PDF image metadata.
	 */
	_detectImageContentType(imgData) {
		if (imgData.kind === 'JPEG' || imgData.kind === 2) return 'image/jpeg';
		return 'image/png';
	}
}
