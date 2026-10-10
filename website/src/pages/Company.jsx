import { useEffect } from "react";
import { Link, useRouter } from "../lib/router";
import { EVENT_CAPABILITIES, LEGAL_DEFAULTS, PRINCIPLES } from "../lib/content";
import { clean, digits, safeUrl, setSeo, track, useRows, waLink } from "../lib/data";
import { FaqList, FinalCta, PageHero, SectionHead } from "../components/Shared";
import LeadForm from "../components/LeadForm";
import TeamCard from "../components/TeamCard";
import { Query } from "../supabase";

export function About({ s }) {
  useEffect(() => {
    setSeo({ title: "About Sky Wings Prime | Marketing Strategy & Brand Consultancy in Dubai", description: "Sky Wings Prime is a Middle East-based independent marketing strategy and brand consultancy with an international perspective.", path: "/about" });
  }, []);
  return (
    <>
      <PageHero eyebrow="About" title="Strategy Built to Elevate Brands." intro="Middle East-based marketing strategy and brand management with an international perspective." crumbs={[{ label: "About" }]} />
      <section className="section">
        <div className="container split">
          <div className="prose">
            <h2>Our Story</h2>
            <p>Sky Wings Prime is a Middle East-based independent marketing strategy and brand consultancy offering tailored solutions for businesses seeking clarity, direction and refined market positioning.</p>
            <p>The consultancy operates with a focused, expert-led approach, delivering strategic marketing support designed to help brands grow sustainably in competitive environments.</p>
            <p>With international exposure through its association with Sky Wings Holdings in Sri Lanka, Sky Wings Prime brings cross-market insight across tourism, events and marketing-related sectors, with a strong understanding of regional and global business dynamics.</p>
          </div>
          <div className="grid">
            <div className="card"><h3 className="gold">Vision</h3><p>To be a trusted boutique marketing consultancy recognized for clarity, strategic thinking, and high-quality brand development support.</p></div>
            <div className="card"><h3 className="gold">Mission</h3><p>To support businesses in building stronger brand identity, improving market positioning, and enhancing communication strategies through structured and intelligent marketing guidance.</p></div>
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Values" title="Our Core Principles" />
          <ul className="pill-list">{PRINCIPLES.map(p => <li key={p}>{p}</li>)}</ul>
          <div className="split" style={{ marginTop: 64 }}>
            <div><h3 className="gold">International Context</h3><p className="lead">Our operational base is Dubai. Through our association with Sky Wings Holdings in Sri Lanka, we draw on an understanding of Middle Eastern market behaviour, South Asian business environments and international customer expectations.</p></div>
            <div className="card"><h3>Media permit</h3><p>National Media Council Permit No. <b style={{ color: "var(--text)" }}>{s.media_permit_no}</b><br />{s.legal_name}<br />{s.address}</p></div>
          </div>
        </div>
      </section>
      <FinalCta s={s} />
    </>
  );
}

export function Team({ s }) {
  const { rows } = useRows("team_members", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(50)]);
  useEffect(() => {
    setSeo({ title: "Our Team | Sky Wings Prime", description: "Meet the people behind the strategy at Sky Wings Prime.", path: "/team" });
  }, []);
  return (
    <>
      <PageHero eyebrow="Team" title="Meet the People Behind the Strategy" crumbs={[{ label: "Team" }]} />
      <section className="section">
        <div className="container">
          <div className="grid g4">
            {rows.map(m => <TeamCard key={m.id} member={m} />)}
          </div>
        </div>
      </section>
      <FinalCta s={s} />
    </>
  );
}

export function Events({ s }) {
  useEffect(() => {
    setSeo({ title: "Events & Promotional Marketing | Sky Wings Prime", description: "Corporate event promotion, exhibition marketing, product launches and brand activations from Sky Wings Prime in Dubai.", path: "/events" });
  }, []);
  return (
    <>
      <PageHero eyebrow="Events" title="Events That Build Brands." intro="Great events create attention. Strategic events create lasting brand value." crumbs={[{ label: "Events" }]} />
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Capabilities" title="Event & promotional marketing support" />
          <div className="grid g4">{EVENT_CAPABILITIES.map(c => <div className="card hover" key={c}><h3 style={{ margin: 0 }}>{c}</h3></div>)}</div>
        </div>
      </section>
      <FinalCta s={s} />
    </>
  );
}

export function Faq({ s }) {
  const { rows } = useRows("faqs", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(50)]);
  useEffect(() => {
    setSeo({
      title: "FAQ | Sky Wings Prime", description: "Answers to common questions about Sky Wings Prime's services, location and how to request a consultation.", path: "/faq",
      jsonLd: rows.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: rows.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) } : undefined,
    });
  }, [rows]);
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently Asked Questions" crumbs={[{ label: "FAQ" }]} />
      <section className="section"><div className="container" style={{ maxWidth: 860 }}><FaqList items={rows} /></div></section>
      <FinalCta s={s} />
    </>
  );
}

