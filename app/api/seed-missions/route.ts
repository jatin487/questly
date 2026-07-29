import { createClient as createServerClient } from '@supabase/supabase-js'

const sampleMissions = [
  {
    title: "Challenge 1: Team Selfie",
    description: "Gather your entire team and capture the perfect team selfie at the Main Gate. Make sure everyone is in the frame! This is your first mission and a great way to bond with your teammates.",
    location_name: "Main Gate",
    points: 10,
    difficulty: "easy",
    category: "team",
    requires_photo: true,
  },
  {
    title: "Challenge 2: Find the Building",
    description: "Visit one of the academic buildings (Nursing Block, Pharmacy Block, Engineering Block, or Management Block). Take a team photo in front of the building to prove you found it!",
    location_name: "Nursing, Pharmacy, Engineering, or Management Block",
    points: 10,
    difficulty: "easy",
    category: "exploration",
    requires_photo: true,
  },
  {
    title: "Challenge 3: Meet a Professor",
    description: "Head to the Nursing Department and capture a group photo with faculty members. This is a great opportunity to connect with professors and get to know the academic community.",
    location_name: "Nursing Department",
    points: 20,
    difficulty: "medium",
    category: "social",
    requires_photo: true,
  },
  {
    title: "Challenge 4: Canteen Hunt",
    description: "Visit the campus canteen and take a creative selfie with a snack or meal. Bonus points if you mention your favorite item in the submission! Show us your culinary adventure.",
    location_name: "Campus Canteen",
    points: 10,
    difficulty: "easy",
    category: "social",
    requires_photo: true,
  },
  {
    title: "Challenge 5: Campus Reel",
    description: "Create a 15-20 second video showcasing your first impression of DBUU. Include shots of the Main Gate, you with friends, a walk around campus, and the Academic Block. Be creative! Bonus prize for the most creative reel.",
    location_name: "Main Gate, Academic Block, and Around Campus",
    points: 30,
    difficulty: "hard",
    category: "creative",
    requires_photo: true,
  },
  {
    title: "Challenge 6: Plant Explorer",
    description: "Identify and photograph 3 different plants or trees around campus. Make sure to get clear, recognizable photos of each plant. This is a great way to appreciate the natural beauty of DBUU.",
    location_name: "Campus Grounds",
    points: 20,
    difficulty: "medium",
    category: "nature",
    requires_photo: true,
  },
  {
    title: "Challenge 7: Safety First",
    description: "Locate and photograph one of the following safety equipment on campus: Fire Extinguisher, Emergency Exit, or First Aid Box. Help us ensure everyone knows where safety equipment is located!",
    location_name: "Campus Buildings",
    points: 10,
    difficulty: "easy",
    category: "safety",
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
