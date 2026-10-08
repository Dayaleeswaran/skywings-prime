// Generates public/sitemap.xml and public/robots.txt before every build.
// Includes dynamic pages (services, projects, articles) when Supabase env vars are available.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const env = { ...process.env };
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2];
  }
}
const site = (env.VITE_SITE_URL || "").replace(/\/+$/, "");
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
const paths = ["/", "/about", "/services", "/work", "/concept-lab", "/events", "/team", "/insights", "/faq", "/contact", "/consultation",
  "/privacy-policy", "/terms-and-conditions", "/cookie-policy", "/disclaimer", "/accessibility"];

async function rows(table, filter, cols) {
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=${cols}&${filter}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

const services = await rows("services", "visible=eq.true", "slug");
const projects = await rows("portfolio", "visible=eq.true", "slug,id");
const posts = await rows("blog_posts", "published=eq.true", "slug,id,published_at");
services.forEach(r => r.slug && paths.push(`/services/${r.slug}`));
projects.forEach(r => paths.push(`/case-studies/${r.slug || r.id}`));
posts.filter(r => !r.published_at || new Date(r.published_at) <= new Date()).forEach(r => paths.push(`/insights/${r.slug || r.id}`));

if (!site) console.warn("[sitemap] VITE_SITE_URL is not set - URLs will be relative. Set it for production builds.");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(p => `  <url><loc>${site}${p}</loc></url>`).join("\n")}\n</urlset>\n`;
writeFileSync("public/sitemap.xml", xml);
writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\nDisallow: /thank-you\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`[sitemap] ${paths.length} URLs written`);
