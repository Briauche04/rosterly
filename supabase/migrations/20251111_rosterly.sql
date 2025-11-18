
-- Rosterly schema additions (idempotent-ish)
create table if not exists shift_templates (
  id bigserial primary key,
  store_id uuid,
  name text not null,
  start_time time not null,
  end_time time not null,
  hours numeric not null default 0
);

create table if not exists tutorials (
  id bigserial primary key,
  title text not null,
  category text,
  body_md text,
  youtube_url text,
  created_at timestamp with time zone default now()
);

create table if not exists reminders (
  id bigserial primary key,
  kind text not null, -- 'holiday' | 'birthday' | 'event'
  title text not null,
  date date not null,
  payload jsonb default '{}'::jsonb
);

create table if not exists forum_threads (
  id bigserial primary key,
  author_id uuid,
  category text, -- request | complaint | proposal
  title text not null,
  status text default 'open',
  created_at timestamp with time zone default now()
);

create table if not exists forum_posts (
  id bigserial primary key,
  thread_id bigint references forum_threads(id) on delete cascade,
  author_id uuid,
  body_md text not null,
  attachment_url text,
  created_at timestamp with time zone default now()
);

-- Helper views

create or replace view schedule_slots_view as
select
  ss.*,
  to_char(ss.start_time, 'HH24:MI') as start_label,
  to_char(ss.end_time,   'HH24:MI') as end_label,
  case ss.day
    when 'sun' then 'ראשון' when 'mon' then 'שני' when 'tue' then 'שלישי'
    when 'wed' then 'רביעי' when 'thu' then 'חמישי' when 'fri' then 'שישי'
    else 'שבת'
  end as day_label
from schedule_slots ss;


-- submission_days view example (depends on your existing schema)
create or replace view submission_days_view as
select s.week_start, d.day, d.available, d.start_time, d.end_time, d.employee_id
from submissions s join submission_days d on d.submission_id = s.id;
