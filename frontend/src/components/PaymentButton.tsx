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
        className="w-full h-11 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] text-[14px] font-semibold tracking-tight"
        aria-label={label}
      >
        {label}
      </button>
    </div>
  )
}
