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
