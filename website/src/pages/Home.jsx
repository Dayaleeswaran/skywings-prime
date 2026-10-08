import { useEffect } from "react";
import { Link } from "../lib/router";
import { FOCUS, INDUSTRIES, PRINCIPLES, PROCESS, TRUST_STRIP, VALUE, WHO } from "../lib/content";
import { clean, orgJsonLd, safeUrl, setSeo, useRows } from "../lib/data";
import { FaqList, FinalCta, SectionHead, Thumb } from "../components/Shared";
import TeamCard from "../components/TeamCard";
import StatsBand from "../components/Stats";
import { Query } from "../supabase";
import { AnimatedDivider, GrainOverlay, Magnetic, ParticleBackground, ScrollIndicator, SplitText } from "../components/Fx";

export default function Home({ s, services }) {
  const projects = useRows("portfolio", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.orderDesc("created_at"), Query.limit(30)]);
  const team = useRows("team_members", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(8)]);
  const testimonials = useRows("testimonials", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(6)]);
  const posts = useRows("blog_posts", [Query.equal("published", true), Query.orderDesc("published_at"), Query.limit(3)]);
  const clients = useRows("clients", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(24)]);
  const faqs = useRows("faqs", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(8)]);

  useEffect(() => {
    setSeo({
      title: "Sky Wings Prime | Marketing Management & Brand Strategy in Dubai",
      description: "Sky Wings Prime is a Middle East-based marketing management company helping businesses strengthen their brand, improve market positioning and build sustainable growth.",
      path: "/",
      jsonLd: orgJsonLd(s),
    });
  }, [s]);

  const real = projects.rows.filter(p => p.project_type === "real").slice(0, 3);
  const concepts = projects.rows.filter(p => p.project_type === "concept").slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="fluid" aria-hidden="true"><i /><i /><i /></div>
        <ParticleBackground />
        <GrainOverlay />
        <div className="container">
          <span className="eyebrow">Strategy • Brand • Growth</span>
          <SplitText as="h1" delay={0.1}>Strategy That Gives Your <em><span className="c-blue">Brand</span> <span className="c-gold">Wings.</span></em></SplitText>
          <p className="lead">Sky Wings Prime is a Middle East-based marketing management company helping businesses strengthen their brand, improve market positioning and build sustainable growth through structured marketing, creative communication and strategic direction.</p>
          <div className="btn-row" style={{ marginTop: 34 }}>
            <Magnetic strength={25}><Link to="/consultation" className="btn btn-primary">Request a Private Consultation</Link></Magnetic>
            <Magnetic strength={20}><Link to="/services" className="btn btn-ghost">Explore Our Services</Link></Magnetic>
          </div>
          <p className="micro">Middle East | International Perspective</p>
        </div>
        <ScrollIndicator />
      </section>

      <AnimatedDivider />

      <div className="strip"><div className="container"><ul>{TRUST_STRIP.map(t => <li key={t}>{t}</li>)}</ul></div></div>

      <StatsBand s={s} />

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">Introduction</span>
            <h2>Strategic Marketing. Measurable Growth.</h2>
            <p className="lead">We turn business vision into market value through intelligent strategy, effective brand positioning and powerful communication. Sky Wings Prime takes a focused consultancy approach, providing structured marketing direction and practical solutions designed around each client's goals, market and growth potential.</p>
            <Link to="/about" className="btn btn-ghost" style={{ marginTop: 12 }}>Discover Our Approach</Link>
          </div>
          <div className="grid g2">
            {FOCUS.map(f => (
              <div className="card" key={f.title}><h3>{f.title}</h3><p>{f.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="What We Do" title="Our Marketing Capabilities" intro="Ten service areas, each tailored to your goals, market and stage of growth." />
          <div className="grid g3">
            {services.slice(0, 10).map(sv => (
              <Link key={sv.id} to={`/services/${sv.slug}`} className="card">
                <div className="icon" aria-hidden="true">{sv.icon || "✦"}</div>
                <h3>{sv.title}</h3>
                <p>{sv.subtitle}</p>
                <span className="more">Learn More →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <span className="eyebrow">About</span>
            <h2>Clarity. Direction. Results.</h2>
            <p className="lead">Sky Wings Prime is a Middle East-based marketing management company focused on helping businesses build stronger brands, improve market positioning and develop structured marketing strategies for long-term growth. With international exposure through its association with Sky Wings Holdings in Sri Lanka, the company combines regional understanding with a broader international business perspective.</p>
            <Link to="/about" className="btn btn-primary" style={{ marginTop: 12 }}>About Sky Wings Prime</Link>
          </div>
          <div className="card">
            <h3>Why Sky Wings Prime</h3>
            <ul className="check-list" style={{ marginTop: 12 }}>{VALUE.map(v => <li key={v}>{v}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="How We Work" title="A Simple, Structured Process" center />
          <div className="grid g4 steps">
            {PROCESS.map(p => (
              <div className="card step" key={p.n}><div className="num">{p.n}</div><h3>{p.title}</h3><p>{p.text}</p></div>
            ))}
          </div>
          <div className="grid g2" style={{ marginTop: 56 }}>
            <div><h3 className="gold">Core Principles</h3><ul className="pill-list">{PRINCIPLES.map(p => <li key={p}>{p}</li>)}</ul></div>
            <div><h3 className="gold">Who We Work With</h3><ul className="pill-list">{WHO.map(p => <li key={p}>{p}</li>)}</ul></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Industries" title="Industries We Focus On" />
          <ul className="pill-list">{INDUSTRIES.map(i => <li key={i}>{i}</li>)}</ul>
        </div>
      </section>

      {clients.rows.length > 0 && (
        <section className="section alt">
          <div className="container">
            <SectionHead eyebrow="Clients" title="Brands We Work With" center />
            <ul className="logo-row">
              {clients.rows.map(c => {
                const url = safeUrl(c.website_url);
                const face = c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy" decoding="async" /> : <span>{c.name}</span>;
                return <li key={c.id}>{url ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={c.name}>{face}</a> : face}</li>;
              })}
            </ul>
          </div>
        </section>
      )}

      {real.length > 0 && (
        <section className="section alt">
          <div className="container">
            <SectionHead eyebrow="Featured Work" title="Selected Client Work" />
            <div className="grid g3">
              {real.map(p => (
                <Link key={p.id} to={`/case-studies/${p.slug || p.id}`} className="card">
                  <Thumb src={p.cover_url} alt={p.title} label={p.industry} />
                  <span className="tag real" style={{ alignSelf: "flex-start", marginBottom: 10 }}>Client Work</span>
                  <h3>{p.title}</h3><p>{p.summary}</p><span className="more">View case study →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {concepts.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="Concept Lab" title="Strategy in Action" intro="Clearly labelled concept projects that demonstrate our thinking — not paid client work." />
            <div className="grid g3">
              {concepts.map(p => (
                <Link key={p.id} to={`/case-studies/${p.slug || p.id}`} className="card">
                  <Thumb src={p.cover_url} alt={p.title} label={p.industry} />
                  <span className="tag concept" style={{ alignSelf: "flex-start", marginBottom: 10 }}>Concept Project</span>
                  <h3>{p.title}</h3><p>{p.summary}</p>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 32 }}><Link to="/concept-lab" className="btn btn-ghost">Explore the Concept Lab</Link></div>
          </div>
        </section>
      )}

      <section className="section alt">
        <div className="container split">
          <div>
            <span className="eyebrow">Events & Promotional Marketing</span>
            <h2>Events That Build Brands.</h2>
            <p className="lead">Great events create attention. Strategic events create lasting brand value.</p>
          </div>
          <div><Link to="/events" className="btn btn-primary">Explore Events / Promotional Marketing</Link></div>
        </div>
      </section>

      {team.rows.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="Team" title="Meet the People Behind the Strategy" />
            <div className="grid g4">
              {team.rows.map(m => <TeamCard key={m.id} member={m} />)}
            </div>
          </div>
        </section>
      )}

      {testimonials.rows.length > 0 && (
        <section className="section alt">
          <div className="container">
            <SectionHead eyebrow="Testimonials" title="What Clients Say" />
            <div className="grid g3">
              {testimonials.rows.map(t => (
                <figure className="card" key={t.id} style={{ margin: 0 }}>
                  <blockquote style={{ margin: "0 0 16px", fontSize: 17 }}>“{t.quote}”</blockquote>
                  <figcaption className="muted"><b style={{ color: "var(--text)" }}>{t.author}</b>{(t.role || t.company) && <><br />{[t.role, t.company].filter(Boolean).join(", ")}</>}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {posts.rows.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="Insights" title="Insights for Smarter Growth" />
            <div className="grid g3">
              {posts.rows.map(p => (
                <Link key={p.id} to={`/insights/${p.slug || p.id}`} className="card">
                  <Thumb src={p.featured_image} alt={p.title} label={p.category} />
                  <span className="eyebrow" style={{ marginBottom: 6 }}>{p.category}</span>
                  <h3>{p.title}</h3>
                  <p dangerouslySetInnerHTML={{ __html: clean(p.excerpt) }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section alt">
        <div className="container split">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2>Questions, Answered</h2>
            <Link to="/faq" className="btn btn-ghost">See all FAQs</Link>
          </div>
          <FaqList items={faqs.rows} />
        </div>
      </section>

      <FinalCta s={s} />
    </>
  );
}
