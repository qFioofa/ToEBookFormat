/**
 * MobiGenerator — generates MOBI and AZW3 format files.
 * Since true MOBI/AZW3 binary format generation requires Calibre/KindleGen,
 * this generator produces EPUB files with appropriate warnings,
 * which can then be converted using external tools.
 */
import { EpubGenerator } from '../epubGenerator/EpubGenerator.js';

export class MobiGenerator {
	constructor() {
		this._epubGen = new EpubGenerator();
	}

	/**
	 * Generate a MOBI file (actually EPUB with a warning).
	 * @param {string} title
	 * @param {string} author
	 * @param {string} text
	 * @param {Array} images
	 * @param {string} language
	 * @returns {Promise<Blob>}
	 */
	async generateMobi(title, author, text, images = [], language = 'en') {
		try {
			const epubBlob = await this._epubGen.generate(title, author, text, images, language);
			console.warn(
				'MOBI format generates EPUB files. Use Calibre or KindleGen to convert EPUB to MOBI for Kindle compatibility.'
			);
			return epubBlob;
		} catch (error) {
			console.error('Error creating MOBI (EPUB):', error);
			throw new Error('Failed to create MOBI (EPUB): ' + error.message);
		}
	}

	/**
	 * Generate an AZW3 file (actually EPUB with a warning).
	 * @param {string} title
	 * @param {string} author
	 * @param {string} text
	 * @param {Array} images
	 * @param {string} language
	 * @returns {Promise<Blob>}
	 */
	async generateAzw3(title, author, text, images = [], language = 'en') {
		try {
			const epubBlob = await this._epubGen.generate(title, author, text, images, language);
			console.warn(
				'AZW3 format generates EPUB files. Use Calibre or Send to Kindle to convert EPUB to AZW3 for Kindle compatibility.'
			);
			return epubBlob;
		} catch (error) {
			console.error('Error creating AZW3 (EPUB):', error);
			throw new Error('Failed to create AZW3 (EPUB): ' + error.message);
		}
	}
}
