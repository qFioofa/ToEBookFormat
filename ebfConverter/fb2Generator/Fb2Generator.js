/**
 * Fb2Generator — generates valid FictionBook 2.0 (FB2) XML files.
 *
 * Structure:
 *   <?xml …?>
 *   <FictionBook>
 *     <description>
 *       <title-info> … </title-info>
 *       <document-info> … </document-info>
 *     </description>
 *     <body>
 *       <section> … </section>  (one per chapter)
 *     </body>
 *     <binary id="img_1" …> … </binary>
 *   </FictionBook>
 */
import { ImageEncoder } from '../imageEncoder/imageEncoder.js';
import { BookModel } from '../bookModel/BookModel.js';

export class Fb2Generator {
	/**
	 * Generate an FB2 file as a Blob.
	 * @param {string} title
	 * @param {string} author
	 * @param {string} text - Raw extracted text
	 * @param {Array} images - [{ data, width, height }]
	 * @param {string} language
	 * @returns {Promise<Blob>}
	 */
	async generate(title, author, text, images = [], language = 'ru') {
		const langCode = this._validateLanguageCode(language);
		const book = BookModel.fromText(text, { title, author, language, images });

		const bodyContent = book.renderFb2Body();
		const binarySections = ImageEncoder.toFb2BinaryElements(images);

		const fb2XML = `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
  <description>
    <title-info>
      <author>
        <first-name>${this._escapeXml(author || 'Unknown')}</first-name>
      </author>
      <book-title>${this._escapeXml(title || 'Untitled Book')}</book-title>
      <lang>${langCode}</lang>
      <date>${new Date().getFullYear()}</date>
    </title-info>
    <document-info>
      <program-used>ToEBookFormat Converter</program-used>
      <date>${new Date().toISOString().split('T')[0]}</date>
      <id>${this._generateUUID()}</id>
    </document-info>
  </description>
  <body>
${bodyContent}
  </body>
${binarySections}</FictionBook>`;

		this._validateFb2Xml(fb2XML);
		return new Blob([fb2XML], { type: 'application/fb2+xml;charset=utf-8' });
	}

	_validateLanguageCode(lang) {
		if (!lang || typeof lang !== 'string') return 'ru';
		const code = lang.trim().toLowerCase();
		return /^[a-z]{2}(-[A-Z]{2})?$/.test(code) ? code : 'ru';
	}

	_generateUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	_escapeXml(str) {
		if (!str) return '';
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	}

	_validateFb2Xml(xml) {
		const errors = [];
		if (/&(?!amp;|lt;|gt;|quot;|#39;|apos;)/g.test(xml)) {
			errors.push('Contains unescaped ampersands (&)');
		}
		if (!xml.includes('<FictionBook') || !xml.includes('</FictionBook>')) {
			errors.push('Missing FictionBook root element');
		}
		if (!xml.includes('<description>') || !xml.includes('</description>')) {
			errors.push('Missing description section');
		}
		if (!xml.includes('<body>') || !xml.includes('</body>')) {
			errors.push('Missing body section');
		}
		const binaryMatches = xml.match(/<binary[^>]*>/gi) || [];
		const binaryIds = binaryMatches.map((m) => {
			const idMatch = m.match(/id="([^"]+)"/);
			return idMatch ? idMatch[1] : null;
		}).filter(Boolean);
		if (binaryIds.length !== binaryMatches.length) {
			errors.push('Some binary elements missing id attribute');
		}
		if (new Set(binaryIds).size !== binaryIds.length) {
			errors.push('Duplicate binary IDs detected');
		}
		if (errors.length > 0) {
			console.warn('FB2 XML validation warnings:', errors);
		}
	}
}
