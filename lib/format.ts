export function formatPct(pct: number): string {
  return (pct * 100).toFixed(2) + '%';
}

export function genderEmoji(gender: string): string {
  return gender === 'boy' ? '👦' : '👧';
}

export function genderColor(gender: string): string {
  return gender === 'boy' ? 'text-blue-600' : 'text-pink-600';
}

export function genderBg(gender: string): string {
  return gender === 'boy' ? 'bg-blue-50' : 'bg-pink-50';
}
