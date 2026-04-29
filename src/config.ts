import type { ThemeKey, StatusKey, PartnerKey, ThemeConfig, StatusConfig, PartnerConfig } from './types'

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  education:     { label: 'Éducation',         icon: '🎓', color: '#3B82F6' },
  sante:         { label: 'Santé',              icon: '🏥', color: '#EF4444' },
  loisirs:       { label: 'Loisirs',            icon: '⚽', color: '#8B5CF6' },
  urgences:      { label: 'Urgences',           icon: '🚨', color: '#F97316' },
  developpement: { label: 'Développement',      icon: '🏗️', color: '#10B981' },
  agr:           { label: 'Activités Génératrices de Revenus',                icon: '🧑‍🌾', color: '#F59E0B' },
  siege:         { label: 'Siège / Bureau',     icon: '🏢', color: '#6B7280' },
}

export const STATUS: Record<StatusKey, StatusConfig> = {
  termine:  { label: 'Terminé',              icon: '✓', color: '#10B981' },
  en_cours: { label: 'En cours',             icon: '↻', color: '#F59E0B' },
  reflexion:{ label: 'En réflexion',         icon: '◎', color: '#6B7280' },
}

export const PARTNERS: Record<PartnerKey, PartnerConfig> = {
  spf63:   { label: 'SPF 63',   logo: 'logos/logo_spf.png' },
  spf83:   { label: 'SPF 83',   logo: 'logos/logo_spf.png' },
  spf77:   { label: 'SPF 77',   logo: 'logos/logo_spf.png' },
  spfaura: { label: 'SPF AURA', logo: 'logos/logo_spf.png' },
  spfan:   { label: 'SPF AN',   logo: 'logos/logo_spf.png' },
  spf13:   { label: 'SPF 13',   logo: 'logos/logo_spf.png' },

  agence_eau: {
    label: "Agence de l'Eau Rhone Méditerranée Corse",
    logo: 'logos/logo_rmc.png'
  },

  agence_eau_sioule: {
    label: "Agence de l'Eau Sioule et Morge",
    logo: 'logos/logo_sioule_morge.jpg'
  },

  ambassade: {
    label: 'Ambassade de France',
    logo: 'logos/logo_ambassade.png'
  },

  cdm63: {
    label: 'Copain du Monde 63',
    logo: 'logos/logo_cdm63.png' // corrigé
  },

  annonay: {
    label: 'Annonay Agglo',
    logo: 'logos/logo_annonay.png'
  },

  csm: {
    label: 'CSM-Fifa National',
    logo: 'logos/logo_csm.png'
  },

  axian: { label: 'Fondation Axian', logo: '' },
  auto:  { label: 'Auto-financement', logo: '' },

  aina: {
    label: 'Aina Madagascar',
    logo: 'logos/logo_aina.png'
  },
}

export const MAP_CENTER: [number, number] = [-18.9, 47.5]
export const MAP_ZOOM = 6
