import type { Office, OpeningHours } from './types'

const WEEKDAYS: OpeningHours = { days: [1, 2, 3, 4, 5], open: '08:30', close: '16:30' }
const SATURDAY: OpeningHours = { days: [6], open: '09:00', close: '12:30' }

/** Guichets de proximité du réseau kolchi-fdarak. */
export const OFFICES: Office[] = [
  {
    id: 'maarif',
    name: 'Guichet Maârif',
    district: 'maarif',
    address: '27, rue Ibnou Mounir, Maârif',
    position: [33.5781, -7.6352],
    phone: '05 22 98 41 10',
    hours: [WEEKDAYS, SATURDAY],
    services: ['civil', 'certificates', 'reports', 'urbanism'],
  },
  {
    id: 'sidi-belyout',
    name: 'Guichet Sidi Belyout',
    district: 'sidi-belyout',
    address: '112, boulevard Mohammed V, Sidi Belyout',
    position: [33.5962, -7.6158],
    phone: '05 22 47 63 25',
    hours: [WEEKDAYS, SATURDAY],
    services: ['civil', 'certificates', 'tax', 'reports'],
  },
  {
    id: 'hay-hassani',
    name: 'Guichet Hay Hassani',
    district: 'hay-hassani',
    address: '58, boulevard Ghandi, Hay Hassani',
    position: [33.5612, -7.6588],
    phone: '05 22 93 17 52',
    hours: [WEEKDAYS],
    services: ['civil', 'certificates', 'reports'],
  },
  {
    id: 'ain-chock',
    name: 'Guichet Aïn Chock',
    district: 'ain-chock',
    address: '9, boulevard Al Qods, Aïn Chock',
    position: [33.5431, -7.5976],
    phone: '05 22 21 05 48',
    hours: [WEEKDAYS],
    services: ['civil', 'urbanism', 'reports'],
  },
  {
    id: 'hay-mohammadi',
    name: 'Guichet Hay Mohammadi',
    district: 'hay-mohammadi',
    address: '41, boulevard Ali Yata, Hay Mohammadi',
    position: [33.5884, -7.5532],
    phone: '05 22 62 84 30',
    hours: [WEEKDAYS, SATURDAY],
    services: ['civil', 'certificates', 'reports'],
  },
  {
    id: 'sidi-bernoussi',
    name: 'Guichet Sidi Bernoussi',
    district: 'sidi-bernoussi',
    address: '15, avenue Omar Ibn Al Khattab, Sidi Bernoussi',
    position: [33.6031, -7.4952],
    phone: '05 22 73 52 06',
    hours: [WEEKDAYS],
    services: ['civil', 'tax', 'reports'],
  },
  {
    id: 'ben-msick',
    name: "Guichet Ben M'Sick",
    district: 'ben-msick',
    address: '76, boulevard Driss El Harti, Ben M\'Sick',
    position: [33.5519, -7.5781],
    phone: '05 22 70 39 64',
    hours: [WEEKDAYS],
    services: ['civil', 'certificates', 'urbanism', 'reports'],
  },
]

export function getOffice(id: string): Office | undefined {
  return OFFICES.find((o) => o.id === id)
}
