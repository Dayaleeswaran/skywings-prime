import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { track, waLink } from "../lib/data";
import { FALLBACK_FAQS } from "../lib/content";
import { ParticleBackground, SplitText } from "./Fx";

export function PageHero({ eyebrow, title, intro, crumbs = [] }) {
  return (
    <section className="page-hero">
      <div className="fluid" aria-hidden="true"><i /><i /><i /></div>
      <ParticleBackground />
      <div className="container">
        {crumbs.length > 0 && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>{crumbs.map(c => <span key={c.label}> / {c.to ? <Link to={c.to}>{c.label}</Link> : c.label}</span>)}
          </nav>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <SplitText as="h1">{title}</SplitText>
        {intro && <p className="lead">{intro}</p>}
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, intro, center }) {
  return (
    <div className={center ? "center" : ""} style={{ marginBottom: 44 }}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <SplitText as="h2">{title}</SplitText>
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">✦</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function FaqList({ items }) {
  const list = items?.length ? items : FALLBACK_FAQS;
  return (
    <div className="faq">
      {list.map((f, i) => (
        <details key={f.id || i}>
          <summary>{f.question}</summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function FinalCta({ s, title = "Ready to Give Your Brand the Wings to Grow?", text = "Tell us where your business is today and where you want it to go. We’ll help build the strategy to move it forward." }) {
  return (
    <section className="section">
      <div className="container">
        <div className="cta">
          <h2>{title}</h2>
          <p className="lead">{text}</p>
          <div className="btn-row" style={{ justifyContent: "center", marginTop: 28 }}>
            <Link to="/consultation" className="btn btn-primary">Request a Consultation</Link>
            <a className="btn btn-ghost" href={waLink(s.whatsapp_uae, "Hello Sky Wings Prime, I'd like to talk about my marketing goals.")} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click")}>Talk to Us on WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Thumb({ src, alt = "", label }) {
  return <div className="thumb">{src ? <img src={src} alt={alt} loading="lazy" /> : <span>{label}</span>}</div>;
}

export function useTitle(title, description, path, extra = {}) {
  // thin wrapper to keep page code short; implemented in pages via setSeo
  return { title, description, path, ...extra };
}

export function Loading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSlow(true), 400); return () => clearTimeout(t); }, []);
  return <div className="container section" aria-live="polite">{slow ? "Loading…" : ""}</div>;
}
