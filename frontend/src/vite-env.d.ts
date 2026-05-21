/// <reference types="vite/client" />

interface Window {
  Telegram?: {
    WebApp: {
      initData: string
      initDataUnsafe: Record<string, unknown>
      themeParams: Record<string, string>
      ready: () => void
      close: () => void
      openTelegramLink: (url: string) => void
    }
  }
}
