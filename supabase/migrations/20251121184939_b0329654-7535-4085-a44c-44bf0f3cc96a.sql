-- Create public-assets storage bucket for email assets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-assets',
  'public-assets',
  true,
  5242880, -- 5MB limit
  array['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
);

-- Create RLS policies for public-assets bucket
create policy "Public assets are publicly accessible"
on storage.objects for select
using (bucket_id = 'public-assets');

create policy "Authenticated users can upload public assets"
on storage.objects for insert
with check (
  bucket_id = 'public-assets' 
  and auth.role() = 'authenticated'
);

create policy "Authenticated users can update public assets"
on storage.objects for update
using (bucket_id = 'public-assets' and auth.role() = 'authenticated');

create policy "Authenticated users can delete public assets"
on storage.objects for delete
using (bucket_id = 'public-assets' and auth.role() = 'authenticated');