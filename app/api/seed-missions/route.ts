import { createClient as createServerClient } from '@supabase/supabase-js'

const sampleMissions = [
  {
    title: "Find the Ancient Library",
    description: "Locate the oldest library building on campus and photograph the main entrance. Look for the classical architecture.",
    location_name: "Central Library, East Wing",
    points: 15,
    difficulty: "easy",
    category: "exploration",
    requires_photo: true,
  },
  {
    title: "Capture the Sunset from the Rooftop",
    description: "Go to the campus rooftop and take a photo of the sunset. Document the view from the highest point on campus.",
    location_name: "Student Center Rooftop",
    points: 25,
    difficulty: "medium",
    category: "adventure",
    requires_photo: true,
  },
  {
    title: "Meet the Campus Mascot",
    description: "Find the campus mascot statue or sculpture and take a selfie with it. Extra points for creative poses!",
    location_name: "Main Plaza",
    points: 20,
    difficulty: "easy",
    category: "exploration",
    requires_photo: true,
  },
  {
    title: "Discover Hidden Garden",
    description: "Find the secret garden behind the Science Building. Take photos of 3 different plants.",
    location_name: "Science Building Rear",
    points: 30,
    difficulty: "hard",
    category: "exploration",
    requires_photo: true,
  },
  {
    title: "Complete the Campus Trail",
    description: "Walk the entire marked campus trail and collect photos at each checkpoint. Visit all 5 stations.",
    location_name: "Campus Perimeter",
    points: 50,
    difficulty: "hard",
    category: "adventure",
    requires_photo: true,
  },
  {
    title: "Visit the Campus Museum",
    description: "Tour the on-campus museum and photograph your favorite exhibit. Learn about campus history.",
    location_name: "Campus Museum",
    points: 20,
    difficulty: "medium",
    category: "culture",
    requires_photo: true,
  },
  {
    title: "Find All Campus Quads",
    description: "Explore and photograph all 4 main quads on campus. Each quad has unique architecture.",
    location_name: "Multiple Locations",
    points: 35,
    difficulty: "medium",
    category: "exploration",
    requires_photo: true,
  },
  {
    title: "Breakfast at the Clock Tower Cafe",
    description: "Have breakfast at the historic cafe near the clock tower and share a photo of your meal.",
    location_name: "Clock Tower Cafe",
    points: 15,
    difficulty: "easy",
    category: "lifestyle",
    requires_photo: true,
  },
]

export async function POST() {
  try {
    // Use service role for seed operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    )

    // Check if missions already exist
    const { data: existingMissions, error: checkError } = await supabase
      .from('missions')
      .select('id')
      .limit(1)

    if (checkError) throw checkError

    if (existingMissions && existingMissions.length > 0) {
      return Response.json({ message: 'Missions already exist', count: existingMissions.length })
    }

    // Insert sample missions
    const { data, error } = await supabase.from('missions').insert(sampleMissions).select()

    if (error) throw error

    return Response.json({ message: 'Missions seeded successfully', count: data?.length || 0 })
  } catch (error: any) {
    console.error('Error seeding missions:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
