# kolchi-fdarak

Portail de services de proximité pour Casablanca : signaler un problème dans son quartier sur une carte, suivre son dossier avec un numéro de référence, trouver la bonne démarche, préparer ses pièces et prendre rendez-vous dans un guichet.

> **Projet portfolio indépendant.** Ce site n'est pas affilié à la Commune de Casablanca ni à aucune administration. Les signalements et rendez-vous ne sont transmis à personne : ils sont enregistrés uniquement dans le navigateur (`localStorage`). Les guichets, délais, frais et pièces indiqués sont des exemples. En cas de danger immédiat : 19 (police) ou 141 (SAMU).

## Fonctionnalités

| Parcours | Route | Contenu |
|---|---|---|
| Signalement | `/signaler` | Catégorie → emplacement sur la carte → description et coordonnées → vérification → référence `KF-AAAA-NNNNNN` |
| Suivi | `/suivi`, `/suivi/:ref` | Dossiers et rendez-vous enregistrés sur l'appareil (statut figé, date d'effacement), dossiers d'exemple avec un historique illustratif |
| Démarches | `/demarches`, `/demarches/:id` | Catalogue avec recherche et filtres, fiche (pièces, délai, frais, guichets) |
| Préparer une demande | `/demarches/:id/preparer` | Liste de pièces à cocher, récapitulatif imprimable |
| Rendez-vous | `/rendez-vous` | Démarche → guichet → date et créneau → coordonnées → référence `RDV-AAAA-NNNNNN` |
| Orientation | `/orientation` | Questions guidées menant à la bonne démarche |
| Guichets | `/guichets` | Carte et liste filtrable, horaires, ouvert/fermé en temps réel |

Langues : français (par défaut), arabe (interface de droite à gauche), darija en écriture latine, anglais.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Contrôle de types puis build de production dans `dist/` |
| `npm run preview` | Sert `dist/` avec les mêmes en-têtes de sécurité que la production |
| `npm test` | Tests (Vitest + Testing Library + axe-core) |
| `npm run typecheck` | `tsc` seul |
| `npm run lint` | ESLint |

Node 22.22 ou plus récent.

## Choix techniques

- **React 19, TypeScript strict, Vite, Tailwind CSS 4, React Router.** Pas de framework serveur : le site est entièrement statique.
- **Leaflet + react-leaflet** pour la carte, fond **OpenStreetMap**. C'est la seule ressource chargée depuis l'extérieur (images de tuiles) ; elle est autorisée explicitement dans la CSP (`vercel.json`) et l'attribution exigée par la licence ODbL reste affichée sur la carte.
- **Aucune donnée envoyée.** Les dossiers passent par `src/state/` (`localStorage`). Une règle ESLint interdit `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, et un test (`src/test/noExternalCalls.test.ts`) refuse ces mêmes appels ainsi que toute URL externe (`https://…` ou relative au protocole `//…`) hors de `src/map/tiles.ts`.
- **Traductions typées.** `src/i18n/locales/<langue>/<module>.ts` ; le français est la source, le typage et `dictionaries.test.ts` imposent les mêmes clés et variables dans les quatre langues.
- **Accessibilité.** Lien d'évitement, focus déplacé à chaque changement de page et d'étape, récapitulatif d'erreurs relié aux champs, statuts jamais signalés par la couleur seule, carte utilisable au clavier (flèches, +/−, bouton « Placer le repère au centre de la carte »), axe-core sur chaque écran dans les tests.

## Structure

```
src/
  app/        routes, en-tête, pied de page, erreurs
  ui/         composants partagés (champs, étapes, statuts, alertes)
  map/        carte Leaflet et tuiles
  data/       arrondissements, guichets, dossiers existants, types
  state/      signalements et rendez-vous (localStorage)
  lib/        références, validation CIN/téléphone, stockage
  i18n/       moteur de traduction et dictionnaires
  features/   un dossier par parcours (report, tracking, services, booking, guide, offices, home, about)
  test/       configuration, carte simulée pour jsdom, aide axe
```

## Données et confidentialité

Ce site n'est pas un vrai service administratif : rien de ce qui y est saisi n'est transmis à une administration, et aucun guichet n'est informé d'un rendez-vous.

**Ce qui est stocké**, uniquement dans le `localStorage` du navigateur :

| Clé | Contenu |
|---|---|
| `kolchi-fdarak:reports` | Signalements de cet appareil : `ref`, `category`, `district`, `street`, `position` (latitude, longitude), `description`, `createdAt`, `status`, `history` |
| `kolchi-fdarak:appointments` | Rendez-vous de cet appareil : `ref`, `officeId`, `procedureId`, `date`, `slot`, `createdAt` |
| `kolchi-fdarak:lang` | Langue choisie |

