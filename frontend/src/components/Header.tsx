import { Settings2 } from 'lucide-react'

interface HeaderProps {
  name: string
}

export function Header({ name }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-[var(--tg-theme-bg-color)]"
      style={{ borderBottom: '1px solid color-mix(in srgb, var(--tg-theme-hint-color) 20%, transparent)' }}
    >
      <span
        className="text-xl font-semibold text-[var(--tg-theme-text-color)] truncate max-w-[75%]"
        aria-label={`Пользователь: ${name}`}
      >
        {name}
      </span>
      <Settings2
        size={24}
        className="text-[var(--tg-theme-hint-color)] flex-shrink-0"
        aria-hidden="true"
      />
    </header>
  )
}
