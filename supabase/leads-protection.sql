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
