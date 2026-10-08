// Static copy taken from the client specification. Company details are defaults only —
// the live values come from the `settings` table (Admin → Settings).

export const DEFAULT_SETTINGS = {
  brand_name: "Sky Wings Prime",
  legal_name: "Skywings Prime Marketing Management",
  tagline: "Giving You Wings",
  address: "232, Muhaisnah, Dubai, UAE",
  phone: "+971 50 527 3277",
  whatsapp_uae: "+971 50 527 3277",
  whatsapp_sl: "+94 74 041 5234",
  email: "info@skywinsgholdings.com",
  privacy_email: "info@skywinsgholdings.com",
  license_no: "1618737",
  business_hours: "Monday to Friday, 9:00 AM – 5:00 PM",
  social_instagram: "https://www.instagram.com/skywings_prime",
  social_facebook: "https://www.facebook.com/SkyWingsPrime",
  social_linkedin: "",
  social_tiktok: "",
  announcement_text: "",
  announcement_link: "",
  stat_1_value: "10", stat_1_label: "Service areas",
  stat_2_value: "10", stat_2_label: "Industries we focus on",
  stat_3_value: "4", stat_3_label: "Step working process",
  stat_4_value: "", stat_4_label: "",
  services_video_url: "",
  services_image_url: "",
  company_profile_pdf: "",
  company_profile_word: "",
  ga4_id: "",
  meta_pixel_id: "",
};

export const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
  { label: "Events", to: "/events" },
  { label: "Insights", to: "/insights" },
  { label: "Contact", to: "/contact" },
];

export const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Cookie Policy", to: "/cookie-policy" },
  { label: "Disclaimer", to: "/disclaimer" },
  { label: "Accessibility", to: "/accessibility" },
];

export const TRUST_STRIP = ["Strategic Clarity", "Expert Approach", "Global Perspective", "Sustainable Growth"];

export const FOCUS = [
  { title: "Strategic Direction", text: "Clear, structured marketing direction built around your goals." },
  { title: "Brand Development", text: "Identity and positioning that make your business easy to recognise." },
  { title: "Digital Communication", text: "Consistent messaging across the channels your customers use." },
  { title: "Results-Oriented Marketing", text: "Practical campaigns planned, guided and refined over time." },
];

export const VALUE = ["Boutique Expertise", "Strategic Clarity", "International Perspective", "Professional Approach", "Modern Marketing Thinking"];
export const PRINCIPLES = ["Professional Integrity", "Strategic Clarity", "Client-Focused Approach", "Quality Over Volume", "Long-Term Value Creation"];

export const PROCESS = [
  { n: "01", title: "Discovery", text: "Understand needs, goals and market context." },
  { n: "02", title: "Strategy Development", text: "Create structured marketing and brand direction." },
  { n: "03", title: "Guidance & Support", text: "Actionable recommendations and ongoing input." },
  { n: "04", title: "Refinement", text: "Improve outcomes using feedback and performance insights." },
];

export const WHO = ["Entrepreneurs", "Startups & Growing Businesses", "Professional Service Providers", "Niche & Premium Brands", "Tourism, Real Estate and Healthcare Businesses"];
export const INDUSTRIES = ["Real Estate", "Healthcare", "Tourism & Travel", "Corporate Services", "Professional Services", "Startups", "Premium Brands", "Hospitality", "Retail", "Events"];

export const EVENT_CAPABILITIES = [
  "Corporate event promotion", "Exhibition marketing", "Product launch promotion", "Brand activations",
  "Event campaign planning", "Event promotional materials", "Digital event promotion", "Event content / media coverage",
];

export const BLOG_CATEGORIES = [
  "Marketing Strategy", "Brand Management", "Digital Marketing", "Social Media", "Advertising",
  "Dubai/UAE Marketing", "Tourism Marketing", "Real Estate Marketing", "Healthcare Marketing",
];

export const SERVICE_OPTIONS = [
  "Digital Marketing Management", "Social Media Management", "Branding & Brand Management", "Content Marketing",
  "Advertising & Campaign Management", "Marketing Strategy & Consultancy", "Creative Marketing Solutions",
  "Online Business & Brand Promotion", "Influencer & Promotional Marketing", "Corporate Marketing Management", "Not sure yet",
];

export const FALLBACK_FAQS = [
  { question: "What services does Sky Wings Prime provide?", answer: "Sky Wings Prime provides digital marketing management, social media management, branding, content marketing, advertising and campaign management, marketing strategy and consultancy, creative marketing, online brand promotion, influencer/promotional marketing and corporate marketing management." },
  { question: "Where is Sky Wings Prime located?", answer: "232, Muhaisnah, Dubai, UAE." },
  { question: "How can I request a consultation?", answer: "Use the consultation form, call +971 50 527 3277, or contact the team via WhatsApp." },
];

// ── Default legal text (structure from the specification). Editable in Admin → Settings.
// FINAL WORDING MUST BE REVIEWED BY A LEGAL ADVISER BEFORE LAUNCH.
const para = (...t) => t.map(x => `<p>${x}</p>`).join("");
const h = (t) => `<h2>${t}</h2>`;
const ul = (...i) => `<ul>${i.map(x => `<li>${x}</li>`).join("")}</ul>`;

