import type { ReactNode } from 'react'
import { CircleCheck, Info, TriangleAlert } from 'lucide-react'

type Tone = 'info' | 'warning' | 'success'

const STYLES: Record<Tone, string> = {
  info: 'border-brand-600 bg-brand-50',
  warning: 'border-warning-700 bg-warning-50',
  success: 'border-success-700 bg-success-50',
}

const ICONS: Record<Tone, ReactNode> = {
  info: <Info className="size-5 text-brand-700" />,
  warning: <TriangleAlert className="size-5 text-warning-700" />,
  success: <CircleCheck className="size-5 text-success-700" />,
}

export function Alert({ tone = 'info', title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  return (
    <div className={`flex gap-3 rounded-md border-s-4 p-4 ${STYLES[tone]}`}>
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {ICONS[tone]}
      </span>
      <div className="text-ink">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  )
}
