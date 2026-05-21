import { useState } from 'react'
import { Copy, Check, QrCode } from 'lucide-react'

interface ConfigBlockProps {
  vlessUrl: string
  onShowQr: () => void
}

export function ConfigBlock({ vlessUrl, onShowQr }: ConfigBlockProps) {
  const [copied, setCopied] = useState(false)

  const truncatedUrl = vlessUrl.length > 46
    ? vlessUrl.slice(0, 43) + '…'
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
      className="mx-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
      role="region"
      aria-label="Блок конфигурации"
    >
      <p className="text-[11px] uppercase tracking-widest text-[var(--muted)] mb-3 font-medium">
        Конфигурация
      </p>

      <p
        className="text-[13px] text-[var(--muted)] font-mono break-all mb-4 select-all leading-relaxed"
        aria-label="Конфигурационная ссылка"
      >
        {truncatedUrl}
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-md border border-[var(--border)] text-[13px] font-medium text-[var(--text)]"
          style={{ background: copied ? 'var(--faint)' : 'transparent' }}
          aria-label={copied ? 'Скопировано' : 'Копировать конфигурацию'}
        >
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" />
              Скопировано
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" />
              Копировать
            </>
          )}
        </button>

        <button
          onClick={onShowQr}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-md border border-[var(--border)] text-[13px] font-medium text-[var(--text)]"
          style={{ background: 'transparent' }}
          aria-label="Показать QR-код конфигурации"
        >
          <QrCode size={14} aria-hidden="true" />
          QR-код
        </button>
      </div>
    </div>
  )
}
