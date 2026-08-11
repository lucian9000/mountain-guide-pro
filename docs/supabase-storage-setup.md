# Supabase Storage Setup

Image uploads for the admin panel. The app never creates buckets, so if one is
missing the admin image picker falls back to "paste a URL instead" (with a clear
toast, no crash).

## Current state — ✅ all applied (2026-08-11)

| Bucket | Status | Used by |
|---|---|---|
| `route-images` | ✅ created | Route gallery + What's New images (`src/lib/images.ts`) |
| `event-images` | ✅ created (public, 3 MB) | Admin → Events → wizard step 3 |
| `special-images` | ✅ created (public, 3 MB) | Admin → Specials → create/edit |
| `guide-photos` | ✅ created (public, 3 MB) | Admin → Guides → create/edit |

Applied as migration `phase6_storage_buckets_and_policies`. Verified: public
read works (a missing object returns `404 not_found`, not a permission error)
and an anonymous upload is refused with *"new row violates row-level security
policy"* — so only an admin profile can write.

> Note: an earlier draft of this doc called the specials bucket
> `specials-images` (plural). The code uses **`special-images`** — match the
> code.

## Re-running / doing this on another project

### Option A — SQL (fastest)

Run the **`-- STORAGE POLICIES`** section at the bottom of
[`supabase/schema-phase6.sql`](../supabase/schema-phase6.sql) in
Dashboard → SQL Editor. It creates all three buckets and their policies, and is
idempotent (safe to re-run).

⚠️ **Two gotchas that make it look like it worked when it didn't:**

1. **The SQL editor runs only your *selection* if any text is highlighted.**
   Highlighting just the `-- STORAGE POLICIES` comment header runs a block of
   comments — which succeeds and does nothing. Click into the editor and clear
   the selection (or select the whole block from `insert into storage.buckets`
   to the final `end $$;`) before running.
2. **"Success. No rows returned" is the expected output.** `insert`,
   `create policy` and `do $$ … $$` blocks never return rows, so that message
   means it ran — it is *not* a warning.

Always confirm with this, which *does* return rows:

```sql
select id, public, file_size_limit from storage.buckets order by id;

select policyname, cmd from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;
```

You should see four buckets and four policies per new bucket
(public read + admin insert/update/delete).

## Option B — Dashboard click-through

For **each** of `event-images`, `special-images`, `guide-photos`:

1. **Storage → New bucket**
   - Name: exactly as above
   - **Public bucket: ON** (the live site loads these images anonymously)
   - Additional configuration → **Restrict file size: 3 MB**
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
2. **Storage → Policies → New policy** on that bucket, four times:

```sql
-- read: anyone (so images render on the public site)
create policy "public read event-images" on storage.objects
  for select using ( bucket_id = 'event-images' );

-- writes: admins only, via the existing is_admin() helper
create policy "admin write event-images" on storage.objects
  for insert with check ( bucket_id = 'event-images' and public.is_admin() );

create policy "admin update event-images" on storage.objects
  for update using ( bucket_id = 'event-images' and public.is_admin() );

create policy "admin delete event-images" on storage.objects
  for delete using ( bucket_id = 'event-images' and public.is_admin() );
```

Repeat with `special-images` and `guide-photos` in place of `event-images`.
`is_admin()` is defined in [`supabase/schema.sql`](../supabase/schema.sql) and is
the same helper the table policies use — an upload only succeeds when the
caller's `profiles.role = 'admin'`.

## How the upload works

- The admin picks a photo (camera or file) in `ImageUpload`
  (`src/components/admin/ImageUpload.tsx`).
- It's rejected client-side if it isn't an image or exceeds **5 MB**
  pre-compression.
- `src/lib/image-compress.ts` resizes it so the longest side is **≤ 1600px** and
  re-encodes to **WebP (~0.8 quality)** in the browser — so the 3 MB bucket cap is
  never the binding constraint in practice.
- It uploads through the **anon** client as `{uuid}.webp`; the Storage policies
  above are what actually authorise the write. The service_role key is never in
  the bundle.
- The public URL is written back into `events.image_url` /
  `specials.image_url` / `guides.photo_url`.

## Known gap: orphaned files

Replacing or removing a photo leaves the previous object in the bucket. This is
deliberate for now — volumes are tiny. A scheduled Edge Function that deletes
objects no longer referenced by any row is the eventual cleanup, tracked as a
future task.
