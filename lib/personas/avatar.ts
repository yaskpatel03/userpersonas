// Deterministically maps a persona name to a randomuser.me portrait number (1–99)
// so the same persona always gets the same avatar across page loads.

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash)
}

export function getAvatarUrl(name: string, gender: 'male' | 'female'): string {
  const portraitNumber = (hashName(name) % 99) + 1
  const genderPath = gender === 'female' ? 'women' : 'men'
  return `https://randomuser.me/api/portraits/${genderPath}/${portraitNumber}.jpg`
}

// Infer gender from persona context heuristic — falls back to alternating
export function inferGender(name: string): 'male' | 'female' {
  const feminineNames = ['riya', 'amara', 'sarah', 'emma', 'aisha', 'priya', 'sofia', 'anna', 'lisa', 'maya']
  const lower = name.toLowerCase().split(' ')[0]
  return feminineNames.includes(lower) ? 'female' : 'male'
}
