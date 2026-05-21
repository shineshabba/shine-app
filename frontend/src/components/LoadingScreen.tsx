/**
 * Экран загрузки — CSS-спиннер.
 * Показывается пока оба /api/me и /api/config в полёте.
 * aria-label на русском (FE-06).
 */
export function LoadingScreen() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center bg-[var(--tg-theme-secondary-bg-color)]"
      role="status"
      aria-label="Загрузка..."
    >
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--tg-theme-hint-color)] opacity-25" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--tg-theme-button-color)]"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
