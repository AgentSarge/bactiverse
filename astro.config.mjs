// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Static site for Cloudflare Pages (`npm run build` → `dist`).
// Do not add @astrojs/cloudflare — Pages serves the static output only.
export default defineConfig({
	output: 'static',
	integrations: [react()],
});
