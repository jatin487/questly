import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-xl font-bold text-primary">DBUU Campus Explorer</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-balance text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
          Explore Your Campus Like Never Before
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Complete missions, discover hidden spots, collect points, and compete with your teammates on the leaderboard.
          Turn campus exploration into an exciting adventure.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="px-8">
              Start Exploring
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="px-8">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid w-full max-w-4xl gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-primary/20 bg-background/50 p-6">
            <div className="text-3xl font-bold text-primary">🎯</div>
            <h3 className="mt-4 font-semibold">Exciting Missions</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete campus challenges and earn points for each mission.
            </p>
          </div>

          <div className="rounded-lg border border-secondary/20 bg-background/50 p-6">
            <div className="text-3xl font-bold text-secondary">👥</div>
            <h3 className="mt-4 font-semibold">Team Competition</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Join or create teams and climb the leaderboard together.
            </p>
          </div>

          <div className="rounded-lg border border-accent/20 bg-background/50 p-6">
            <div className="text-3xl font-bold text-accent">🏆</div>
            <h3 className="mt-4 font-semibold">Live Leaderboards</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              See real-time updates as teams complete missions and earn points.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-background/50 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; 2024 DBUU Campus Explorer. All rights reserved.</p>
      </footer>
    </div>
  )
}
