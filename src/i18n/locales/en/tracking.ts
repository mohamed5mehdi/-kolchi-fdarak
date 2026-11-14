import type { Dict } from '../../types'

export const tracking: Dict['tracking'] = {
  title: 'Track a case',
  lead: 'Enter the reference you received when reporting or booking.',
  form: {
    label: 'Case reference',
    hint: 'For example: KF-2026-004817 for a report, RDV-2026-000213 for an appointment.',
    error: 'This is not a valid reference. It starts with KF or RDV, followed by the year and a number.',
  },
  report: {
    heading: 'Report {ref}',
    status: 'Status',
    category: 'Category',
    district: 'District',
    street: 'Street or landmark',
    createdAt: 'Recorded on',
    description: 'Description',
    historyTitle: 'History',
    upcoming: 'Upcoming',
    mapLabel: 'Map: reported location',
    byDevice: 'Saved on this device — not sent to any administration. Automatically deleted on {date}.',
    frozen: 'The status of this case will not change: it has not been sent to any service.',
    sample: 'Sample case: the history shown is illustrative, no real service has been involved.',
  },
  appointment: {
    heading: 'Appointment {ref}',
    procedure: 'Service',
    office: 'Office',
    date: 'Date',
    slot: 'Time',
    bring: 'This appointment only exists in this browser: no office is informed of it. For a real procedure, contact the relevant administration directly.',
  },
  notFound: {
    title: 'No case matches {ref}',
    check: 'Check what you entered: a report reference looks like KF-2026-004817, an appointment reference like RDV-2026-000213.',
    delay: 'Only cases saved in this browser, and sample cases, can be found here.',
  },
  device: {
    title: 'On this device',
    lead: 'Reports and appointments saved in this browser.',
    reports: 'My reports',
    appointments: 'My appointments',
    slotAt: '{date} at {slot}',
    empty: 'No cases saved on this device. Reports and appointments you make here will appear in this list.',
  },
}
