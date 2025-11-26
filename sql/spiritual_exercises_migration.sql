-- Migration: Spiritual Exercises (Duchovné cvičenia)
-- Created: 2025-11-26

-- =====================================================
-- 1. Main table: spiritual_exercises
-- =====================================================
create table public.spiritual_exercises (
  id bigserial primary key,
  
  -- Základné info
  title text not null,
  slug text unique not null,
  description text, -- krátky intro text
  full_description text, -- dlhší popis
  image_url text,
  
  -- Termín
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  
  -- Miesto
  location_name text not null,
  location_address text,
  location_city text,
  location_country text default 'Slovakia',
  
  -- Jazyk
  locale_id bigint not null references locales(id),
  
  -- Lektor/Vedúci
  leader_name text,
  leader_bio text,
  leader_photo text,
  
  -- Kapacita
  max_capacity integer,
  current_registrations integer default 0,
  
  -- Status
  is_published boolean default false,
  is_active boolean default true,
  
  -- Meta
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  
  constraint spiritual_exercises_dates_check check (end_date > start_date),
  constraint spiritual_exercises_capacity_check check (max_capacity is null or max_capacity > 0),
  constraint spiritual_exercises_registrations_check check (current_registrations >= 0)
);

-- Indexes for spiritual_exercises
create index idx_spiritual_exercises_locale on spiritual_exercises(locale_id);
create index idx_spiritual_exercises_dates on spiritual_exercises(start_date, end_date);
create index idx_spiritual_exercises_slug on spiritual_exercises(slug);
create index idx_spiritual_exercises_published on spiritual_exercises(is_published, is_active);

-- Trigger for updated_at
create trigger handle_spiritual_exercises_updated_at 
  before update on spiritual_exercises 
  for each row execute function moddatetime('updated_at');

-- =====================================================
-- 2. Pricing table: spiritual_exercises_pricing
-- =====================================================
create table public.spiritual_exercises_pricing (
  id bigserial primary key,
  exercise_id bigint not null references spiritual_exercises(id) on delete cascade,
  
  room_type text not null, -- napr. "Jednolôžková izba", "Dvojlôžková izba", "Viacposteľová izba"
  price decimal(10,2) not null,
  description text, -- napr. "s vlastným WC", "spoločné sociálne zariadenia"
  
  display_order integer default 0,
  
  created_at timestamp with time zone default now(),
  
  constraint pricing_price_check check (price >= 0)
);

create index idx_pricing_exercise on spiritual_exercises_pricing(exercise_id);
create index idx_pricing_display_order on spiritual_exercises_pricing(exercise_id, display_order);

-- =====================================================
-- 3. Testimonials table: spiritual_exercises_testimonials
-- =====================================================
create table public.spiritual_exercises_testimonials (
  id bigserial primary key,
  exercise_id bigint not null references spiritual_exercises(id) on delete cascade,
  
  author_name text not null,
  testimonial_text text not null,
  rating integer check (rating >= 1 and rating <= 5), -- voliteľné, 1-5 hviezdičiek
  
  display_order integer default 0,
  is_visible boolean default true,
  
  created_at timestamp with time zone default now()
);

create index idx_testimonials_exercise on spiritual_exercises_testimonials(exercise_id);
create index idx_testimonials_visible on spiritual_exercises_testimonials(exercise_id, is_visible);
create index idx_testimonials_display_order on spiritual_exercises_testimonials(exercise_id, display_order);

-- =====================================================
-- 4. Forms table: spiritual_exercises_forms
-- =====================================================
create table public.spiritual_exercises_forms (
  id bigserial primary key,
  exercise_id bigint not null references spiritual_exercises(id) on delete cascade,
  form_id text not null, -- ID z EasyForms
  
  is_active boolean default true,
  
  created_at timestamp with time zone default now(),
  
  constraint unique_exercise_form unique (exercise_id, form_id)
);

create index idx_exercise_forms_exercise on spiritual_exercises_forms(exercise_id);
create index idx_exercise_forms_active on spiritual_exercises_forms(exercise_id, is_active);

-- =====================================================
-- 5. Gallery table: spiritual_exercises_gallery
-- =====================================================
create table public.spiritual_exercises_gallery (
  id bigserial primary key,
  exercise_id bigint not null references spiritual_exercises(id) on delete cascade,
  
  image_url text not null,
  caption text,
  alt_text text,
  
  display_order integer default 0,
  is_visible boolean default true,
  
  created_at timestamp with time zone default now()
);

create index idx_gallery_exercise on spiritual_exercises_gallery(exercise_id);
create index idx_gallery_visible on spiritual_exercises_gallery(exercise_id, is_visible);
create index idx_gallery_display_order on spiritual_exercises_gallery(exercise_id, display_order);

-- =====================================================
-- 6. Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
alter table spiritual_exercises enable row level security;
alter table spiritual_exercises_pricing enable row level security;
alter table spiritual_exercises_testimonials enable row level security;
alter table spiritual_exercises_forms enable row level security;
alter table spiritual_exercises_gallery enable row level security;

-- Public read access for published exercises
create policy "Public can view published spiritual exercises"
  on spiritual_exercises for select
  using (is_published = true and is_active = true);

create policy "Public can view pricing for published exercises"
  on spiritual_exercises_pricing for select
  using (
    exists (
      select 1 from spiritual_exercises
      where spiritual_exercises.id = spiritual_exercises_pricing.exercise_id
        and spiritual_exercises.is_published = true
        and spiritual_exercises.is_active = true
    )
  );

