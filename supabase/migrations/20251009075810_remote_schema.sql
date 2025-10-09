revoke delete on table "public"."folders" from "anon";

revoke insert on table "public"."folders" from "anon";

revoke references on table "public"."folders" from "anon";

revoke select on table "public"."folders" from "anon";

revoke trigger on table "public"."folders" from "anon";

revoke truncate on table "public"."folders" from "anon";

revoke update on table "public"."folders" from "anon";

revoke delete on table "public"."folders" from "authenticated";

revoke insert on table "public"."folders" from "authenticated";

revoke references on table "public"."folders" from "authenticated";

revoke select on table "public"."folders" from "authenticated";

revoke trigger on table "public"."folders" from "authenticated";

revoke truncate on table "public"."folders" from "authenticated";

revoke update on table "public"."folders" from "authenticated";

revoke delete on table "public"."folders" from "service_role";

revoke insert on table "public"."folders" from "service_role";

revoke references on table "public"."folders" from "service_role";

revoke select on table "public"."folders" from "service_role";

revoke trigger on table "public"."folders" from "service_role";

revoke truncate on table "public"."folders" from "service_role";

revoke update on table "public"."folders" from "service_role";

revoke delete on table "public"."notes" from "anon";

revoke insert on table "public"."notes" from "anon";

revoke references on table "public"."notes" from "anon";

revoke select on table "public"."notes" from "anon";

revoke trigger on table "public"."notes" from "anon";

revoke truncate on table "public"."notes" from "anon";

revoke update on table "public"."notes" from "anon";

revoke delete on table "public"."notes" from "authenticated";

revoke insert on table "public"."notes" from "authenticated";

revoke references on table "public"."notes" from "authenticated";

revoke select on table "public"."notes" from "authenticated";

revoke trigger on table "public"."notes" from "authenticated";

revoke truncate on table "public"."notes" from "authenticated";

revoke update on table "public"."notes" from "authenticated";

revoke delete on table "public"."notes" from "service_role";

revoke insert on table "public"."notes" from "service_role";

revoke references on table "public"."notes" from "service_role";

revoke select on table "public"."notes" from "service_role";

revoke trigger on table "public"."notes" from "service_role";

revoke truncate on table "public"."notes" from "service_role";

revoke update on table "public"."notes" from "service_role";

revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke references on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke trigger on table "public"."projects" from "anon";

revoke truncate on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."projects" from "authenticated";

revoke insert on table "public"."projects" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke select on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke delete on table "public"."projects" from "service_role";

revoke insert on table "public"."projects" from "service_role";

revoke references on table "public"."projects" from "service_role";

revoke select on table "public"."projects" from "service_role";

revoke trigger on table "public"."projects" from "service_role";

revoke truncate on table "public"."projects" from "service_role";

revoke update on table "public"."projects" from "service_role";

revoke delete on table "public"."user_ai_keys" from "anon";

revoke insert on table "public"."user_ai_keys" from "anon";

revoke references on table "public"."user_ai_keys" from "anon";

revoke select on table "public"."user_ai_keys" from "anon";

revoke trigger on table "public"."user_ai_keys" from "anon";

revoke truncate on table "public"."user_ai_keys" from "anon";

revoke update on table "public"."user_ai_keys" from "anon";

revoke delete on table "public"."user_ai_keys" from "authenticated";

revoke insert on table "public"."user_ai_keys" from "authenticated";

revoke references on table "public"."user_ai_keys" from "authenticated";

revoke select on table "public"."user_ai_keys" from "authenticated";

revoke trigger on table "public"."user_ai_keys" from "authenticated";

revoke truncate on table "public"."user_ai_keys" from "authenticated";

revoke update on table "public"."user_ai_keys" from "authenticated";

revoke delete on table "public"."user_ai_keys" from "service_role";

revoke insert on table "public"."user_ai_keys" from "service_role";

revoke references on table "public"."user_ai_keys" from "service_role";

revoke select on table "public"."user_ai_keys" from "service_role";

revoke trigger on table "public"."user_ai_keys" from "service_role";

revoke truncate on table "public"."user_ai_keys" from "service_role";

revoke update on table "public"."user_ai_keys" from "service_role";

create table "public"."custom_cards" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "icon_name" text not null,
    "links" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "href" text not null
);


alter table "public"."custom_cards" enable row level security;

