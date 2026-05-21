export function UnregisteredScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 bg-[var(--bg)]">
      <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center">
        <span className="text-[var(--muted)] text-base leading-none">?</span>
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-[15px] font-medium text-[var(--text)]">
          Аккаунт не найден
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Пройдите /start в боте @shine_connect_bot
        </p>
      </div>
    </div>
  )
}
