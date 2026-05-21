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
      className="mx-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
      role="region"
      aria-label="Блок подписки"
    >
      <p className="text-[11px] uppercase tracking-widest text-[var(--muted)] mb-3 font-medium">
        Подписка
      </p>

      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: subscription_active ? 'var(--positive)' : 'var(--faint)' }}
          aria-hidden="true"
        />
        <span
          className="text-[15px] font-medium"
          style={{ color: subscription_active ? 'var(--positive)' : 'var(--muted)' }}
        >
          {subscription_active
            ? `Активна${subscription_end ? ` · до ${formatDate(subscription_end)}` : ''}`
            : 'Не активна'}
        </span>
      </div>

      <p className="text-[13px] text-[var(--muted)] pl-[14px]">
        {device_limit} {device_limit === 1 ? 'устройство' : 'устройств'}
      </p>
    </div>
  )
}
