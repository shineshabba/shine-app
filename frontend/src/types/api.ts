export interface UserProfile {
  tg_user_id: number
  name: string
  subscription_active: boolean
  subscription_end: string | null
  device_limit: number
  is_admin: boolean
}

export interface ConfigResponse {
  vless_url: string
}

export interface AdminUser {
  tg_user_id: number
  name: string
  username: string | null
  subscription_active: boolean
  subscription_end: string | null
  is_forever: boolean
  has_config: boolean
}

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
