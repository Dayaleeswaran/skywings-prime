-- Skywings Prime — Supabase schema, Row Level Security, Storage and starter content.
-- Run this whole file once in: Supabase Dashboard → SQL Editor.
--
-- AFTER running it:
--   1. Authentication → Users → "Add user" (create your admin login) and turn OFF
--      "Allow new users to sign up" (Authentication → Providers → Email).
--   2. Make that user an admin (replace the e-mail):
--        insert into public.admins (user_id)
--        select id from auth.users where email = 'you@example.com';

create extension if not exists pgcrypto;

-- ───────────────────────── admins ─────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('super_admin','admin'))
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

-- a signed-in user may only see their own admin row (used by the admin app to verify access)
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid());

-- ───────────────────────── content tables ─────────────────────────
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique,
  seo_title text not null default '',
  seo_description text not null default '',
  problems text[] not null default '{}',
  icon text not null default '',
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  items text[] not null default '{}',
  gallery text[] not null default '{}',
  visible boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique,
  project_type text not null default 'concept' check (project_type in ('real','concept')),
  industry text not null default '',
  summary text not null default '',
  cover_url text not null default '',
  sort_order int not null default 0,
  title text not null,
  category text not null default '',
  year text not null default '',
  problem text not null default '',
  strategy text not null default '',
  execution text not null default '',
  results text not null default '',
  visible boolean not null default true
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique,
  author text not null default '',
  tags text not null default '',
  featured_image text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  title text not null,
  category text not null default '',
  excerpt text not null default '',
  content text not null default '',
  published boolean not null default false,
  published_at timestamptz
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  role text not null default '',
  initials text not null default '',
  bio text not null default '',
  image_url text not null default '',
  expertise text not null default '',
  email text not null default '',
  featured boolean not null default false,
  instagram text not null default '',
  linkedin text not null default '',
  facebook text not null default '',
  twitter text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  logo_url text not null default '',
  website_url text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author text not null,
  role text not null default '',
  company text not null default '',
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  photo_url text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  question text not null,
  answer text not null,
  group_name text not null default 'general',
  visible boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default ''
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  form_type text not null default 'contact' check (form_type in ('contact','consultation')),
  name text not null check (char_length(name) between 1 and 120),
  company text not null default '' check (char_length(company) <= 160),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null default '' check (char_length(phone) <= 40),
  whatsapp text not null default '' check (char_length(whatsapp) <= 40),
  website text not null default '' check (char_length(website) <= 300),
  industry text not null default '' check (char_length(industry) <= 120),
  service text not null default '' check (char_length(service) <= 300),
  budget text not null default '' check (char_length(budget) <= 80),
  preferred_contact text not null default '' check (char_length(preferred_contact) <= 40),
  preferred_time text not null default '' check (char_length(preferred_time) <= 120),
  message text not null check (char_length(message) between 1 and 5000),
  source text not null default 'Contact Form',
  status text not null default 'New' check (status in ('New','Contacted','Follow-up','Qualified','Converted','Closed')),
  notes text not null default '',
  consent_at timestamptz,
  read boolean not null default false
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb
);

-- ───────────────────────── Row Level Security ─────────────────────────
alter table public.services enable row level security;
alter table public.portfolio enable row level security;
alter table public.blog_posts enable row level security;
alter table public.team_members enable row level security;
alter table public.clients enable row level security;
alter table public.testimonials enable row level security;
alter table public.settings enable row level security;
alter table public.faqs enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.activity_log enable row level security;

