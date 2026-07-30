# Mission Image Storage Reference

## Where Mission Photos Are Stored

### Storage Location
- **Service**: Supabase Storage
- **Bucket**: `mission-submissions`
- **Project URL**: `https://vhnvamifepgdkelgboap.supabase.co` (after migration)

### File Organization
```
Supabase Storage: mission-submissions/
├── {user_id_1}/
│   ├── 1722345678-photo.jpg
│   ├── 1722345679-image.png
│   └── 1722345680-screenshot.jpg
├── {user_id_2}/
│   ├── 1722345681-photo.jpg
│   └── ...
└── {user_id_n}/
    └── ...
```

### How Images Are Uploaded

**File**: `/app/dashboard/missions/[id]/page.tsx`

```typescript
// Lines 90-103: Upload Logic

if (selectedFile) {
  const fileName = `${Date.now()}-${selectedFile.name}`  // e.g., "1722345678-photo.jpg"
  
  const { error: uploadError } = await supabase.storage
    .from('mission-submissions')  // ← Storage bucket
    .upload(`${user.id}/${fileName}`, selectedFile)  // ← Path: {user_id}/{fileName}

  // Generate public URL
  const { data } = supabase.storage
    .from('mission-submissions')
    .getPublicUrl(`${user.id}/${fileName}`)

  photoUrl = data.publicUrl  // e.g., https://[project].supabase.co/storage/v1/object/public/mission-submissions/[user_id]/[fileName]
}
```

### Image Public URLs

After upload, images are publicly accessible at:

```
https://vhnvamifepgdkelgboap.supabase.co/storage/v1/object/public/mission-submissions/{user_id}/{fileName}
```

### Database Storage

**Table**: `mission_submissions`

**Column**: `photo_url` (stores the public URL)

```sql
SELECT 
  id,
  mission_id,
  user_id,
  photo_url,  -- ← Public URL stored here
  submission_text,
  status,
  created_at
FROM mission_submissions
WHERE status = 'pending';
```

### Image Access Flow

```
1. User uploads photo on mission detail page
   ↓
2. Photo uploaded to Supabase Storage
   Path: mission-submissions/{user_id}/{timestamp}-{original_name}
   ↓
3. Public URL generated
   URL: https://[project].supabase.co/storage/v1/object/public/mission-submissions/{user_id}/{fileName}
   ↓
4. URL stored in mission_submissions.photo_url
   ↓
5. Admin can view image in submission review page
   ↓
6. On approval, image remains in storage
   Status changes to 'approved'
```

---

## Configuration for Your New Project

### Step 1: Create Storage Bucket

In Supabase: https://app.supabase.com/projects

1. Select your project: `vhnvamifepgdkelgboap`
2. Go to **Storage** section
3. Click **Create a new bucket**
4. Name: `mission-submissions`
5. Privacy: **Public** (so image URLs are accessible)
6. Click **Create bucket**

### Step 2: Update Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://vhnvamifepgdkelgboap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-settings-api>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key-from-settings-api>
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

---

## Checking Uploaded Images

### View in Supabase Dashboard

1. Go to your Supabase project
2. Click **Storage** in sidebar
3. Open `mission-submissions` bucket
4. Browse by user folder
5. See all uploaded images organized by user

### Direct Access

Each image is publicly accessible via its URL:

```
https://vhnvamifepgdkelgboap.supabase.co/storage/v1/object/public/mission-submissions/[user_id]/[filename]
```

### In Application

1. Go to `/admin/submissions` page
2. View pending submissions
3. See photo preview for each submission
4. Image URL is embedded in the submission record

---

## Image Storage Limits

- **Max file size**: 10MB (default Supabase limit)
- **Supported formats**: JPG, PNG, GIF, WebP, etc.
- **Storage capacity**: Depends on Supabase plan

---

## Related Code Files

| File | Purpose |
|------|---------|
| `/app/dashboard/missions/[id]/page.tsx` | Upload mission photos |
| `/app/admin/submissions/page.tsx` | View submitted photos in admin dashboard |
| `/app/api/setup/buckets/route.ts` | Create storage bucket if missing |
| `/lib/supabase/client.ts` | Supabase client configuration |

---

## Quick Migration Commands

### Get Your New Project Keys

1. Visit: https://app.supabase.com/projects
2. Select project: `vhnvamifepgdkelgboap`
3. Settings → API
4. Copy the following:

**Anon Key** (Public - safe to share):
```
process.env.key
```

**Service Role Key** (Secret - keep secure):
```
process.env.API_KEY
```

---

## Summary

✅ **Photos are stored in**: Supabase Storage > `mission-submissions` bucket
✅ **Organized by**: User ID folders
✅ **Accessed via**: Public URLs
✅ **Stored in database**: `mission_submissions.photo_url`
✅ **Managed in admin**: `/admin/submissions` page

All images are securely stored and easily managed through your Supabase dashboard!
