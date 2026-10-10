# Sky Wings Prime — website, admin panel & database

Folders: `website/` (public site), `admin/` (admin panel / CMS), `supabase/` (database schema + lead e-mail function).

## 1. Set up (about 15 minutes)
1. **Supabase project** → SQL Editor → run `supabase/schema.sql` (tables, access rules, storage bucket, starter content, lead spam protection).
   *If the project already ran an earlier version, also run `supabase/leads-protection.sql` once.*
2. Authentication → Users → add the admin user; turn **off** public sign-ups; then run
   `insert into public.admins (user_id, role) select id, 'super_admin' from auth.users where email = 'you@example.com';`
3. Authentication → URL Configuration: set Site URL and Redirect URLs to the **admin** address (password reset).
4. In each app copy `.env.example` to `.env` and fill in: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` (public website address, e.g. `https://www.example.com`).
5. `npm install && npm run dev` in each folder. `npm run build` in the website also regenerates `sitemap.xml`, `robots.txt` and one HTML page per route with its own title / description / share preview (`scripts/prerender.mjs`).
6. **Deploy to Vercel**: two projects (root directories `website` and `admin`) with the same env vars. Set `VITE_SITE_URL` *before* the first website build. Edit the domains in each `vercel.json` (`frame-ancestors` / `frame-src`) if they are placeholders.
7. Admin → Site Settings: confirm company details, add LinkedIn, GA4 / Meta Pixel IDs, legal text.

## 2. Lead e-mail alerts (optional, about 10 minutes)
Function code: `supabase/functions/notify-lead/index.ts` (uses Resend).
1. Create a Resend account, verify your sending domain, create an API key.
2. `supabase functions deploy notify-lead --no-verify-jwt`
3. `supabase secrets set RESEND_API_KEY=... NOTIFY_TO="info@example.com" MAIL_FROM="Sky Wings Prime <leads@yourdomain.com>" WEBHOOK_SECRET=<long random string>`
4. Dashboard → Database → Webhooks → Create: table `contact_submissions`, event **INSERT**, target the `notify-lead` function, add HTTP header `x-webhook-secret: <same string>`.
Until this is set up, new leads are only visible in Admin → Leads.

## 3. What is built
- **Website** (animated look: serif headings, particle/fluid hero, scroll reveals, tilt cards, magnetic buttons, custom cursor, page transitions, splash; Skywings blue + gold, real logo + bird favicon): Home (all spec sections), About, Services + 10 service pages, Work, Concept Lab, case-study pages, Events, Team, Insights + articles, FAQ, Contact, Consultation, 5 legal pages, thank-you, 404.
- **Global**: announcement bar, sticky header, floating WhatsApp (UAE / Sri Lanka, prefilled text), footer with the media permit no., cookie banner (analytics/marketing load only after consent), skip link, reduced-motion support.
- **SEO**: per-page title / description / canonical / Open Graph, JSON-LD (ProfessionalService, Service, Article, Breadcrumb, FAQ), sitemap, robots, static per-route HTML for crawlers and link previews.
- **Forms**: validation, consent checkbox + timestamp, honeypot, double-submit + cooldown, **server-side rate limit (3 per e-mail per hour, 60 per hour overall), link and e-mail checks**.
- **Admin** (logo + favicon): Services, Work & Concepts (real vs concept), Insights (drafts, slug, SEO), Team, Clients, Testimonials, FAQs, **Leads CRM** (status, notes, filters, search, CSV export), **Site Settings** (company data, socials, announcement, tracking IDs, 5 legal pages).
- **Security**: row-level security on every table, admin allow-list, sanitised HTML, upload type/size limits, security headers + CSP, no secrets in the browser.

## 4. Not built (deferred)
- Next.js server rendering (the site is a client-rendered Vite app; the build step above covers titles/descriptions/previews/structured data, but the full page text is only visible to crawlers that run JavaScript).
- CAPTCHA (rate limit + honeypot only), Events CMS, Media library, soft-delete, Super Admin vs Admin permission differences in the UI (the `role` column exists), scheduled-publish screen (a future publish date already hides an article until then), redirect management, HTML sitemap page, newsletter.
- Cover images for the 6 concept projects and real photography (placeholders shown); high-resolution logo.
- Legal wording must be reviewed by a legal adviser.

## 5. Pending client confirmations (spec section 39)
Official e-mail · team role for Buddika Chandra Wijewardhana (blank, not shown) · existing client brand · event photos · TikTok URL · Sky Wings Holdings wording · governing law.
