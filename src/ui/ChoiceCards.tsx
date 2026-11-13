import type { ReactNode } from 'react'

export interface Choice<T extends string> {
  value: T
  label: string
  description?: string
  icon?: ReactNode
}

/** Groupe de boutons radio présentés en cartes. Navigation native aux flèches. */
export function ChoiceCards<T extends string>({
  name,
  legend,
  choices,
  value,
  onChange,
  error,
  columns = 2,
}: {
  name: string
  legend: string
  choices: Choice<T>[]
  value: T | null
  onChange: (value: T) => void
  error?: string
  columns?: 1 | 2 | 3
}) {
  const errorId = error ? `${name}-error` : undefined
  const grid = columns === 1 ? '' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
  return (
    <fieldset id={name} tabIndex={-1} aria-describedby={errorId} className="focus:outline-none">
      <legend className="mb-3 text-lg font-semibold text-ink">{legend}</legend>
      {error && (
        <p id={errorId} className="mb-2 text-sm font-semibold text-danger-700">
          {error}
        </p>
      )}
      <div className={`grid gap-3 ${grid}`}>
        {choices.map((c) => {
          const id = `${name}-${c.value}`
          const checked = value === c.value
          return (
            <label
              key={c.value}
              htmlFor={id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border bg-white p-4 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 ${
                checked ? 'border-brand-700 ring-2 ring-brand-700' : 'border-line-strong hover:border-brand-600'
              }`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={c.value}
                checked={checked}
                onChange={() => onChange(c.value)}
                className="mt-1 size-4 accent-brand-700 focus-visible:outline-none"
              />
              {c.icon && <span className="mt-0.5 text-brand-700" aria-hidden="true">{c.icon}</span>}
              <span>
                <span className="block font-semibold text-ink">{c.label}</span>
                {c.description && <span className="mt-0.5 block text-sm text-ink-soft">{c.description}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
