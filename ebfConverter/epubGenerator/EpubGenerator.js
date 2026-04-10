/**
 * EpubGenerator — generates valid EPUB 3.0 files using JSZip.
 * Produces a fully compliant EPUB with:
 * - mimetype (STORED, no compression)
 * - META-INF/container.xml
 * - OEBPS/styles.css
 * - OEBPS/chapter1.xhtml (content)
 * - OEBPS/nav.xhtml (navigation document)
 * - OEBPS/content.opf (package document)
 * - OEBPS/images/ (embedded images)
 */
import JSZip from 'jszip';
import { ImageEncoder } from '../imageEncoder/imageEncoder.js';

export class EpubGenerator {
	/**
	 * Generate an EPUB file as a Blob.
	 * @param {string} title
	 * @param {string} author
	 * @param {string} text — clean body text (paragraphs separated by \n\n)
	 * @param {Array} images — array of { data, width, height }
	 * @param {string} language
	 * @returns {Promise<Blob>}
	 */
	async generate(title, author, text, images = [], language = 'en') {
		try {
			const zip = new JSZip();

			// mimetype must be first, stored with no compression
			zip.file('mimetype', 'application/epub+zip', {
				compression: 'STORE',
				compressionOptions: { level: 0 }
			});

			// Container
			zip.file('META-INF/container.xml', this._containerXml(), {
				compression: 'DEFLATE',
				compressionOptions: { level: 6 }
			});

			const oebps = zip.folder('OEBPS');

			// Styles
			oebps.file('styles.css', this._stylesCss(), {
				compression: 'DEFLATE',
				compressionOptions: { level: 6 }
			});

			// Images
			const imageManifestEntries = this._addImages(oebps, images);

			// Chapter content
			const chapterXhtml = this._buildChapterXhtml(title, author, text, images);
			oebps.file('chapter1.xhtml', chapterXhtml, {
				compression: 'DEFLATE',
				compressionOptions: { level: 6 }
			});

			// Navigation
			const navXhtml = this._buildNavXhtml(title);
			oebps.file('nav.xhtml', navXhtml, {
				compression: 'DEFLATE',
				compressionOptions: { level: 6 }
			});

			// Package document
			const contentOpf = this._buildContentOpf(title, author, language, imageManifestEntries);
			oebps.file('content.opf', contentOpf, {
				compression: 'DEFLATE',
				compressionOptions: { level: 6 }
			});

			// Validate
			this._validateXhtml(chapterXhtml, 'chapter1.xhtml');
			this._validateXhtml(navXhtml, 'nav.xhtml');

			const blob = await zip.generateAsync({
				type: 'blob',
				mimeType: 'application/epub+zip'
			});

			return blob;
		} catch (error) {
			console.error('Error creating EPUB:', error);
			throw new Error('Failed to create EPUB: ' + error.message);
		}
	}

	_containerXml() {
		return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
	}

	_stylesCss() {
		return `body {
  font-family: Georgia, "Times New Roman", serif;
  line-height: 1.6;
  margin: 1em;
  text-align: justify;
}
h1 {
  font-size: 1.8em;
  font-weight: bold;
  margin: 1.5em 0 1em 0;
  text-align: center;
  page-break-before: always;
}
h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 1.2em 0 0.8em 0;
  text-align: center;
  page-break-before: auto;
}
h3 {
  font-size: 1.2em;
  font-weight: bold;
  margin: 1em 0 0.6em 0;
}
p {
  text-indent: 1em;
  margin: 0.5em 0;
}
p.no-indent {
  text-indent: 0;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
}
hr {
  border: none;
  border-top: 1px solid #999999;
  margin: 1.5em 0;
}
`;
	}

