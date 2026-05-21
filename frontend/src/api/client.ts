import type { UserProfile, ConfigResponse } from '../types/api'
import { ApiError, type ApiErrorCode } from '../types/api'

const API_BASE = (import.meta.env.VITE_API_URL ?? 'https://api.shineee.space').trim()

/**
 * Получить initData из Telegram WebApp.
 * НИКОГДА не конструируем initData вручную — только из window.Telegram.WebApp.
 * Пустая строка означает запуск вне Telegram (dev-режим).
 */
function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

async function apiFetch<T>(path: string): Promise<T> {
  const initData = getInitData()

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'X-Telegram-Init-Data': initData,
        'Content-Type': 'application/json',
      },
    })
  } catch {
    throw new ApiError('network', 'Нет соединения с сервером')
  }

  if (!response.ok) {
    const code = response.status as ApiErrorCode
    const knownCodes: ApiErrorCode[] = [401, 403, 404]
    const errorCode: ApiErrorCode = knownCodes.includes(code) ? code : 'unknown'

    switch (errorCode) {
      case 401:
        throw new ApiError(401, 'Не удалось авторизоваться')
      case 403:
        throw new ApiError(403, 'Подписка не активна')
      case 404:
        throw new ApiError(404, 'Пользователь не найден')
      default:
        throw new ApiError('unknown', `Ошибка сервера: ${response.status}`)
    }
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  /**
   * GET /api/me — профиль пользователя.
   * Бросает ApiError(404) если не зарегистрирован.
   * Бросает ApiError(401) если невалидный initData.
   */
  getMe(): Promise<UserProfile> {
    return apiFetch<UserProfile>('/api/me')
  },

  /**
   * GET /api/config — VLESS конфигурация.
   * Бросает ApiError(403) если подписка не активна.
   */
  getConfig(): Promise<ConfigResponse> {
    return apiFetch<ConfigResponse>('/api/config')
  },
}
