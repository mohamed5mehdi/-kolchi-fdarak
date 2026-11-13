import type { Report } from './types'

/**
 * Dossiers déjà enregistrés, consultables par référence.
 * Les dates sont relatives au jour courant pour que l'historique reste plausible.
 */
function daysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export function sampleReports(): Report[] {
  return [
    {
      ref: 'KF-2026-004817',
      category: 'road',
      district: 'maarif',
      street: 'Rue Ibnou Mounir, à hauteur du n° 40',
      position: [33.5772, -7.6338],
      description: "Nid-de-poule d'environ 60 cm sur la voie de droite, dangereux pour les deux-roues.",
      createdAt: daysAgo(9, 8, 42),
      status: 'scheduled',
      history: [
        { status: 'received', at: daysAgo(9, 8, 42) },
        { status: 'assigned', at: daysAgo(8, 11, 15), unit: 'roads' },
        { status: 'scheduled', at: daysAgo(3, 14, 5), unit: 'roads' },
      ],
    },
    {
      ref: 'KF-2026-003952',
      category: 'lighting',
      district: 'hay-hassani',
      street: 'Boulevard Ghandi, côté parc',
      position: [33.5601, -7.6564],
      description: 'Trois lampadaires éteints depuis une semaine, le trottoir est entièrement dans le noir.',
      createdAt: daysAgo(16, 19, 20),
      status: 'resolved',
      history: [
        { status: 'received', at: daysAgo(16, 19, 20) },
        { status: 'assigned', at: daysAgo(15, 9, 30), unit: 'lighting' },
        { status: 'scheduled', at: daysAgo(12, 10, 0), unit: 'lighting' },
        { status: 'resolved', at: daysAgo(10, 16, 45), unit: 'lighting' },
      ],
    },
    {
      ref: 'KF-2026-005108',
      category: 'cleanliness',
      district: 'sidi-belyout',
      street: 'Rue Tata, près du marché',
      position: [33.5948, -7.6141],
      description: 'Dépôt sauvage de gravats et de cartons sur le trottoir.',
      createdAt: daysAgo(2, 7, 55),
      status: 'assigned',
      history: [
        { status: 'received', at: daysAgo(2, 7, 55) },
        { status: 'assigned', at: daysAgo(1, 9, 10), unit: 'cleanliness' },
      ],
    },
    {
      ref: 'KF-2026-005231',
      category: 'water',
      district: 'ain-chock',
      street: 'Boulevard Al Qods, angle rue 12',
      position: [33.5422, -7.5991],
      description: "Bouche d'égout qui déborde après chaque pluie, l'eau stagne sur la chaussée.",
      createdAt: daysAgo(0, 9, 12),
      status: 'received',
      history: [{ status: 'received', at: daysAgo(0, 9, 12) }],
    },
    {
      ref: 'KF-2026-002674',
      category: 'green',
      district: 'anfa',
      street: 'Square face au lycée, boulevard d’Anfa',
      position: [33.5899, -7.6319],
      description: 'Branche cassée suspendue au-dessus de l’aire de jeux.',
      createdAt: daysAgo(31, 15, 0),
      status: 'closed',
      history: [
        { status: 'received', at: daysAgo(31, 15, 0) },
        { status: 'assigned', at: daysAgo(30, 8, 50), unit: 'green' },
        { status: 'resolved', at: daysAgo(28, 11, 20), unit: 'green' },
        { status: 'closed', at: daysAgo(21, 9, 0) },
      ],
    },
  ]
}
