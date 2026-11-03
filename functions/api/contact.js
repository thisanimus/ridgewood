// Cloudflare Pages Function — handles POST /api/contact from the contact form.
//
// 1. Reads the form (name, email, message; `company` is a honeypot).
// 2. Verifies the Cloudflare Turnstile token.
// 3. Emails the message to the office via Resend, with Reply-To set to the sender.
// 4. Redirects back to the contact page; the page shows the matching
//    confirmation with CSS (:target), so no client-side JavaScript is needed.
//
// Environment (Pages project → Settings → Variables and Secrets):
//   RESEND_API_KEY        secret
//   TURNSTILE_SECRET_KEY  secret
//   CONTACT_FROM          sender, on a domain verified in Resend,
//                         e.g. "Ridgewood Website <website@ridgewoodwealth.com>"
//   CONTACT_TO            where messages are delivered (comma-separate several)

const SENT = "/contact.html#message-sent";
const FAILED = "/contact.html#message-error";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
	const back = (path) => Response.redirect(new URL(path, request.url).toString(), 303);

	let form;
	try {
		form = await request.formData();
	} catch {
		return back(FAILED);
	}
	const field = (name, max) => String(form.get(name) ?? "").trim().slice(0, max);

	// Bots tend to fill every field; quietly pretend it worked.
	if (field("company", 200)) return back(SENT);

	const name = field("name", 200).replace(/\s+/g, " ");
	const email = field("email", 320);
	const message = field("message", 5000);
	if (!name || !message || !EMAIL.test(email)) return back(FAILED);

	const missing = ["RESEND_API_KEY", "TURNSTILE_SECRET_KEY", "CONTACT_FROM", "CONTACT_TO"].filter((key) => !env[key]);
	if (missing.length) {
		console.error("contact: missing environment variables:", missing.join(", "));
		return back(FAILED);
	}

	const human = await verifyTurnstile({
		secret: env.TURNSTILE_SECRET_KEY,
		token: field("cf-turnstile-response", 4096),
		ip: request.headers.get("CF-Connecting-IP"),
	});
	if (!human) return back(FAILED);

	const sent = await sendEmail(env, { name, email, message });
	return back(sent ? SENT : FAILED);
}

async function verifyTurnstile({ secret, token, ip }) {
	if (!token) return false;
	const body = new FormData();
	body.append("secret", secret);
	body.append("response", token);
	if (ip) body.append("remoteip", ip);
	try {
		const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
		const result = await res.json();
		if (!result.success) console.warn("contact: turnstile rejected:", result["error-codes"]);
		return result.success === true;
	} catch (err) {
		console.error("contact: turnstile verification failed:", err);
		return false;
	}
}

async function sendEmail(env, { name, email, message }) {
	const text = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");
	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: env.CONTACT_FROM,
				to: env.CONTACT_TO.split(",").map((address) => address.trim()).filter(Boolean),
				reply_to: email,
				subject: `Website enquiry from ${name}`,
				text,
			}),
		});
		if (!res.ok) console.error("contact: resend error", res.status, await res.text());
		return res.ok;
	} catch (err) {
		console.error("contact: resend request failed:", err);
		return false;
	}
}
