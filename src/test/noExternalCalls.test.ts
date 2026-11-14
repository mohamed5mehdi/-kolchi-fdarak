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
  ['EventSource', /EventSource/],
  ['navigator.sendBeacon', /sendBeacon/],
  ['URL http(s)://', /https?:\/\//],
  // « //tile.example.org/… » : URL relative au protocole, chargée en http(s) selon la page.
  ['URL //domaine', /["'`]\/\/[a-z0-9.-]+\.[a-z]{2,}/i],
]

/** Exceptions explicites « fichier:motif ». Seules les tuiles OpenStreetMap sont chargées depuis l'extérieur. */
const ALLOWLIST: string[] = ['/src/map/tiles.ts:URL http(s)://']

const labels = FORBIDDEN.map(([label]) => label)

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
    const bad = {
      a: 'await fetch("/x")',
      b: 'new XMLHttpRequest()',
      c: 'new WebSocket(u)',
      d: 'navigator.sendBeacon(u)',
      e: '"https://x.invalid"',
      f: 'new EventSource("/flux")',
      g: "const u = '//tile.example.org/{z}/{x}/{y}.png'",
      h: 'const u = `//cdn.example.com/a.js`',
    }
    expect(violations(bad)).toHaveLength(8)
  })

  it('ne confond pas un commentaire ou un chemin local avec une URL externe', () => {
    expect(violations({ a: '// Commentaire : voir src/state/', b: 'navigate("/suivi")', c: "import x from './a.ts'" })).toEqual([])
  })

  it('la liste blanche ne contient que des fichiers et motifs existants, et reste limitée aux tuiles', () => {
    for (const entry of ALLOWLIST) {
      const cut = entry.indexOf(':')
      const [file, label] = [entry.slice(0, cut), entry.slice(cut + 1)]
      expect(Object.keys(sources)).toContain(file)
      expect(labels).toContain(label)
      // Une exception qui ne correspond plus à rien doit être retirée.
      expect(FORBIDDEN.find(([l]) => l === label)![1].test(sources[file])).toBe(true)
    }
    expect(ALLOWLIST).toEqual(['/src/map/tiles.ts:URL http(s)://'])
  })

  it('aucun fichier source ne contacte de service externe', () => {
    expect(violations(sources)).toEqual([])
  })
})
