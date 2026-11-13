import type { Dict } from '../../types'

export const guide: Dict['guide'] = {
  title: 'L9a lmastara li tsl7lek',
  lead: 'Jaweb 3la chi as2ila, w n9oulou lik lmastara li tsl7lek.',
  answersTitle: 'Ajwiba dyalek',
  restart: 'Bda mn jdid',
  chooseError: 'Khtar jawab.',
  resultTitle: 'Lmastara li khassek ddir',
  seeDetail: 'Chouf lbita9a',
  prepare: 'Wjjed ttalab dyali',
  book: 'Khod maw3id',
  questions: {
    start: {
      title: 'Ach bghiti ddir?',
      options: {
        report: 'Nbellegh 3la mochkil f zen9a',
        civil: 'Nakhod wti9a dyal l7ala lmadaniya',
        certify: 'Nsa77e7 l2imda2 wla ntaba9 nouskha m3a l2asl',
        works: 'Ndir chi khdma f ddar',
        address: 'Nbbet l3onwan dyali',
        other: 'Chi 7aja okhra',
      },
    },
    civil: {
      title: 'L chkoun?',
      options: {
        self: 'Lik nta',
        child: 'L weldek wla bentek',
        declare: 'Nsrre7 b lazdiyad',
      },
    },
    civilCopy: {
      title: 'Achmen wti9a khassatek?',
      options: {
        full: 'Nouskha kamla, b ga3 lbayanat',
        extract: 'Mostakhraj, l dossier 3adi',
      },
    },
    certify: {
      title: 'Ach bghiti tsa77e7?',
      options: {
        signature: 'L2imda2 dyali 3la wti9a',
        copy: 'Photocopies dyal lwata2i9',
        situation: '7ala chakhsiya (l7ayat, ttakaffol, l3zouba…)',
      },
    },
  },
  results: {
    report: {
      title: 'Bellegh 3la mochkil',
      body: '7ofra f triq, dow tafi, zbel mlo7: wsef lmochkil w 7ettou 3la lkharita. Ghadi ywselek raqm bach ttbe3 ach wqe3 fih.',
      link: 'Dir tabligh',
    },
    offices: {
      title: 'Sir l chi chebbak',
      body: 'Lmowadafin f chbabik l9orb ywjjhouk f lmasatir li ma kaynach hna.',
      link: 'Chouf chbabik',
    },
  },
}
