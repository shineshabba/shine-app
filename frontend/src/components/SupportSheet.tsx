import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronRight, Smartphone, Tablet, Monitor, Laptop, MessageCircle } from 'lucide-react'

interface SupportSheetProps {
  isOpen: boolean
  onClose: () => void
}

const ADMIN_URL = 'https://t.me/shineshabba'

interface AccordionItem {
  id: string
  icon: React.ReactNode
  title: string
  content: string
}

const SUPPORT_ITEMS: AccordionItem[] = [
  {
    id: 'ios',
    icon: <Smartphone size={18} aria-hidden="true" />,
    title: 'iPhone / iPad',
    content: 'Скопируй конфигурацию → открой Streisand или Shadowrocket → нажми + → вставь ссылку → подключись',
  },
  {
    id: 'android',
    icon: <Tablet size={18} aria-hidden="true" />,
    title: 'Android',
    content: 'Скопируй конфигурацию → открой v2rayNG или Hiddify → нажми + → вставь ссылку → подключись',
  },
  {
    id: 'windows',
    icon: <Monitor size={18} aria-hidden="true" />,
    title: 'Windows',
    content: 'Скопируй конфигурацию → открой Hiddify или v2rayN → добавь сервер из буфера обмена → подключись',
  },
  {
    id: 'mac',
    icon: <Laptop size={18} aria-hidden="true" />,
    title: 'macOS',
    content: 'Скопируй конфигурацию → открой Hiddify или FoXray → добавь сервер из буфера обмена → подключись',
  },
]

export function SupportSheet({ isOpen, onClose }: SupportSheetProps) {
  const [openItem, setOpenItem] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) setOpenItem(null)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleAdminClick = () => {
    window.Telegram?.WebApp?.openTelegramLink(ADMIN_URL)
  }

  const toggleItem = (id: string) => {
    setOpenItem(prev => prev === id ? null : id)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms ease-out',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Поддержка"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[20px] bg-[var(--tg-theme-bg-color)]"
        style={{
          maxHeight: '80vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms ease-out',
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-9 h-1 rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-hint-color) 40%, transparent)' }}
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xl font-semibold text-[var(--tg-theme-text-color)]">
            Поддержка
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 text-[var(--tg-theme-hint-color)]"
            aria-label="Закрыть поддержку"
            style={{ background: 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-6">
          <div className="space-y-1">
            {SUPPORT_ITEMS.map((item) => {
              const isExpanded = openItem === item.id
              return (
                <div key={item.id} className="rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center gap-3 min-h-[44px] px-4 py-3 text-left text-base font-semibold text-[var(--tg-theme-text-color)]"
                    style={{ background: 'none' }}
                    aria-expanded={isExpanded}
                    aria-controls={`accordion-${item.id}`}
                  >
                    <span className="text-[var(--tg-theme-hint-color)]">{item.icon}</span>
                    <span className="flex-1">{item.title}</span>
                    {isExpanded
                      ? <ChevronDown size={18} className="text-[var(--tg-theme-hint-color)]" aria-hidden="true" />
                      : <ChevronRight size={18} className="text-[var(--tg-theme-hint-color)]" aria-hidden="true" />
                    }
                  </button>

                  <div
                    id={`accordion-${item.id}`}
                    style={{
                      overflow: 'hidden',
                      maxHeight: isExpanded ? '200px' : '0',
                      transition: 'max-height 200ms ease-out',
                    }}
                  >
                    <p className="px-4 pb-4 pt-1 text-sm text-[var(--tg-theme-hint-color)] leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleAdminClick}
            className="mt-6 w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] text-base font-semibold"
            aria-label="Написать администратору в Telegram"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Написать администратору
          </button>
        </div>
      </div>
    </>
  )
}
