import type { Dict } from '../../types'

export const tracking: Dict['tracking'] = {
  title: 'Tbe3 dossier',
  lead: 'Kteb lmarje3 li khditi mlli bellghti wla khditi maw3id.',
  form: {
    label: 'Lmarje3 dyal dossier',
    hint: 'Matalan: KF-2026-004817 l ttabligh, RDV-2026-000213 l lmaw3id.',
    error: 'Had chi li ktebti machi marje3. Lmarje3 kaybda b KF wla RDV, w mn mourah l3am w chi raqm.',
  },
  report: {
    heading: 'Ttabligh {ref}',
    status: 'L7ala',
    category: 'Lfi2a',
    district: 'Lmo9ata3a',
    street: 'Zenqa wla 3alama',
    createdAt: 'Tsejjel nhar',
    description: 'Lwasf',
    historyTitle: 'Lmara7il',
    upcoming: 'Jaya',
    mapLabel: 'Kharita: lblasa li tbellegh 3liha',
    byDevice: 'Msejjel f had lappareil — ma katsifet l 7ta idara. Ghadi ytms7 bou7do nhar {date}.',
    frozen: 'Lwad3iya dyal had dossier ma ghadi tbeddel ch: ma tsifet l 7ta maslaha.',
    sample: 'Dossier dyal lmital: ttarikh li baynin ghir mital, 7ta maslaha 7a9i9iya ma tdekhlat.',
  },
  appointment: {
    heading: 'Lmaw3id {ref}',
    procedure: 'Lmastara',
    office: 'Chbbak',
    date: 'Tarikh',
    slot: 'Sa3a',
    bring: 'Had lmaw3id kayn ghir f had navigateur: 7ta chebbak ma 3ndo khbar bih. Ila bghiti tdir lmastara b s7, sir nichan l lidara lm3niya.',
  },
  notFound: {
    title: 'Ma kayn 7ta dossier b {ref}',
    check: 'Tte7a9 mn chi li ktebti: marje3 ttabligh b7al KF-2026-004817, w marje3 lmaw3id b7al RDV-2026-000213.',
    delay: 'Ghir dossiers li msejjlin f had navigateur, w dossiers dyal lmital, li t9der tl9ahom hna.',
  },
  device: {
    title: 'F had lappareil',
    lead: 'Tablighat w lmawa3id li msejjlin f had navigateur.',
    reports: 'Tablighat dyali',
    appointments: 'Lmawa3id dyali',
    slotAt: '{date} m3a {slot}',
    empty: 'Ma kayn 7ta dossier msejjel f had lappareil. Tablighat w lmawa3id li ghadi tdir mn hna ghadi ybanou f had lista.',
  },
}
