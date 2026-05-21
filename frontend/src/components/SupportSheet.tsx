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
    icon: <Smartphone size={16} aria-hidden="true" />,
    title: 'iPhone / iPad',
    content: 'Скопируй конфигурацию → открой Streisand или Shadowrocket → нажми + → вставь ссылку → подключись',
  },
  {
    id: 'android',
    icon: <Tablet size={16} aria-hidden="true" />,
    title: 'Android',
    content: 'Скопируй конфигурацию → открой v2rayNG или Hiddify → нажми + → вставь ссылку → подключись',
  },
  {
    id: 'windows',
    icon: <Monitor size={16} aria-hidden="true" />,
    title: 'Windows',
    content: 'Скопируй конфигурацию → открой Hiddify или v2rayN → добавь сервер из буфера обмена → подключись',
  },
  {
    id: 'mac',
    icon: <Laptop size={16} aria-hidden="true" />,
    title: 'macOS',
    content: 'Скопируй конфигурацию → открой Hiddify или FoXray → добавь сервер из буфера обмена → подключись',
  },
]

export function SupportSheet({ isOpen, onClose }: SupportSheetProps) {
  const [openItem, setOpenItem] = useState<string | null>(null)

  useEffect(() => { if (!isOpen) setOpenItem(null) }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black"
        style={{
          opacity: isOpen ? 0.7 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Поддержка"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-xl border-t border-[var(--border)] bg-[var(--surface)]"
        style={{
          maxHeight: '80vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 280ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-[3px] rounded-full bg-[var(--faint)]" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <span className="text-[11px] uppercase tracking-widest text-[var(--muted)] font-medium">
            Поддержка
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] text-[var(--muted)]"
            aria-label="Закрыть поддержку"
            style={{ background: 'none' }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 pb-8">
          <div>
            {SUPPORT_ITEMS.map((item, i) => {
              const isExpanded = openItem === item.id
              const isLast = i === SUPPORT_ITEMS.length - 1
              return (
                <div key={item.id} className={!isLast ? 'border-b border-[var(--border)]' : ''}>
                  <button
                    onClick={() => setOpenItem(prev => prev === item.id ? null : item.id)}
                    className="w-full flex items-center gap-3 min-h-[44px] py-3 text-left text-[14px] font-medium text-[var(--text)]"
                    style={{ background: 'none' }}
                    aria-expanded={isExpanded}
                    aria-controls={`accordion-${item.id}`}
                  >
                    <span className="text-[var(--muted)]">{item.icon}</span>
                    <span className="flex-1">{item.title}</span>
                    {isExpanded
                      ? <ChevronDown size={15} className="text-[var(--muted)]" aria-hidden="true" />
                      : <ChevronRight size={15} className="text-[var(--muted)]" aria-hidden="true" />
                    }
                  </button>

                  <div
                    id={`accordion-${item.id}`}
                    style={{
                      overflow: 'hidden',
                      maxHeight: isExpanded ? '200px' : '0',
                      transition: 'max-height 180ms ease',
                    }}
                  >
                    <p className="pb-4 text-[13px] text-[var(--muted)] leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => window.Telegram?.WebApp?.openTelegramLink(ADMIN_URL)}
            className="mt-5 w-full flex items-center justify-center gap-2 h-11 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] text-[14px] font-semibold"
            aria-label="Написать администратору в Telegram"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Написать администратору
          </button>
        </div>
      </div>
    </>
  )
}
