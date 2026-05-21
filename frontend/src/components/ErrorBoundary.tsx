import { Component, type ReactNode } from 'react'
import { WifiOff } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary — перехватывает ошибки рендеринга.
 * Показывает fallback вместо пустого экрана (FE-08).
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4 bg-[var(--tg-theme-secondary-bg-color)]">
          <WifiOff size={48} className="text-[var(--tg-theme-hint-color)]" aria-hidden="true" />
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">
              Произошла ошибка
            </h1>
            <p className="text-base text-[var(--tg-theme-hint-color)]">
              Перезагрузите приложение
            </p>
          </div>
          <button
            onClick={this.handleReload}
            className="mt-2 h-12 px-8 rounded-xl bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] text-base font-semibold"
            aria-label="Перезагрузить приложение"
          >
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
