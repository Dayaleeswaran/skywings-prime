import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { breadcrumbJsonLd, clean, readTime, SITE_URL, setSeo, useRows, useSettings } from "../lib/data";
import { FinalCta, Loading, PageHero, Thumb } from "../components/Shared";
import { Query } from "../supabase";

const usePosts = () => useRows("blog_posts", [Query.equal("published", true), Query.orderDesc("published_at"), Query.limit(100)]);
const fmt = d => (d ? new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }) : "");
// Scheduled posts (future published_at) stay hidden until their date.
const live = p => !p.published_at || new Date(p.published_at) <= new Date();

export function InsightsList() {
  const { rows, loading } = usePosts();
  const [cat, setCat] = useState("All");
  useEffect(() => {
    setSeo({ title: "Insights | Sky Wings Prime", description: "Articles on marketing strategy, brand management, digital marketing and growth from Sky Wings Prime in Dubai.", path: "/insights" });
  }, []);
  const posts = rows.filter(live);
  const cats = ["All", ...new Set(posts.map(p => p.category).filter(Boolean))];
  const shown = cat === "All" ? posts : posts.filter(p => p.category === cat);
  const s = useSettings();
  return (
    <>
      <PageHero eyebrow="Insights" title="Insights for Smarter Growth" intro="Practical thinking on marketing strategy, brand and growth." crumbs={[{ label: "Insights" }]} />
      <section className="section">
        <div className="container">
          {loading ? <Loading /> : posts.length === 0 ? <p className="lead">New articles are coming soon.</p> : (
            <>
              <div className="chips" style={{ marginBottom: 36 }} role="group" aria-label="Filter by category">
                {cats.map(c => <button key={c} className={`chip${cat === c ? " active" : ""}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
              </div>
              <div className="grid g3">
                {shown.map(p => (
                  <Link key={p.id} to={`/insights/${p.slug || p.id}`} className="card">
                    <Thumb src={p.featured_image} alt={p.title} label={p.category} />
                    <span className="eyebrow" style={{ marginBottom: 6 }}>{p.category}</span>
                    <h3>{p.title}</h3>
                    <p dangerouslySetInnerHTML={{ __html: clean(p.excerpt) }} />
                    <p className="muted" style={{ fontSize: 13, marginTop: "auto" }}>{fmt(p.published_at)} · {readTime(p.content)}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <FinalCta s={s} />
    </>
  );
}

export function InsightDetail({ slug }) {
  const { rows, loading } = usePosts();
  const s = useSettings();
  const post = rows.filter(live).find(x => x.slug === slug || x.id === slug);
  useEffect(() => {
    if (!post) return;
    const path = `/insights/${post.slug || post.id}`;
    setSeo({
      title: post.seo_title || `${post.title} | Sky Wings Prime`,
      description: post.seo_description || (post.excerpt || "").replace(/<[^>]+>/g, "").slice(0, 160),
      path, type: "article", image: post.featured_image || undefined,
      jsonLd: [
        { "@context": "https://schema.org", "@type": "Article", headline: post.title, datePublished: post.published_at, author: { "@type": "Person", name: post.author || s.brand_name }, image: post.featured_image || undefined, mainEntityOfPage: SITE_URL + path, publisher: { "@type": "Organization", name: s.legal_name } },
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: post.title, path }]),
      ],
    });
  }, [post, s]);
  if (loading) return <Loading />;
  if (!post) return <section className="section"><div className="container center"><h1>Article not found</h1><Link to="/insights" className="btn btn-primary">Back to Insights</Link></div></section>;
  const related = rows.filter(live).filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
  const url = encodeURIComponent(SITE_URL + `/insights/${post.slug || post.id}`);
  return (
    <>
      <PageHero eyebrow={post.category} title={post.title} intro={`${post.author ? post.author + " · " : ""}${fmt(post.published_at)} · ${readTime(post.content)}`} crumbs={[{ label: "Insights", to: "/insights" }, { label: post.title }]} />
      <section className="section">
        <div className="container">
          {post.featured_image && <img src={post.featured_image} alt={post.title} style={{ borderRadius: 18, marginBottom: 40, maxHeight: 460, width: "100%", objectFit: "cover" }} />}
          <div className="prose" dangerouslySetInnerHTML={{ __html: clean(post.content || post.excerpt) }} />
          <div className="chips" style={{ marginTop: 40 }}>
            <a className="chip" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}>Share on LinkedIn</a>
            <a className="chip" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}>Share on Facebook</a>
            <a className="chip" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${url}`}>Share on WhatsApp</a>
          </div>
          {related.length > 0 && (
            <div style={{ marginTop: 72 }}>
              <h2>Related articles</h2>
              <div className="grid g3">{related.map(p => <Link key={p.id} to={`/insights/${p.slug || p.id}`} className="card"><h3>{p.title}</h3></Link>)}</div>
            </div>
          )}
        </div>
      </section>
      <FinalCta s={s} title="Want to talk about your marketing?" text="Request a private consultation and we’ll help you plan the next step." />
    </>
  );
}
