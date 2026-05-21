import { Headphones } from 'lucide-react'

interface SupportButtonProps {
  onOpen: () => void
}

export function SupportButton({ onOpen }: SupportButtonProps) {
  return (
    <div className="mx-4 flex justify-center">
      <button
        onClick={onOpen}
        className="flex items-center gap-2 min-h-[44px] px-4 text-[13px] text-[var(--muted)]"
        style={{ background: 'none' }}
        aria-label="Открыть поддержку"
      >
        <Headphones size={15} aria-hidden="true" />
        Поддержка
      </button>
    </div>
  )
}
