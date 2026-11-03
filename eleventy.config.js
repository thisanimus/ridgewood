// Eleventy build for the Ridgewood Wealth Management site.
// Output (_site) is a plain static site, ready for Cloudflare Pages.
import { existsSync } from "node:fs";

// Locally, read build-time variables (PUBLIC_TURNSTILE_SITE_KEY) from .env.
// On Cloudflare Pages they come from the project's environment variables.
if (existsSync(".env")) process.loadEnvFile(".env");

export default function (eleventyConfig) {
	// Static assets (CSS component files, images, JS, documents) are copied as-is;
	// main.css @imports each CSS component file at runtime.
	eleventyConfig.addPassthroughCopy("src/assets");

	return {
		dir: {
			input: "src",
			includes: "_includes",
			data: "_data",
			output: "_site",
		},
		templateFormats: ["liquid"],
		htmlTemplateEngine: "liquid",
	};
}
