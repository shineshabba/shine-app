import type { UserProfile } from '../types/api'

interface PaymentButtonProps {
  profile: UserProfile
}

const TRIBUTE_URL = 'https://t.me/tribute/app?startapp=sVHH'

export function PaymentButton({ profile }: PaymentButtonProps) {
  const isLapsed = profile.subscription_end !== null
  const label = isLapsed ? 'Продлить подписку' : 'Оформить подписку'

  const handleClick = () => {
    window.Telegram?.WebApp?.openTelegramLink(TRIBUTE_URL)
  }

  return (
    <div className="mx-4">
      <button
        onClick={handleClick}
        className="w-full h-12 rounded-xl bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] text-base font-semibold"
        aria-label={label}
      >
        {label}
      </button>
    </div>
  )
}
