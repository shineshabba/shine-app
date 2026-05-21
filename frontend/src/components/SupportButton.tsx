import { Headphones } from 'lucide-react'

interface SupportButtonProps {
  onOpen: () => void
}

export function SupportButton({ onOpen }: SupportButtonProps) {
  return (
    <div className="mx-4 flex justify-center">
      <button
        onClick={onOpen}
        className="flex items-center gap-2 min-h-[44px] px-4 text-base text-[var(--tg-theme-link-color)]"
        style={{ background: 'none' }}
        aria-label="Открыть поддержку"
      >
        <Headphones size={18} aria-hidden="true" />
        Поддержка
      </button>
    </div>
  )
}
