# Supabase Storage Setup

Image uploads for the admin panel. **Creating the buckets is a one-time manual
step** — the app never creates them, so until you do this the admin image
pickers fall back to "paste a URL instead" (with a clear toast, no crash).

## Current state

| Bucket | Status | Used by |
|---|---|---|
| `route-images` | ✅ already created | Route gallery + What's New images (`src/lib/images.ts`) |
| `event-images` | ⬜ **create this** | Admin → Events → wizard step 3 |
| `special-images` | ⬜ **create this** | Admin → Specials → create/edit |
| `guide-photos` | ⬜ **create this** | Admin → Guides → create/edit |

> Note: an earlier draft of this doc called the specials bucket
> `specials-images` (plural). The code uses **`special-images`** — match the
> code.

## Option A — SQL (fastest)

Run the **`-- STORAGE POLICIES`** section at the bottom of
[`supabase/schema-phase6.sql`](../supabase/schema-phase6.sql) in
Dashboard → SQL Editor. It creates all three buckets and their policies, and is
idempotent (safe to re-run).

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
