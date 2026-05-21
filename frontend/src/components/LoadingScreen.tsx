export function LoadingScreen() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center bg-[var(--bg)]"
      role="status"
      aria-label="Загрузка..."
    >
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
        <div
          className="absolute inset-0 rounded-full border border-transparent border-t-[var(--text)]"
          style={{ animation: 'spin 0.75s linear infinite' }}
        />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
