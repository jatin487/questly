# Switching to Your New Supabase Project

## Current Storage Configuration

**Images are stored in**: `Supabase Storage > mission-submissions bucket`

**Image Upload Path**: `{user_id}/{fileName}` (organized by user)

**Current Project**:
- URL: `https://pptlzbklfpghsvdpysmc.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGx6YmtsZnBnaHN2ZHB5c21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMjQyNjUsImV4cCI6MjEwMDYwMDI2NX0.WdHb5v7Xtam6KuJuW5EGxzBgM8gvRgXeDWDYv4D8qIA`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGx6YmtsZnBnaHN2ZHB5c21jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAyNDI2NSwiZXhwIjoyMTAwNjAwMjY1fQ.eDNIFx3ttexmqpiXeOhrrVH47UD86QJgr6NT4obSdJQ`

---

## Your New Supabase Project

- URL: `https://vhnvamifepgdkelgboap.supabase.co`
- Publishable Key: `process.env.key` (or your actual key)
- API Key: `process.env.API_KEY` (or your actual key)

---

## Steps to Migrate

### 1. Set Up New Supabase Project

In your new Supabase project (`vhnvamifepgdkelgboap.supabase.co`):

1. Go to **Storage** → **Create a new bucket**
2. Name it: `mission-submissions`
3. Click **Create bucket**

### 2. Update Environment Variables

Update these in your Vercel project settings or `.env.local`:

```env
# OLD (Current)
NEXT_PUBLIC_SUPABASE_URL=https://pptlzbklfpghsvdpysmc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NEW (Your Project)
NEXT_PUBLIC_SUPABASE_URL=https://vhnvamifepgdkelgboap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-new-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-new-service-key>
```

**Where to find your keys:**
1. Go to your Supabase project: `https://app.supabase.com/projects`
2. Select your project `vhnvamifepgdkelgboap`
3. Go to **Settings** → **API**
4. Copy:
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Set Up RLS Policies (Optional but Recommended)

In your new Supabase project, go to **SQL Editor** and run:

```sql
-- Enable RLS on mission-submissions storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload submissions" 
  ON storage.objects
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'mission-submissions');

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read submissions" 
  ON storage.objects
  FOR SELECT 
  TO authenticated 
  USING (bucket_id = 'mission-submissions');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own submissions" 
  ON storage.objects
  FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'mission-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Verify Connection

After updating environment variables:

1. Restart your dev server: `npm run dev`
2. Try uploading a mission image
3. Check Supabase Storage → `mission-submissions` bucket
4. Confirm the image appears there

---

## Image Upload Location Details

**Storage Bucket**: `mission-submissions`

**File Path Structure**: 
```
mission-submissions/
├── [user_id_1]/
│   ├── 1722345678-photo.jpg
│   └── 1722345679-image.png
├── [user_id_2]/
│   ├── 1722345680-screenshot.jpg
│   └── ...
```

**Code Reference**:
- Upload: `/app/dashboard/missions/[id]/page.tsx` (lines 92-94)
- Storage bucket: `'mission-submissions'`
- Public URL generation: `getPublicUrl()` method

---

## Migration Checklist

- [ ] Create `mission-submissions` bucket in new project
- [ ] Copy API keys from new project
- [ ] Update `NEXT_PUBLIC_SUPABASE_URL` environment variable
- [ ] Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` environment variable
- [ ] Restart dev server (`npm run dev`)
- [ ] Test image upload on a mission
- [ ] Verify image appears in new project's storage bucket
- [ ] Deploy to production (push to GitHub)
- [ ] Update production environment variables on Vercel

---

## Accessing Your Images

All uploaded mission images are stored as **public URLs** in Supabase Storage.

**URL Format**:
```
https://vhnvamifepgdkelgboap.supabase.co/storage/v1/object/public/mission-submissions/{user_id}/{fileName}
```

**Example**:
```
https://vhnvamifepgdkelgboap.supabase.co/storage/v1/object/public/mission-submissions/123e4567-e89b-12d3-a456-426614174000/1722345678-photo.jpg
```

---

## Troubleshooting

### Images Not Uploading
- Check that `mission-submissions` bucket exists in your new project
- Verify RLS policies allow INSERT for authenticated users
- Confirm environment variables are correct

### 404 Image URLs
- Ensure bucket is set to **Public** in Storage settings
- Check that `mission-submissions` bucket exists
- Verify the file path is correct

### Connection Errors
- Restart dev server after changing environment variables
- Double-check Supabase URL format (no trailing slashes)
- Verify anon key is not corrupted (no extra spaces)

---

## Code Files That Handle Storage

1. **Upload Logic**: `/app/dashboard/missions/[id]/page.tsx` (lines 90-103)
2. **Storage Setup**: `/app/api/setup/buckets/route.ts`
3. **Supabase Client**: `/lib/supabase/client.ts`

No code changes are needed - just update environment variables!
