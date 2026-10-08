import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { breadcrumbJsonLd, clean, setSeo, useRows } from "../lib/data";
import { FinalCta, Loading, PageHero, Thumb } from "../components/Shared";
import { Query } from "../supabase";

const useProjects = () => useRows("portfolio", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.orderDesc("created_at"), Query.limit(100)]);

const Label = ({ p }) => (
  <span className={`tag ${p.project_type}`} style={{ alignSelf: "flex-start", marginBottom: 10 }}>
    {p.project_type === "concept" ? "Concept Project" : "Client Work"}
  </span>
);

function ProjectCard({ p }) {
  return (
    <Link to={`/case-studies/${p.slug || p.id}`} className="card">
      <Thumb src={p.cover_url} alt={p.title} label={p.industry || p.category} />
      <Label p={p} />
      <h3>{p.title}</h3>
      <p>{p.summary}</p>
      <p className="muted" style={{ fontSize: 13, marginTop: "auto" }}>{[p.industry, p.category, p.year].filter(Boolean).join(" · ")}</p>
    </Link>
  );
}

export function WorkList() {
  const { rows, loading } = useProjects();
  const [filter, setFilter] = useState("All");
  useEffect(() => {
    setSeo({ title: "Work & Case Studies | Sky Wings Prime", description: "Client work and clearly labelled concept projects from Sky Wings Prime across branding, digital, social, campaigns and events.", path: "/work" });
  }, []);
  const cats = [...new Set(rows.map(r => r.category).filter(Boolean))];
  const filters = ["All", "Client Work", "Concept Projects", ...cats];
  const shown = rows.filter(p =>
    filter === "All" ? true : filter === "Client Work" ? p.project_type === "real" : filter === "Concept Projects" ? p.project_type === "concept" : p.category === filter);
  return (
    <>
      <PageHero eyebrow="Work" title="Work & Case Studies" intro="Real client work is shown separately from concept projects, which demonstrate our thinking and are never presented as commissioned work." crumbs={[{ label: "Work" }]} />
      <section className="section">
        <div className="container">
          <div className="chips" role="group" aria-label="Filter projects" style={{ marginBottom: 36 }}>
            {filters.map(f => <button key={f} className={`chip${filter === f ? " active" : ""}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}
          </div>
          {loading ? <Loading /> : shown.length ? <div className="grid g3">{shown.map(p => <ProjectCard key={p.id} p={p} />)}</div> : <p className="lead">Projects will be added here soon.</p>}
        </div>
      </section>
      <FinalCtaWrap />
    </>
  );
}

export function ConceptLab() {
  const { rows, loading } = useProjects();
  useEffect(() => {
    setSeo({ title: "Concept Lab | Sky Wings Prime", description: "Strategy in action: clearly labelled concept projects demonstrating Sky Wings Prime's marketing and brand thinking.", path: "/concept-lab" });
  }, []);
  const concepts = rows.filter(p => p.project_type === "concept");
  return (
    <>
      <PageHero eyebrow="Concept Lab" title="Strategy in Action" intro="Concept projects that demonstrate our strategic and creative thinking. They are not paid client work." crumbs={[{ label: "Concept Lab" }]} />
      <section className="section">
        <div className="container">
          {loading ? <Loading /> : <div className="grid g3">{concepts.map(p => <ProjectCard key={p.id} p={p} />)}</div>}
        </div>
      </section>
      <FinalCtaWrap />
    </>
  );
}

export function ProjectDetail({ slug }) {
  const { rows, loading } = useProjects();
  const p = rows.find(x => x.slug === slug || x.id === slug);
  useEffect(() => {
    if (!p) return;
    setSeo({
      title: `${p.title} | Sky Wings Prime`,
      description: p.summary || `${p.title} — ${p.project_type === "concept" ? "a concept project" : "case study"} by Sky Wings Prime.`,
      path: `/case-studies/${p.slug || p.id}`, image: p.cover_url || undefined,
      jsonLd: breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: p.title, path: `/case-studies/${p.slug || p.id}` }]),
    });
  }, [p]);
  if (loading) return <Loading />;
  if (!p) return <section className="section"><div className="container center"><h1>Project not found</h1><Link to="/work" className="btn btn-primary">Back to Work</Link></div></section>;
  const blocks = [["Challenge", p.problem], ["Strategy", p.strategy], ["Execution", p.execution], ["Results", p.results]].filter(([, v]) => v);
  return (
    <>
      <PageHero eyebrow={p.project_type === "concept" ? "Concept Project" : "Case Study"} title={p.title} intro={p.summary} crumbs={[{ label: "Work", to: "/work" }, { label: p.title }]} />
      <section className="section">
        <div className="container">
          {p.project_type === "concept" && <div className="alert" style={{ background: "rgba(214,178,94,.12)", border: "1px solid rgba(214,178,94,.4)", marginBottom: 32 }}><b>Concept Project.</b> This is a concept created to demonstrate our thinking. It was not commissioned by a client.</div>}
          <Thumb src={p.cover_url} alt={p.title} label={[p.industry, p.category].filter(Boolean).join(" · ")} />
          <p className="muted">{[p.industry, p.category, p.year].filter(Boolean).join(" · ")}</p>
          {blocks.map(([label, html]) => (
            <div key={label} style={{ marginTop: 40 }} className="prose">
              <h2>{label}</h2>
              <div dangerouslySetInnerHTML={{ __html: clean(html) }} />
            </div>
          ))}
        </div>
      </section>
      <FinalCtaWrap />
    </>
  );
}

import { useSettings } from "../lib/data";
function FinalCtaWrap() { const s = useSettings(); return <FinalCta s={s} />; }
