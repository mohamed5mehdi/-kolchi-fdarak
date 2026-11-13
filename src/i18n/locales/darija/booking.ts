import type { Dict } from '../../types'

export const booking: Dict['booking'] = {
  title: 'Khod maw3id',
  lead: 'Khtar chchebbak, nhar w sa3a.',
  steps: {
    procedure: 'Lmastara',
    office: 'Chchebbak',
    slot: 'Nhar w sa3a',
    contact: 'Lma3loumat dyalek',
    review: 'Tt2kkid',
  },
  procedure: {
    title: 'L ina mastara?',
    label: 'Lmastara',
    choose: 'Khtar mastara',
    hint: 'Kayban ghir lmasatir li katdar b maw3id.',
    error: 'Khtar mastara.',
  },
  office: {
    title: 'F ina chebbak?',
    legend: 'Chbabik li kaydirou had lmastara',
    error: 'Khtar chebbak.',
    notOffered: '{office} ma kaydirch had lmastara. Khtar chebbak akhor.',
  },
  slot: {
    title: 'Ina nhar w ina sa3a?',
    dateLabel: 'Nhar',
    dateHint: 'L3echra d ayyam jayin li kaykoun fihom chchebbak m7loul.',
    slotLegend: 'Lw9at li khawyin',
    error: 'Khtar sa3a.',
    none: 'Had chchebbak ma b9a fih ta w9t khawi f l3echra d ayyam jayin. Khtar chebbak akhor.',
    taken: 'Had sa3a ba3da t7jzat daba. Khtar chi w9t akhor.',
  },
  contact: {
    title: 'Lma3loumat dyalek',
    sample: 'Lkhanat 3amrin b hawiya dyal lmital. Beddelha b dyalek.',
  },
  review: {
    title: 'T2kked mn lmaw3id dyalek',
    procedure: 'Lmastara',
    office: 'Chchebbak',
    when: 'Nhar w sa3a',
    contact: 'Lma3loumat dyalek',
    confirm: 'Akked lmaw3id',
  },
  when: '{date} m3a {slot}',
  done: {
    title: 'Lmaw3id t2akked',
    refLabel: 'Raqm lmaw3id',
    refHint: 'Ktbo 3ndek: bih tl9a lmaw3id dyalek.',
    bring: 'Lwata2i9 li khassek tjib',
    arrive: 'Ji 9bel lmaw3id b 10 d9aye9.',
    track: 'Tbe3 had lmaw3id',
  },
}
