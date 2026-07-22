-- The contract status question was dropped from the application form: it was
-- not used when assessing a player. The column stays so applications collected
-- while the field existed keep their answer; new rows simply leave it null.
-- The existing check constraint accepts null, so only the not-null needs to go.
alter table public.applications alter column contract_status drop not null;
