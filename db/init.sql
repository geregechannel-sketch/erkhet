create table if not exists inquiries (
  id bigserial primary key,
  name text not null,
  phone text not null,
  email text,
  interested_tour text,
  people_count int default 0,
  days_count int default 0,
  note text,
  created_at timestamptz not null default now()
);
