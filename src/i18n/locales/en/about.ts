import type { Dict } from '../../types'

export const about: Dict['about'] = {
  title: 'About this project',
  intro: 'kolchi-fdarak is a portfolio project by Mehdi: the design and development of a local services portal for Casablanca.',
  notAffiliatedTitle: 'What this site is not',
  notAffiliated:
    'This site is not a service of the City of Casablanca or of any public authority. Reports and appointments are not sent to anyone: they are stored only in your browser. The offices, timescales and documents shown are examples.',
  emergency: 'If there is immediate danger, call 19 (police) or 141 (ambulance).',
  goalsTitle: 'Goals',
  goals: {
    one: 'A complete report in under two minutes, on a phone.',
    two: 'Clear tracking from a single number, without a phone call.',
    three: 'An interface usable with a keyboard and screen readers, in French, Arabic, Darija and English.',
  },
  techTitle: 'How it was built',
  tech: 'React, TypeScript, Vite, Tailwind CSS, Leaflet and OpenStreetMap. Tested with Vitest, Testing Library and axe-core.',
  privacyTitle: 'Your data',
  privacy: 'Reports and appointments are saved only in this browser. They are deleted automatically 30 days after they were saved; an appointment is also deleted once its date has passed. The name, ID card number and phone number entered in the forms are never stored; apart from these records, only your language choice is remembered. Map backgrounds are loaded from OpenStreetMap, which sees your IP address and the area displayed. You can delete everything at any time.',
  clear: 'Delete my cases and appointments',
  confirmClear: 'Confirm deletion',
  confirmPrompt: 'The cases and appointments saved in this browser will be permanently deleted.',
  cleared: 'Your cases and appointments have been deleted from this browser.',
  clearFailed: 'The deletion could not be verified: storage in this browser is blocked. Delete the site data from your browser settings.',
}
