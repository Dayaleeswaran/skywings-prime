// Runs after `vite build`. Writes one static HTML file per route (dist/<route>/index.html) with that page's own
// <title>, description, canonical, Open Graph / Twitter tags, JSON-LD and a plain-HTML fallback (headings, text and links).
// Crawlers and social-link previews (WhatsApp, LinkedIn, Facebook) do not run JavaScript, so without this every page
// would share the home page's metadata. The React app still takes over in the browser and keeps the tags in sync.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const env = { ...process.env };
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2];
  }
}
const SITE = (env.VITE_SITE_URL || "").replace(/\/+$/, "");
const SB = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_ANON_KEY;
const OG_IMAGE = `${SITE}/og-image.png`;

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = s => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function rows(table, filter, cols) {
  if (!SB || !KEY) return [];
  try {
    const res = await fetch(`${SB}/rest/v1/${table}?select=${cols}&${filter}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

const settingsRows = await rows("settings", "key=in.(brand_name,legal_name,phone,phone_2,email,address,social_instagram,social_facebook,social_linkedin,social_tiktok)", "key,value");
const S = Object.fromEntries(settingsRows.map(r => [r.key, r.value]));
const legalName = S.legal_name || "Skywings Prime Marketing Management";
const sameAs = [S.social_instagram, S.social_facebook, S.social_linkedin, S.social_tiktok].filter(v => /^https?:\/\//.test(v || ""));

const org = {
  "@context": "https://schema.org", "@type": "ProfessionalService", name: legalName, alternateName: S.brand_name || "Sky Wings Prime",
  slogan: "Giving You Wings", url: SITE, telephone: [S.phone || "+971 50 527 3277", S.phone_2 || "+971 54 724 9877"], email: S.email || undefined,
  address: { "@type": "PostalAddress", streetAddress: S.address || "232, Muhaisnah, Dubai, UAE", addressCountry: "AE" }, sameAs,
};
const crumbs = items => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SITE + it.path })) });

const routes = [
  { path: "/", title: "Sky Wings Prime | Marketing Management & Brand Strategy in Dubai", description: "Sky Wings Prime is a Middle East-based marketing management company helping businesses strengthen their brand, improve market positioning and build sustainable growth.", ld: [org] },
  { path: "/about", title: "About Sky Wings Prime | Marketing Strategy & Brand Consultancy in Dubai", description: "Sky Wings Prime is a Middle East-based independent marketing strategy and brand consultancy with an international perspective." },
  { path: "/services", title: "Marketing Services in Dubai | Sky Wings Prime", description: "Digital marketing, social media, branding, content, advertising, strategy and corporate marketing management from Sky Wings Prime in Dubai." },
  { path: "/work", title: "Work & Case Studies | Sky Wings Prime", description: "Client work and clearly labelled concept projects from Sky Wings Prime across branding, digital, social, campaigns and events." },
  { path: "/concept-lab", title: "Concept Lab | Sky Wings Prime", description: "Strategy in action: clearly labelled concept projects demonstrating Sky Wings Prime's marketing and brand thinking." },
  { path: "/events", title: "Events & Promotional Marketing | Sky Wings Prime", description: "Corporate event promotion, exhibition marketing, product launches and brand activations from Sky Wings Prime in Dubai." },
  { path: "/team", title: "Our Team | Sky Wings Prime", description: "Meet the people behind the strategy at Sky Wings Prime." },
  { path: "/insights", title: "Insights | Sky Wings Prime", description: "Articles on marketing strategy, brand management, digital marketing and growth from Sky Wings Prime in Dubai." },
  { path: "/faq", title: "FAQ | Sky Wings Prime", description: "Answers to common questions about Sky Wings Prime's services, location and how to request a consultation." },
  { path: "/contact", title: "Contact Sky Wings Prime | Dubai Marketing Consultancy", description: "Contact Sky Wings Prime in Dubai by form, phone, email or WhatsApp." },
  { path: "/consultation", title: "Request a Private Consultation | Sky Wings Prime", description: "Request a private marketing consultation with Sky Wings Prime in Dubai." },
  { path: "/privacy-policy", title: "Privacy Policy | Sky Wings Prime", description: `Privacy Policy of ${legalName}.` },
  { path: "/terms-and-conditions", title: "Terms & Conditions | Sky Wings Prime", description: `Terms & Conditions of ${legalName}.` },
  { path: "/cookie-policy", title: "Cookie Policy | Sky Wings Prime", description: `Cookie Policy of ${legalName}.` },
  { path: "/disclaimer", title: "Disclaimer | Sky Wings Prime", description: `Disclaimer of ${legalName}.` },
  { path: "/accessibility", title: "Accessibility Statement | Sky Wings Prime", description: `Accessibility Statement of ${legalName}.` },
];

for (const s of await rows("services", "visible=eq.true&order=sort_order.asc", "slug,title,subtitle,description,seo_title,seo_description,items")) {
  if (!s.slug) continue;
  const path = `/services/${s.slug}`;
  routes.push({
    path, title: s.seo_title || `${s.title} in Dubai | Sky Wings Prime`, description: s.seo_description || s.subtitle || s.description, h1: s.title,
    body: [s.description, ...(s.items || [])].filter(Boolean),
    ld: [{ "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.description || s.subtitle, provider: { "@type": "ProfessionalService", name: legalName, url: SITE }, areaServed: "United Arab Emirates" },
      crumbs([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.title, path }])],
  });
}
for (const p of await rows("portfolio", "visible=eq.true", "slug,id,title,summary,project_type,cover_url")) {
  const path = `/case-studies/${p.slug || p.id}`;
  routes.push({ path, title: `${p.title} | Sky Wings Prime`, description: p.summary || `${p.title} — ${p.project_type === "concept" ? "a concept project" : "case study"} by Sky Wings Prime.`, h1: p.title, image: p.cover_url, ld: [crumbs([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: p.title, path }])] });
}
for (const a of await rows("blog_posts", "published=eq.true", "slug,id,title,excerpt,author,published_at,featured_image,seo_title,seo_description")) {
  if (a.published_at && new Date(a.published_at) > new Date()) continue; // scheduled
  const path = `/insights/${a.slug || a.id}`;
  routes.push({
    path, type: "article", title: a.seo_title || `${a.title} | Sky Wings Prime`, description: a.seo_description || strip(a.excerpt).slice(0, 160), h1: a.title, image: a.featured_image,
    ld: [{ "@context": "https://schema.org", "@type": "Article", headline: a.title, datePublished: a.published_at, author: { "@type": "Person", name: a.author || "Sky Wings Prime" }, image: a.featured_image || undefined, mainEntityOfPage: SITE + path, publisher: { "@type": "Organization", name: legalName } },
      crumbs([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: a.title, path }])],
  });
}

const template = readFileSync("dist/index.html", "utf8");
const NAV = [["/", "Home"], ["/about", "About"], ["/services", "Services"], ["/work", "Work"], ["/events", "Events"], ["/insights", "Insights"], ["/contact", "Contact"], ["/consultation", "Request a Consultation"]];

function render(r) {
  const img = r.image && /^https?:\/\//.test(r.image) ? r.image : OG_IMAGE;
  const head = [
    `<link rel="canonical" href="${esc(SITE + r.path)}" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:type" content="${r.type || "website"}" />`,
    `<meta property="og:url" content="${esc(SITE + r.path)}" />`,
    `<meta property="og:site_name" content="Sky Wings Prime" />`,
    `<meta property="og:image" content="${esc(img)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(r.title)}" />`,
    `<meta name="twitter:description" content="${esc(r.description)}" />`,
    `<meta name="twitter:image" content="${esc(img)}" />`,
    ...(r.ld || []).map(o => `<script type="application/ld+json" data-seo-ld="1">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`),
  ].join("\n    ");
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(r.description)}" />`)
    .replace("</head>", `    ${head}\n  </head>`);
  const fallback = `<noscript><h1>${esc(r.h1 || r.title)}</h1><p>${esc(r.description)}</p>${(r.body || []).map(b => `<p>${esc(b)}</p>`).join("")}<nav>${NAV.map(([p, l]) => `<a href="${p}">${l}</a>`).join(" · ")}</nav><p>${esc(legalName)} · ${esc(S.address || "232, Muhaisnah, Dubai, UAE")} · ${esc(S.phone || "+971 50 527 3277")}</p></noscript>`;
  return html.replace(/<noscript>[\s\S]*?<\/noscript>/, fallback);
}

if (!SITE) console.warn("[prerender] VITE_SITE_URL is not set — canonical and Open Graph URLs will be relative. Set it for production builds.");
for (const r of routes) {
  const file = r.path === "/" ? "dist/index.html" : join("dist", r.path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(r));
}
console.log(`[prerender] ${routes.length} pages written`);
