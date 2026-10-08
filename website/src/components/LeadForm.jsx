import { useRef, useState } from "react";
import { supabase } from "../supabase";
import { Link, useRouter } from "../lib/router";
import { SERVICE_OPTIONS } from "../lib/content";
import { track } from "../lib/data";

const COOLDOWN_MS = 30000;

function Field({ id, label, req, error, children }) {
  return (
    <div className="field">
      <label htmlFor={`lf-${id}`}>{label}{req && <span className="req"> *</span>}</label>
      {children}
      {error && <div className="err" role="alert">{error}</div>}
    </div>
  );
}

const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// type: "contact" | "consultation"
export default function LeadForm({ type = "contact", presetService = "", compact = false }) {
  const { navigate } = useRouter();
  const consult = type === "consultation";
  const [f, setF] = useState({
    name: "", company: "", email: "", phone: "", whatsapp: "", website: "", service: presetService, message: "",
    industry: "", budget: "", preferred_contact: "", preferred_time: "", challenge: "", consent: false, hp: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState("");
  const busy = useRef(false);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const validate = () => {
    const er = {};
    if (!f.name.trim()) er.name = "Please enter your name.";
    if (!emailOk(f.email.trim())) er.email = "Please enter a valid email address.";
    if (!f.message.trim() && !(consult && f.challenge.trim())) er.message = consult ? "Please describe your challenge or message." : "Please enter a message.";
    if (!f.consent) er.consent = "Please accept the Privacy Policy to continue.";
    if (f.website && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(f.website.trim())) er.website = "Please enter a valid website address.";
    return er;
  };

  const submit = async e => {
    e.preventDefault();
    if (busy.current) return;
    setFailed("");
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) { document.getElementById(`lf-${Object.keys(er)[0]}`)?.focus(); return; }
    if (f.hp) { navigate("/thank-you"); return; } // honeypot: pretend success to bots
    const last = Number(localStorage.getItem("sw_last_lead") || 0);
    if (Date.now() - last < COOLDOWN_MS) { setFailed("Please wait a few seconds before sending another message."); return; }

    busy.current = true; setSending(true);
    const message = consult && f.challenge.trim() ? `${f.challenge.trim()}${f.message.trim() ? `\n\n${f.message.trim()}` : ""}` : f.message.trim();
    const { error } = await supabase.from("contact_submissions").insert({
      form_type: type,
      name: f.name.trim(), company: f.company.trim(), email: f.email.trim(), phone: f.phone.trim(), whatsapp: f.whatsapp.trim(),
      website: f.website.trim(), industry: f.industry.trim(), service: f.service, budget: f.budget,
      preferred_contact: f.preferred_contact, preferred_time: f.preferred_time.trim(), message,
      source: compact ? "Services Quote Form" : consult ? "Consultation Form" : "Contact Form", status: "New", notes: "", consent_at: new Date().toISOString(), read: false,
    });
    busy.current = false; setSending(false);
    if (error) {
      console.error(error.message);
      const m = error.message || "";
      setFailed(
        m.includes("rate_limited") ? "We've received several messages from you recently. Please try again later or contact us on WhatsApp." :
        m.includes("too_many_links") ? "Please remove some of the links from your message and try again." :
        m.includes("invalid_email") ? "Please check your email address." :
        "Sorry, something went wrong sending your message. Please try again or contact us on WhatsApp."
      );
      return;
    }
    localStorage.setItem("sw_last_lead", String(Date.now()));
    track(consult ? "consultation_submit" : "contact_submit");
    navigate("/thank-you");
  };

  const inp = (id, props = {}) => <input id={`lf-${id}`} value={f[id]} onChange={set(id)} aria-invalid={!!errors[id]} {...props} />;

  if (compact) {
    return (
      <form className="form quote-form" onSubmit={submit} noValidate>
        <Field id="name" error={errors.name} label="First name" req>{inp("name", { autoComplete: "given-name", maxLength: 120, placeholder: "Enter your first name" })}</Field>
        <Field id="email" error={errors.email} label="Email" req>{inp("email", { type: "email", autoComplete: "email", maxLength: 254, placeholder: "Enter your email" })}</Field>
        <Field id="message" error={errors.message} label="Comment" req>
          <textarea id="lf-message" value={f.message} onChange={set("message")} maxLength={4000} aria-invalid={!!errors.message} placeholder="Enter your comment" style={{ minHeight: 90 }} />
        </Field>
        <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="company_website" value={f.hp} onChange={set("hp")} />
        <div style={{ marginTop: 12 }}>
          <label className="consent">
            <input id="lf-consent" type="checkbox" checked={f.consent} onChange={set("consent")} />
            <span>I agree to the <Link to="/privacy-policy" target="_blank">Privacy Policy</Link>. <span className="gold">*</span></span>
          </label>
          {errors.consent && <div className="err" role="alert" style={{ color: "#ff8a80", fontSize: 13, marginTop: 6 }}>{errors.consent}</div>}
        </div>
        {failed && <div className="alert error" role="alert">{failed}</div>}
        <button className="quote-btn" disabled={sending} type="submit"><span>{sending ? "SENDING…" : "SUBMIT NOW"}</span></button>
      </form>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="row">
        <Field id="name" error={errors.name} label="Full Name" req>{inp("name", { autoComplete: "name", maxLength: 120 })}</Field>
        <Field id="company" error={errors.company} label="Company Name">{inp("company", { autoComplete: "organization", maxLength: 160 })}</Field>
      </div>
      <div className="row">
        <Field id="email" error={errors.email} label="Email" req>{inp("email", { type: "email", autoComplete: "email", maxLength: 254 })}</Field>
        <Field id="phone" error={errors.phone} label="Phone">{inp("phone", { type: "tel", autoComplete: "tel", maxLength: 40 })}</Field>
      </div>
      <div className="row">
        <Field id="whatsapp" error={errors.whatsapp} label="WhatsApp">{inp("whatsapp", { type: "tel", maxLength: 40 })}</Field>
        <Field id="website" error={errors.website} label="Website">{inp("website", { placeholder: "https://", maxLength: 300 })}</Field>
      </div>
      {consult && (
        <div className="row">
          <Field id="industry" error={errors.industry} label="Industry">{inp("industry", { maxLength: 120 })}</Field>
          <Field id="budget" error={errors.budget} label="Budget range (optional)">
            <select id="lf-budget" value={f.budget} onChange={set("budget")}>
              <option value="">Prefer not to say</option>
              <option>Under AED 5,000 / month</option>
              <option>AED 5,000 – 15,000 / month</option>
              <option>AED 15,000 – 30,000 / month</option>
              <option>AED 30,000+ / month</option>
              <option>One-off project</option>
            </select>
          </Field>
        </div>
      )}
      <Field id="service" error={errors.service} label={consult ? "Required service(s)" : "Service Interested In"}>
        <select id="lf-service" value={f.service} onChange={set("service")}>
          <option value="">Select a service</option>
          {SERVICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      {consult && (
        <>
          <Field id="challenge" error={errors.challenge} label="Current challenge">
            <textarea id="lf-challenge" value={f.challenge} onChange={set("challenge")} maxLength={2000} />
          </Field>
          <div className="row">
            <Field id="preferred_contact" error={errors.preferred_contact} label="Preferred contact method">
              <select id="lf-preferred_contact" value={f.preferred_contact} onChange={set("preferred_contact")}>
                <option value="">No preference</option><option>Phone</option><option>WhatsApp</option><option>Email</option>
              </select>
            </Field>
            <Field id="preferred_time" error={errors.preferred_time} label="Preferred date / time">{inp("preferred_time", { placeholder: "e.g. Tuesday afternoon", maxLength: 120 })}</Field>
          </div>
        </>
      )}
      <Field id="message" error={errors.message} label={consult ? "Additional message" : "Message"} req={!consult}>
        <textarea id="lf-message" value={f.message} onChange={set("message")} maxLength={4000} aria-invalid={!!errors.message} />
      </Field>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="company_website" value={f.hp} onChange={set("hp")} />
      <div>
        <label className="consent">
          <input id="lf-consent" type="checkbox" checked={f.consent} onChange={set("consent")} />
          <span>I agree to the processing of my details as described in the <Link to="/privacy-policy" target="_blank">Privacy Policy</Link>. <span className="gold">*</span></span>
        </label>
        {errors.consent && <div className="err" role="alert" style={{ color: "#ff8a80", fontSize: 13, marginTop: 6 }}>{errors.consent}</div>}
      </div>
      {failed && <div className="alert error" role="alert">{failed}</div>}
      <button className="btn btn-primary" disabled={sending} type="submit">{sending ? "Sending…" : consult ? "Request a Private Consultation" : "Send Message"}</button>
    </form>
  );
}
