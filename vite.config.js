import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	resolve: {
		alias: {
			'@ebfStyle': "@ebfStyle",
			'@ebfElements': '@ebfElements',
			'@ebfTranslate': '@ebfTranslate'
		}
	},
	server: {
		host: '0.0.0.0',
		port: 5173,
		fs: {
			allow: [
				'@ebfStyle',
				'@ebfTranslate',
				"@ebfElements"
			]
		}
	},
	preview: {
		host: '0.0.0.0',
		port: 4173,
		allowedHosts: true
	},
	plugins: [sveltekit()]
});

