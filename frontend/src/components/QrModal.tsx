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
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-label="QR-код конфигурации"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'var(--tg-theme-bg-color)',
        animation: 'fadeIn 150ms ease-out',
      }}
      onClick={onClose}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-4 right-4 flex items-center justify-center w-11 h-11 rounded-full text-[var(--tg-theme-hint-color)]"
        aria-label="Закрыть QR-код"
        style={{ background: 'none' }}
      >
        <X size={24} />
      </button>

      <div onClick={(e) => e.stopPropagation()} style={{ padding: '48px' }}>
        <QRCodeSVG
          value={vlessUrl}
          style={{
            width: 'min(80vw, 80vh)',
            height: 'min(80vw, 80vh)',
          }}
          level="M"
          bgColor="transparent"
          fgColor="var(--tg-theme-text-color)"
        />
      </div>
    </div>
  )
}
