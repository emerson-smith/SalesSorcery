import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
	name: "SalesSorcery",
	description:
		"Elevate your software demos with effortless personalization, real-time customization, and privacy control for any webpage during your sales pitch.",
	version: "0.1.0",
	manifest_version: 3,
	icons: {
		16: "img/logo-16.png",
		32: "img/logo-32.png",
		48: "img/logo-48.png",
		128: "img/logo-128.png",
	},
	action: {
		default_popup: "popup.html",
		default_icon: "img/logo-48.png",
	},
	options_page: "options.html",
	background: {
		service_worker: "src/background/index.js",
		type: "module",
	},
	content_scripts: [
		{
			matches: ["http://*/*", "https://*/*"],
			js: ["src/content/index.js"],
			css: ["style/content.css"],
			run_at: "document_idle",
		},
	],
	web_accessible_resources: [
		{
			resources: ["img/logo-16.png", "img/logo-32.png", "img/logo-48.png", "img/logo-128.png", "style/content.css"],
			matches: [],
		},
	],
	permissions: ["storage"],
});
