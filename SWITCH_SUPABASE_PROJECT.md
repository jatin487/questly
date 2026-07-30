# Quick Start: Switch to Your New Supabase Project

## Your New Project Details

- **Project ID**: vhnvamifepgdkelgboap
- **Project URL**: https://vhnvamifepgdkelgboap.supabase.co
- **Publishable Key**: process.env.key
- **API Key**: process.env.API_KEY

---

## Complete Migration in 5 Steps

### Step 1: Get Your API Keys from Supabase

1. Open: https://app.supabase.com/projects
2. Click your project: `vhnvamifepgdkelgboap`
3. Go to: **Settings** → **API**
4. Copy these keys:

```
Anon Key (Public):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...  [COPY THIS]

Service Role Key (Secret):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...  [COPY THIS]
```

### Step 2: Create Storage Bucket in Your New Project

1. In Supabase: Click **Storage** in sidebar
2. Click **Create a new bucket**
3. Fill in:
   - **Name**: `mission-submissions`
   - **Privacy**: Public
4. Click **Create bucket**

### Step 3: Update Environment Variables

If running locally, update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vhnvamifepgdkelgboap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-your-anon-key-here>
SUPABASE_SERVICE_ROLE_KEY=<paste-your-service-key-here>
```

**If deployed on Vercel:**

1. Go to: https://vercel.com/dashboard
2. Select your project: `questly`
3. Go to: **Settings** → **Environment Variables**
4. Update:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://vhnvamifepgdkelgboap.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [your anon key]
   - `SUPABASE_SERVICE_ROLE_KEY` = [your service role key]
5. Click **Save**

### Step 4: Restart Your App

**Local development:**
```bash
npm run dev
```

**Deployed (Vercel):**
- Automatic redeploy on environment variable change
- Or manually redeploy from Vercel dashboard

### Step 5: Test Image Upload

1. Go to: http://localhost:3000/dashboard/missions
2. Click any mission
3. Upload a photo
4. Submit mission
5. Check Supabase: **Storage** → **mission-submissions** → your user folder
6. Confirm image appears ✓

---

## Current vs New Project Comparison

| Item | Current Project | Your New Project |
|------|-----------------|------------------|
| **URL** | pptlzbklfpghsvdpysmc.supabase.co | vhnvamifepgdkelgboap.supabase.co |
| **Bucket** | mission-submissions | mission-submissions (create) |
| **Image Path** | /mission-submissions/{user_id}/{file} | /mission-submissions/{user_id}/{file} |
| **Config** | NEXT_PUBLIC_SUPABASE_URL | NEXT_PUBLIC_SUPABASE_URL |

---

## Verification Checklist

- [ ] Got Anon Key from Supabase Settings → API
- [ ] Got Service Role Key from Supabase Settings → API
- [ ] Created `mission-submissions` bucket in new project
- [ ] Updated `NEXT_PUBLIC_SUPABASE_URL` to new project URL
- [ ] Updated `NEXT_PUBLIC_SUPABASE_ANON_KEY` to new project key
- [ ] Updated `SUPABASE_SERVICE_ROLE_KEY` to new project key
- [ ] Restarted dev server / redeployed app
- [ ] Tested image upload - image appears in Supabase Storage
- [ ] Checked Supabase dashboard - image visible in bucket

---

## Troubleshooting

### Q: Images not uploading?
**A**: 
- Check that `mission-submissions` bucket exists
- Verify bucket is set to **Public**
- Confirm environment variables are correct (no extra spaces)

### Q: Getting 404 errors for images?
**A**:
- Ensure bucket privacy is set to **Public**
- Check that files actually exist in Supabase Storage
- Verify environment variable `NEXT_PUBLIC_SUPABASE_URL` is correct

### Q: Can't find my API keys?
**A**:
- Go to: https://app.supabase.com/projects
- Select your project
- Click **Settings** (gear icon)
- Look for **API** section
- Copy from there

### Q: Environment variables aren't updating?
**A**:
- For local: Restart dev server (`npm run dev`)
- For Vercel: Manual redeploy or wait for automatic redeploy
- Clear browser cache if needed

---

## File Structure After Migration

Your image uploads will be organized like this:

```
Your Project: vhnvamifepgdkelgboap
├── Storage
│   └── mission-submissions/
│       ├── user-id-1/
│       │   ├── 1722345678-photo.jpg
│       │   ├── 1722345679-image.png
│       │   └── ...
│       ├── user-id-2/
│       │   ├── 1722345680-screenshot.jpg
│       │   └── ...
│       └── ...
```

---

## Important Notes

⚠️ **Old Project**: You can keep it or delete it (images won't be affected)

✅ **New Project**: Will only store NEW uploads from this point forward

ℹ️ **No Code Changes**: Only environment variables need to be updated!

---

## FAQ

**Q: Will existing missions work?**
A: Yes, but old uploaded images will still reference the old project. New uploads will go to your new project.

**Q: Do I need to update database?**
A: No, the database is separate. Only storage location changes.

**Q: Can I migrate old images?**
A: Manually via Supabase - copy files from old bucket to new bucket.

**Q: Which environment variables do I need?**
A: 
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Next Steps

1. Complete all 5 steps above
2. Test by uploading a mission image
3. Verify image appears in new project's storage
4. Everything ready - keep using as normal!

For more details, see:
- `SUPABASE_MIGRATION.md` - Detailed migration guide
- `IMAGE_STORAGE_REFERENCE.md` - Technical storage reference
- `README.md` - General app documentation
