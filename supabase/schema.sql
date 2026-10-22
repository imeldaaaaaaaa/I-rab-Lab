-- Bedah I‘rob — skema database awal.
-- Jalankan di Supabase SQL Editor pada project baru.
-- Setelah akun dibuat, tetapkan peran guru/admin secara manual (lihat README).

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('admin','teacher','student')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name','Siswa'), 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'teacher'); $$;

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  level text not null default 'Dasar',
  content text not null,
  source_title text,
  source_author text,
  source_edition text,
  source_pages text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  sentence text not null,
  translation text,
  analyses jsonb not null default '[]'::jsonb,
  difficulty text not null default 'Dasar',
  source_pages text,
  source_material_id uuid references public.materials(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  invite_code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  instructions text,
  due_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint assignment_has_content check (question_id is not null or material_id is not null)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete set null,
  answers jsonb not null default '[]'::jsonb,
  score numeric(5,2),
  feedback text,
  submitted_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(student_id, material_id)
);

create index if not exists idx_materials_status on public.materials(status);
alter table public.questions add column if not exists slug text;
alter table public.questions add column if not exists source_pages text;
create unique index if not exists idx_questions_slug_unique on public.questions(slug);

create index if not exists idx_questions_status on public.questions(status);
create index if not exists idx_classes_teacher on public.classes(teacher_id);
create index if not exists idx_class_members_student on public.class_members(student_id);
create index if not exists idx_assignments_class on public.assignments(class_id);
create index if not exists idx_attempts_student on public.attempts(student_id);
create index if not exists idx_attempts_question on public.attempts(question_id);

create or replace function public.is_class_member(p_class_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.class_members where class_id = p_class_id and student_id = auth.uid()); $$;

create or replace function public.is_teacher_of_class(p_class_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.classes where id = p_class_id and teacher_id = auth.uid()); $$;

