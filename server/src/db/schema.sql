-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Rooms table
create table public.rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  creator_name text not null,
  status text not null check (status in ('active', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default timezone('utc'::text, now() + interval '5 days') not null
);

-- Participants table
create table public.participants (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, name)
);

-- Items table
create table public.items (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  price decimal not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assignments table
create table public.assignments (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.items(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  percentage decimal not null default 100
);