**Ce qui n'est jamais stocké** : le nom, la CIN (ni complète ni masquée) et le téléphone. Ces champs servent seulement à la validation du formulaire (`invalidReportFields`, `invalidAppointmentFields`) ; ils sont pré-remplis avec une identité d'exemple que l'interface invite à garder. Une entrée d'une version antérieure qui contiendrait encore une propriété `contact` est réécrite sans elle à la lecture suivante.

**Durée de conservation** (`RETENTION_DAYS = 30`) : un signalement est effacé 30 jours après sa création ; un rendez-vous est effacé dès que sa date est passée (jour calendaire de Casablanca) et au plus tard 30 jours après sa création. La purge a lieu à chaque lecture du stockage (chargement de la page, événement `storage`, enregistrement) ; la clé n'est réécrite que si une entrée a été retirée ou migrée, pour ne pas déclencher de boucle d'événements entre onglets. Un onglet resté ouvert garde l'affichage jusqu'à sa prochaine lecture.

**Effacement** : la page « À propos » propose une suppression en deux temps (« Effacer… », puis « Confirmer la suppression » ou « Annuler »). Les clés sont supprimées avec `removeItem`, puis la suppression est vérifiée (`getItem` doit renvoyer `null`) ; si ce n'est pas le cas, un message d'échec s'affiche au lieu d'un faux succès. La préférence de langue (`kolchi-fdarak:lang`) n'est pas concernée. L'utilisateur peut aussi supprimer les données du site depuis les réglages de son navigateur.

**Fonds de carte** : les tuiles sont chargées depuis `tile.openstreetmap.org`, fournisseur externe. Le serveur de tuiles voit l'adresse IP du visiteur, l'en-tête `Referer` et la zone affichée. Le projet ne contrôle ni sa disponibilité ni ses conditions d'usage ; ce service communautaire n'est pas adapté à un fort trafic, et une mise en ligne à grande échelle exigerait un fournisseur de tuiles dédié.

**Concurrence** : chaque enregistrement relit le stockage juste avant d'écrire (pas d'écrasement d'un dossier enregistré dans un autre onglet, créneau déjà pris refusé) et chaque onglet se met à jour sur l'événement `storage`. Il n'y a en revanche **aucun verrou entre onglets** : deux onglets qui enregistrent à la même milliseconde peuvent encore se marcher dessus. L'API Web Locks n'est pas utilisée : elle rendrait l'enregistrement asynchrone pour un gain faible dans ce contexte. Rien n'est partagé entre appareils ou navigateurs, et **aucune réservation n'est garantie** : un vrai service de rendez-vous exigerait un serveur faisant autorité.

## Sources et limites

- Numéros d'urgence vérifiés auprès de la MAP (agence de presse officielle) : 19 pour la police secours ([MAP, identité visuelle des véhicules de police, 2022](https://www.mapnews.ma/en/actualites/politics/national-police-adopts-new-visual-identity-vehicles), [bilan 2023 de la Sûreté nationale](https://www.mapnews.ma/fr/actualites/g%C3%A9n%C3%A9ral/bilan-2023-des-services-de-la-s%C3%BBret%C3%A9-nationale)) et 141 pour le SAMU ([MAP, « Allô SAMU 141 »](https://www.mapexpress.ma/actualite/societe-et-regions/coronavirus-ministere-sante-renforce-loutil-communication-lancement-dallo-samu-141/)). Le 15 (Protection civile), souvent cité, n'a pas pu être confirmé par une source officielle et n'est donc pas affiché.
- Les 16 arrondissements de Casablanca sont réels ; leurs centres sont approximatifs et servent seulement à pré-remplir le formulaire.
- Guichets « kolchi-fdarak », adresses de guichets, délais, frais et pièces : contenus d'exemple, sans valeur officielle.
- Les dossiers affichés sur l'accueil et consultables par référence (par exemple `KF-2026-004817`) sont des exemples : leur historique est illustratif, aucun service réel n'est intervenu. Un dossier enregistré sur l'appareil garde le statut « Reçu » : il n'est transmis à aucun service.
- Aucun SMS, courriel ni accusé de réception n'est envoyé ; le téléphone saisi n'est ni utilisé ni conservé.
- Pas de backend : pas de comptes, pas de synchronisation entre appareils, pas de garantie de réservation (voir « Concurrence » ci-dessus).
- Principes d'ergonomie inspirés des services publics numériques (une question par écran, langage simple, récapitulatif avant enregistrement) ; aucun code, texte ni élément graphique repris.
- Les textes arabes et darija doivent être relus par un locuteur natif avant une mise en ligne publique.
- Tests d'accessibilité automatisés et vérifications clavier ; pas de test avec un lecteur d'écran réel à ce stade.

## Déploiement

Prévu sur Vercel (non effectué). `vercel.json` contient la réécriture des routes vers `index.html` et les en-têtes de sécurité (CSP stricte, `X-Frame-Options`, `Permissions-Policy`). La politique `Referrer-Policy: strict-origin-when-cross-origin` est volontaire : les serveurs de tuiles OpenStreetMap exigent un en-tête `Referer`.