create or replace function public.join_class_by_code(p_invite_code text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_class_id uuid;
begin
  if not exists(select 1 from public.profiles where id = auth.uid() and role = 'student') then
    raise exception 'Hanya akun siswa yang dapat bergabung menggunakan kode kelas.';
  end if;
  select id into v_class_id from public.classes
  where upper(invite_code) = upper(trim(p_invite_code)) and is_active = true
  limit 1;
  if v_class_id is null then
    raise exception 'Kode kelas tidak ditemukan atau kelas tidak aktif.';
  end if;
  insert into public.class_members(class_id, student_id)
  values (v_class_id, auth.uid())
  on conflict (class_id, student_id) do nothing;
  return v_class_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.questions enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments enable row level security;
alter table public.attempts enable row level security;
alter table public.lesson_progress enable row level security;

-- Akses baca untuk konten publik. Row Level Security tetap membatasi baris draft dan operasi tulis.
grant usage on schema public to anon, authenticated;
grant select on public.materials, public.questions to anon, authenticated;
grant insert, update, delete on public.materials, public.questions to authenticated;

-- Profiles: pengguna dapat membaca profil sendiri; admin dapat mengelola seluruh profil.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles for select
using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles for all
using (public.is_admin()) with check (public.is_admin());

-- Materi: materi terbit dapat dibaca pengunjung anonim maupun pengguna login; hanya admin yang mengubah konten utama.
drop policy if exists "materials_read_published_or_admin" on public.materials;
create policy "materials_read_published_or_admin" on public.materials for select
using (status = 'published' or public.is_admin());
drop policy if exists "materials_admin_insert" on public.materials;
create policy "materials_admin_insert" on public.materials for insert with check (public.is_admin());
drop policy if exists "materials_admin_update" on public.materials;
create policy "materials_admin_update" on public.materials for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "materials_admin_delete" on public.materials;
create policy "materials_admin_delete" on public.materials for delete using (public.is_admin());

-- Soal: soal terbit dapat dibaca pengunjung anonim maupun pengguna login; admin mengelola bank soal.
drop policy if exists "questions_read_published_or_admin" on public.questions;
create policy "questions_read_published_or_admin" on public.questions for select
using (status = 'published' or public.is_admin());
drop policy if exists "questions_admin_insert" on public.questions;
create policy "questions_admin_insert" on public.questions for insert with check (public.is_admin());
drop policy if exists "questions_admin_update" on public.questions;
create policy "questions_admin_update" on public.questions for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "questions_admin_delete" on public.questions;
create policy "questions_admin_delete" on public.questions for delete using (public.is_admin());

-- Kelas: guru melihat kelas miliknya, siswa melihat kelas tempat ia terdaftar.
drop policy if exists "classes_select_related" on public.classes;
create policy "classes_select_related" on public.classes for select
using (teacher_id = auth.uid() or public.is_class_member(id) or public.is_admin());
drop policy if exists "classes_teacher_insert" on public.classes;
create policy "classes_teacher_insert" on public.classes for insert
with check ((teacher_id = auth.uid() and public.is_teacher()) or public.is_admin());
drop policy if exists "classes_teacher_update" on public.classes;
create policy "classes_teacher_update" on public.classes for update
using (teacher_id = auth.uid() or public.is_admin())
with check (teacher_id = auth.uid() or public.is_admin());
drop policy if exists "classes_teacher_delete" on public.classes;
create policy "classes_teacher_delete" on public.classes for delete
using (teacher_id = auth.uid() or public.is_admin());

-- Keanggotaan: siswa membaca keanggotaan sendiri; guru hanya melihat anggota kelasnya.
drop policy if exists "class_members_select_related" on public.class_members;
create policy "class_members_select_related" on public.class_members for select
using (student_id = auth.uid() or public.is_teacher_of_class(class_id) or public.is_admin());
drop policy if exists "class_members_teacher_manage" on public.class_members;
create policy "class_members_teacher_manage" on public.class_members for all
using (public.is_teacher_of_class(class_id) or public.is_admin())
with check (public.is_teacher_of_class(class_id) or public.is_admin());

-- Fungsi join_class_by_code adalah jalur siswa untuk bergabung, tidak perlu INSERT langsung.

-- Tugas: anggota kelas dapat membaca; guru pemilik kelas dapat mengelola.
drop policy if exists "assignments_select_related" on public.assignments;
create policy "assignments_select_related" on public.assignments for select
using (public.is_teacher_of_class(class_id) or public.is_class_member(class_id) or public.is_admin());
drop policy if exists "assignments_teacher_insert" on public.assignments;
create policy "assignments_teacher_insert" on public.assignments for insert
with check (public.is_teacher_of_class(class_id) or public.is_admin());
drop policy if exists "assignments_teacher_update" on public.assignments;
create policy "assignments_teacher_update" on public.assignments for update
using (public.is_teacher_of_class(class_id) or public.is_admin())
with check (public.is_teacher_of_class(class_id) or public.is_admin());
drop policy if exists "assignments_teacher_delete" on public.assignments;
create policy "assignments_teacher_delete" on public.assignments for delete
using (public.is_teacher_of_class(class_id) or public.is_admin());

-- Percobaan: siswa hanya dapat menambah/membaca percobaan sendiri; guru dapat membaca siswa di kelasnya.
drop policy if exists "attempts_select_self_teacher_admin" on public.attempts;
create policy "attempts_select_self_teacher_admin" on public.attempts for select
using (
  student_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.student_id = attempts.student_id and c.teacher_id = auth.uid()
  )
);
drop policy if exists "attempts_insert_self" on public.attempts;
create policy "attempts_insert_self" on public.attempts for insert
with check (
  student_id = auth.uid()
  and exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
  and exists(select 1 from public.questions q where q.id = question_id and q.status = 'published')
);

-- Progres materi: siswa mengelola progres sendiri; guru dapat membaca progres anggota kelas.
drop policy if exists "lesson_progress_select_related" on public.lesson_progress;
create policy "lesson_progress_select_related" on public.lesson_progress for select
using (
  student_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.student_id = lesson_progress.student_id and c.teacher_id = auth.uid()
  )
);
drop policy if exists "lesson_progress_insert_self" on public.lesson_progress;
create policy "lesson_progress_insert_self" on public.lesson_progress for insert
with check (student_id = auth.uid());
drop policy if exists "lesson_progress_update_self" on public.lesson_progress;
create policy "lesson_progress_update_self" on public.lesson_progress for update
using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Catatan: tinjau ulang seluruh kebijakan akses sebelum digunakan untuk data siswa nyata.