export const LEGAL_DEFAULTS = {
  privacy: {
    title: "Privacy Policy",
    html:
      h("Introduction") + para("This Privacy Policy explains how Skywings Prime Marketing Management (“Sky Wings Prime”, “we”, “us”) collects, uses and protects personal information when you use this website or contact us.") +
      h("Information we collect") + para("Name, email address, phone number, company, website, enquiry and consultation details, and technical data such as IP address, device and browser information, and cookie/analytics information.") +
      h("How information is collected") + para("Through our contact and consultation forms, email, WhatsApp, cookies and analytics tools, newsletters and direct communication.") +
      h("How we use information") + para("To respond to enquiries, provide services, prepare proposals, manage client relationships, improve the website, keep it secure, meet legal obligations and, where you have consented, send marketing communications.") +
      h("Legal basis and consent") + para("Where applicable we rely on your consent, performance of a contract, our legitimate business interests and legal obligations.") +
      h("Cookies and tracking") + para("We use essential cookies to operate the site and, with your consent, analytics, marketing and preference cookies. See our Cookie Policy for details.") +
      h("Third-party services") + para("We list only services we actually use, such as hosting, email delivery, analytics and advertising platforms (for example Google, Meta or LinkedIn tools) when enabled.") +
      h("Data sharing") + para("We do not sell personal information. We share it only with service providers who need it to deliver our services, or when required by law.") +
      h("International processing") + para("Some service providers may process data outside your country where applicable.") +
      h("Retention") + para("We keep personal data only as long as reasonably necessary for business and legal purposes.") +
      h("Security") + para("We use reasonable technical and organisational safeguards to protect personal information.") +
      h("Your rights") + para("Where applicable you may request access, correction or deletion of your data, object to or opt out of processing, and withdraw consent at any time.") +
      h("Marketing communications") + para("You can unsubscribe from marketing messages at any time using the link provided or by contacting us.") +
      h("Children") + para("This website is intended for business and general audiences and is not directed at children.") +
      h("External links") + para("Third-party websites have their own privacy practices, which we do not control.") +
      h("Policy updates") + para("We may update this policy from time to time. The effective date is shown on this page.") +
      h("Contact") + para("For privacy questions, contact us using the details in the website footer."),
  },
  terms: {
    title: "Terms & Conditions",
    html:
      h("Acceptance of terms") + para("By using this website you agree to these Terms & Conditions.") +
      h("Company information") + para("This website is operated by Skywings Prime Marketing Management, Dubai, UAE.") +
      h("Permitted use") + para("You may use this website for lawful purposes only and in a way that does not harm the site or other users.") +
      h("Service information") + para("Information on this website is for general information. It does not create a contract. Services are provided only under a separate written agreement.") +
      h("Intellectual property") + para("All content, branding, graphics, photography, video and copy are owned by or licensed to Skywings Prime Marketing Management unless otherwise stated. Unauthorised reproduction is prohibited.") +
      h("Prohibited activities") + para("Attempting to gain unauthorised access, introducing malware, scraping the site at scale, or misusing contact forms.") +
      h("Accuracy and availability") + para("We aim for accurate information but do not guarantee that the website is error-free or uninterrupted.") +
      h("Proposals and pricing") + para("Proposals and prices are provided on request and apply only as stated in writing.") +
      h("Third-party links") + para("We are not responsible for the content or practices of external websites.") +
      h("Marketing results") + para("Sky Wings Prime does not guarantee specific sales, revenue, leads, rankings, engagement or advertising outcomes unless expressly stated in a separate written agreement.") +
      h("Limitation of liability") + para("To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of this website.") +
      h("Governing law") + para("Governing law and jurisdiction: to be confirmed following legal review.") +
      h("Changes to these terms") + para("We may update these terms. Continued use of the website means you accept the updated terms.") +
      h("Contact") + para("Questions about these terms can be sent using the details in the website footer."),
  },
  cookies: {
    title: "Cookie Policy",
    html:
      h("What cookies are") + para("Cookies are small text files stored on your device that help a website work and understand how it is used.") +
      h("Essential cookies") + para("Required for the website to function, for example to remember your cookie choice. These cannot be switched off.") +
      h("Analytics cookies") + para("Help us understand how visitors use the website (for example Google Analytics). Used only with your consent.") +
      h("Marketing cookies") + para("Used to measure and improve advertising (for example Meta Pixel, LinkedIn Insight Tag or Google Ads). Used only with your consent.") +
      h("Preference cookies") + para("Remember choices you make on the website.") +
      h("Third-party cookies") + para("Third-party cookies are set only by services that are enabled on this website.") +
      h("Managing cookies") + para("You can accept all cookies, reject non-essential cookies or manage your preferences using the cookie banner. You can also change your browser settings.") +
      h("Changing or withdrawing consent") + para("Use “Cookie settings” in the footer at any time to change or withdraw your consent.") +
      h("Policy updates and contact") + para("We may update this policy. Contact us using the details in the website footer."),
  },
  disclaimer: {
    title: "Disclaimer",
    html:
      para("The marketing information on this website is general in nature.") +
      ul("Results vary by client, market, budget and circumstances.", "Third-party platforms may change their rules, features or pricing.", "We do not guarantee uninterrupted availability of the website.", "External websites linked from this site are outside Sky Wings Prime’s control.", "Concept projects shown on this website are not completed client work unless clearly stated."),
  },
  accessibility: {
    title: "Accessibility Statement",
    html:
      para("Sky Wings Prime is committed to making this website usable by as many people as possible.") +
      ul("Keyboard navigation for menus, forms and interactive elements.", "Readable colour contrast and visible focus states.", "Alternative text for meaningful images.", "Labelled form fields with clear error messages.", "Respect for reduced-motion preferences.") +
      para("If you have difficulty using any part of this website, please contact us using the details in the footer and we will do our best to help."),
  },
};
