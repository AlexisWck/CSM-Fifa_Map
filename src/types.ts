export interface ProjectProperties {
  Name: string
  description: string
  theme: ThemeKey
  status: StatusKey
  partners: PartnerKey[]
  section: string
  photo?: string
  year?: number
}

export interface ProjectFeature {
  type: 'Feature'
  properties: ProjectProperties
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export interface ProjectCollection {
  type: 'FeatureCollection'
  name: string
  features: ProjectFeature[]
}

export interface ProcessedProject {
  id: string
  name: string
  description: string
  theme: ThemeKey
  status: StatusKey
  partners: PartnerKey[]
  section: string
  photo?: string
  year?: number
  lat: number
  lng: number
}

export interface FilterState {
  themes: Set<ThemeKey>
  statuses: Set<StatusKey>
  partners: Set<PartnerKey>
  sections: Set<string>
  search: string
}

export type ThemeKey = 'education' | 'sante' | 'loisirs' | 'urgences' | 'developpement' | 'agr' | 'siege'
export type StatusKey = 'termine' | 'en_cours' | 'reflexion'
export type PartnerKey = 'spf63' | 'spf83' | 'spf77' | 'spfaura' | 'spfan' | 'spf13' | 'agence_eau' | 'csm' | 'axian' | 'auto' | 'aina' | 'cdm63' | 'agence_eau_sioule' | 'ambassade' | 'annonay'

export interface ThemeConfig {
  label: string
  icon: string
  color: string
}

export interface StatusConfig {
  label: string
  icon: string
  color: string
}

export interface PartnerConfig {
  label: string
  logo?: string
}
