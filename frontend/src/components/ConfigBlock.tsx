import { useState } from 'react'
import { Copy, Check, QrCode } from 'lucide-react'

interface ConfigBlockProps {
  vlessUrl: string
  onShowQr: () => void
}

export function ConfigBlock({ vlessUrl, onShowQr }: ConfigBlockProps) {
  const [copied, setCopied] = useState(false)

  const truncatedUrl = vlessUrl.length > 43
    ? vlessUrl.slice(0, 40) + '…'
    : vlessUrl

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vlessUrl)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = vlessUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="mx-4 rounded-2xl p-4 bg-[var(--tg-theme-bg-color)]"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      role="region"
      aria-label="Блок конфигурации"
    >
      <h2 className="text-xl font-semibold text-[var(--tg-theme-text-color)] mb-3">
        Конфигурация
      </h2>

      <p
        className="text-sm text-[var(--tg-theme-text-color)] font-mono break-all mb-4 select-all"
        aria-label="Конфигурационная ссылка (сокращённая)"
      >
        {truncatedUrl}
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 min-h-[44px] rounded-[10px] bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] text-base font-semibold"
          aria-label={copied ? 'Скопировано' : 'Копировать конфигурацию'}
        >
          {copied ? (
            <>
              <Check size={16} aria-hidden="true" />
              Скопировано ✓
            </>
          ) : (
            <>
              <Copy size={16} aria-hidden="true" />
              Копировать
            </>
          )}
        </button>

        <button
          onClick={onShowQr}
          className="flex-1 flex items-center justify-center gap-2 min-h-[44px] rounded-[10px] bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] text-base font-semibold"
          aria-label="Показать QR-код конфигурации"
        >
          <QrCode size={16} aria-hidden="true" />
          QR-код
        </button>
      </div>
    </div>
  )
}
