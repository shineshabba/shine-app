import { useState, useEffect, useCallback } from 'react'
import { apiClient } from './api/client'
import type { UserProfile, ConfigResponse } from './types/api'
import { ApiError } from './types/api'
import { LoadingScreen } from './components/LoadingScreen'
import { ErrorScreen } from './components/ErrorScreen'
import { UnregisteredScreen } from './components/UnregisteredScreen'
import { Header } from './components/Header'
import { SubscriptionBlock } from './components/SubscriptionBlock'
import { ConfigBlock } from './components/ConfigBlock'
import { PaymentButton } from './components/PaymentButton'
import { SupportButton } from './components/SupportButton'
import { QrModal } from './components/QrModal'
import { SupportSheet } from './components/SupportSheet'

type AppState =
  | { status: 'loading' }
  | { status: 'error'; message?: string }
  | { status: 'unregistered' }
  | { status: 'ready'; profile: UserProfile; config: ConfigResponse | null }

export default function App() {
  const [appState, setAppState] = useState<AppState>({ status: 'loading' })
  const [showQr, setShowQr] = useState(false)
  const [showSupport, setShowSupport] = useState(false)

  const loadData = useCallback(async () => {
    setAppState({ status: 'loading' })

    try {
      const profile = await apiClient.getMe()

      let config: ConfigResponse | null = null
      if (profile.subscription_active) {
        try {
          config = await apiClient.getConfig()
        } catch (configError) {
          if (configError instanceof ApiError && configError.code === 403) {
            config = null
          } else {
            throw configError
          }
        }
      }

      setAppState({ status: 'ready', profile, config })
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.code) {
          case 404:
            setAppState({ status: 'unregistered' })
            return
          case 401:
            setAppState({ status: 'error', message: 'Не удалось авторизоваться' })
            return
          default:
            setAppState({ status: 'error', message: error.message })
            return
        }
      }
      setAppState({ status: 'error' })
    }
  }, [])

  useEffect(() => {
    window.Telegram?.WebApp?.ready()
    loadData()
  }, [loadData])

  if (appState.status === 'loading') return <LoadingScreen />
  if (appState.status === 'error') return <ErrorScreen onRetry={loadData} message={appState.message} />
  if (appState.status === 'unregistered') return <UnregisteredScreen />

  const { profile, config } = appState

  return (
    <div className="min-h-dvh bg-[var(--tg-theme-secondary-bg-color)] flex flex-col">
      <Header name={profile.name} />

      <main className="flex-1 flex flex-col gap-6 py-6">
        <SubscriptionBlock profile={profile} />

        {profile.subscription_active && config && (
          <ConfigBlock
            vlessUrl={config.vless_url}
            onShowQr={() => setShowQr(true)}
          />
        )}

        {!profile.subscription_active && (
          <PaymentButton profile={profile} />
        )}

        <div className="flex-1" aria-hidden="true" />
        <SupportButton onOpen={() => setShowSupport(true)} />
      </main>

      {/* QR Modal (D-02, D-09) */}
      {appState.status === 'ready' && appState.config && (
        <QrModal
          vlessUrl={appState.config.vless_url}
          isOpen={showQr}
          onClose={() => setShowQr(false)}
        />
      )}

      {/* Support Bottom Sheet (D-03) */}
      <SupportSheet
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />
    </div>
  )
}
