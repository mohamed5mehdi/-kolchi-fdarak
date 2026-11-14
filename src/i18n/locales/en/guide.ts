import type { Dict } from '../../types'

export const guide: Dict['guide'] = {
  title: 'Find the right procedure',
  lead: 'Answer a few questions and we will point you to the right procedure.',
  answersTitle: 'Your answers',
  restart: 'Start again',
  chooseError: 'Choose an answer.',
  resultTitle: 'What to do',
  seeDetail: 'See the details',
  prepare: 'Prepare my application',
  book: 'Book an appointment',
  questions: {
    start: {
      title: 'What would you like to do?',
      options: {
        report: 'Report a problem in the street',
        civil: 'Get a civil status record',
        certify: 'Have a signature or a copy certified',
        works: 'Carry out works at home',
        address: 'Prove your address',
        other: 'Something else',
      },
    },
    civil: {
      title: 'Who is it for?',
      options: {
        self: 'For yourself',
        child: 'For your child',
        declare: 'Register a birth',
      },
    },
    civilCopy: {
      title: 'Which document do you need?',
      options: {
        full: 'A full copy, with all notes',
        extract: 'An extract, for a routine application',
      },
    },
    certify: {
      title: 'What needs certifying?',
      options: {
        signature: 'My signature on a document',
        copy: 'Photocopies of documents',
        situation: 'A personal situation (proof of life, financial support, single status…)',
      },
    },
  },
  results: {
    report: {
      title: 'Report a problem',
      body: 'Pothole, broken street light, fly-tipping: describe the problem and place it on the map. You get a reference to find the case again on this device.',
      link: 'Make a report',
    },
    offices: {
      title: 'Go to a service office',
      body: 'Staff at the local service offices can guide you for procedures not listed here.',
      link: 'See the offices',
    },
  },
}
