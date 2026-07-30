# Connect Your Supabase Project - Complete Setup Guide

This guide will help you configure the treasure hunt app to upload mission photos directly to your Supabase project.

## Your Project Details

```
Project ID: vhnvamifepgdkelgboap
Project URL: https://vhnvamifepgdkelgboap.supabase.co
Publishable Key (JWT): process.env.JWT
Service Role Key: process.env.Service_role
```

## Step 1: Get Your Actual API Keys

Your app needs the ACTUAL keys, not the environment variable names. Here's how to get them:

### Get JWT (Anon Key):
1. Go to: https://app.supabase.com/projects
2. Select: vhnvamifepgdkelgboap
3. Click: **Settings** (gear icon in sidebar)
4. Click: **API** in the left menu
5. Find: "Project API keys" section
6. Copy: The **Anon Key** (starts with `eyJ`)
7. This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Get Service Role Key:
1. Same location as above
2. Find: "Project API keys" section
3. Copy: The **Service Role Key** (starts with `eyJ`)
4. This is your `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Create Storage Bucket

Mission photos need a place to be stored in your Supabase project.

1. Go to: https://vhnvamifepgdkelgboap.supabase.co
2. Click: **Storage** (in left sidebar)
3. Click: **Create a new bucket**
4. Set **Name**: `mission-submissions`
5. Set **Privacy**: `Public` (so photos can be viewed)
6. Click: **Create bucket**

✓ Bucket created!

## Step 3: Update Environment Variables (Local Development)

1. Open: `.env.local` file in your project (or create if missing)

2. Update these lines with your ACTUAL keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vhnvamifepgdkelgboap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (paste your JWT here)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (paste your service role here)
```

3. Save the file

## Step 4: Update Production (Vercel)

If your app is deployed on Vercel, update the production environment variables:

1. Go to: https://vercel.com/dashboard
2. Select: **questly** project
3. Go to: **Settings** → **Environment Variables**

4. Update/Add these variables:

| Variable Name | Value |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | https://vhnvamifepgdkelgboap.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (paste your JWT key here) |
| SUPABASE_SERVICE_ROLE_KEY | (paste your service role key here) |

5. For each, click **Save**
6. Then go to **Deployments** and click **Redeploy** on the latest deployment

## Step 5: Restart Development Server

If running locally:

```bash
# Stop the server (Ctrl+C)
# Then restart it:
npm run dev
```

## Step 6: Test Image Upload

Now when someone uploads a mission photo, it should go directly to YOUR Supabase project!

1. Go to: http://localhost:3000/dashboard/missions
2. Click: Any mission (e.g., "Team Selfie")
3. Click: **Choose Photo** button
4. Select: An image from your computer
5. Type: A description
6. Click: **Submit Mission**

✓ If successful, the image should appear in your Supabase project!

## Verify Upload in Supabase

To confirm the image was uploaded to YOUR project:

1. Go to: https://app.supabase.com/projects
2. Select: vhnvamifepgdkelgboap
3. Click: **Storage**
4. Open: **mission-submissions** bucket
5. Look for: A folder with the user ID
6. Inside: Your uploaded image file

✓ You should see your image here!

## Database Storage

The image URL is also stored in your database:

1. Go to: Supabase dashboard
2. Click: **Table Editor** → **mission_submissions**
3. Find: Your recent submission
4. Check: The `photo_url` column
5. It should contain: The public URL to your image

✓ Everything connected!

## What Happens Now

When users upload mission photos:

1. Photo file uploaded → **Your Supabase Storage** (mission-submissions bucket)
2. Public URL generated → https://vhnvamifepgdkelgboap.supabase.co/storage/...
3. URL saved → **Your Supabase Database** (mission_submissions table)
4. Admin sees → Photo preview in /admin/submissions
5. On approval → Photo stays in your storage, points awarded

Everything goes directly to YOUR Supabase project!

## Troubleshooting

### Images not uploading?
- Check bucket exists and is set to **Public** (not Private)
- Check environment variables have correct values (not env var names)
- Check keys start with `eyJ` (JWT format)
- Restart dev server: `npm run dev`

### Getting 404 errors on images?
- Verify bucket privacy is set to **Public**
- Check URL is correct format
- Confirm environment variables are set

### Can't find API keys?
- Go to: https://app.supabase.com/projects
- Select: vhnvamifepgdkelgboap
- Click: Settings → API
- Keys are in "Project API keys" section

### Still having issues?
- Check `.env.local` file is saved
- Make sure you used ACTUAL keys, not variable names
- Verify bucket name is exactly `mission-submissions`
- Restart dev server after any changes

## Quick Reference

```
Your Project URL: https://vhnvamifepgdkelgboap.supabase.co

Environment Variables to Update:
  NEXT_PUBLIC_SUPABASE_URL=https://vhnvamifepgdkelgboap.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[JWT from API Settings]
  SUPABASE_SERVICE_ROLE_KEY=[Service Role Key from API Settings]

Storage Bucket Name: mission-submissions
Storage Privacy: Public

Test Location: http://localhost:3000/dashboard/missions
Admin Review: http://localhost:3000/admin/submissions
Verify in Supabase: Storage → mission-submissions
```

## Summary

✓ Mission photos will upload directly to your Supabase project
✓ Images stored in: mission-submissions bucket
✓ Images organized by: User ID
✓ Admin can see: All photos in /admin/submissions
✓ Database stores: Image URL for each submission

Everything is now connected to YOUR Supabase project!
