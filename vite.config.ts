import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	base: 'https://empty-dubs.github.io/discograph/',
	plugins: [tailwindcss(), sveltekit()]
});
