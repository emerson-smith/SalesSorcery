import { defineConfig, loadEnv } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";

import manifest from "./src/manifest.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		build: {
			emptyOutDir: true,
			outDir: "build",
			rollupOptions: {
				output: {
					chunkFileNames: "assets/chunk-[hash].js",
				},
			},
		},
		define: {
			"process.env": env,
		},
		plugins: [crx({ manifest }), react()],
	};
});
