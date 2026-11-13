/** Insère une référence dans un texte traduit en la gardant isolée (chiffres latins, sens LTR en arabe). */
export function RefHeading({ template, value }: { template: string; value: string }) {
  const [before, after = ''] = template.split('{ref}')
  return (
    <>
      {before}
      <span className="ref">{value}</span>
      {after}
    </>
  )
}
