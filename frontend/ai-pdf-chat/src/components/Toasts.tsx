import type { Toast } from '../useChat'

export function Toasts({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null
  return (
    <div className="toasts">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
      ))}
    </div>
  )
}
