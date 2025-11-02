-- Create RLS policies for event-banners storage bucket

-- Allow authenticated users to upload their own files
CREATE POLICY "Authenticated users can upload event banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-banners');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update event banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'event-banners');

-- Allow everyone to view event banners (since bucket is public)
CREATE POLICY "Anyone can view event banners"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-banners');

-- Allow authenticated users to delete event banners
CREATE POLICY "Authenticated users can delete event banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'event-banners');