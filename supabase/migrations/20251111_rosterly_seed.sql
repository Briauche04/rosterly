
insert into employees(full_name, phone, role, global_worker, active) values
 ('Store Manager', '050-1111111', 'Store Manager', true,  true),
 ('Assistant Manager', '050-2222222', 'Assistant Manager', true,  true),
 ('Key Holder', '050-3333333', 'Key Holder', false, true),
 ('Seller A', '050-4444444', 'Seller', false, true),
 ('Cashier B', '050-5555555', 'Cashier', false, true),
 ('Storage C', '050-6666666', 'Storage', false, true);
with next_sunday as (
  select (date_trunc('week', now()) + interval '1 day')::date as sun
)
insert into schedules(week_start, status)
select sun, 'draft' from next_sunday
on conflict (week_start) do nothing;
