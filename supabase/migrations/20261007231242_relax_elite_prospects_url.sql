-- The contact form has always labelled this field optional ("leave this field
-- blank if you don't have a profile"), but the column's not-null constraint
-- forced the client to submit a placeholder URL (the bare eliteprospects.com
-- homepage) whenever a player had no profile, and blocked submission outright
-- if that client-side fallback didn't run. The application layer now stores a
-- real null instead of a placeholder, so the column must accept it too.
alter table public.applications alter column elite_prospects_url drop not null;
