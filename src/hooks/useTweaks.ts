import { useState, useCallback, useEffect } from 'react'

export interface Tweaks {
  accent:       string
  accentSoft:   string
  accentStrong: string
  density:      'comfy' | 'dense'
  dark:         boolean
}

export const ACCENT_PRESETS = [
  { label: 'Azul médico',     accent: '#0369a1', accentSoft: '#e0f2fe', accentStrong: '#0c4a6e' },
  { label: 'Verde sanitario', accent: '#0d9488', accentSoft: '#ccfbf1', accentStrong: '#134e4a' },
  { label: 'Violeta clínico', accent: '#7c3aed', accentSoft: '#ede9fe', accentStrong: '#4c1d95' },
  { label: 'Rojo emergencia', accent: '#dc2626', accentSoft: '#fee2e2', accentStrong: '#7f1d1d' },
]

export const TWEAKS_KEY = 'atencion_tweaks'

const DEFAULT_TWEAKS: Tweaks = {
  accent:       '#0369a1',
  accentSoft:   '#e0f2fe',
  accentStrong: '#0c4a6e',
  density:      'comfy',
  dark:         false,
}

function applyAccent(tweaks: Tweaks) {
  const root = document.documentElement
  root.style.setProperty('--accent',        tweaks.accent)
  root.style.setProperty('--accent-soft',   tweaks.accentSoft)
  root.style.setProperty('--accent-strong', tweaks.accentStrong)
}

export function useTweaks() {
  const [tweaks, setTweaks] = useState<Tweaks>(() => {
    try {
      const stored = localStorage.getItem(TWEAKS_KEY)
      return stored ? { ...DEFAULT_TWEAKS, ...JSON.parse(stored) } : DEFAULT_TWEAKS
    } catch {
      return DEFAULT_TWEAKS
    }
  })

  useEffect(() => {
    applyAccent(tweaks)
  }, [tweaks])

  const update = useCallback((partial: Partial<Tweaks>) => {
    setTweaks(prev => {
      const next = { ...prev, ...partial }
      localStorage.setItem(TWEAKS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { tweaks, update, ACCENT_PRESETS }
}
