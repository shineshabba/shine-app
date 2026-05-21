import type { UserProfile } from '../types/api'

interface SubscriptionBlockProps {
  profile: UserProfile
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

export function SubscriptionBlock({ profile }: SubscriptionBlockProps) {
  const { subscription_active, subscription_end, device_limit } = profile

  return (
    <div
      className="mx-4 rounded-2xl p-4 bg-[var(--tg-theme-bg-color)]"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      role="region"
      aria-label="Блок подписки"
    >
      <h2 className="text-xl font-semibold text-[var(--tg-theme-text-color)] mb-3">
        Подписка
      </h2>

      {subscription_active ? (
        <p
          className="text-base"
          style={{ color: '#34C759' }}
          aria-label={`Подписка активна${subscription_end ? ` до ${formatDate(subscription_end)}` : ''}`}
        >
          ✅ Активна{subscription_end ? ` до ${formatDate(subscription_end)}` : ''}
        </p>
      ) : (
        <p
          className="text-base"
          style={{ color: 'var(--tg-theme-destructive-text-color, #FF3B30)' }}
          aria-label="Подписка не активна"
        >
          ❌ Не активна
        </p>
      )}

      <p className="text-sm text-[var(--tg-theme-hint-color)] mt-2">
        Лимит: {device_limit} {device_limit === 1 ? 'устройство' : 'устройств'}
      </p>
    </div>
  )
}
