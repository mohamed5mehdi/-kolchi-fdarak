import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

type Variant = 'primary' | 'secondary' | 'ghost'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800',
  secondary: 'border border-brand-700 bg-white text-brand-700 hover:bg-brand-50',
  ghost: 'text-brand-700 underline-offset-4 hover:underline px-2',
}

function buttonClass(variant: Variant = 'primary', extra = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim()
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  children,
  ...props
}: LinkProps & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, className)} {...props}>
      {children}
    </Link>
  )
}
