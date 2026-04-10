/**
 * ImageEncoder — utilities for encoding, converting, and validating images
 * for embedding in ebook formats (EPUB, FB2, etc.).
 */
export class ImageEncoder {
	/**
	 * Convert image data (Uint8Array/ArrayBuffer) to base64 string.
	 * @param {Uint8Array|ArrayBuffer|object} data
	 * @returns {string}
	 */
	static toBase64(data) {
		let bytes;
		if (data instanceof ArrayBuffer) {
			bytes = new Uint8Array(data);
		} else if (data instanceof Uint8Array) {
			bytes = data;
		} else if (typeof data === 'object' && data !== null) {
			bytes = new Uint8Array(data);
		} else {
			throw new Error('Unsupported image data format');
		}
		let binary = '';
		for (let i = 0; i < bytes.length; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	/**
	 * Validate and normalize image data to Uint8Array.
	 * @param {object} img — { data, width, height }
	 * @returns {Uint8Array}
	 */
	static normalizeImageData(img) {
		if (!img || !img.data) {
			throw new Error('Invalid image data');
		}
		const data = img.data;
		if (data instanceof Uint8Array) return data;
		if (data instanceof ArrayBuffer) return new Uint8Array(data);
		if (typeof data === 'object') {
			try {
				return new Uint8Array(data);
			} catch (e) {
				throw new Error('Cannot convert image data');
			}
		}
		throw new Error('Unsupported image data format');
	}

	/**
	 * Convert an array of image objects to EPUB manifest entries.
	 * @param {Array} images
	 * @returns {Array<{id: string, href: string, mediaType: string}>}
	 */
	static toEpubManifestEntries(images) {
		const entries = [];
		for (let i = 0; i < images.length; i++) {
			const img = images[i];
			if (img && img.data) {
				entries.push({
					id: `img${i + 1}`,
					href: `images/image_${i + 1}.png`,
					mediaType: 'image/png'
				});
			}
		}
		return entries;
	}

	/**
	 * Convert images to FB2 binary elements string.
	 * Limits to 50 images to keep file size reasonable.
	 * @param {Array} images
	 * @returns {string}
	 */
	static toFb2BinaryElements(images) {
		if (!images || images.length === 0) return '';

		const elements = [];
		const limit = Math.min(images.length, 50);

		for (let i = 0; i < limit; i++) {
			const img = images[i];
			if (img && img.data) {
				try {
					const base64 = this.toBase64(img.data);
					const imageId = `img_${i + 1}`;
					elements.push(
						`  <binary xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" content-type="image/png" id="${imageId}">${base64}</binary>`
					);
				} catch (e) {
					console.warn(`Warning: Could not convert image ${i}:`, e.message);
				}
			}
		}

		return elements.length > 0 ? '\n' + elements.join('\n') + '\n' : '';
	}

	/**
	 * Validate that an image object has the required properties.
	 * @param {object} img
	 * @returns {boolean}
	 */
	static isValidImage(img) {
		return img && img.data && img.width && img.height;
	}

	/**
	 * Generate an image reference for use in HTML/XHTML.
	 * @param {number} index — 1-based image index
	 * @param {string} [alt]
	 * @returns {string}
	 */
	static toHtmlImg(index, alt = '') {
		return `<img src="images/image_${index}.png" alt="${alt}" />`;
	}
}