	_addImages(oebps, images) {
		const entries = [];
		if (images && images.length > 0) {
			for (let i = 0; i < images.length; i++) {
				const img = images[i];
				try {
					const imgData = ImageEncoder.normalizeImageData(img);
					const fileName = `images/image_${i + 1}.png`;
					oebps.file(fileName, imgData, { base64: false, compression: 'DEFLATE', compressionOptions: { level: 6 } });
					entries.push(`    <item id="img${i + 1}" href="${fileName}" media-type="image/png"/>`);
				} catch (e) {
					console.warn(`Warning: Could not add image ${i + 1}:`, e.message);
				}
			}
		}
		return entries;
	}

	_buildChapterXhtml(title, author, text, images) {
		const paragraphs = text.split('\n\n').filter(p => p.trim());
		let html = '';

		html += `<h1>${this._escapeHtml(title || 'Untitled Book')}</h1>\n`;
		html += `<p class="no-indent">by ${this._escapeHtml(author || 'Unknown Author')}</p>\n`;
		html += `<hr/>\n`;

		for (const para of paragraphs) {
			const trimmed = para.trim();
			if (trimmed) {
				html += `<p>${this._escapeHtml(trimmed)}</p>\n`;
			}
		}

		return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>${this._escapeHtml(title || 'Untitled Book')}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
${html}
</body>
</html>`;
	}

	_buildNavXhtml(title) {
		return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>Table of Contents</title>
  <style type="text/css">
    nav#toc ol {
      list-style-type: none;
      padding-left: 0;
    }
    nav#toc li {
      margin: 0.5em 0;
    }
    nav#toc a {
      text-decoration: none;
      color: #000000;
    }
  </style>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="chapter1.xhtml">${this._escapeHtml(title || 'Untitled Book')}</a></li>
    </ol>
  </nav>
</body>
</html>`;
	}

	_buildContentOpf(title, author, language, imageManifestEntries) {
		const langCode = this._validateLanguageCode(language);
		const imageManifest = imageManifestEntries.join('\n');

		return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:${this._generateUUID()}</dc:identifier>
    <dc:title>${this._escapeXml(title || 'Untitled Book')}</dc:title>
    <dc:creator id="creator">${this._escapeXml(author || 'Unknown Author')}</dc:creator>
    <dc:language>${langCode}</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, '')}Z</meta>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
  </metadata>
  <manifest>
    <item id="styles" href="styles.css" media-type="text/css"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
${imageManifest}
  </manifest>
  <spine>
    <itemref idref="chapter1"/>
  </spine>
</package>`;
	}

	_validateXhtml(xhtml, fileName) {
		const errors = [];
		const unescapedAmpersand = /&(?!amp;|lt;|gt;|quot;|#39;|apos;)/g;
		if (unescapedAmpersand.test(xhtml)) {
			errors.push('Contains unescaped ampersands (&)');
		}
		const voidElements = ['br', 'hr', 'img', 'input', 'meta', 'link'];
		for (const elem of voidElements) {
			const regex = new RegExp(`<${elem}[^>]*(?<!/)>`, 'gi');
			const matches = xhtml.match(regex);
			if (matches && matches.length > 0) {
				errors.push(`Void element <${elem}> should be self-closing: <${elem} ... />`);
			}
		}
		const imgsWithoutAlt = xhtml.match(/<img(?![^>]*\balt=)[^>]*>/gi);
		if (imgsWithoutAlt && imgsWithoutAlt.length > 0) {
			errors.push('Image(s) missing alt attribute');
		}
		if (errors.length > 0) {
			console.warn(`XHTML validation warnings for ${fileName}:`, errors);
		}
		return errors.length === 0;
	}

	_validateLanguageCode(lang) {
		if (!lang || typeof lang !== 'string') return 'en';
		const code = lang.trim().toLowerCase();
		if (/^[a-z]{2}(-[A-Z]{2})?$/.test(code)) return code;
		return 'en';
	}

	_escapeXml(str) {
		if (!str) return '';
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');
	}

	_escapeHtml(str) {
		if (!str) return '';
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	_generateUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
}
