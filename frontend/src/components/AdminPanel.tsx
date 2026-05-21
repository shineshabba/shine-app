import { useState, useEffect, useCallback } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { apiClient } from '../api/client'
import type { AdminUser } from '../types/api'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

type ActionState = { userId: number; action: string } | null

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<ActionState>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.adminListUsers()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) load()
  }, [isOpen, load])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const grant = async (userId: number, days: number) => {
    const key = days === 0 ? 'forever' : `${days}d`
    setPending({ userId, action: key })
    try {
      await apiClient.adminGrant(userId, days)
      await load()
    } finally {
      setPending(null)
    }
  }

  const revoke = async (userId: number) => {
    setPending({ userId, action: 'revoke' })
    try {
      await apiClient.adminRevoke(userId)
      await load()
    } finally {
      setPending(null)
    }
  }

  const isBusy = (userId: number, action: string) =>
    pending?.userId === userId && pending?.action === action

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)]" style={{ animation: 'fadeIn 120ms ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between h-14 px-5 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-widest text-[var(--muted)] font-medium">Пользователи</span>
          {!loading && (
            <span className="text-[11px] text-[var(--faint)]">{users.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] text-[var(--muted)]"
            style={{ background: 'none', opacity: loading ? 0.4 : 1 }}
            aria-label="Обновить"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] text-[var(--muted)]"
            style={{ background: 'none' }}
            aria-label="Закрыть"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 rounded-full border border-[var(--border)] border-t-[var(--text)]"
              style={{ animation: 'spin 0.75s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-[13px] text-[var(--muted)] mt-12">Нет пользователей</p>
        ) : (
          <div>
            {users.map((user, i) => (
              <div
                key={user.tg_user_id}
                className={`px-5 py-4 ${i < users.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
              >
                {/* Name + status */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: user.subscription_active ? 'var(--positive)' : 'var(--faint)' }}
                  />
                  <span className="text-[14px] font-medium text-[var(--text)] truncate flex-1">
                    {user.name}
                  </span>
                  {user.username && (
                    <span className="text-[12px] text-[var(--muted)] shrink-0">@{user.username}</span>
                  )}
                </div>

                {/* Status line */}
                <p className="text-[12px] text-[var(--muted)] mb-3 pl-[14px]">
                  {user.subscription_active
                    ? user.is_forever
                      ? 'Навсегда'
                      : `до ${user.subscription_end}`
                    : 'Нет доступа'}
                </p>

                {/* Action buttons */}
                <div className="flex gap-2 pl-[14px]">
                  <button
                    onClick={() => grant(user.tg_user_id, 30)}
                    disabled={pending !== null}
                    className="h-8 px-3 rounded border border-[var(--border)] text-[12px] text-[var(--text)]"
                    style={{ background: 'transparent', opacity: isBusy(user.tg_user_id, '30d') ? 0.5 : 1 }}
                  >
                    {isBusy(user.tg_user_id, '30d') ? '...' : '+30 дней'}
                  </button>
                  <button
                    onClick={() => grant(user.tg_user_id, 0)}
                    disabled={pending !== null}
                    className="h-8 px-3 rounded border border-[var(--border)] text-[12px] text-[var(--text)]"
                    style={{ background: 'transparent', opacity: isBusy(user.tg_user_id, 'forever') ? 0.5 : 1 }}
                  >
                    {isBusy(user.tg_user_id, 'forever') ? '...' : '♾ Навсегда'}
                  </button>
                  {user.subscription_active && (
                    <button
                      onClick={() => revoke(user.tg_user_id)}
                      disabled={pending !== null}
                      className="h-8 px-3 rounded border border-[var(--border)] text-[12px]"
                      style={{ background: 'transparent', color: '#ef4444', borderColor: '#2a1515', opacity: isBusy(user.tg_user_id, 'revoke') ? 0.5 : 1 }}
                    >
                      {isBusy(user.tg_user_id, 'revoke') ? '...' : 'Отозвать'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
