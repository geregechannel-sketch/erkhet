create table if not exists users (
  id bigserial primary key,
  full_name text not null,
  email text not null unique,
  phone text not null default '',
  password_hash text not null,
  role text not null default 'customer' check (role in ('customer', 'super_admin', 'booking_manager', 'finance', 'support')),
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
  preferred_language text not null default 'mn',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists tours (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  summary text not null,
  description text not null,
  business_line text not null default 'domestic' check (business_line in ('inbound', 'outbound', 'domestic')),
  operation_type text not null default 'scheduled' check (operation_type in ('scheduled', 'custom')),
  tour_kind text not null default 'multi_day' check (tour_kind in ('multi_day', 'day_tour')),
  duration_days int not null default 1,
  duration_nights int not null default 0,
  base_price numeric(12,2),
  currency text,
  pricing_note text not null default '',
  route text not null default '',
  cover_image text not null default '',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  capacity int not null default 12,
  availability_count int not null default 12,
  departure_dates text[] not null default '{}'::text[],
  itinerary text[] not null default '{}'::text[],
  inclusions text[] not null default '{}'::text[],
  exclusions text[] not null default '{}'::text[],
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists favorite_tours (
  user_id bigint not null references users(id) on delete cascade,
  tour_id bigint not null references tours(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tour_id)
);

create table if not exists bookings (
  id bigserial primary key,
  booking_reference text not null unique,
  user_id bigint not null references users(id) on delete restrict,
  tour_id bigint not null references tours(id) on delete restrict,
  traveler_name text not null,
  email text not null,
  phone text not null,
  preferred_departure_date text not null default '',
  participant_count int not null default 1,
  note text not null default '',
  traveler_details jsonb not null default '[]'::jsonb,
  amount numeric(12,2) not null default 0,
  currency text not null default 'MNT',
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'partially_paid', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  admin_note text not null default '',
  review_flag boolean not null default false,
  review_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id bigserial primary key,
  payment_reference text not null unique,
  booking_id bigint not null references bookings(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  provider text not null,
  method text not null,
  provider_reference text not null default '',
  amount numeric(12,2) not null,
  currency text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  failure_reason text not null default '',
  refunded_amount numeric(12,2) not null default 0,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists support_requests (
  id bigserial primary key,
  support_reference text not null unique,
  user_id bigint references users(id) on delete set null,
  booking_id bigint references bookings(id) on delete set null,
  tour_id bigint references tours(id) on delete set null,
  type text not null default 'support' check (type in ('support', 'feedback', 'complaint')),
  subject text not null,
  message text not null,
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text not null default '',
  status text not null default 'new' check (status in ('new', 'in_review', 'resolved', 'closed')),
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists support_request_events (
  id bigserial primary key,
  support_request_id bigint not null references support_requests(id) on delete cascade,
  event_type text not null,
  message text not null,
  actor_label text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_expires_at on sessions(expires_at);
create index if not exists idx_tours_status on tours(status);
create index if not exists idx_password_reset_tokens_user_id on password_reset_tokens(user_id);
create index if not exists idx_password_reset_tokens_expires_at on password_reset_tokens(expires_at);
create index if not exists idx_tours_business_line on tours(business_line);
create index if not exists idx_bookings_user_id on bookings(user_id);
create index if not exists idx_bookings_tour_id on bookings(tour_id);
create index if not exists idx_bookings_status on bookings(booking_status);
create index if not exists idx_payments_booking_id on payments(booking_id);
create index if not exists idx_payments_user_id on payments(user_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_support_requests_user_id on support_requests(user_id);
create index if not exists idx_support_requests_status on support_requests(status);
create table if not exists service_bookings (
  id bigserial primary key,
  service_reference text not null unique,
  user_id bigint not null references users(id) on delete cascade,
  service_type text not null check (service_type in ('hotel', 'restaurant', 'flight', 'taxi', 'esim')),
  service_label text not null,
  status text not null default 'new' check (status in ('new', 'in_review', 'quoted', 'confirmed', 'cancelled', 'completed')),
  destination text not null default '',
  travel_date text not null default '',
  end_date text not null default '',
  quantity int not null default 1,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null default '',
  details jsonb not null default '{}'::jsonb,
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_service_bookings_user_id on service_bookings(user_id);
create index if not exists idx_service_bookings_type on service_bookings(service_type);
create index if not exists idx_service_bookings_status on service_bookings(status);


insert into tours (
  slug,
  title,
  summary,
  description,
  business_line,
  operation_type,
  tour_kind,
  duration_days,
  duration_nights,
  base_price,
  currency,
  pricing_note,
  route,
  cover_image,
  status,
  featured,
  capacity,
  availability_count,
  departure_dates,
  itinerary,
  inclusions,
  exclusions,
  sort_order
)
values
  (
    'ub-4d',
    'ÃÂ£Ãâ€˜ Ã‘â€¦ÃÂ¾Ã‘â€š ÃÂ¾Ã‘â‚¬Ã‘â€¡ÃÂ¼Ã‘â€¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ»',
    'ÃÂ¥ÃÂ¾Ã‘â€š, Ã‘â€šÃ’Â¯Ã’Â¯Ã‘â€¦, ÃÂ°Ã‘â€¦Ã‘Æ’ÃÂ¹ÃÂ³ Ã‘â€šÃ‘ÂÃÂ½Ã‘â€ ÃÂ²Ã‘ÂÃ‘â‚¬ÃÂ¶Ã’Â¯Ã’Â¯ÃÂ»Ã‘ÂÃ‘ÂÃÂ½ 4 Ã“Â©ÃÂ´Ã‘â‚¬ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ¼ÃÂ°Ã‘â‚¬Ã‘Ë†Ã‘â‚¬Ã‘Æ’Ã‘â€š.',
    'ÃÂ£ÃÂ»ÃÂ°ÃÂ°ÃÂ½ÃÂ±ÃÂ°ÃÂ°Ã‘â€šÃÂ°Ã‘â‚¬ Ã‘â€¦ÃÂ¾Ã‘â€šÃ‘â€¹ÃÂ½ ÃÂ³ÃÂ¾ÃÂ» Ã’Â¯ÃÂ·ÃÂ¼Ã‘ÂÃ‘â‚¬Ã’Â¯Ã’Â¯ÃÂ´, ÃÅ“ÃÂ¾ÃÂ½ÃÂ³ÃÂ¾ÃÂ» ÃÂ°Ã‘â€¦Ã‘Æ’ÃÂ¹, ÃÂ§ÃÂ¸ÃÂ½ÃÂ³ÃÂ¸Ã‘Â Ã‘â€¦ÃÂ°ÃÂ°ÃÂ½Ã‘â€¹ ÃÂ¼ÃÂ¾Ã‘â‚¬Ã‘Å’Ã‘â€š Ã‘â€¦Ã“Â©Ã‘Ë†Ã“Â©Ã“Â©Ã‘â€š Ã‘â€ ÃÂ¾ÃÂ³Ã‘â€ ÃÂ¾ÃÂ»ÃÂ±ÃÂ¾Ã‘â‚¬Ã‘â€¹ÃÂ³ Ã‘â€¦ÃÂ°ÃÂ¼ÃÂ°Ã‘â‚¬Ã‘ÂÃÂ°ÃÂ½ Ã‘â€šÃ“Â©ÃÂ»Ã“Â©ÃÂ²ÃÂ»Ã“Â©Ã‘ÂÃ“Â©ÃÂ½ Ã‘â€¦Ã‘Æ’ÃÂ²ÃÂ°ÃÂ°Ã‘â‚¬Ã‘Å’Ã‘â€š ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ».',
    'domestic',
    'scheduled',
    'multi_day',
    4,
    4,
    2300000,
    'MNT',
    '',
    'Ãâ€”ÃÂ°ÃÂ¼Ã‘â€¹ÃÂ½-Ã’Â®Ã’Â¯ÃÂ´ - ÃÂ¡ÃÂ°ÃÂ¹ÃÂ½Ã‘Ë†ÃÂ°ÃÂ½ÃÂ´ - ÃÂ£Ãâ€˜ - ÃÅ“ÃÂ¾Ã‘â‚¬Ã‘Å’Ã‘â€š Ã‘â€¦Ã“Â©Ã‘Ë†Ã“Â©Ã“Â©Ã‘â€š Ã‘â€ ÃÂ¾ÃÂ³Ã‘â€ ÃÂ¾ÃÂ»ÃÂ±ÃÂ¾Ã‘â‚¬',
    'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1400&auto=format&fit=crop',
    'published',
    true,
    16,
    16,
    array['2026-05-20', '2026-06-17', '2026-07-15'],
    array[
      '1 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: Ãâ€”ÃÂ°ÃÂ¼Ã‘â€¹ÃÂ½-Ã’Â®Ã’Â¯ÃÂ´Ã‘ÂÃ‘ÂÃ‘Â ÃÂ¡ÃÂ°ÃÂ¹ÃÂ½Ã‘Ë†ÃÂ°ÃÂ½ÃÂ´, ÃÂ¥ÃÂ°ÃÂ¼Ã‘â‚¬Ã‘â€¹ÃÂ½ Ã‘â€¦ÃÂ¸ÃÂ¹ÃÂ´',
      '2 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ£Ãâ€˜ Ã‘â€¦ÃÂ¾Ã‘â€šÃ‘â€¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ», Ã‘â€šÃÂ°ÃÂ»ÃÂ±ÃÂ°ÃÂ¹, ÃÂ¼Ã‘Æ’ÃÂ·ÃÂµÃÂ¹, Ãâ€œÃÂ°ÃÂ½ÃÂ´ÃÂ°ÃÂ½',
      '3 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÅ“ÃÂ¾ÃÂ½ÃÂ³ÃÂ¾ÃÂ» ÃÂ°Ã‘â€¦Ã‘Æ’ÃÂ¹Ã‘â€šÃÂ°ÃÂ¹ Ã‘â€šÃÂ°ÃÂ½ÃÂ¸ÃÂ»Ã‘â€ ÃÂ°Ã‘â€¦ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ»',
      '4 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ§ÃÂ¸ÃÂ½ÃÂ³ÃÂ¸Ã‘Â Ã‘â€¦ÃÂ°ÃÂ°ÃÂ½Ã‘â€¹ ÃÂ¼ÃÂ¾Ã‘â‚¬Ã‘Å’Ã‘â€š Ã‘â€¦Ã“Â©Ã‘Ë†Ã“Â©Ã“Â©Ã‘â€š Ã‘â€ ÃÂ¾ÃÂ³Ã‘â€ ÃÂ¾ÃÂ»ÃÂ±ÃÂ¾Ã‘â‚¬, ÃÂ±Ã‘Æ’Ã‘â€ ÃÂ°Ã‘â€¦'
    ],
    array['ÃÅ“Ã‘ÂÃ‘â‚¬ÃÂ³Ã‘ÂÃÂ¶ÃÂ»ÃÂ¸ÃÂ¹ÃÂ½ Ã‘â€¦Ã“Â©Ã‘â€šÃ“Â©Ã‘â€¡', 'ÃÅ“ÃÂ°Ã‘â‚¬Ã‘Ë†Ã‘â‚¬Ã‘Æ’Ã‘â€š ÃÂ´ÃÂ¾Ã‘â€šÃÂ¾Ã‘â‚¬Ã‘â€¦ Ã‘â€šÃ‘ÂÃ‘ÂÃÂ²Ã‘ÂÃ‘â‚¬', 'Ã’Â®ÃÂ½ÃÂ´Ã‘ÂÃ‘ÂÃÂ½ ÃÂ·ÃÂ¾Ã‘â€¦ÃÂ¸ÃÂ¾ÃÂ½ ÃÂ±ÃÂ°ÃÂ¹ÃÂ³Ã‘Æ’Ã‘Æ’ÃÂ»ÃÂ°ÃÂ»Ã‘â€šÃ‘â€¹ÃÂ½ ÃÂ´Ã‘ÂÃÂ¼ÃÂ¶ÃÂ»Ã‘ÂÃÂ³'],
    array['ÃÂ¥Ã‘Æ’ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ·ÃÂ°Ã‘â‚¬ÃÂ´ÃÂ°ÃÂ»', 'ÃÂ¡ÃÂ¾ÃÂ½ÃÂ³ÃÂ¾ÃÂ»Ã‘â€šÃ‘â€šÃÂ¾ÃÂ¹ ÃÂ½Ã‘ÂÃÂ¼Ã‘ÂÃÂ»Ã‘â€š Ã’Â¯ÃÂ¹ÃÂ» ÃÂ°ÃÂ¶ÃÂ¸ÃÂ»ÃÂ»ÃÂ°ÃÂ³ÃÂ°ÃÂ°'],
    10
  ),
  (
    'gobi-5d',
    'Ãâ€œÃÂ¾ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ»',
    'Ãâ€œÃÂ¾ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ³ÃÂ¾ÃÂ» Ã‘â€ Ã‘ÂÃÂ³Ã’Â¯Ã’Â¯ÃÂ´ÃÂ¸ÃÂ¹ÃÂ³ Ã‘â€¦ÃÂ°ÃÂ¼ÃÂ°Ã‘â‚¬Ã‘ÂÃÂ°ÃÂ½ ÃÂ±Ã’Â¯Ã‘â€šÃ‘ÂÃÂ½ Ã‘â€¦Ã“Â©Ã‘â€šÃ“Â©ÃÂ»ÃÂ±Ã“Â©Ã‘â‚¬.',
    'ÃÂ¦ÃÂ°ÃÂ³ÃÂ°ÃÂ°ÃÂ½ Ã‘ÂÃ‘Æ’ÃÂ²ÃÂ°Ã‘â‚¬ÃÂ³ÃÂ°, ÃÂÃÂ»Ã‘â€¹ÃÂ½ ÃÂ°ÃÂ¼, ÃÅ“Ã‘Æ’Ã‘â€¦ÃÂ°Ã‘â‚¬ Ã‘Ë†ÃÂ¸ÃÂ²Ã‘ÂÃ‘â‚¬Ã‘â€šÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°ÃÂ¼ ÃÂ·Ã‘ÂÃ‘â‚¬ÃÂ³ÃÂ¸ÃÂ¹ÃÂ³ Ã‘â€¦ÃÂ°ÃÂ¼ÃÂ°Ã‘â‚¬Ã‘ÂÃÂ°ÃÂ½ 5 Ã“Â©ÃÂ´Ã‘â‚¬ÃÂ¸ÃÂ¹ÃÂ½ Ã‘â€šÃ“Â©ÃÂ»Ã“Â©ÃÂ²ÃÂ»Ã“Â©Ã‘ÂÃ“Â©ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ».',
    'domestic',
    'scheduled',
    'multi_day',
    5,
    5,
    2500000,
    'MNT',
    '',
    'ÃÂ¡ÃÂ°ÃÂ¹ÃÂ½Ã‘Ë†ÃÂ°ÃÂ½ÃÂ´ - ÃÂ£Ãâ€˜ - ÃÅ“ÃÂ°ÃÂ½ÃÂ´ÃÂ°ÃÂ»ÃÂ³ÃÂ¾ÃÂ²Ã‘Å’ - ÃÂ¦ÃÂ°ÃÂ³ÃÂ°ÃÂ°ÃÂ½ Ã‘ÂÃ‘Æ’ÃÂ²ÃÂ°Ã‘â‚¬ÃÂ³ÃÂ° - ÃÂÃÂ»Ã‘â€¹ÃÂ½ ÃÂ°ÃÂ¼',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1400&auto=format&fit=crop',
    'published',
    true,
    16,
    14,
    array['2026-05-27', '2026-06-24', '2026-07-22'],
    array[
      '1 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: Ãâ€”ÃÂ°ÃÂ¼Ã‘â€¹ÃÂ½-Ã’Â®Ã’Â¯ÃÂ´Ã‘ÂÃ‘ÂÃ‘Â ÃÂ¡ÃÂ°ÃÂ¹ÃÂ½Ã‘Ë†ÃÂ°ÃÂ½ÃÂ´, ÃÂ¥ÃÂ°ÃÂ¼Ã‘â‚¬Ã‘â€¹ÃÂ½ Ã‘â€¦ÃÂ¸ÃÂ¹ÃÂ´, ÃÂ£Ãâ€˜-ÃÂ´ ÃÂ¸Ã‘â‚¬ÃÂ½Ã‘Â',
      '2 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ£Ãâ€˜ Ã‘â€¦ÃÂ¾Ã‘â€šÃ‘â€¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ»',
      '3 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÅ“ÃÂ°ÃÂ½ÃÂ´ÃÂ°ÃÂ»ÃÂ³ÃÂ¾ÃÂ²Ã‘Å’, ÃÂ¦ÃÂ°ÃÂ³ÃÂ°ÃÂ°ÃÂ½ Ã‘ÂÃ‘Æ’ÃÂ²ÃÂ°Ã‘â‚¬ÃÂ³ÃÂ°, Ãâ€ÃÂ°ÃÂ»ÃÂ°ÃÂ½ÃÂ·ÃÂ°ÃÂ´ÃÂ³ÃÂ°ÃÂ´',
      '4 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÅ“Ã‘Æ’Ã‘â€¦ÃÂ°Ã‘â‚¬ Ã‘Ë†ÃÂ¸ÃÂ²Ã‘ÂÃ‘â‚¬Ã‘â€šÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°ÃÂ¼, ÃÂÃÂ»Ã‘â€¹ÃÂ½ ÃÂ°ÃÂ¼, ÃÂ£Ãâ€˜ Ã‘â‚¬Ã‘Æ’Ã‘Æ’ ÃÂ±Ã‘Æ’Ã‘â€ ÃÂ½ÃÂ°',
      '5 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÅ“ÃÂ¾Ã‘â‚¬Ã‘Å’Ã‘â€š Ã‘â€¦Ã“Â©Ã‘Ë†Ã“Â©Ã“Â©Ã‘â€š Ã‘â€ ÃÂ¾ÃÂ³Ã‘â€ ÃÂ¾ÃÂ»ÃÂ±ÃÂ¾Ã‘â‚¬, ÃÂ±Ã‘Æ’Ã‘â€ ÃÂ½ÃÂ°'
    ],
    array['ÃÅ“Ã‘ÂÃ‘â‚¬ÃÂ³Ã‘ÂÃÂ¶ÃÂ»ÃÂ¸ÃÂ¹ÃÂ½ Ã‘â€¦Ã“Â©Ã‘â€šÃ“Â©Ã‘â€¡', 'ÃÂ¢Ã‘ÂÃ‘ÂÃÂ²Ã‘ÂÃ‘â‚¬', 'Ãâ€˜ÃÂ°ÃÂ·Ã‘â€¹ÃÂ½ ÃÂ·ÃÂ¾Ã‘â€¦ÃÂ¸ÃÂ¾ÃÂ½ ÃÂ±ÃÂ°ÃÂ¹ÃÂ³Ã‘Æ’Ã‘Æ’ÃÂ»ÃÂ°ÃÂ»Ã‘â€š'],
    array['ÃÂ¥Ã‘Æ’ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ Ã‘â€¦Ã‘ÂÃ‘â‚¬Ã‘ÂÃÂ³ÃÂ»Ã‘ÂÃ‘Â', 'ÃÂ¡ÃÂ¾ÃÂ½ÃÂ³ÃÂ¾ÃÂ»Ã‘â€šÃ‘â€šÃÂ¾ÃÂ¹ ÃÂ½Ã‘ÂÃÂ¼Ã‘ÂÃÂ»Ã‘â€š Ã’Â¯ÃÂ¹ÃÂ»Ã‘â€¡ÃÂ¸ÃÂ»ÃÂ³Ã‘ÂÃ‘Â'],
    20
  ),
  (
    'khangai-7d',
    'ÃÂ¥ÃÂ°ÃÂ½ÃÂ³ÃÂ°ÃÂ¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ»',
    'ÃÂ¥ÃÂ°ÃÂ½ÃÂ³ÃÂ°ÃÂ¹, ÃÂ¥Ã“Â©ÃÂ²Ã‘ÂÃÂ³Ã“Â©ÃÂ»ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ±ÃÂ°ÃÂ¹ÃÂ³ÃÂ°ÃÂ»Ã‘Å’, Ã‘ÂÃÂ¾Ã‘â€˜ÃÂ»Ã‘â€¹ÃÂ½ Ã‘Æ’Ã‘â‚¬Ã‘â€š ÃÂ¼ÃÂ°Ã‘â‚¬Ã‘Ë†Ã‘â‚¬Ã‘Æ’Ã‘â€š.',
    'ÃÂ¥Ã“Â©ÃÂ²Ã‘ÂÃÂ³Ã“Â©ÃÂ», Ãâ€ÃÂ°Ã‘â‚¬Ã‘â€¦ÃÂ°ÃÂ´Ã‘â€¹ÃÂ½ ÃÂ½Ã‘Æ’Ã‘â€šÃÂ³ÃÂ°ÃÂ°Ã‘â‚¬ ÃÂ°Ã‘ÂÃÂ»ÃÂ°Ã‘â€¦ 7 Ã“Â©ÃÂ´Ã‘â‚¬ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ».',
    'domestic',
    'scheduled',
    'multi_day',
    7,
    6,
    3300000,
    'MNT',
    '',
    'ÃÂ¡ÃÂ°ÃÂ¹ÃÂ½Ã‘Ë†ÃÂ°ÃÂ½ÃÂ´ - ÃÂ£Ãâ€˜ - ÃÂ¥Ã“Â©ÃÂ²Ã‘ÂÃÂ³Ã“Â©ÃÂ» - Ãâ€ÃÂ°Ã‘â‚¬Ã‘â€¦ÃÂ°ÃÂ´',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop',
    'published',
    true,
    14,
    11,
    array['2026-06-10', '2026-07-08', '2026-08-05'],
    array[
      '1 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: Ãâ€”ÃÂ°ÃÂ¼Ã‘â€¹ÃÂ½-Ã’Â®Ã’Â¯ÃÂ´Ã‘ÂÃ‘ÂÃ‘Â ÃÂ¡ÃÂ°ÃÂ¹ÃÂ½Ã‘Ë†ÃÂ°ÃÂ½ÃÂ´, ÃÂ¥ÃÂ°ÃÂ¼Ã‘â‚¬Ã‘â€¹ÃÂ½ Ã‘â€¦ÃÂ¸ÃÂ¹ÃÂ´',
      '2 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ£Ãâ€˜ Ã‘â€¦ÃÂ¾Ã‘â€šÃ‘â€¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ»',
      '3 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ¥Ã“Â©ÃÂ²Ã‘ÂÃÂ³Ã“Â©ÃÂ» ÃÂ°ÃÂ¹ÃÂ¼ÃÂ°ÃÂ³, ÃÅ“Ã“Â©Ã‘â‚¬Ã“Â©ÃÂ½ Ã‘ÂÃ‘Æ’ÃÂ¼',
      '4 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ Ã‘ÂÃÂ½Ã‘â€¡ÃÂ¸ÃÂ½ÃÂ»Ã‘â€¦Ã’Â¯ÃÂ¼ÃÂ±Ã‘Â, Ãâ€“ÃÂ°Ã‘â‚¬ÃÂ³ÃÂ°ÃÂ½Ã‘â€š ÃÂ³ÃÂ¾ÃÂ», Ãâ€ÃÂ°Ã‘â‚¬Ã‘â€¦ÃÂ°ÃÂ´Ã‘â€¹ÃÂ½ 13 ÃÂ¾ÃÂ²ÃÂ¾ÃÂ¾',
      '5 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ¥Ã“Â©ÃÂ²Ã‘ÂÃÂ³Ã“Â©ÃÂ» ÃÂ½Ã‘Æ’Ã‘Æ’Ã‘â‚¬',
      '6 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ£Ãâ€˜ ÃÂ±Ã‘Æ’Ã‘â€ ÃÂ½ÃÂ°',
      '7 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÅ“ÃÂ¾Ã‘â‚¬Ã‘Å’Ã‘â€š Ã‘â€¦Ã“Â©Ã‘Ë†Ã“Â©Ã“Â©Ã‘â€š Ã‘â€ ÃÂ¾ÃÂ³Ã‘â€ ÃÂ¾ÃÂ»ÃÂ±ÃÂ¾Ã‘â‚¬, ÃÂ±Ã‘Æ’Ã‘â€ ÃÂ½ÃÂ°'
    ],
    array['ÃÂ¥Ã“Â©Ã‘â€šÃ“Â©Ã‘â€¡', 'ÃÂ¢Ã‘ÂÃ‘ÂÃÂ²Ã‘ÂÃ‘â‚¬', 'ÃÅ“ÃÂ°Ã‘â‚¬Ã‘Ë†Ã‘â‚¬Ã‘Æ’Ã‘â€š ÃÂ´ÃÂ¾Ã‘â€šÃÂ¾Ã‘â‚¬Ã‘â€¦ ÃÂ·ÃÂ¾Ã‘â€¦ÃÂ¸ÃÂ¾ÃÂ½ ÃÂ±ÃÂ°ÃÂ¹ÃÂ³Ã‘Æ’Ã‘Æ’ÃÂ»ÃÂ°ÃÂ»Ã‘â€š'],
    array['ÃÂ¥Ã‘Æ’ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ·ÃÂ°Ã‘â‚¬ÃÂ´ÃÂ°ÃÂ»', 'ÃÂ¡ÃÂ¾ÃÂ½ÃÂ³ÃÂ¾ÃÂ»Ã‘â€šÃ‘â€šÃÂ¾ÃÂ¹ ÃÂ°Ã‘ÂÃÂ»ÃÂ»Ã‘â€¹ÃÂ½ ÃÂ½Ã‘ÂÃÂ¼Ã‘ÂÃÂ»Ã‘â€š'],
    30
  ),
  (
    'aglag-1d',
    'ÃÂÃÂ³ÃÂ»ÃÂ°ÃÂ³ ÃÂ±Ã’Â¯Ã‘â€šÃ‘ÂÃ‘ÂÃÂ»ÃÂ¸ÃÂ¹ÃÂ½ Ã‘â€¦ÃÂ¸ÃÂ¹ÃÂ´ÃÂ¸ÃÂ¹ÃÂ½ 1 Ã“Â©ÃÂ´Ã‘â‚¬ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ»',
    'Ã“Â¨ÃÂ´Ã‘â‚¬ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ¼Ã“Â©Ã‘â‚¬ÃÂ³Ã“Â©ÃÂ», ÃÂ±ÃÂ°ÃÂ¹ÃÂ³ÃÂ°ÃÂ»ÃÂ¸ÃÂ¹ÃÂ½ Ã‘â€šÃÂ°ÃÂ¹ÃÂ²ÃÂ°ÃÂ½ ÃÂ¾Ã‘â‚¬Ã‘â€¡ÃÂ¸ÃÂ½.',
    'ÃÂ£ÃÂ»ÃÂ°ÃÂ°ÃÂ½ÃÂ±ÃÂ°ÃÂ°Ã‘â€šÃÂ°Ã‘â‚¬ ÃÂ¾Ã‘â‚¬Ã‘â€¡ÃÂ¼Ã‘â€¹ÃÂ½ Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬ ÃÂ°Ã‘ÂÃÂ»ÃÂ»Ã‘â€¹ÃÂ½ Ã‘â€¦ÃÂ°ÃÂ¼ÃÂ³ÃÂ¸ÃÂ¹ÃÂ½ Ã‘ÂÃ‘â‚¬Ã‘ÂÃÂ»Ã‘â€šÃ‘â€šÃ‘ÂÃÂ¹ ÃÂ¼ÃÂ°Ã‘â‚¬Ã‘Ë†Ã‘â‚¬Ã‘Æ’Ã‘â€š.',
    'domestic',
    'scheduled',
    'day_tour',
    1,
    0,
    null,
    null,
    'Ã’Â®ÃÂ½Ã‘Â Ã‘â€¦Ã’Â¯Ã‘ÂÃ‘ÂÃÂ»Ã‘â€šÃ‘ÂÃ‘ÂÃ‘â‚¬',
    'ÃÂ£Ãâ€˜ ÃÂ¾Ã‘â‚¬Ã‘â€¡ÃÂ¸ÃÂ¼',
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1400&auto=format&fit=crop',
    'published',
    false,
    20,
    20,
    array[]::text[],
    array['1 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂÃÂ³ÃÂ»ÃÂ°ÃÂ³ ÃÂ±Ã’Â¯Ã‘â€šÃ‘ÂÃ‘ÂÃÂ»ÃÂ¸ÃÂ¹ÃÂ½ Ã‘â€¦ÃÂ¸ÃÂ¹ÃÂ´'],
    array['ÃÂ¥Ã“Â©Ã‘â€šÃ“Â©Ã‘â€¡', 'ÃÂ¢Ã‘ÂÃ‘ÂÃÂ²Ã‘ÂÃ‘â‚¬'],
    array['ÃÂ¥ÃÂ¾ÃÂ¾ÃÂ»', 'ÃÂ¥Ã‘Æ’ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ·ÃÂ°Ã‘â‚¬ÃÂ´ÃÂ°ÃÂ»'],
    40
  ),
  (
    'gobi-2d',
    'Ãâ€œÃÂ¾ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ±ÃÂ¾ÃÂ³ÃÂ¸ÃÂ½ÃÂ¾ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ»',
    'Ãâ€ÃÂ¾Ã‘â€šÃÂ¾ÃÂ¾ÃÂ´Ã‘â€¹ÃÂ½ ÃÂ±ÃÂ¾ÃÂ³ÃÂ¸ÃÂ½ÃÂ¾ Ã‘â€¦Ã‘Æ’ÃÂ³ÃÂ°Ã‘â€ ÃÂ°ÃÂ°ÃÂ½Ã‘â€¹ Ãâ€œÃÂ¾ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°Ã‘ÂÃÂ»ÃÂ°ÃÂ».',
    'ÃÂ¦ÃÂ°ÃÂ³ÃÂ°ÃÂ°ÃÂ½ Ã‘ÂÃ‘Æ’ÃÂ²ÃÂ°Ã‘â‚¬ÃÂ³ÃÂ°, ÃÂÃÂ»Ã‘â€¹ÃÂ½ ÃÂ°ÃÂ¼, ÃÅ“Ã‘Æ’Ã‘â€¦ÃÂ°Ã‘â‚¬ Ã‘Ë†ÃÂ¸ÃÂ²Ã‘ÂÃ‘â‚¬Ã‘â€šÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°ÃÂ¼Ã‘â€¹ÃÂ³ Ã‘â€¦ÃÂ°ÃÂ¼ÃÂ°Ã‘â‚¬Ã‘ÂÃÂ°ÃÂ½ 2 Ã“Â©ÃÂ´Ã‘â‚¬ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ¼ÃÂ°Ã‘â‚¬Ã‘Ë†Ã‘â‚¬Ã‘Æ’Ã‘â€š.',
    'domestic',
    'scheduled',
    'multi_day',
    2,
    1,
    null,
    null,
    'Ã’Â®ÃÂ½Ã‘Â Ã‘â€¦Ã’Â¯Ã‘ÂÃ‘ÂÃÂ»Ã‘â€šÃ‘ÂÃ‘ÂÃ‘â‚¬',
    'ÃÂ¦ÃÂ°ÃÂ³ÃÂ°ÃÂ°ÃÂ½ Ã‘ÂÃ‘Æ’ÃÂ²ÃÂ°Ã‘â‚¬ÃÂ³ÃÂ°, ÃÂÃÂ»Ã‘â€¹ÃÂ½ ÃÂ°ÃÂ¼, ÃÅ“Ã‘Æ’Ã‘â€¦ÃÂ°Ã‘â‚¬ Ã‘Ë†ÃÂ¸ÃÂ²Ã‘ÂÃ‘â‚¬Ã‘â€šÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°ÃÂ¼',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1400&auto=format&fit=crop',
    'published',
    false,
    18,
    18,
    array[]::text[],
    array['1-2 Ã“Â©ÃÂ´Ã“Â©Ã‘â‚¬: ÃÂ¦ÃÂ°ÃÂ³ÃÂ°ÃÂ°ÃÂ½ Ã‘ÂÃ‘Æ’ÃÂ²ÃÂ°Ã‘â‚¬ÃÂ³ÃÂ°, ÃÂÃÂ»Ã‘â€¹ÃÂ½ ÃÂ°ÃÂ¼, ÃÅ“Ã‘Æ’Ã‘â€¦ÃÂ°Ã‘â‚¬ Ã‘Ë†ÃÂ¸ÃÂ²Ã‘ÂÃ‘â‚¬Ã‘â€šÃÂ¸ÃÂ¹ÃÂ½ ÃÂ°ÃÂ¼'],
    array['ÃÂ¥Ã“Â©Ã‘â€šÃ“Â©Ã‘â€¡', 'ÃÂ¢Ã‘ÂÃ‘ÂÃÂ²Ã‘ÂÃ‘â‚¬'],
    array['ÃÂ¥Ã‘Æ’ÃÂ²ÃÂ¸ÃÂ¹ÃÂ½ ÃÂ·ÃÂ°Ã‘â‚¬ÃÂ´ÃÂ°ÃÂ»', 'ÃÂ¡ÃÂ¾ÃÂ½ÃÂ³ÃÂ¾ÃÂ»Ã‘â€šÃ‘â€šÃÂ¾ÃÂ¹ ÃÂ½Ã‘ÂÃÂ¼Ã‘ÂÃÂ»Ã‘â€š Ã’Â¯ÃÂ¹ÃÂ»Ã‘â€¡ÃÂ¸ÃÂ»ÃÂ³Ã‘ÂÃ‘Â'],
    50
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  business_line = excluded.business_line,
  operation_type = excluded.operation_type,
  tour_kind = excluded.tour_kind,
  duration_days = excluded.duration_days,
  duration_nights = excluded.duration_nights,
  base_price = excluded.base_price,
  currency = excluded.currency,
  pricing_note = excluded.pricing_note,
  route = excluded.route,
  cover_image = excluded.cover_image,
  status = excluded.status,
  featured = excluded.featured,
  capacity = excluded.capacity,
  availability_count = excluded.availability_count,
  departure_dates = excluded.departure_dates,
  itinerary = excluded.itinerary,
  inclusions = excluded.inclusions,
  exclusions = excluded.exclusions,
  sort_order = excluded.sort_order,
  updated_at = now();