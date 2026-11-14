import type { ReportEvent, ReportStatus } from '../../data/types'

/** Cycle normal d'un signalement ; « clôturé » n'est affiché que s'il a eu lieu. */
export const CYCLE: ReportStatus[] = ['received', 'assigned', 'scheduled', 'resolved']

/** Étapes du cycle encore à venir après la plus avancée déjà atteinte. */
export function upcomingSteps(history: ReportEvent[]): ReportStatus[] {
  if (history.some((e) => e.status === 'closed')) return []
  const reached = Math.max(-1, ...history.map((e) => CYCLE.indexOf(e.status)))
  return CYCLE.slice(reached + 1)
}

/** Une date « jour » (AAAA-MM-JJ) est lue à midi pour ne pas changer de jour selon le fuseau. */
export function dayIso(day: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T12:00:00` : day
}
