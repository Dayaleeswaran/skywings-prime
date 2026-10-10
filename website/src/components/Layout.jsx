import { useEffect, useState } from "react";
import { Link, useRouter } from "../lib/router";
import { LEGAL_LINKS, NAV } from "../lib/content";
import { getConsent, loadAnalytics, safeUrl, track, waLink } from "../lib/data";
import { Magnetic } from "./Fx";

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Sky Wings Prime — home">
      <img className="brand-icon" src="/logo-icon.png" alt="" width="64" height="41" />
      <span className="brand-text">Sky Wings <em>Prime</em><small>Giving You Wings</small></span>
    </Link>
  );
}

export function Announcement({ s }) {
  const text = (s.announcement_text || "").trim();
  if (!text) return null;
  const link = safeUrl(s.announcement_link) || (s.announcement_link?.startsWith("/") ? s.announcement_link : "");
  return (
    <div className="announce" role="region" aria-label="Announcement">
      {text} {link && <Link to={link}>Learn more</Link>}
    </div>
  );
}

export function Header() {
  const { path } = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const current = to => (to === "/" ? path === "/" : path === to || path.startsWith(to + "/"));
  return (
    <header className={`header${scrolled || open ? " scrolled" : ""}`}>
      <div className="container header-inner">
        <Magnetic strength={12}><Brand /></Magnetic>
        <nav className={`nav${open ? " open" : ""}`} aria-label="Main">
          {NAV.map(n => <Link key={n.to} to={n.to} aria-current={current(n.to) ? "page" : undefined}>{n.label}</Link>)}
          <Link to="/consultation" className="btn btn-primary" style={{ marginTop: open ? 10 : 0 }}>Request a Consultation</Link>
        </nav>
        <button className="menu-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? "✕" : "☰"}</button>
      </div>
    </header>
  );
}

const SOCIALS = [
  ["social_instagram", "Instagram", "IG"],
  ["social_facebook", "Facebook", "f"],
  ["social_linkedin", "LinkedIn", "in"],
  ["social_tiktok", "TikTok", "TT"],
];

export function Footer({ s, services, onCookieSettings }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="footer-wordmark" aria-label="Sky Wings Prime — home"><span>Sky Wings <em>Prime</em></span><small>Giving You Wings</small></Link>
            <p className="muted" style={{ marginTop: 18, maxWidth: 320 }}>
              A Middle East-based marketing management company helping businesses strengthen their brand and build sustainable growth.
            </p>
            <div className="socials">
              {SOCIALS.map(([key, label, glyph]) => {
                const url = safeUrl(s[key]);
                return url ? <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} onClick={() => track("outbound_social_click", { network: label })}>{glyph}</a> : null;
              })}
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              {NAV.map(n => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
              <li><Link to="/team">Team</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              {services.slice(0, 10).map(sv => <li key={sv.id}><Link to={`/services/${sv.slug}`}>{sv.title}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="muted">
              <li>{s.address}</li>
              <li><a href={`tel:${s.phone.replace(/\s/g, "")}`} onClick={() => track("phone_click")}>{s.phone}</a></li>
              {s.phone_2 && <li><a href={`tel:${s.phone_2.replace(/\s/g, "")}`} onClick={() => track("phone_click")}>{s.phone_2}</a></li>}
              <li><a href={`mailto:${s.email}`} onClick={() => track("email_click")}>{s.email}</a></li>
              {s.media_permit_no && <li>National Media Council Permit No. {s.media_permit_no}</li>}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {s.legal_name}. All Rights Reserved.</span>
          <span style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            {LEGAL_LINKS.map(l => <Link key={l.to} to={l.to}>{l.label}</Link>)}
            <button className="link-btn" onClick={onCookieSettings}>Cookie settings</button>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat({ s }) {
  const [open, setOpen] = useState(false);
  const { path } = useRouter();
  const msg = `Hello Sky Wings Prime, I'd like to know more${path !== "/" ? ` about: ${document.title.split("|")[0].trim()}` : ""}.`;
  const options = [
    s.whatsapp_uae && { label: "UAE", number: s.whatsapp_uae },
    s.whatsapp_sl && { label: "Sri Lanka", number: s.whatsapp_sl },
  ].filter(Boolean);
  if (!options.length) return null;
  const click = () => track("whatsapp_click");
  return (
    <div className="wa">
      {open && options.length > 1 && (
        <div className="wa-menu" role="menu">
          {options.map(o => (
            <a key={o.label} role="menuitem" href={waLink(o.number, msg)} target="_blank" rel="noopener noreferrer" onClick={click}>
              WhatsApp — {o.label}<small>{o.number}</small>
            </a>
          ))}
        </div>
      )}
      {options.length > 1 ? (
        <button className="wa-btn" aria-label="Chat on WhatsApp" aria-expanded={open} onClick={() => setOpen(o => !o)}>💬</button>
      ) : (
        <a className="wa-btn" aria-label="Chat on WhatsApp" href={waLink(options[0].number, msg)} target="_blank" rel="noopener noreferrer" onClick={click}>💬</a>
      )}
    </div>
  );
}

export function CookieBanner({ s, forceOpen, onClose }) {
  const [visible, setVisible] = useState(() => !getConsent());
  const [manage, setManage] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false, preferences: false });

  useEffect(() => { if (forceOpen) { setVisible(true); setManage(true); } }, [forceOpen]);
  useEffect(() => { loadAnalytics(s); }, [s]);

  const save = choice => {
    localStorage.setItem("sw_cookie_consent", JSON.stringify({ ...choice, essential: true, at: new Date().toISOString() }));
    setVisible(false); setManage(false); onClose?.();
    loadAnalytics(s);
  };
  if (!visible) return null;
  return (
    <div className="cookie" role="dialog" aria-label="Cookie consent">
      <p>We use cookies to operate our website, understand website usage and support marketing activities. You can accept all cookies, reject non-essential cookies or manage your preferences. See our <Link to="/cookie-policy" style={{ textDecoration: "underline" }}>Cookie Policy</Link>.</p>
      {manage && (
        <div className="prefs">
          <label><input type="checkbox" checked disabled /> Essential (always on)</label>
          <label><input type="checkbox" checked={prefs.analytics} onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))} /> Analytics</label>
          <label><input type="checkbox" checked={prefs.marketing} onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))} /> Marketing</label>
          <label><input type="checkbox" checked={prefs.preferences} onChange={e => setPrefs(p => ({ ...p, preferences: e.target.checked }))} /> Preferences</label>
        </div>
      )}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => save({ analytics: true, marketing: true, preferences: true })}>Accept All</button>
        <button className="btn btn-ghost" onClick={() => save({ analytics: false, marketing: false, preferences: false })}>Reject Non-Essential</button>
        {manage
          ? <button className="btn btn-ghost" onClick={() => save(prefs)}>Save Preferences</button>
          : <button className="btn btn-ghost" onClick={() => setManage(true)}>Manage Preferences</button>}
      </div>
    </div>
  );
}
