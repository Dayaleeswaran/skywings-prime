import { useCallback, useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { supabase, applyQueries } from "../supabase";
import { DEFAULT_SETTINGS } from "./content";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, "");

// Sanitise admin-authored HTML before rendering.
export const clean = html => DOMPurify.sanitize(html || "", { USE_PROFILES: { html: true } });

export const safeUrl = u => (/^https?:\/\//i.test((u || "").trim()) ? u.trim() : "");

export async function fetchRows(table, queries = []) {
  const { data, error } = await applyQueries(supabase.from(table).select("*"), queries);
  if (error) { console.error(`[${table}]`, error.message); return []; }
  return data || [];
}

// Keeps a piece of data fresh without a page reload:
//  1. Supabase Realtime pushes a message the moment the admin changes the table (needs supabase/realtime.sql run once);
//  2. fallback: re-load when the tab gets focus again and every 45 s while the page is visible
//     (Realtime does not announce rows that just became hidden, and it does nothing until the SQL above is run).
function useLiveRefresh(table, load) {
  useEffect(() => {
    let timer;
    const soon = () => { clearTimeout(timer); timer = setTimeout(load, 300); }; // merge bursts of changes into one reload
    const channel = supabase
      .channel(`live-${table}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, soon)
      .subscribe();
    const onVisible = () => { if (document.visibilityState === "visible") soon(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", soon);
    const poll = setInterval(() => { if (document.visibilityState === "visible") load(); }, 45000);
    return () => {
      clearTimeout(timer); clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", soon);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
}

// Generic list hook: { rows, loading } (updates live)
export function useRows(table, queries = []) {
  const [state, setState] = useState({ rows: [], loading: true });
  const alive = useRef(true);
  const load = useCallback(() => fetchRows(table, queries).then(rows => { if (alive.current) setState({ rows, loading: false }); }),
    // queries are static per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table]);
  useEffect(() => { alive.current = true; load(); return () => { alive.current = false; }; }, [load]);
  useLiveRefresh(table, load);
  return state;
}

// ── Settings (shared promise; refreshed live) ──
let settingsPromise;
const loadSettings = force => {
  if (!settingsPromise || force) {
    settingsPromise = fetchRows("settings").then(rows => {
      const map = { ...DEFAULT_SETTINGS };
      rows.forEach(r => { if (r.value !== "" || !(r.key in DEFAULT_SETTINGS) || r.key.startsWith("stat_")) map[r.key] = r.value; });
      return map;
    });
  }
  return settingsPromise;
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const alive = useRef(true);
  const refresh = useCallback(() => loadSettings(true).then(s => { if (alive.current) setSettings(s); }), []);
  useEffect(() => {
    alive.current = true;
    loadSettings(false).then(s => { if (alive.current) setSettings(s); });
    return () => { alive.current = false; };
  }, []);
  useLiveRefresh("settings", refresh);
  return settings;
}

export const isDirectVideo = url => !!url && (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.includes("/storage/v1/object/"));

export function getEmbedUrl(url) {
  let embed = url || "";
  if (url.includes("youtube.com/watch?v=")) embed = `https://www.youtube.com/embed/${url.split("v=")[1].split("&")[0]}`;
  else if (url.includes("youtu.be/")) embed = `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
  else if (url.includes("vimeo.com/")) embed = `https://player.vimeo.com/video/${url.split("vimeo.com/")[1].split("?")[0]}`;
  const sep = embed.includes("?") ? "&" : "?";
  if (embed.includes("youtube.com")) embed += `${sep}autoplay=1&rel=0&modestbranding=1`;
  else if (embed.includes("vimeo.com")) embed += `${sep}autoplay=1`;
  return embed;
}

export const digits = n => (n || "").replace(/\D/g, "");
export const waLink = (number, text) => `https://wa.me/${digits(number)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// ── Analytics (consent-aware) ──
export function track(name, params = {}) {
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
    if (typeof window.fbq === "function") window.fbq("trackCustom", name, params);
  } catch { /* tracking must never break the page */ }
}

export function getConsent() {
  try { return JSON.parse(localStorage.getItem("sw_cookie_consent") || "null"); } catch { return null; }
}

let analyticsLoaded = false;
export function loadAnalytics(settings) {
  const consent = getConsent();
  if (analyticsLoaded || !consent) return;
  const { ga4_id, meta_pixel_id } = settings;
  if (consent.analytics && /^G-[A-Z0-9]+$/i.test(ga4_id || "")) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4_id}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ga4_id, { anonymize_ip: true });
    analyticsLoaded = true;
  }
  if (consent.marketing && /^\d{5,20}$/.test(meta_pixel_id || "")) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", meta_pixel_id);
    window.fbq("track", "PageView");
    analyticsLoaded = true;
  }
}

// ── SEO ──
export function setSeo({ title, description, path = "/", image, type = "website", noindex = false, jsonLd }) {
  const base = SITE_URL;
  document.title = title;
  const set = (attr, key, value) => {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
    el.setAttribute("content", value || "");
  };
  set("name", "description", description);
  set("property", "og:title", title);
  set("property", "og:description", description);
  set("property", "og:type", type);
  set("property", "og:url", base + path);
  set("property", "og:site_name", "Sky Wings Prime");
  const shareImage = image || `${base}/og-image.png`;
  set("property", "og:image", shareImage);
  set("name", "twitter:card", "summary_large_image");
  set("name", "twitter:image", shareImage);
  set("name", "twitter:title", title);
  set("name", "twitter:description", description);
  set("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
  canonical.href = base + path;

  document.head.querySelectorAll('script[data-seo-ld]').forEach(n => n.remove());
  (jsonLd ? [].concat(jsonLd) : []).forEach(obj => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo-ld", "1");
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  });
}

export const orgJsonLd = settings => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: settings.legal_name,
  alternateName: settings.brand_name,
  slogan: settings.tagline,
  url: SITE_URL,
  telephone: settings.phone,
  email: settings.email,
  address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "AE" },
  sameAs: [settings.social_instagram, settings.social_facebook, settings.social_linkedin, settings.social_tiktok].map(safeUrl).filter(Boolean),
});

export const breadcrumbJsonLd = items => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SITE_URL + it.path })),
});

export const slugify = t => (t || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const readTime = html => `${Math.max(1, Math.round((html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200))} min read`;
