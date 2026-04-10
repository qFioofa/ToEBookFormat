import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@ebfStyle': './ebfStyle',
			'@ebfElements': './ebfElements',
			'@ebfTranslate': './ebfTranslate',
			'@ebfConverter': './ebfConverter'
		}
	}
};

export default config;

