-- Pet weight and carrier size, entered by the owner. Used only to compare
-- against a sourced airline limit already on the pass. Not a new airline rule.
alter table public.pets
  add column if not exists weight_lb numeric,
  add column if not exists carrier_length_in numeric,
  add column if not exists carrier_width_in numeric,
  add column if not exists carrier_height_in numeric;

alter table public.pets drop constraint if exists pets_weight_lb_range;
alter table public.pets add constraint pets_weight_lb_range
  check (weight_lb is null or (weight_lb > 0 and weight_lb <= 400));

alter table public.pets drop constraint if exists pets_carrier_length_range;
alter table public.pets add constraint pets_carrier_length_range
  check (carrier_length_in is null or (carrier_length_in > 0 and carrier_length_in <= 60));

alter table public.pets drop constraint if exists pets_carrier_width_range;
alter table public.pets add constraint pets_carrier_width_range
  check (carrier_width_in is null or (carrier_width_in > 0 and carrier_width_in <= 60));

alter table public.pets drop constraint if exists pets_carrier_height_range;
alter table public.pets add constraint pets_carrier_height_range
  check (carrier_height_in is null or (carrier_height_in > 0 and carrier_height_in <= 60));

grant select (weight_lb, carrier_length_in, carrier_width_in, carrier_height_in) on public.pets to authenticated;
grant insert (weight_lb, carrier_length_in, carrier_width_in, carrier_height_in) on public.pets to authenticated;
grant update (weight_lb, carrier_length_in, carrier_width_in, carrier_height_in) on public.pets to authenticated;
