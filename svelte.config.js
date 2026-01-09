import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@ebfStyle': './@ebfStyle/*',
			'@ebfElements': './@ebfElements/*',
			'@ebfTranslate': './@ebfTranslate/*'
		}
	}
};

export default config;

