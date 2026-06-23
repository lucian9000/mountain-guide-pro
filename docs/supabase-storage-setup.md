# Supabase Storage Setup (Phase 3)

Image uploads for specials and guide photos. Until this is wired up, the admin
panel uses plain `image_url` / `photo_url` text fields — paste any public URL.

## Buckets to create (Dashboard → Storage → New bucket)

### `specials-images`
- Public: **yes** (public read)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Max file size: 5 MB
- Used by: Admin → Specials image upload

### `guide-photos`
- Public: **yes** (public read)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Max file size: 3 MB
- Used by: Admin → Guides photo upload

## Storage RLS policies

Public read is covered by the "public" bucket flag. Restrict writes to admins —
in Dashboard → Storage → Policies (or SQL), add for each bucket:

```sql
-- Example for specials-images (repeat for guide-photos)
create policy "admins upload specials images"
  on storage.objects for insert
  with check ( bucket_id = 'specials-images' and public.is_admin() );

create policy "admins update specials images"
  on storage.objects for update
  using ( bucket_id = 'specials-images' and public.is_admin() );

create policy "admins delete specials images"
  on storage.objects for delete
  using ( bucket_id = 'specials-images' and public.is_admin() );
```

(`is_admin()` is defined in `supabase/schema.sql`.)

## Wiring the upload (when implemented)

Replace the image-URL text inputs in `SpecialFormDialog` / `GuideFormDialog` with a
file input that does:

```ts
const { data, error } = await supabase.storage
  .from("specials-images")
  .upload(`${crypto.randomUUID()}.webp`, file, { contentType: file.type });

const { data: pub } = supabase.storage
  .from("specials-images")
  .getPublicUrl(data.path);
// store pub.publicUrl in specials.image_url
```
