interface ErrorScreenProps {
  onRetry: () => void
  message?: string
}

export function ErrorScreen({ onRetry, message }: ErrorScreenProps) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-5 px-6 bg-[var(--bg)]">
      <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center">
        <span className="text-[var(--muted)] text-lg leading-none">!</span>
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-[15px] font-medium text-[var(--text)]">
          Не удалось загрузить данные
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          {message ?? 'Проверьте соединение и попробуйте снова'}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="mt-1 h-10 px-8 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] text-[13px] font-medium"
        aria-label="Повторить загрузку"
      >
        Повторить
      </button>
    </div>
  )
}
