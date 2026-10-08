// Site UI effects (hero particles, grain, split-text, magnetic buttons, custom cursor,
// splash, page transition, scroll reveals, tilt cards). Visual only — no content lives here.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "../lib/router";

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine) and (min-width: 1025px)").matches;

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => reducedMotion());
  useEffect(() => {
    if (visible || !ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [visible, threshold]);
  return [ref, visible];
}

// Heading that slides up from behind a mask ("SplitText")
export function SplitText({ as: Tag = "div", children, delay = 0, className = "", style }) {
  const [ref, visible] = useInView(0.1);
  return (
    <Tag ref={ref} className={`split-mask ${className}`} style={style}>
      <span className="split-inner" style={{ transform: visible ? "translateY(0)" : "translateY(110%)", transitionDelay: `${delay}s` }}>{children}</span>
    </Tag>
  );
}

// Button/logo that leans toward the cursor ("Magnetic")
export function Magnetic({ children, strength = 15, className = "", style }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = e => {
    if (!finePointer() || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - (left + width / 2)) * (strength / (width / 2)), y: (e.clientY - (top + height / 2)) * (strength / (height / 2)) });
  };
  return (
    <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{ display: "inline-block", transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform .3s cubic-bezier(.23,1,.32,1)", ...style }}>
      {children}
    </div>
  );
}

// Animated divider line
export function AnimatedDivider() {
  const [ref, visible] = useInView(0.5);
  return (
    <div ref={ref} className="divider" aria-hidden="true">
      <div className="divider-glow" style={{ transform: visible ? "translateX(0)" : "translateX(-100%)" }} />
    </div>
  );
}

// Hero particle network ("ParticleBackground") in the Skywings blue + gold
export function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const mouse = { x: -1000, y: -1000 };
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const count = window.innerWidth < 700 ? 45 : 90;
    const dots = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2.6 + 0.8,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, o: Math.random() * 0.5 + 0.3, gold: i % 4 === 0,
    }));
    const onMove = e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    const rgb = d => (d.gold ? "214,178,94" : "54,169,225");
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of dots) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const force = Math.max(0, (250 - Math.hypot(dx, dy)) / 250);
        const rx = p.x - dx * force * 0.1, ry = p.y - dy * force * 0.1;
        ctx.beginPath(); ctx.arc(rx, ry, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb(p)},${p.o + force * 0.4})`; ctx.fill();
        for (const q of dots) {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) { ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(${rgb(p)},${(1 - d / 120) * 0.15})`; ctx.stroke(); }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);
  return <canvas ref={canvasRef} className="particles" aria-hidden="true" />;
}

export const GrainOverlay = () => <div className="grain" aria-hidden="true" />;

// Mouse + "SCROLL" indicator at the bottom of the hero
export function ScrollIndicator() {
  return (
    <div className="scroll-indicator" aria-hidden="true">
      <span className="scroll-indicator-text">Scroll</span>
      <div className="scroll-mouse"><div className="scroll-wheel" /></div>
    </div>
  );
}

// Logo splash shown once per browser session
export function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1700);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="splash" role="presentation">
      <div className="splash-logo"><img src="/logo.png" alt="Sky Wings Prime — Giving you Wings" width="260" height="188" /></div>
      <div className="splash-line" />
    </div>
  );
}

// Colour panels sweep across the screen between pages
export function TransitionPanels() {
  const { transitioning } = useRouter();
  return (
    <div className="panels" aria-hidden="true">
      {["#36A9E1", "#D6B25E", "#FFFFFF"].map((c, i) => (
        <div key={i} className="panel-sweep" style={{ background: c, transform: transitioning ? "translateX(0)" : "translateX(-100%)", transitionDelay: `${i * 90}ms` }} />
      ))}
      <div className="panel-logo" style={{ opacity: transitioning ? 1 : 0 }}><img src="/logo.png" alt="" width="220" height="159" /></div>
    </div>
  );
}

// Scroll-reveal + tilt/glow for cards, driven by one observer (no per-component wiring).
const REVEAL_SELECTOR = ".card, .member, .team-tile, .strip li, .pill-list li, .faq details, .panel, .cta, .contact-list li, .eyebrow, .lead, .section .btn-row, .prose > *";
export function useGlobalFx(path) {
  useEffect(() => {
    if (reducedMotion()) return;
    // Reveal anything inside (or already above) the viewport. A plain scroll check is used instead of
    // IntersectionObserver so content can never stay hidden (it also survives React StrictMode's double effect).
    const sweep = () => {
      const limit = window.innerHeight - 40;
      document.querySelectorAll("#main .rv:not(.rv-in)").forEach(el => {
        if (el.getBoundingClientRect().top < limit) el.classList.add("rv-in");
      });
    };
    let queued = false;
    const onScroll = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; sweep(); }); };
    const mark = root => {
      root.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
        if (el.classList.contains("rv") || el.closest(".hero, .page-hero, .header")) return; // hero content has its own entrance animation
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        el.style.setProperty("--rv-delay", `${(siblings.indexOf(el) % 6) * 0.08}s`);
        el.classList.add("rv");
      });
      requestAnimationFrame(sweep);
    };
    const main = document.getElementById("main");
    if (!main) return;
    mark(main);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const mo = new MutationObserver(() => mark(main)); // content that loads from the database later
    mo.observe(main, { childList: true, subtree: true });
    const timer = setInterval(sweep, 700); // safety net for layout shifts
    return () => { mo.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); clearInterval(timer); };
  }, [path]);

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    let last = null;
    const move = e => {
      const card = e.target.closest?.(".card, .member");
      if (last && last !== card) { last.style.setProperty("--rx", "0deg"); last.style.setProperty("--ry", "0deg"); last.style.setProperty("--glow", "0"); }
      last = card;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--rx", `${(y - 0.5) * -10}deg`);
      card.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
      card.style.setProperty("--gx", `${x * 100}%`);
      card.style.setProperty("--gy", `${y * 100}%`);
      card.style.setProperty("--glow", "1");
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
}
