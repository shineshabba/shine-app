import { SlidersHorizontal } from 'lucide-react'

interface HeaderProps {
  name: string
}

export function Header({ name }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-5 bg-[var(--bg)] border-b border-[var(--border)]">
      <span className="text-[15px] font-medium text-[var(--text)] tracking-tight truncate max-w-[75%]">
        {name}
      </span>
      <SlidersHorizontal size={17} className="text-[var(--faint)] flex-shrink-0" aria-hidden="true" />
    </header>
  )
}
