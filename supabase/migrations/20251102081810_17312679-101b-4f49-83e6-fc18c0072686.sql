-- Allow public (anon) to upload to event-banners to support admin UI without Supabase auth
CREATE POLICY "Public can upload event banners"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-banners');