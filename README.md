# DBUU Campus Explorer Hunt

A gamified campus exploration application built with Next.js 16, Supabase, and Socket.IO. Students complete missions, earn points, form teams, and compete on live leaderboards.

## Features

### MVP (Implemented)
- **User Authentication**: Email/password signup and login via Supabase
- **User Profiles**: Individual user profiles with points and mission tracking
- **Missions System**: Browse active missions with difficulty levels and point rewards
- **Mission Submissions**: Submit mission completions with optional photos and text
- **Teams**: Create teams, invite members, and compete as a group
- **Leaderboards**: Individual and team leaderboards sorted by total points
- **Admin Dashboard**: Moderate submissions, approve/reject with points assignment
- **API Routes**: Full RESTful API for all core functionality

### Future Enhancements (Phase 2)
- GPS verification for missions
- QR code scanning for check-ins
- Dark/light theme toggle
- Real-time Socket.IO notifications
- Advanced analytics and statistics
- Social features (following, activity feed)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Real-time**: Socket.IO (setup ready, not yet integrated)
- **Database**: PostgreSQL via Supabase with Row Level Security
- **Deployment**: Vercel

## Project Structure

```
app/
  ├── auth/                    # Authentication pages
  │   ├── login/              # Login page
  │   ├── sign-up/            # Sign up page
  │   ├── callback/           # OAuth callback handler
  │   └── error/              # Error page
  ├── dashboard/              # Main app
  │   ├── page.tsx            # Dashboard home
  │   ├── missions/           # Mission listing and details
  │   ├── leaderboard/        # Leaderboards (individual/team)
  │   ├── teams/              # Team management
  │   ├── submissions/        # User submission history
  │   └── layout.tsx          # Dashboard layout with nav
  ├── admin/                  # Admin pages
  │   ├── page.tsx            # Admin dashboard
  │   └── missions/new        # Create new mission
  └── api/                    # API routes
      ├── seed-missions/      # Seed sample missions
      ├── submissions/        # Submission CRUD
      ├── teams/              # Team management
      ├── leaderboard/        # Leaderboard data
      └── auth/               # Auth callbacks

lib/
  └── supabase/               # Supabase client setup
      ├── client.ts          # Browser client
      ├── server.ts          # Server client
      └── proxy.ts           # Session handling

components/
  ├── dashboard-nav.tsx       # Navigation component
  └── ui/                     # shadcn/ui components

database/
  └── schema.sql              # Database schema (auto-created)
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account (free tier works)
- Vercel account (for deployment)

### Local Development

1. **Clone and install**
   ```bash
   git clone <repo>
   cd v0-project
   pnpm install
   ```

2. **Set up environment variables**
   
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
   ```

   Get these from your Supabase project settings.

3. **Run dev server**
   ```bash
   pnpm dev
   ```

4. **Access the app**
   - Open http://localhost:3000
   - Sign up for a new account
   - Complete email verification
   - Explore missions and submit completions

### Database Setup

The database schema is automatically created when you deploy. For local development:

1. In Supabase dashboard, go to SQL Editor
2. Run the schema migration (already set up in the Supabase integration)
3. Sample missions are auto-seeded via `/api/seed-missions` endpoint

### Key API Endpoints

- `POST /api/submissions` - Create submission
- `PATCH /api/submissions/[id]` - Review/approve submission
- `GET /api/submissions` - Get user submissions
- `POST /api/teams` - Create team
- `GET /api/teams` - Get all teams
- `POST /api/teams/[id]/members` - Add team member
- `GET /api/leaderboard?type=individual|team` - Get leaderboard

## User Flows

### Student/User Flow
1. Sign up → Email confirmation
2. View profile with points
3. Browse active missions
4. Submit mission completion (with optional photo)
5. View submission status (pending/approved/rejected)
6. Check leaderboard ranking
7. Create or join team
8. Compete with team on team leaderboard

### Admin Flow
1. Login as admin
2. Navigate to admin dashboard
3. View pending submissions
4. Approve (assign points) or reject with reason
5. Create new missions
6. Monitor user activity

## Next Steps for Full Implementation

### 1. Socket.IO Real-time Setup
- Install socket.io server and client
- Create real-time connection in layout
- Emit events on submission approval
- Update leaderboards in real-time

### 2. Photo Upload
- Set up Supabase Storage
- Add file upload to submission form
- Display photos in submission review

### 3. Advanced Features
- GPS verification using Geolocation API
- QR code generation and scanning
- Email notifications
- Batch leaderboard snapshots

### 4. Polish & Optimization
- Add loading states and optimistic updates
- Implement error boundaries
- Add success/error toasts
- Responsive mobile layout refinement
- Performance optimization

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial campus explorer app"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to vercel.com/new
   - Import GitHub repo
   - Add environment variables from `.env.local`
   - Deploy

3. **Post-deployment**
   - Update Supabase project CORS settings
   - Test email confirmation flow
   - Seed production missions
   - Share deployment URL with users

## Database Schema Overview

### Tables
- **profiles**: User profile data (points, missions completed)
- **teams**: Team information (name, points, members)
- **team_members**: Team membership with roles
- **missions**: Mission definitions with difficulty/points
- **mission_submissions**: User submission records with status
- **leaderboard_snapshots**: Historical leaderboard data

### Row Level Security
- Users can only view/edit their own profiles
- Users can only submit their own missions
- Admin users can review all submissions
- Teams are publicly viewable

## Troubleshooting

**Email confirmation not working**
- Check spam folder
- Verify Supabase SMTP is configured
- Check NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL

**Submissions not showing**
- Verify RLS policies allow user access
- Check submission status in database
- Ensure team_id is correct if using teams

**Leaderboard not updating**
- Check profile total_points calculation
- Verify submission approval updates points
- Check sorting order in API

## Support

For issues or questions, check:
1. Supabase documentation: https://supabase.com/docs
2. Next.js documentation: https://nextjs.org/docs
3. Socket.IO docs: https://socket.io/docs
