import { describe, expect, it } from 'vitest'

// Le projet n'embarque pas @types/node : on lit le texte brut des sources via import.meta.glob.
const sources = import.meta.glob(['/src/**/*.{ts,tsx}', '!/src/**/*.test.{ts,tsx}', '!/src/test/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const FORBIDDEN: Array<[string, RegExp]> = [
  ['fetch(', /\bfetch\s*\(/],
  ['XMLHttpRequest', /XMLHttpRequest/],
  ['WebSocket', /WebSocket/],
  ['navigator.sendBeacon', /sendBeacon/],
  ['URL http(s)://', /https?:\/\//],
]

/** Exceptions explicites « fichier:motif ». Seules les tuiles OpenStreetMap sont chargées depuis l'extérieur. */
const ALLOWLIST: string[] = ['/src/map/tiles.ts:URL http(s)://']

function violations(files: Record<string, string>): string[] {
  const found: string[] = []
  for (const [file, content] of Object.entries(files)) {
    for (const [label, re] of FORBIDDEN) {
      if (re.test(content) && !ALLOWLIST.includes(`${file}:${label}`)) found.push(`${file}: ${label}`)
    }
  }
  return found
}

describe('garde-fou : aucune donnée envoyée à un serveur', () => {
  it('analyse réellement les sources du projet', () => {
    expect(Object.keys(sources)).toContain('/src/state/reports.ts')
    expect(Object.keys(sources)).toContain('/src/map/tiles.ts')
  })

  it('détecte chaque motif interdit', () => {
    const bad = { a: 'await fetch("/x")', b: 'new XMLHttpRequest()', c: 'new WebSocket(u)', d: 'navigator.sendBeacon(u)', e: '"https://x.invalid"' }
    expect(violations(bad)).toHaveLength(5)
  })

  it('aucun fichier source ne contacte de service externe', () => {
    expect(violations(sources)).toEqual([])
  })
})
