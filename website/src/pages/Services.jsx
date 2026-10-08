import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { PROCESS } from "../lib/content";
import { breadcrumbJsonLd, getEmbedUrl, isDirectVideo, safeUrl, SITE_URL, setSeo, useRows } from "../lib/data";
import { FaqList, FinalCta, Loading, PageHero, SectionHead } from "../components/Shared";
import LeadForm from "../components/LeadForm";
import { Query } from "../supabase";

export function ServicesList({ s, services, loading }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    setSeo({
      title: "Marketing Services in Dubai | Sky Wings Prime",
      description: "Digital marketing, social media, branding, content, advertising, strategy and corporate marketing management from Sky Wings Prime in Dubai.",
      path: "/services",
    });
  }, []);

  const videoUrl = safeUrl(s.services_video_url);
  const imageUrl = safeUrl(s.services_image_url);
  const direct = isDirectVideo(videoUrl);
  const pdf = safeUrl(s.company_profile_pdf);
  const word = safeUrl(s.company_profile_word);

  return (
    <>
      <section className="services-top">
        <div className="container services-layout">
          {/* Showreel / brand card */}
          <div className="services-reel">
            {videoUrl && playing ? (
              direct
                ? <video src={videoUrl} autoPlay loop controls playsInline />
                : <iframe src={getEmbedUrl(videoUrl)} title="Sky Wings Prime video" allow="autoplay; fullscreen" />
            ) : (
              <>
                {imageUrl && <img className="reel-cover" src={imageUrl} alt="" />}
                {!imageUrl && videoUrl && direct && <video src={videoUrl} preload="metadata" muted playsInline />}
                {!imageUrl && <div className="fluid" aria-hidden="true"><i /><i /><i /></div>}
                {!imageUrl && !videoUrl && (
                  <div className="reel-brand">
                    <img src="/logo.png" alt="" width="150" height="139" />
                    <p>Strategy • Brand • Growth</p>
                  </div>
                )}
                {videoUrl && <button className="services-play" onClick={() => setPlaying(true)} aria-label="Play video">PLAY</button>}
              </>
            )}
          </div>

          {/* Numbered services panel */}
          <div className="services-panel">
            <h1 className="services-panel-title">Services</h1>
            {loading
              ? Array.from({ length: 6 }, (_, i) => <div key={i} className="services-row skeleton" aria-hidden="true" />)
              : services.map((sv, i) => (
                <Link key={sv.id} to={`/services/${sv.slug}`} className="services-row">
                  <span className="services-row-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="services-row-title">{sv.title}</span>
                  <svg className="services-row-arrow" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container quote-layout">
          <div>
            <h2 className="quote-heading">Strategic Marketing. Measurable Growth.</h2>
            <p className="quote-text">We turn business vision into market value through intelligent strategy, effective brand positioning and powerful communication. Sky Wings Prime takes a focused consultancy approach, providing structured marketing direction and practical solutions designed around each client's goals, market and growth potential.</p>
            <p className="quote-text">With international exposure through its association with Sky Wings Holdings in Sri Lanka, the company combines regional understanding with a broader international business perspective.</p>

            {services.length > 0 && (
              <>
                <h2 className="quote-heading" style={{ marginTop: 56 }}>What We Provide</h2>
                <div className="provide-grid">
                  {services.map((sv, i) => (
                    <Link key={sv.id} to={`/services/${sv.slug}`} className="provide-item">
                      <div className="provide-head">
                        <span className="provide-num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="provide-title">{sv.title}</span>
                      </div>
                      <p className="provide-desc">{sv.description || sv.subtitle}</p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="quote-side">
            <div className="quote-panel">
              <h2 className="services-panel-title">Get A Quote</h2>
              <LeadForm type="contact" compact />
            </div>
            {(pdf || word) && (
              <div className="quote-panel">
                <h2 className="services-panel-title">Company Profile</h2>
                {pdf && <a className="profile-btn" href={pdf} target="_blank" rel="noopener noreferrer" download>DOWNLOAD PDF</a>}
                {word && <a className="profile-btn" href={word} target="_blank" rel="noopener noreferrer" download>DOWNLOAD WORD FILE</a>}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export function ServiceDetail({ slug, s, services, loading }) {
  const service = services.find(x => x.slug === slug);
  const faqs = useRows("faqs", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(8)]);
  const related = useRows("portfolio", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(30)]);

  useEffect(() => {
    if (!service) return;
    setSeo({
      title: service.seo_title || `${service.title} in Dubai | Sky Wings Prime`,
      description: service.seo_description || service.subtitle,
      path: `/services/${service.slug}`,
      jsonLd: [
        { "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.description || service.subtitle, provider: { "@type": "ProfessionalService", name: s.legal_name, url: SITE_URL }, areaServed: "United Arab Emirates" },
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.title, path: `/services/${service.slug}` }]),
      ],
    });
  }, [service, s]);

  if (loading) return <Loading />;
  if (!service) return <NotFoundInline />;

  const items = service.items || [];
  const problems = service.problems || [];
  const relatedProjects = related.rows.filter(p => p.category && service.title.toLowerCase().includes(p.category.toLowerCase())).slice(0, 3);

  return (
    <>
      <PageHero eyebrow="Service" title={service.title} intro={service.subtitle} crumbs={[{ label: "Services", to: "/services" }, { label: service.title }]} />
      <section className="section">
        <div className="container">
          <div className="btn-row" style={{ marginBottom: 56 }}>
            <Link to={`/consultation?service=${encodeURIComponent(service.title)}`} className="btn btn-primary">Request a Consultation</Link>
          </div>
          {service.description && (
            <div className="split" style={{ marginBottom: 72 }}>
              <div><span className="eyebrow">Overview</span><h2>What it is and who it helps</h2></div>
              <p className="lead">{service.description}</p>
            </div>
          )}
          {problems.length > 0 && (
            <div style={{ marginBottom: 72 }}>
              <SectionHead eyebrow="Challenges" title="Business problems this solves" />
              <div className="grid g3">{problems.map(p => <div className="card" key={p}><p style={{ color: "var(--text)", margin: 0 }}>{p}</p></div>)}</div>
            </div>
          )}
          {items.length > 0 && (
            <div style={{ marginBottom: 72 }}>
              <SectionHead eyebrow="What's Included" title="Deliverables" />
              <div className="grid g2">{items.map(i => <div className="card hover" key={i}><h3 style={{ margin: 0 }}>{i}</h3></div>)}</div>
            </div>
          )}
          <SectionHead eyebrow="Approach" title="Discover → Plan → Execute → Refine" />
          <div className="grid g4 steps">
            {PROCESS.map(p => <div className="card step" key={p.n}><div className="num">{p.n}</div><h3>{p.title}</h3><p>{p.text}</p></div>)}
          </div>
          {relatedProjects.length > 0 && (
            <div style={{ marginTop: 72 }}>
              <SectionHead eyebrow="Related Work" title="Featured work & concepts" />
              <div className="grid g3">
                {relatedProjects.map(p => (
                  <Link key={p.id} to={`/case-studies/${p.slug || p.id}`} className="card">
                    <span className={`tag ${p.project_type}`} style={{ alignSelf: "flex-start", marginBottom: 10 }}>{p.project_type === "concept" ? "Concept Project" : "Client Work"}</span>
                    <h3>{p.title}</h3><p>{p.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="section alt">
        <div className="container split">
          <div><span className="eyebrow">FAQ</span><h2>Common questions</h2></div>
          <FaqList items={faqs.rows} />
        </div>
      </section>
      <FinalCta s={s} />
    </>
  );
}

function NotFoundInline() {
  return (
    <section className="section"><div className="container center">
      <h1>Service not found</h1>
      <p className="lead">This service may have moved or no longer exists.</p>
      <Link to="/services" className="btn btn-primary">View all services</Link>
    </div></section>
  );
}
