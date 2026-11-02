import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

// Renders the kb the way the desk sees it: static pages in rendered/.
export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [
        vitePreprocess(),
        mdsvex({ extensions: ['.svx'], layout: { runbook } }),
      ],
      adapter: adapter({ pages: 'rendered', assets: 'rendered', strict: false }),
      inlineStyleThreshold: Infinity,
      prerender: { entries: ['*'], handleHttpError: 'warn' },
    }),
  ],
});
