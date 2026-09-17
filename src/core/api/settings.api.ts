import { apiClient } from '@/core/utils/apiClient'
import type { SystemSettings, UpdateSystemSettingsBody } from './types'

export const settingsApi = {
  get: () => apiClient<SystemSettings>('/settings'),

  update: (body: UpdateSystemSettingsBody) =>
    apiClient<SystemSettings>('/settings', { method: 'PATCH', body: JSON.stringify(body) }),
}
