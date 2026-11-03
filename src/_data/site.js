// Site-wide data used by the layout, masthead and footer.
export default {
	name: "Ridgewood Wealth Management",
	legalName: "Ridgewood Wealth Management LLC",
	themeColor: "#1e355a",

	// Primary nav. `key` matches each page's `nav` front matter for aria-current.
	nav: [
		{ key: "home", label: "Home", href: "index.html" },
		{ key: "about", label: "About", href: "about.html" },
		{ key: "wealth-navigator", label: "Wealth Navigator", href: "wealth-navigator.html" },
		{ key: "process", label: "Process", href: "our-process.html" },
		{ key: "contact", label: "Contact", href: "contact.html" },
	],
	clientPortal: "https://wealth.emaplan.com/ema/SignIn?ema=",

	// Public Turnstile site key for the contact form (set at build time)
	turnstileSiteKey: process.env.PUBLIC_TURNSTILE_SITE_KEY ?? "",

	address: {
		lines: ["180 State Street, Suite 225", "Southlake, TX 76092"],
		map: "https://goo.gl/maps/J8ZoKLAH1sEjjQQP7",
	},
	phone: { display: "(817) 301-5190", tel: "+18173015190" },
	social: [
		{ label: "Twitter", href: "https://twitter.com/RidgewoodWealth" },
		{ label: "LinkedIn", href: "https://www.linkedin.com/company/ridgewood-wealth-management/" },
	],
	legal: [
		{ label: "Business Information", href: "legal.html#business-information" },
		{ label: "Privacy Policy", href: "legal.html#privacy-policy" },
		{ label: "Website Content", href: "legal.html#website-content" },
	],
};
