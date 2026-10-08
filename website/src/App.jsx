import { useCallback, useState } from "react";
import { match, useRouter } from "./lib/router";
import { useRows, useSettings } from "./lib/data";
import { Announcement, CookieBanner, Footer, Header, WhatsAppFloat } from "./components/Layout";
import { Query } from "./supabase";
import { SplashScreen, TransitionPanels, reducedMotion, useGlobalFx } from "./components/Fx";
import Home from "./pages/Home";
import { ServiceDetail, ServicesList } from "./pages/Services";
import { ConceptLab, ProjectDetail, WorkList } from "./pages/Work";
import { InsightDetail, InsightsList } from "./pages/Insights";
import { About, Consultation, Contact, Events, Faq, Legal, NotFound, Team, ThankYou } from "./pages/Company";

const LEGAL_ROUTES = {
  "/privacy-policy": "privacy",
  "/terms-and-conditions": "terms",
  "/cookie-policy": "cookies",
  "/disclaimer": "disclaimer",
  "/accessibility": "accessibility",
};

function Routes({ path, s, services, loading }) {
  if (path === "/") return <Home s={s} services={services} />;
  if (path === "/about") return <About s={s} />;
  if (path === "/services") return <ServicesList s={s} services={services} loading={loading} />;
  if (path === "/work") return <WorkList />;
  if (path === "/concept-lab") return <ConceptLab />;
  if (path === "/events") return <Events s={s} />;
  if (path === "/team") return <Team s={s} />;
  if (path === "/insights") return <InsightsList />;
  if (path === "/contact") return <Contact s={s} />;
  if (path === "/consultation") return <Consultation />;
  if (path === "/faq") return <Faq s={s} />;
  if (path === "/thank-you") return <ThankYou s={s} />;
  if (LEGAL_ROUTES[path]) return <Legal key={path} kind={LEGAL_ROUTES[path]} s={s} />;

  const svc = match("/services/:slug", path);
  if (svc) return <ServiceDetail key={svc.slug} slug={svc.slug} s={s} services={services} loading={loading} />;
  const proj = match("/case-studies/:slug", path);
  if (proj) return <ProjectDetail key={proj.slug} slug={proj.slug} />;
  const post = match("/insights/:slug", path);
  if (post) return <InsightDetail key={post.slug} slug={post.slug} />;
  return <NotFound />;
}

export default function App() {
  const { path } = useRouter();
  const s = useSettings();
  const { rows: allServices, loading } = useRows("services", [Query.equal("visible", true), Query.orderAsc("sort_order"), Query.limit(50)]);
  const services = allServices.filter(sv => sv.slug); // services need a URL slug to be linkable
  const [cookieOpen, setCookieOpen] = useState(false);
  const [splash, setSplash] = useState(() => !reducedMotion() && !sessionStorage.getItem("sw_splash_seen"));
  const endSplash = useCallback(() => { sessionStorage.setItem("sw_splash_seen", "1"); setSplash(false); }, []);
  useGlobalFx(path);

  return (
    <>
      <TransitionPanels />
      {splash && <SplashScreen onDone={endSplash} />}
      <a href="#main" className="skip-link">Skip to content</a>
      <Announcement s={s} />
      <Header />
      <main id="main"><Routes path={path} s={s} services={services} loading={loading} /></main>
      <Footer s={s} services={services} onCookieSettings={() => setCookieOpen(true)} />
      <WhatsAppFloat s={s} />
      <CookieBanner s={s} forceOpen={cookieOpen} onClose={() => setCookieOpen(false)} />
    </>
  );
}
