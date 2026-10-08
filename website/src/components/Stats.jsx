import { useEffect, useState } from "react";
import { reducedMotion, useInView } from "./Fx";

// "15+" -> { prefix: "", num: 15, decimals: 0, comma: false, suffix: "+" }; "2M+" -> num 2, suffix "M+"; "no digits" -> null
function parseStat(value) {
  const m = String(value || "").trim().match(/^(\D*?)(\d[\d,]*\.?\d*)(.*)$/);
  if (!m) return null;
  const raw = m[2];
  return { prefix: m[1], num: parseFloat(raw.replace(/,/g, "")), decimals: (raw.split(".")[1] || "").length, comma: raw.includes(","), suffix: m[3] };
}

function useCountUp(target, run, ms = 1500) {
  const [n, setN] = useState(() => (reducedMotion() ? target : 0));
  useEffect(() => {
    if (!run || reducedMotion()) { if (run) setN(target); return; }
    let raf;
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / ms);
      setN(target * (1 - (1 - t) * (1 - t))); // gentle ease-out so small numbers visibly tick up
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, ms]);
  return n;
}

function Stat({ value, label, run }) {
  const p = parseStat(value);
  const n = useCountUp(p ? p.num : 0, run);
  const shown = p
    ? `${p.prefix}${(p.comma ? n.toLocaleString("en-US", { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals }) : n.toFixed(p.decimals))}${p.suffix}`
    : value;
  return (
    <div className="stat">
      <div className="stat-num" aria-label={`${value} ${label}`}>{shown}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// Key figures band. Values come from Admin → Site Settings → Key Figures (stat_1_value / stat_1_label … stat_4_*).
// A figure is shown only when both its value and its label are filled in; with none filled, the whole band is hidden.
export default function StatsBand({ s }) {
  const [ref, visible] = useInView(0.3);
  const items = [1, 2, 3, 4]
    .map(i => ({ value: (s[`stat_${i}_value`] || "").trim(), label: (s[`stat_${i}_label`] || "").trim() }))
    .filter(x => x.value && x.label);
  if (!items.length) return null;
  return (
    <section className="stats-band" aria-label="Key figures">
      <div className="container stats-grid" ref={ref}>
        {items.map(it => <Stat key={it.label} value={it.value} label={it.label} run={visible} />)}
      </div>
    </section>
  );
}
