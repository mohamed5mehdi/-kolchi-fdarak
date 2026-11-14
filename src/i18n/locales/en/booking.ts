import type { Dict } from '../../types'

export const booking: Dict['booking'] = {
  title: 'Book an appointment',
  lead: 'Choose an office, a date and a time slot.',
  steps: {
    procedure: 'Procedure',
    office: 'Office',
    slot: 'Date and time',
    contact: 'Contact details',
    review: 'Check',
  },
  procedure: {
    title: 'Which procedure?',
    label: 'Procedure',
    choose: 'Choose a procedure',
    hint: 'Only procedures handled by appointment are listed.',
    error: 'Choose a procedure.',
  },
  office: {
    title: 'Which office?',
    legend: 'Offices handling this procedure',
    error: 'Choose an office.',
    notOffered: '{office} does not handle this procedure. Choose another office.',
  },
  slot: {
    title: 'Which day and time?',
    dateLabel: 'Date',
    dateHint: 'The office’s next 10 opening days.',
    slotLegend: 'Available times',
    error: 'Choose a time slot.',
    none: 'This office has no free time slot in its next 10 opening days. Choose another office.',
    taken: 'This time slot has just been booked. Choose another one.',
  },
  contact: {
    title: 'Your contact details',
    sample: 'The fields are filled in with a sample identity. Keep it: nothing is sent, so do not enter your real details.',
  },
  review: {
    title: 'Check your appointment',
    procedure: 'Procedure',
    office: 'Office',
    when: 'Date and time',
    contact: 'Contact details',
    confirm: 'Save the appointment',
  },
  when: '{date} at {slot}',
  done: {
    title: 'Appointment saved on this device',
    refLabel: 'Appointment reference',
    refHint: 'Keep this reference: you will need it to find your appointment.',
    bring: 'Documents usually requested (example)',
    arrive: 'This appointment only exists in this browser: no office is informed of it. For a real procedure, contact the relevant administration directly.',
    track: 'Track this appointment',
  },
}
