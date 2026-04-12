/**
 * ebfConverter — main entry point.
 *
 * Pipeline:
 *   PDF file → PdfReader → StructureAnalyzer → BookModel → Format Generator → Blob
 *
 * Supported formats: epub, fb2, mobi, azw3, txt
 */

export { BookModel } from './bookModel/BookModel.js';
export { StructureAnalyzer } from './structureAnalyzer/StructureAnalyzer.js';
export { PdfReader } from './pdfReader/PdfReader.js';
export { ImageEncoder } from './imageEncoder/imageEncoder.js';
export { EpubGenerator } from './epubGenerator/EpubGenerator.js';
export { Fb2Generator } from './fb2Generator/Fb2Generator.js';
export { MobiGenerator } from './mobiGenerator/MobiGenerator.js';

export const FORMAT_OPTIONS = [
	{ value: 'epub', label: 'EPUB', icon: '📖', ext: '.epub' },
	{ value: 'fb2', label: 'FB2', icon: '📄', ext: '.fb2' },
	{ value: 'mobi', label: 'MOBI', icon: '📱', ext: '.mobi' },
	{ value: 'azw3', label: 'AZW3', icon: '🔥', ext: '.azw3' },
	{ value: 'txt', label: 'TXT', icon: '📝', ext: '.txt' },
];

export function generateId() {
	return Math.random().toString(36).substr(2, 9);
}

export function formatFileSize(bytes) {
	if (!bytes || bytes === 0) return '0 KB';
	const kb = bytes / 1024;
	return kb < 1024 ? kb.toFixed(1) + ' KB' : (kb / 1024).toFixed(1) + ' MB';
}

/**
 * High-level conversion API for use from the UI.
 * @param {object} file - { file: File, format: string, title?: string, author?: string, language?: string }
 * @param {Function} onProgress - callback({ progress: 0-100, status: string, ... })
 * @returns {Promise<{ cancel: Function }>}
 */
export async function startConversion(file, onProgress) {
	if (!file.file || file.file.type !== 'application/pdf') {
		throw new Error('Only PDF files are supported');
	}

	let cancelled = false;

	try {
		onProgress({ progress: 10, status: 'converting' });

		const { PdfReader } = await import('./pdfReader/PdfReader.js');
		const reader = new PdfReader();

		const { text: extractedText, images: extractedImages } = await reader.extractTextAndImages(
			await file.file.arrayBuffer(),
			(progress) => {
				if (!cancelled) {
					onProgress({ progress: Math.round(10 + progress * 0.3), status: 'converting' });
				}
			}
		);

		if (cancelled) return { cancel: () => {} };

		const { StructureAnalyzer } = await import('./structureAnalyzer/StructureAnalyzer.js');
		const analyzer = new StructureAnalyzer();
		const cleanText = analyzer.cleanDocumentText(extractedText);

		onProgress({ progress: 50, status: 'converting' });

		const title = file.title || file.name.replace(/\.[^/.]+$/, '');
		const author = file.author || 'Unknown Author';
		const language = file.language || 'en';
		const baseName = file.name.replace(/\.[^/.]+$/, '');

		let blob;
		let resultName;

		switch (file.format) {
			case 'txt':
				blob = new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
				resultName = baseName + '.txt';
				break;

			case 'epub': {
				onProgress({ progress: 60, status: 'converting' });
				const { EpubGenerator } = await import('./epubGenerator/EpubGenerator.js');
				const gen = new EpubGenerator();
				blob = await gen.generate(title, author, cleanText, extractedImages, language);
				resultName = baseName + '.epub';
				break;
			}

			case 'fb2': {
				onProgress({ progress: 60, status: 'converting' });
				const { Fb2Generator } = await import('./fb2Generator/Fb2Generator.js');
				const gen = new Fb2Generator();
				blob = await gen.generate(title, author, cleanText, extractedImages, language);
				resultName = baseName + '.fb2';
				break;
			}

			case 'mobi': {
				onProgress({ progress: 60, status: 'converting' });
				const { MobiGenerator } = await import('./mobiGenerator/MobiGenerator.js');
				const gen = new MobiGenerator();
				blob = await gen.generateMobi(title, author, cleanText, extractedImages, language);
				resultName = baseName + '.mobi';
				break;
			}

			case 'azw3': {
				onProgress({ progress: 60, status: 'converting' });
				const { MobiGenerator } = await import('./mobiGenerator/MobiGenerator.js');
				const gen = new MobiGenerator();
				blob = await gen.generateAzw3(title, author, cleanText, extractedImages, language);
				resultName = baseName + '.azw3';
				break;
			}

			default:
				throw new Error(`Unsupported format: ${file.format}`);
		}

		if (cancelled) return { cancel: () => {} };

		onProgress({ progress: 95, status: 'converting' });
		await new Promise((resolve) => setTimeout(resolve, 100));
		if (cancelled) return { cancel: () => {} };

		onProgress({
			progress: 100,
			status: 'completed',
			resultName,
			resultBlob: blob,
		});
	} catch (error) {
		console.error('Conversion error:', error);
		onProgress({ progress: 0, status: 'error', error: error.message });
	}

	return { cancel: () => { cancelled = true; } };
}

/**
 * Extract PDF metadata (title, author, page count) from a file object.
 * @param {object} fileObj - { file: File, pages?: number, title?: string, author?: string }
 */
export async function extractPdfMetadata(fileObj) {
	try {
		const { PdfReader } = await import('./pdfReader/PdfReader.js');
		const reader = new PdfReader();
		const metadata = await reader.getMetadata(await fileObj.file.arrayBuffer());
		if (metadata) {
			fileObj.pages = metadata.numPages;
			if (metadata.title) fileObj.title = metadata.title;
			if (metadata.author) fileObj.author = metadata.author;
		} else {
			fileObj.pages = '—';
		}
	} catch (e) {
		console.error('Error extracting PDF metadata:', e);
		fileObj.pages = '—';
	}
}
