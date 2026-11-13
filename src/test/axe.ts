import axe from 'axe-core'

/**
 * Lance axe-core sur un rendu et renvoie les violations sous forme lisible (« règle : sélecteurs »).
 * Contrastes exclus : jsdom ne calcule pas les styles ; ils sont vérifiés dans le navigateur.
 */
export async function axeViolations(container: Element): Promise<string[]> {
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  })
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}