-- Public (anon) can read only what the site is meant to show; admins can do everything.
do $$
declare t text;
begin
  foreach t in array array['services','portfolio','team_members','clients','testimonials','faqs'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (visible = true or public.is_admin())', t);
  end loop;
  foreach t in array array['services','portfolio','blog_posts','team_members','clients','testimonials','settings','faqs'] loop
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read" on public.blog_posts;
create policy "public read" on public.blog_posts for select to anon, authenticated using (published = true or public.is_admin());

drop policy if exists "public read" on public.settings;
create policy "public read" on public.settings for select to anon, authenticated using (true);

-- Contact form: anyone may INSERT (length-checked above); only admins can read / update / delete.
drop policy if exists "public insert" on public.contact_submissions;
create policy "public insert" on public.contact_submissions for insert to anon, authenticated with check (read = false and status = 'New' and notes = '' and consent_at is not null);
drop policy if exists "admin manage" on public.contact_submissions;
create policy "admin manage" on public.contact_submissions for select to authenticated using (public.is_admin());
drop policy if exists "admin update" on public.contact_submissions;
create policy "admin update" on public.contact_submissions for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete" on public.contact_submissions;
create policy "admin delete" on public.contact_submissions for delete to authenticated using (public.is_admin());

drop policy if exists "admin log" on public.activity_log;
create policy "admin log" on public.activity_log for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Storage ─────────────────────────
-- Public bucket (files are served by URL), but only admins can upload/replace/delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/avif','video/mp4','video/webm','application/pdf',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "uploads admin insert" on storage.objects;
create policy "uploads admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'uploads' and public.is_admin());
drop policy if exists "uploads admin update" on storage.objects;
create policy "uploads admin update" on storage.objects for update to authenticated using (bucket_id = 'uploads' and public.is_admin());
drop policy if exists "uploads admin delete" on storage.objects;
create policy "uploads admin delete" on storage.objects for delete to authenticated using (bucket_id = 'uploads' and public.is_admin());

-- =====================================================================
-- If you already ran the older version of this schema on this project, these add the new columns.
-- (On a fresh project they do nothing.)
-- =====================================================================
alter table public.admins add column if not exists role text not null default 'admin';
alter table public.services add column if not exists slug text, add column if not exists seo_title text not null default '', add column if not exists seo_description text not null default '', add column if not exists problems text[] not null default '{}';
alter table public.portfolio add column if not exists slug text, add column if not exists project_type text not null default 'concept', add column if not exists industry text not null default '', add column if not exists summary text not null default '', add column if not exists cover_url text not null default '', add column if not exists sort_order int not null default 0;
alter table public.blog_posts add column if not exists slug text, add column if not exists author text not null default '', add column if not exists tags text not null default '', add column if not exists featured_image text not null default '', add column if not exists seo_title text not null default '', add column if not exists seo_description text not null default '';
alter table public.team_members add column if not exists expertise text not null default '', add column if not exists email text not null default '', add column if not exists featured boolean not null default false;
alter table public.contact_submissions
  add column if not exists form_type text not null default 'contact', add column if not exists company text not null default '', add column if not exists phone text not null default '',
  add column if not exists whatsapp text not null default '', add column if not exists website text not null default '', add column if not exists industry text not null default '',
  add column if not exists budget text not null default '', add column if not exists preferred_contact text not null default '', add column if not exists preferred_time text not null default '',
  add column if not exists source text not null default 'Contact Form', add column if not exists status text not null default 'New', add column if not exists notes text not null default '', add column if not exists consent_at timestamptz;
create unique index if not exists services_slug_key on public.services (slug);
create unique index if not exists portfolio_slug_key on public.portfolio (slug);
create unique index if not exists blog_posts_slug_key on public.blog_posts (slug);
drop policy if exists "public insert" on public.contact_submissions;
create policy "public insert" on public.contact_submissions for insert to anon, authenticated with check (read = false and status = 'New' and notes = '' and consent_at is not null);


-- =====================================================================
-- STARTER CONTENT (from the client specification). Safe to re-run.
-- =====================================================================
insert into public.settings (key, value) values
  ('brand_name','Sky Wings Prime'),
  ('legal_name','Skywings Prime Marketing Management'),
  ('tagline','Giving You Wings'),
  ('address','232, Muhaisnah, Dubai, UAE'),
  ('phone','+971 50 527 3277'),
  ('whatsapp_uae','+971 50 527 3277'),
  ('whatsapp_sl','+94 74 041 5234'),
  ('email','info@skywinsgholdings.com'),
  ('privacy_email','info@skywinsgholdings.com'),
  ('license_no','1618737'),
  ('business_hours','Monday to Friday, 9:00 AM – 5:00 PM'),
  ('social_instagram','https://www.instagram.com/skywings_prime'),
  ('social_facebook','https://www.facebook.com/SkyWingsPrime'),
  ('social_linkedin',''),
  ('social_tiktok',''),
  ('announcement_text',''),
  ('announcement_link',''),
  ('ga4_id',''),
  ('meta_pixel_id',''),
  ('site_url','')
on conflict (key) do nothing;

insert into public.services (slug, title, subtitle, description, items, problems, icon, sort_order) values
 ('digital-marketing-management','Digital Marketing Management','Build a consistent, measurable digital presence across the platforms your customers use.',
  'Structured management of your digital marketing — from planning and content to campaign execution and promotion across social platforms.',
  array['Social Media Marketing','Facebook & Instagram Management','Content Planning & Campaign Management','Digital Brand Promotion'],
  array['Inconsistent posting and unclear messaging','No clear plan connecting content to business goals','Limited visibility among the right audience'],'📈',1),
 ('social-media-management','Social Media Management','Keep your brand active, consistent and engaging on social media.',
  'Day-to-day management of your social presence, from page management and scheduling to audience engagement.',
  array['Social Media Page Management','Content Scheduling','Audience Engagement','Brand Presence Management'],
  array['Pages that are inactive or inconsistent','No time to respond to your audience','A brand voice that varies from post to post'],'💬',2),
 ('branding-brand-management','Branding & Brand Management','A clear identity and positioning that makes your business stand out.',
  'Brand strategy, identity development and positioning to help your business communicate with clarity and confidence.',
  array['Brand Strategy','Brand Identity Development','Brand Positioning','Corporate Brand Management'],
  array['A brand that looks or sounds different across channels','Unclear positioning against competitors','An identity that no longer reflects the business'],'✦',3),
 ('content-marketing','Content Marketing','Content that communicates your value and supports your campaigns.',
  'Creative and promotional content developed around your brand, your audience and your campaign goals.',
  array['Creative Content Development','Promotional Content','Marketing Copywriting','Campaign Content Planning'],
  array['Content that lacks a clear purpose','No consistent content calendar','Copy that does not reflect the brand'],'✎',4),
 ('advertising-campaign-management','Advertising & Campaign Management','Plan and run advertising campaigns with clear goals.',
  'Planning and management of digital advertising and promotional campaigns, including lead generation.',
  array['Digital Advertising Campaigns','Promotional Campaign Management','Lead Generation Campaigns','Marketing Campaign Planning'],
  array['Advertising spend without a clear plan','Campaigns that are hard to track or compare','Difficulty generating qualified enquiries'],'◎',5),
 ('marketing-strategy-consultancy','Marketing Strategy & Consultancy','Structured marketing direction built around your goals and market.',
  'Consultancy-led support to define your marketing strategy, plan your next steps and review performance.',
  array['Marketing Strategy','Business Marketing Planning','Market Positioning','Marketing Performance Review'],
  array['No documented marketing strategy','Uncertainty about where to focus effort and budget','Unclear market positioning'],'⚑',6),
 ('creative-marketing-solutions','Creative Marketing Solutions','Promotional creative that communicates your message clearly.',
  'Creative concepts and materials for promotions, social media and corporate communication.',
  array['Promotional Creative Concepts','Social Media Creatives','Campaign Concepts','Corporate Promotional Materials'],
  array['Creative that does not match the brand','Limited in-house design capacity','Campaigns that need a fresh concept'],'◈',7),
 ('online-business-brand-promotion','Online Business & Brand Promotion','Strengthen how your business appears and engages online.',
  'Support to develop your online brand, promote your business profile and improve your digital presence.',
  array['Online Brand Development','Business Profile Promotion','Digital Presence Enhancement','Customer Engagement Strategies'],
  array['A weak or incomplete online presence','Low discoverability for your business','Limited customer engagement online'],'🌐',8),
 ('influencer-promotional-marketing','Influencer & Promotional Marketing','Coordinate promotional partnerships and brand awareness campaigns.',
  'Coordination of influencer campaigns and promotional partnerships to raise awareness of your brand.',
  array['Influencer Campaign Coordination','Promotional Partnerships','Brand Awareness Campaigns','Digital Promotion'],
  array['Difficulty finding suitable promotional partners','Campaigns that lack coordination','Low brand awareness in a target audience'],'★',9),
 ('corporate-marketing-management','Corporate Marketing Management','Ongoing marketing support for established businesses.',
  'Corporate marketing support, campaign coordination, promotional planning and ongoing marketing management.',
  array['Corporate Marketing Support','Marketing Campaign Coordination','Promotional Planning','Ongoing Marketing Management'],
  array['No dedicated marketing function','Campaigns managed without coordination','Marketing activity without ongoing review'],'▣',10)
on conflict (slug) do nothing;

insert into public.faqs (question, answer, sort_order)
select * from (values
 ('What services does Sky Wings Prime provide?','Sky Wings Prime provides digital marketing management, social media management, branding, content marketing, advertising and campaign management, marketing strategy and consultancy, creative marketing, online brand promotion, influencer/promotional marketing and corporate marketing management.',1),
 ('Where is Sky Wings Prime located?','232, Muhaisnah, Dubai, UAE.',2),
 ('Do you work with businesses outside Dubai?','Sky Wings Prime is positioned with an international perspective. Please get in touch and we will confirm coverage for your market.',3),
 ('Can you manage Facebook and Instagram?','Yes. Facebook & Instagram Management is included under Digital Marketing Management.',4),
 ('Do you provide ongoing marketing support?','Yes. Corporate Marketing Management includes ongoing marketing management and campaign coordination.',5),
 ('Do you provide branding?','Yes. Branding & Brand Management includes brand strategy, identity development, positioning and corporate brand management.',6),
 ('Do you manage advertising campaigns?','Yes. Advertising & Campaign Management includes digital advertising, promotional campaigns, lead generation and campaign planning.',7),
 ('How can I request a consultation?','Use the consultation form, call +971 50 527 3277, or contact the team via WhatsApp.',8)
) as v(question, answer, sort_order)
where not exists (select 1 from public.faqs);

insert into public.portfolio (slug, title, project_type, category, industry, year, summary, visible) values
 ('luxury-real-estate-campaign-concept','Luxury Real Estate Campaign Concept','concept','Campaigns','Real Estate','2026','A concept exploring how a premium property launch could be positioned and promoted.',true),
 ('healthcare-awareness-campaign-concept','Healthcare Awareness / Lead Campaign Concept','concept','Digital','Healthcare','2026','A concept for an awareness and enquiry-generation campaign for a healthcare provider.',true),
 ('tourism-promotion-concept','Tourism Promotion Concept','concept','Campaigns','Tourism & Travel','2026','A concept showing how a destination or tourism offer could be presented to international audiences.',true),
 ('corporate-brand-campaign-concept','Corporate Brand Campaign Concept','concept','Branding','Corporate Services','2026','A concept for a corporate brand awareness campaign.',true),
 ('restaurant-hospitality-launch-concept','Restaurant / Hospitality Launch Concept','concept','Social','Hospitality','2026','A concept for the launch of a restaurant or hospitality venue.',true),
 ('premium-product-campaign-concept','Premium Product Campaign Concept','concept','Campaigns','Premium Brands','2026','A concept for the campaign launch of a premium product.',true)
on conflict (slug) do nothing;

insert into public.team_members (name, role, initials, bio, sort_order, visible)
select 'Buddika Chandra Wijewardhana','','BC','',1,true
where not exists (select 1 from public.team_members where name = 'Buddika Chandra Wijewardhana');


-- ===== Lead protection (rate limit + link/e-mail checks) =====
-- Server-side spam protection for the public contact / consultation forms.
-- Run once in Supabase → SQL Editor (safe to re-run).
--
-- Rules (adjust the numbers below if needed):
--   * the same e-mail address may submit at most 3 times per hour
--   * at most 60 submissions per hour in total (stops floods without blocking normal traffic)
--   * the message may not contain more than 3 links
--   * the e-mail must look like an e-mail address

create or replace function public.leads_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  per_email int;
  total int;
  links int;
begin
  new.email := lower(trim(new.email));
  new.name := trim(new.name);

  if new.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email' using errcode = 'P0001';
  end if;

  select count(*) into per_email from public.contact_submissions
   where email = new.email and created_at > now() - interval '1 hour';
  if per_email >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  select count(*) into total from public.contact_submissions where created_at > now() - interval '1 hour';
  if total >= 60 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  links := (select count(*) from regexp_matches(new.message, 'https?://', 'gi'));
  if links > 3 then
    raise exception 'too_many_links' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists leads_guard_trigger on public.contact_submissions;
create trigger leads_guard_trigger
  before insert on public.contact_submissions
  for each row execute function public.leads_guard();


-- ===== Key figures shown as animated counters on the home page (edit in Admin -> Site Settings -> Key Figures) =====
-- Only figures taken from the client specification. Add real, verified numbers (years, projects, clients...) in the admin.
insert into public.settings (key, value) values
  ('stat_1_value','10'), ('stat_1_label','Service areas'),
  ('stat_2_value','10'), ('stat_2_label','Industries we focus on'),
  ('stat_3_value','4'),  ('stat_3_label','Step working process'),
  ('stat_4_value',''),   ('stat_4_label','')
on conflict (key) do nothing;

-- Live updates: lets the public website receive a message the moment content changes in the admin panel.
-- Run once in Supabase -> SQL Editor (safe to re-run). Row-level security still applies: visitors only ever
-- receive changes to rows they are allowed to read (visible / published content and settings).
do $$
declare t text;
begin
  foreach t in array array['services','portfolio','blog_posts','team_members','clients','testimonials','faqs','settings'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
