import { createClient as createServerClient } from '@supabase/supabase-js'

const sampleMissions = [
  {
    title: 'Mission 1: Team Selfie',
    description:
      'Location: DBUU Main Gate. Take one selfie with your entire team. Every team member must be visible. Submission: Camera access or gallery upload. Reward: 1 Flag. Estimated time: 5 minutes.',
    location_name: 'DBUU Main Gate',
    points: 10,
    difficulty: 'easy',
    category: 'team',
    requires_photo: true,
    requires_gps: false,
    is_active: true,
  },
  {
    title: 'Mission 2: Find the Building',
    description:
      'Locations: Engineering Block, Pharmacy Block, Management Block. Admin can assign one building to each team. Visit the assigned building and take one team photo in front of it. Submission: Photo upload. Optional GPS verification. Reward: 1 Flag. Estimated time: 8 minutes.',
    location_name: 'Assigned Building',
    points: 10,
    difficulty: 'easy',
    category: 'building',
    requires_photo: true,
    requires_gps: true,
    is_active: true,
  },
  {
    title: 'Mission 3: Meet a Professor',
    description:
      'Location: Management Department. Meet any faculty member from the Management Department and take one group photo together. Submission: Photo upload. Reward: 2 Flags. Estimated time: 10 minutes.',
    location_name: 'Management Department',
    points: 20,
    difficulty: 'medium',
    category: 'faculty',
    requires_photo: true,
    requires_gps: false,
    is_active: true,
  },
  {
    title: 'Mission 4: Canteen Hunt',
    description:
      'Task: Visit the campus canteen and take one creative team selfie. Bonus: Write your favourite food item. Submission: Photo upload with optional text. Reward: 1 Flag. Estimated time: 5 minutes.',
    location_name: 'Campus Canteen',
    points: 10,
    difficulty: 'easy',
    category: 'canteen',
    requires_photo: true,
    requires_gps: false,
    is_active: true,
  },
  {
    title: 'Mission 5: Campus Reel',
    description:
      'Requirement: Create a 15–20 second reel. Theme: First Impression of DBUU. Suggested shots: Main Gate, Friends, Campus Walk, Academic Block. Submission: Video upload. Maximum length 30 seconds. Reward: 3 Flags.',
    location_name: 'Around Campus',
    points: 30,
    difficulty: 'hard',
    category: 'creative',
    requires_photo: true,
    requires_gps: false,
    is_active: true,
  },
  {
    title: 'Mission 6: Plant Explorer',
    description:
      'Task: Identify three different plants or trees on campus and upload one clear photo of each. Display progress: 1/3, 2/3, 3/3. Reward: 2 Flags. Estimated time: 15 minutes.',
    location_name: 'Campus Grounds',
    points: 20,
    difficulty: 'medium',
    category: 'nature',
    requires_photo: true,
    requires_gps: false,
    is_active: true,
  },
  {
    title: 'Mission 7: Safety First',
    description:
      'Task: Locate any one of the following: Fire Extinguisher, Emergency Exit, First Aid Box. Upload one clear photo. Reward: 1 Flag. Estimated time: 5 minutes.',
    location_name: 'Campus Safety Zone',
    points: 10,
    difficulty: 'easy',
    category: 'safety',
    requires_photo: true,
    requires_gps: false,
    is_active: true,
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
