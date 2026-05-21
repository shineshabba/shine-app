import { UserX } from 'lucide-react'

/**
 * Экран для незарегистрированного юзера (API 404).
 * Показывает инструкцию /start в боте.
 * Никаких кнопок — юзер должен идти в бот (D-14).
 */
export function UnregisteredScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4 bg-[var(--tg-theme-secondary-bg-color)]">
      <UserX size={48} className="text-[var(--tg-theme-hint-color)]" aria-hidden="true" />
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">
          Аккаунт не найден
        </h1>
        <p className="text-base text-[var(--tg-theme-hint-color)]">
          Пройдите /start в боте @shine_connect_bot
        </p>
      </div>
    </div>
  )
}
