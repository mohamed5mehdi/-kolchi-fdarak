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
    createdAt: 'Submitted on',
    description: 'Description',
    historyTitle: 'History',
    upcoming: 'Upcoming',
    mapLabel: 'Map: reported location',
    byDevice: 'Submitted from this device by {name} · ID card {cin}',
  },
  appointment: {
    heading: 'Appointment {ref}',
    procedure: 'Service',
    office: 'Office',
    date: 'Date',
    slot: 'Time',
    bring: 'Arrive 10 minutes early with your ID card and the documents requested.',
  },
  notFound: {
    title: 'No case matches {ref}',
    check: 'Check what you entered: a report reference looks like KF-2026-004817, an appointment reference like RDV-2026-000213.',
    delay: 'A report made at an office can take up to 24 hours to appear here.',
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
