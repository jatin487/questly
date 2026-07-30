# Quick Start Guide - Campus Explorer Hunt

## ⚡ Get Running in 5 Minutes

### 1. Clone & Install
```bash
git clone <your-repo>
cd v0-project
npm install
```

### 2. Add .env.local
Create `.env.local` in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

Get these from: **Supabase Dashboard → Settings → API**

### 3. Run Dev Server
```bash
npm run dev
```

Open http://localhost:3000 ✅

---

## 🎮 Test Complete Flow (2 minutes)

### Setup: Seed Missions
1. Open http://localhost:3000/api/seed-missions in browser
2. Should show: `{"success":true}` ✅
3. 7 DBUU missions now seeded

### Step 1: Signup
1. Click "Get Started"
2. Fill form:
   - Display Name: "Alex Hunter"
   - Email: "test@example.com"
   - Password: "TestPass123!"
3. Click "Sign Up"
4. ✅ Profile created with 0 points

### Step 2: Browse Missions
1. Navigate to "Missions"
2. See 7 campus challenges
3. Click on any mission
4. View details (location, points, requirements)

### Step 3: Submit Mission
1. Click "Submit" on mission
2. Upload a photo
3. Add description text (optional)
4. Click "Submit Mission"
5. ✅ Submission created (status: pending)

### Step 4: Approve as Admin
1. Open new browser tab (incognito) or logout
2. Login as admin (same test email works)
3. Go to "/admin/submissions"
4. See pending submission with photo
5. Click "Approve"
6. Confirm dialog
7. ✅ Points awarded!

### Step 5: Check Updates (Real-time)
1. Go back to original tab
2. Go to Dashboard
3. ✅ Points updated! (+20 points shown)
4. Go to Leaderboard
5. ✅ You're #1! 🏆

### Step 6: Teams
1. Go to Teams page
2. Click "Create Team"
3. Name: "Team Alpha"
4. Create
5. ✅ Team created
6. Invite friends or click "View all teams"
7. Click "Join Team"
8. ✅ You're now in a team

---

## 📱 Key Pages

| Page | URL | Function |
|------|-----|----------|
| Home | `/` | Landing page |
| Signup | `/auth/sign-up` | Create account |
| Login | `/auth/login` | Sign in |
| Dashboard | `/dashboard` | User stats |
| Missions | `/dashboard/missions` | Browse 7 challenges |
| Mission Detail | `/dashboard/missions/[id]` | Submit photo |
| Teams | `/dashboard/teams` | Team management |
| Leaderboard | `/dashboard/leaderboard` | Rankings (real-time) |
| Submissions | `/dashboard/submissions` | Your submissions |
| Admin | `/admin` | Admin overview |
| Admin - Submissions | `/admin/submissions` | Review & approve |
| Admin - Missions | `/admin/missions` | Manage missions |

---

## 🔑 Key APIs

```bash
# Seed 7 missions
curl http://localhost:3000/api/seed-missions

# Get leaderboard
curl http://localhost:3000/api/leaderboard

# Get all teams
curl http://localhost:3000/api/teams
```

---

## 🧪 Real-time Testing

1. Open 2 browser windows:
   - **Left**: Leaderboard page
   - **Right**: Admin submissions

2. In admin window:
   - Submit a mission
   - Approve it

3. In leaderboard window:
   - Watch ranking update in 1-2 seconds ✅

---

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial setup"
git push origin main

# 2. Go to vercel.com/new
# 3. Import GitHub repo
# 4. Add Environment Variables (same as .env.local)
# 5. Deploy!
```

Get live URL like: `https://campus-explorer-hunt.vercel.app`

---

## ❌ Troubleshooting

**Q: "Email not confirmed" error**
- A: Run: http://localhost:3000/api/dev/confirm-email
- Body: `{"email":"your-email@example.com"}`

**Q: Can't upload photos**
- A: Check storage bucket exists in Supabase
- Go: Supabase Dashboard → Storage → "mission-submissions"

**Q: Leaderboard not updating**
- A: Try refreshing page
- Check browser console for errors
- Verify Realtime is enabled in Supabase

**Q: Admin submission review page not loading**
- A: Ensure user is admin (can add role in Supabase)
- For testing, skip admin check in `/api/submissions/[id]`

---

## 📚 Full Documentation

- **[README.md](./README.md)** - Features & tech stack overview
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[WIRING.md](./WIRING.md)** - Complete system architecture & wiring

---

## 🎯 Next Steps

### After Testing Locally:
1. Deploy to Vercel
2. Share URL with users
3. Users signup and complete missions
4. Admin reviews and approves
5. Leaderboard updates in real-time

### Phase 2 Enhancements:
- GPS verification (geolocation)
- QR code scanning
- Dark/light theme
- Achievement badges
- Notification system

---

**Status**: ✅ All systems working, ready to deploy!

Need help? Check [WIRING.md](./WIRING.md) for complete system architecture.
