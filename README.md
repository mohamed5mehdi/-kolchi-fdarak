# kolchi-fdarak

Portail de services de proximité pour Casablanca : signaler un problème dans son quartier sur une carte, suivre son dossier avec un numéro de référence, trouver la bonne démarche, préparer ses pièces et prendre rendez-vous dans un guichet.

> **Projet portfolio indépendant.** Ce site n'est pas affilié à la Commune de Casablanca ni à aucune administration. Les signalements et rendez-vous ne sont transmis à personne : ils sont enregistrés uniquement dans le navigateur (`localStorage`). Les guichets, délais, frais et pièces indiqués sont des exemples. En cas de danger immédiat : 19 (police) ou 141 (SAMU).

## Fonctionnalités

| Parcours | Route | Contenu |
|---|---|---|
| Signalement | `/signaler` | Catégorie → emplacement sur la carte → description et coordonnées → vérification → référence `KF-AAAA-NNNNNN` |
| Suivi | `/suivi`, `/suivi/:ref` | Statut, historique daté par service, étapes à venir, dossiers déposés depuis l'appareil |
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
- **Aucune donnée envoyée.** Les dossiers passent par `src/state/` (`localStorage`). Une règle ESLint interdit `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, et un test (`src/test/noExternalCalls.test.ts`) refuse toute URL externe hors de `src/map/tiles.ts`.
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

## Sources et limites

- Numéros d'urgence vérifiés auprès de la MAP (agence de presse officielle) : 19 pour la police secours ([MAP, identité visuelle des véhicules de police, 2022](https://www.mapnews.ma/en/actualites/politics/national-police-adopts-new-visual-identity-vehicles), [bilan 2023 de la Sûreté nationale](https://www.mapnews.ma/fr/actualites/g%C3%A9n%C3%A9ral/bilan-2023-des-services-de-la-s%C3%BBret%C3%A9-nationale)) et 141 pour le SAMU ([MAP, « Allô SAMU 141 »](https://www.mapexpress.ma/actualite/societe-et-regions/coronavirus-ministere-sante-renforce-loutil-communication-lancement-dallo-samu-141/)). Le 15 (Protection civile), souvent cité, n'a pas pu être confirmé par une source officielle et n'est donc pas affiché.
- Les 16 arrondissements de Casablanca sont réels ; leurs centres sont approximatifs et servent seulement à pré-remplir le formulaire.
- Guichets « kolchi-fdarak », adresses de guichets, délais, frais et pièces : contenus d'exemple, sans valeur officielle.
- Principes d'ergonomie inspirés des services publics numériques (une question par écran, langage simple, récapitulatif avant envoi) ; aucun code, texte ni élément graphique repris.
- Les textes arabes et darija doivent être relus par un locuteur natif avant une mise en ligne publique.
- Tests d'accessibilité automatisés et vérifications clavier ; pas de test avec un lecteur d'écran réel à ce stade.

## Déploiement

Prévu sur Vercel (non effectué). `vercel.json` contient la réécriture des routes vers `index.html` et les en-têtes de sécurité (CSP stricte, `X-Frame-Options`, `Permissions-Policy`). La politique `Referrer-Policy: strict-origin-when-cross-origin` est volontaire : les serveurs de tuiles OpenStreetMap exigent un en-tête `Referer`.
