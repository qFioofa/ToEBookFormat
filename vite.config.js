import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	resolve: {
		alias: {
			'@ebfStyle': "@ebfStyle"
		}
	},
	server: {
		host: '0.0.0.0',
		port: 5173,
		fs: {
			allow: ['@ebfStyle']
		}
	},
	preview: {
		host: '0.0.0.0',
		port: 4173,
		allowedHosts: true
	},
	plugins: [sveltekit()]
});