export function Contact({ s }) {
  useEffect(() => {
    setSeo({ title: "Contact Sky Wings Prime | Dubai Marketing Consultancy", description: "Contact Sky Wings Prime in Dubai by form, phone, email or WhatsApp.", path: "/contact" });
  }, []);
  return (
    <>
      <PageHero eyebrow="Contact" title="Let’s Talk About Your Brand" intro="Send us a message or reach us directly — we’ll get back to you shortly." crumbs={[{ label: "Contact" }]} />
      <section className="section">
        <div className="container split">
          <div className="panel"><LeadForm type="contact" /></div>
          <ul className="contact-list">
            <li><b>Address</b>{s.address}</li>
            <li><b>Phone</b><a href={`tel:${s.phone.replace(/\s/g, "")}`} onClick={() => track("phone_click")}>{s.phone}</a>{s.phone_2 && <><br /><a href={`tel:${s.phone_2.replace(/\s/g, "")}`} onClick={() => track("phone_click")}>{s.phone_2}</a></>}</li>
            <li><b>WhatsApp</b>
              <a href={waLink(s.whatsapp_uae, "Hello Sky Wings Prime")} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click")}>UAE: {s.whatsapp_uae}</a>
              {digits(s.whatsapp_2) && <><br /><a href={waLink(s.whatsapp_2, "Hello Sky Wings Prime")} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click")}>UAE (2nd number): {s.whatsapp_2}</a></>}
              {digits(s.whatsapp_sl) && <><br /><a href={waLink(s.whatsapp_sl, "Hello Sky Wings Prime")} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click")}>Sri Lanka: {s.whatsapp_sl}</a></>}
            </li>
            <li><b>Email</b><a href={`mailto:${s.email}`} onClick={() => track("email_click")}>{s.email}</a></li>
            <li><b>Media permit</b>National Media Council Permit No. {s.media_permit_no}</li>
          </ul>
        </div>
      </section>
    </>
  );
}

export function Consultation() {
  const preset = new URLSearchParams(window.location.search).get("service") || "";
  useEffect(() => {
    setSeo({ title: "Request a Private Consultation | Sky Wings Prime", description: "Request a private marketing consultation with Sky Wings Prime in Dubai.", path: "/consultation" });
  }, []);
  return (
    <>
      <PageHero eyebrow="Consultation" title="Request a Private Consultation" intro="Tell us about your business and goals. We’ll review your enquiry and respond with the best next step." crumbs={[{ label: "Consultation" }]} />
      <section className="section"><div className="container" style={{ maxWidth: 860 }}><div className="panel"><LeadForm type="consultation" presetService={preset} /></div></div></section>
    </>
  );
}

export function Legal({ kind, s }) {
  const def = LEGAL_DEFAULTS[kind];
  const settings = useRows("settings", [Query.equal("key", [`legal_${kind}`, `legal_${kind}_updated`])]);
  const map = Object.fromEntries(settings.rows.map(r => [r.key, r.value]));
  const html = map[`legal_${kind}`] || def.html;
  const updated = map[`legal_${kind}_updated`] || "";
  const path = { privacy: "/privacy-policy", terms: "/terms-and-conditions", cookies: "/cookie-policy", disclaimer: "/disclaimer", accessibility: "/accessibility" }[kind];
  useEffect(() => {
    setSeo({ title: `${def.title} | Sky Wings Prime`, description: `${def.title} of ${s.legal_name}.`, path });
  }, [def.title, s.legal_name, path]);
  return (
    <>
      <PageHero eyebrow="Legal" title={def.title} crumbs={[{ label: def.title }]} />
      <section className="section">
        <div className="container">
          <div className="prose">
            {updated && <p className="muted">Last updated: {updated}</p>}
            <div dangerouslySetInnerHTML={{ __html: clean(html) }} />
            <p className="muted" style={{ marginTop: 32 }}>Questions? Contact <a href={`mailto:${s.privacy_email || s.email}`}>{s.privacy_email || s.email}</a> · {s.legal_name}, {s.address}</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function ThankYou({ s }) {
  useEffect(() => { setSeo({ title: "Thank You | Sky Wings Prime", description: "Thank you for reaching out to Sky Wings Prime.", path: "/thank-you", noindex: true }); }, []);
  return (
    <section className="hero" style={{ minHeight: "70vh" }}>
      <div className="fluid" aria-hidden="true"><i /><i /><i /></div>
      <div className="container center">
        <h1>Thank You for Reaching Out.</h1>
        <p className="lead">Our team will review your enquiry and get back to you shortly.</p>
        <div className="btn-row" style={{ justifyContent: "center", marginTop: 28 }}>
          <Link to="/" className="btn btn-primary">Return Home</Link>
          {safeUrl(s.social_linkedin) && <a className="btn btn-ghost" href={safeUrl(s.social_linkedin)} target="_blank" rel="noopener noreferrer">Connect on LinkedIn</a>}
        </div>
      </div>
    </section>
  );
}

export function NotFound() {
  const { path } = useRouter();
  useEffect(() => { setSeo({ title: "Page not found | Sky Wings Prime", description: "This page could not be found.", path, noindex: true }); }, [path]);
  return (
    <section className="hero" style={{ minHeight: "70vh" }}>
      <div className="fluid" aria-hidden="true"><i /><i /><i /></div>
      <div className="container center">
        <h1>Looks Like This Page Lost Its Wings.</h1>
        <p className="lead">The page you’re looking for may have moved or no longer exists.</p>
        <div className="btn-row" style={{ justifyContent: "center", marginTop: 28 }}>
          <Link to="/" className="btn btn-primary">Back Home</Link>
          <Link to="/contact" className="btn btn-ghost">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
