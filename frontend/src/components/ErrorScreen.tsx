import { WifiOff } from 'lucide-react'

interface ErrorScreenProps {
  onRetry: () => void
  message?: string
}

/**
 * Экран ошибки — сетевые ошибки и 5xx.
 * onRetry — callback для повторного запроса (FE-08, D-17).
 */
export function ErrorScreen({ onRetry, message }: ErrorScreenProps) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4 bg-[var(--tg-theme-secondary-bg-color)]">
      <WifiOff size={48} className="text-[var(--tg-theme-hint-color)]" aria-hidden="true" />
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">
          Не удалось загрузить данные
        </h1>
        <p className="text-base text-[var(--tg-theme-hint-color)]">
          {message ?? 'Проверьте соединение и попробуйте снова'}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="mt-2 h-12 px-8 rounded-xl bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] text-base font-semibold"
        aria-label="Повторить загрузку"
      >
        Повторить
      </button>
    </div>
  )
}
