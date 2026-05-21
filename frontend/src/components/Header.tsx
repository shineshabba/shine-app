import { Users } from 'lucide-react'

interface HeaderProps {
  name: string
  isAdmin?: boolean
  onAdminOpen?: () => void
}

export function Header({ name, isAdmin, onAdminOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-5 bg-[var(--bg)] border-b border-[var(--border)]">
      <span className="text-[15px] font-medium text-[var(--text)] tracking-tight truncate max-w-[75%]">
        {name}
      </span>
      {isAdmin && (
        <button
          onClick={onAdminOpen}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] text-[var(--muted)] flex-shrink-0"
          style={{ background: 'none' }}
          aria-label="Открыть панель администратора"
        >
          <Users size={15} />
        </button>
      )}
    </header>
  )
}
