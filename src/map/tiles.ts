/**
 * Seule ressource externe du site : les tuiles cartographiques OpenStreetMap (images).
 * L'attribution est exigée par la licence ODbL et la politique d'usage des tuiles OSM.
 * Si cette URL change, mettre à jour la CSP (img-src) dans vercel.json.
 */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