create table "public"."dashboard_items" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "note_id" uuid,
    "folder_id" uuid,
    "position" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."dashboard_items" enable row level security;

CREATE INDEX custom_cards_created_at_idx ON public.custom_cards USING btree (created_at);

CREATE INDEX custom_cards_href_idx ON public.custom_cards USING btree (href);

CREATE UNIQUE INDEX custom_cards_pkey ON public.custom_cards USING btree (id);

CREATE INDEX custom_cards_user_id_idx ON public.custom_cards USING btree (user_id);

CREATE UNIQUE INDEX dashboard_items_pkey ON public.dashboard_items USING btree (id);

CREATE INDEX idx_dashboard_items_folder_id ON public.dashboard_items USING btree (folder_id);

CREATE INDEX idx_dashboard_items_note_id ON public.dashboard_items USING btree (note_id);

CREATE INDEX idx_dashboard_items_user_id ON public.dashboard_items USING btree (user_id);

alter table "public"."custom_cards" add constraint "custom_cards_pkey" PRIMARY KEY using index "custom_cards_pkey";

alter table "public"."dashboard_items" add constraint "dashboard_items_pkey" PRIMARY KEY using index "dashboard_items_pkey";

alter table "public"."custom_cards" add constraint "custom_cards_title_check" CHECK ((char_length(title) <= 50)) not valid;

alter table "public"."custom_cards" validate constraint "custom_cards_title_check";

alter table "public"."custom_cards" add constraint "custom_cards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."custom_cards" validate constraint "custom_cards_user_id_fkey";

alter table "public"."custom_cards" add constraint "valid_href" CHECK (((char_length(href) > 0) AND ((href ~~ '/%'::text) OR (href ~~ 'http://%'::text) OR (href ~~ 'https://%'::text)))) not valid;

alter table "public"."custom_cards" validate constraint "valid_href";

alter table "public"."custom_cards" add constraint "valid_links_structure" CHECK (((jsonb_typeof(links) = 'array'::text) AND (jsonb_array_length(links) >= 0) AND (jsonb_array_length(links) <= 16))) not valid;

alter table "public"."custom_cards" validate constraint "valid_links_structure";

alter table "public"."dashboard_items" add constraint "dashboard_items_folder_id_fkey" FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE not valid;

alter table "public"."dashboard_items" validate constraint "dashboard_items_folder_id_fkey";

alter table "public"."dashboard_items" add constraint "dashboard_items_note_id_fkey" FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE not valid;

alter table "public"."dashboard_items" validate constraint "dashboard_items_note_id_fkey";

alter table "public"."dashboard_items" add constraint "dashboard_items_type_check" CHECK ((((note_id IS NOT NULL) AND (folder_id IS NULL)) OR ((note_id IS NULL) AND (folder_id IS NOT NULL)))) not valid;

alter table "public"."dashboard_items" validate constraint "dashboard_items_type_check";

alter table "public"."dashboard_items" add constraint "dashboard_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."dashboard_items" validate constraint "dashboard_items_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.validate_custom_card_links()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- Check that all links are valid
  if not (
    select bool_and(validate_link_object(link))
    from jsonb_array_elements(new.links) as link
  ) then
    raise exception 'Invalid link object in links array';
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_link_object(link jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
begin
  return (
    link ? 'id' and
    link ? 'label' and
    link ? 'href' and
    jsonb_typeof(link->'id') = 'string' and
    jsonb_typeof(link->'label') = 'string' and
    jsonb_typeof(link->'href') = 'string' and
    char_length(link->>'label') > 0 and
    char_length(link->>'label') <= 30 and
    char_length(link->>'href') > 0
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

create policy "Users can delete own custom cards"
on "public"."custom_cards"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own custom cards"
on "public"."custom_cards"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own custom cards"
on "public"."custom_cards"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view own custom cards"
on "public"."custom_cards"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can create own dashboard items"
on "public"."dashboard_items"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete own dashboard items"
on "public"."dashboard_items"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update own dashboard items"
on "public"."dashboard_items"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own dashboard items"
on "public"."dashboard_items"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_custom_cards_updated_at BEFORE UPDATE ON public.custom_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER validate_custom_cards_links_trigger BEFORE INSERT OR UPDATE ON public.custom_cards FOR EACH ROW EXECUTE FUNCTION validate_custom_card_links();