create policy "Public can view visible testimonials"
  on spiritual_exercises_testimonials for select
  using (
    is_visible = true
    and exists (
      select 1 from spiritual_exercises
      where spiritual_exercises.id = spiritual_exercises_testimonials.exercise_id
        and spiritual_exercises.is_published = true
        and spiritual_exercises.is_active = true
    )
  );

create policy "Public can view active forms"
  on spiritual_exercises_forms for select
  using (
    is_active = true
    and exists (
      select 1 from spiritual_exercises
      where spiritual_exercises.id = spiritual_exercises_forms.exercise_id
        and spiritual_exercises.is_published = true
        and spiritual_exercises.is_active = true
    )
  );

create policy "Public can view visible gallery images"
  on spiritual_exercises_gallery for select
  using (
    is_visible = true
    and exists (
      select 1 from spiritual_exercises
      where spiritual_exercises.id = spiritual_exercises_gallery.exercise_id
        and spiritual_exercises.is_published = true
        and spiritual_exercises.is_active = true
    )
  );

-- Admin full access policies
create policy "Admins have full access to spiritual exercises"
  on spiritual_exercises for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

create policy "Admins have full access to pricing"
  on spiritual_exercises_pricing for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

create policy "Admins have full access to testimonials"
  on spiritual_exercises_testimonials for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

create policy "Admins have full access to forms"
  on spiritual_exercises_forms for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

create policy "Admins have full access to gallery"
  on spiritual_exercises_gallery for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

-- =====================================================
-- 7. Helper function for slug generation
-- =====================================================
create or replace function generate_spiritual_exercise_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  -- Ak už má slug, nechaj ho
  if NEW.slug is not null and NEW.slug != '' then
    return NEW;
  end if;
  
  -- Vygeneruj základný slug z titulku
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  
  -- Skontroluj unikátnosť, ak existuje, pridaj číslo
  while exists (select 1 from spiritual_exercises where slug = final_slug and id != COALESCE(NEW.id, 0)) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;
  
  NEW.slug := final_slug;
  return NEW;
end;
$$ language plpgsql;

create trigger set_spiritual_exercises_slug
  before insert or update on spiritual_exercises
  for each row execute function generate_spiritual_exercise_slug();

-- =====================================================
-- 8. Sample data (optional - remove if not needed)
-- =====================================================

-- Insert sample Slovak locale if not exists
insert into locales (code, name, native_name, is_active)
values ('sk', 'Slovak', 'Slovenčina', true)
on conflict (code) do nothing;

-- Sample spiritual exercise
insert into spiritual_exercises (
  title,
  slug,
  description,
  full_description,
  start_date,
  end_date,
  location_name,
  location_city,
  location_country,
  locale_id,
  leader_name,
  leader_bio,
  max_capacity,
  is_published
) values (
  'Ignácianske duchovné cvičenia',
  'ignacianske-duchovne-cvicenia-2025',
  'Týždenný pobyt v tichosti a modlitbe podľa duchovných cvičení sv. Ignáca z Loyoly.',
  'Duchovné cvičenia sv. Ignáca z Loyoly sú 30-dňovou duchovnou skúsenosťou, ktorá môže byť prispôsobená na kratšie obdobie. Počas týždňa budete mať možnosť hlbšieho vnútorného poznania seba samého, Božej lásky a Ježišovho povolania.',
  '2025-07-15 16:00:00+02',
  '2025-07-22 11:00:00+02',
  'Dobrá Voda - Exercičný dom',
  'Dobrá Voda',
  'Slovakia',
  (select id from locales where code = 'sk'),
  'o. Ján Novák SJ',
  'Kňaz jezuita s 20-ročnou skúsenosťou sprevádzania duchovných cvičení. Absolvent teológie v Ríme a formátor duchovného života.',
  30,
  true
);

-- Sample pricing for the exercise
insert into spiritual_exercises_pricing (exercise_id, room_type, price, description, display_order)
select 
  spiritual_exercises.id,
  pricing.room_type,
  pricing.price,
  pricing.description,
  pricing.display_order
from spiritual_exercises
cross join (values
    ('Jednolôžková izba', 280.00, 's vlastným sociálnym zariadením', 1),
    ('Dvojlôžková izba', 220.00, 's vlastným sociálnym zariadením', 2),
    ('Viacposteľová izba', 180.00, 'spoločné sociálne zariadenia', 3)
  ) as pricing(room_type, price, description, display_order)
where spiritual_exercises.slug = 'ignacianske-duchovne-cvicenia-2025';

-- Sample testimonials
insert into spiritual_exercises_testimonials (exercise_id, author_name, testimonial_text, rating, display_order)
select 
  spiritual_exercises.id,
  testimonials.author_name,
  testimonials.testimonial_text,
  testimonials.rating,
  testimonials.display_order
from spiritual_exercises
cross join (values
    ('Mária K.', 'Týždeň v tichosti mi pomohol nájsť vnútorný pokoj a jasnejšie vnímať Božie vedenie v mojom živote.', 5, 1),
    ('Peter S.', 'Duchovné cvičenia boli pre mňa silnou skúsenosťou. Odporúčam každému, kto hľadá hlbší vzťah s Bohom.', 5, 2),
    ('Jana M.', 'Prekrásne prostredie, starostlivý prístup a kvalitné duchovné sprevádzanie. Ďakujem!', 5, 3)
  ) as testimonials(author_name, testimonial_text, rating, display_order)
where spiritual_exercises.slug = 'ignacianske-duchovne-cvicenia-2025';

-- =====================================================
-- Migration complete!
-- =====================================================
