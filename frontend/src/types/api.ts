/**
 * TypeScript типы для API контракта.
 * Зеркало Pydantic моделей из backend/models.py.
 * При изменении моделей — обновить здесь тоже.
 */

export interface UserProfile {
  tg_user_id: number
  name: string
  subscription_active: boolean
  subscription_end: string | null // ISO date string "YYYY-MM-DD" или null
  device_limit: number
}

export interface ConfigResponse {
  vless_url: string
}

export interface HealthResponse {
  status: 'ok'
}

/** Коды ошибок API — используются для маршрутизации на нужный экран */
export type ApiErrorCode = 401 | 403 | 404 | 'network' | 'unknown'

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
