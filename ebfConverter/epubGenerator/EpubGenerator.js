/**
 * EpubGenerator — generates valid EPUB 3.0 files using JSZip.
 *
 * Structure:
 *   mimetype (STORED)
 *   META-INF/container.xml
 *   OEBPS/content.opf
 *   OEBPS/nav.xhtml (TOC)
 *   OEBPS/styles.css
 *   OEBPS/chapter1.xhtml … chapterN.xhtml
 *   OEBPS/images/image_1.png …
 */
import JSZip from 'jszip';
import { ImageEncoder } from '../imageEncoder/imageEncoder.js';
import { BookModel } from '../bookModel/BookModel.js';

export class EpubGenerator {
	/**
	 * Generate an EPUB file as a Blob.
	 * @param {string} title
	 * @param {string} author
	 * @param {string} text - Raw extracted text
	 * @param {Array} images - [{ data, width, height }]
	 * @param {string} language
	 * @returns {Promise<Blob>}
	 */
	async generate(title, author, text, images = [], language = 'en') {
		const zip = new JSZip();

		zip.file('mimetype', 'application/epub+zip', {
			compression: 'STORE',
			compressionOptions: { level: 0 },
		});

		zip.file('META-INF/container.xml', this._containerXml(), {
			compression: 'DEFLATE',
			compressionOptions: { level: 6 },
		});

		const oebps = zip.folder('OEBPS');

		oebps.file('styles.css', this._stylesCss(), {
			compression: 'DEFLATE',
			compressionOptions: { level: 6 },
		});

		const book = BookModel.fromText(text, { title, author, language, images });

		const imageManifestEntries = this._addImages(oebps, images);

		const chapterFiles = [];
		for (let i = 0; i < book.chapters.length; i++) {
			const chapter = book.chapters[i];
			const fileName = `chapter${i + 1}.xhtml`;
			oebps.file(fileName, this._buildChapterXhtml(chapter, i), {
				compression: 'DEFLATE',
				compressionOptions: { level: 6 },
			});
			chapterFiles.push(fileName);
		}

		oebps.file('nav.xhtml', this._buildNavXhtml(book), {
			compression: 'DEFLATE',
			compressionOptions: { level: 6 },
		});

		oebps.file('content.opf', this._buildContentOpf(book, language, imageManifestEntries, chapterFiles), {
			compression: 'DEFLATE',
			compressionOptions: { level: 6 },
		});

		for (const fileName of chapterFiles) {
			const content = await zip.file(`OEBPS/${fileName}`).async('string');
			this._validateXhtml(content, fileName);
		}
		this._validateXhtml(await zip.file('OEBPS/nav.xhtml').async('string'), 'nav.xhtml');

		return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
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
		if (!images || images.length === 0) return entries;

		for (let i = 0; i < images.length; i++) {
			const img = images[i];
			try {
				const imgData = ImageEncoder.normalizeImageData(img);
				const fileName = `images/image_${i + 1}.png`;
				oebps.file(fileName, imgData, {
					base64: false,
					compression: 'DEFLATE',
					compressionOptions: { level: 6 },
				});
				entries.push(`    <item id="img${i + 1}" href="${fileName}" media-type="image/png"/>`);
			} catch (e) {
				console.warn(`Warning: Could not add image ${i + 1}:`, e.message);
			}
		}
		return entries;
	}

	_buildChapterXhtml(chapter, chapterIndex) {
		let html = '';
		if (chapter.title) {
			html += `<h1>${this._escapeHtml(chapter.title)}</h1>\n`;
		}
		for (const para of chapter.paragraphs) {
			const trimmed = para.trim();
			if (trimmed) {
				html += `<p>${this._escapeHtml(trimmed)}</p>\n`;
			}
		}

		const chapterTitle = chapter.title || `Chapter ${chapterIndex + 1}`;
		return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>${this._escapeHtml(chapterTitle)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
${html}
</body>
</html>`;
	}

	_buildNavXhtml(book) {
		let tocEntries = '';
		for (let i = 0; i < book.chapters.length; i++) {
			const chapter = book.chapters[i];
			tocEntries += `      <li><a href="chapter${i + 1}.xhtml">${this._escapeHtml(chapter.title || `Chapter ${i + 1}`)}</a></li>\n`;
		}

		return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>Table of Contents</title>
  <style type="text/css">
    nav#toc ol { list-style-type: none; padding-left: 0; }
    nav#toc li { margin: 0.5em 0; }
    nav#toc a { text-decoration: none; color: #000; }
  </style>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
${tocEntries}    </ol>
  </nav>
</body>
</html>`;
	}

	_buildContentOpf(book, language, imageManifestEntries, chapterFiles) {
		const langCode = this._validateLanguageCode(language);
		const imageManifest = imageManifestEntries.join('\n');

		let chapterManifest = '';
		let chapterSpine = '';
		for (let i = 0; i < chapterFiles.length; i++) {
			const id = `chapter${i + 1}`;
			chapterManifest += `    <item id="${id}" href="${chapterFiles[i]}" media-type="application/xhtml+xml"/>\n`;
			chapterSpine += `    <itemref idref="${id}"/>\n`;
		}

		return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:${this._generateUUID()}</dc:identifier>
    <dc:title>${this._escapeXml(book.title)}</dc:title>
    <dc:creator id="creator">${this._escapeXml(book.author)}</dc:creator>
    <dc:language>${langCode}</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, '')}Z</meta>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
  </metadata>
  <manifest>
    <item id="styles" href="styles.css" media-type="text/css"/>
${chapterManifest}    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
${imageManifest}
  </manifest>
  <spine>
${chapterSpine}  </spine>
</package>`;
	}

	_validateXhtml(xhtml, fileName) {
		const errors = [];
		if (/&(?!amp;|lt;|gt;|quot;|#39;|apos;)/g.test(xhtml)) {
			errors.push('Contains unescaped ampersands (&)');
		}
		for (const elem of ['br', 'hr', 'img', 'input', 'meta', 'link']) {
			const regex = new RegExp(`<${elem}[^>]*(?<!/)>`, 'gi');
			const matches = xhtml.match(regex);
			if (matches && matches.length > 0) {
				errors.push(`Void element <${elem}> should be self-closing`);
			}
		}
		const imgsWithoutAlt = xhtml.match(/<img(?![^>]*\balt=)[^>]*>/gi);
		if (imgsWithoutAlt && imgsWithoutAlt.length > 0) {
			errors.push('Image(s) missing alt attribute');
		}
		if (errors.length > 0) {
			console.warn(`XHTML validation warnings for ${fileName}:`, errors);
		}
	}

	_validateLanguageCode(lang) {
		if (!lang || typeof lang !== 'string') return 'en';
		const code = lang.trim().toLowerCase();
		return /^[a-z]{2}(-[A-Z]{2})?$/.test(code) ? code : 'en';
	}

	_escapeXml(str) {
		if (!str) return '';
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	}

	_escapeHtml(str) {
		if (!str) return '';
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}

	_generateUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
}
