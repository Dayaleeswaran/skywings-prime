import { useState } from "react";
import { safeUrl, track } from "../lib/data";

const SOCIALS = [
  ["instagram", "Instagram", "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.5 5.8a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2z"],
  ["linkedin", "LinkedIn", "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3v-11zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V20.5h-4v-4.9c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6v5H10v-11z"],
  ["facebook", "Facebook", "M13.5 22v-8.5h2.9l.5-3.5h-3.4V7.8c0-1 .3-1.7 1.7-1.7H17V3.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3.5h3V22h3.5z"],
  ["twitter", "Twitter / X", "M22 5.9c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5 0 2 1.4 3.7 3.3 4.1-.6.2-1.2.2-1.8.1.5 1.6 2 2.8 3.8 2.9A8.2 8.2 0 0 1 2 18.3 11.6 11.6 0 0 0 8.3 20c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2z"],
];

// Full-photo team card. Default: black-and-white photo only. On hover / keyboard focus: the photo turns to colour,
// the name and role appear over the bottom of the photo and a social bar slides up. Only networks that have a link
// are shown. On touch screens (no hover) the colour photo, name and bar are always visible.
export default function TeamCard({ member: m }) {
  const [loaded, setLoaded] = useState(false);
  const links = SOCIALS.map(([key, label, path]) => ({ key, label, path, url: safeUrl(m[key]) })).filter(l => l.url);
  return (
    <article className={`team-tile${links.length ? " has-links" : ""}`} tabIndex={0} aria-label={m.role ? `${m.name}, ${m.role}` : m.name}>
      <div className="team-photo">
        {m.image_url
          ? <img src={m.image_url} alt="" loading="lazy" decoding="async" className={loaded ? "loaded" : ""} onLoad={() => setLoaded(true)} />
          : <div className="team-initials" aria-hidden="true">{m.initials || m.name.slice(0, 2).toUpperCase()}</div>}
      </div>
      <div className="team-overlay">
        <h3>{m.name}</h3>
        {m.role && <div className="role">{m.role}</div>}
      </div>
      {links.length > 0 && (
        <div className="team-socials">
          {links.map(l => (
            <a key={l.key} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on ${l.label}`} title={l.label}
              onClick={() => track("outbound_social_click", { network: l.label })}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d={l.path} /></svg>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
