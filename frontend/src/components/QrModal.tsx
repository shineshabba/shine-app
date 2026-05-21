import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X } from 'lucide-react'

interface QrModalProps {
  vlessUrl: string
  isOpen: boolean
  onClose: () => void
}

export function QrModal({ vlessUrl, isOpen, onClose }: QrModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-label="QR-код конфигурации"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]"
      style={{ animation: 'fadeIn 120ms ease-out' }}
      onClick={onClose}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] text-[var(--muted)]"
        aria-label="Закрыть QR-код"
        style={{ background: 'none' }}
      >
        <X size={16} />
      </button>

      <div
        className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
        onClick={(e) => e.stopPropagation()}
      >
        <QRCodeSVG
          value={vlessUrl}
          style={{ width: 'min(68vw, 68vh)', height: 'min(68vw, 68vh)' }}
          level="M"
          bgColor="transparent"
          fgColor="var(--text)"
        />
      </div>
    </div>
  )
}
