import L from 'leaflet'
import 'leaflet.markercluster'
import type { ProcessedProject } from './types'
import { THEMES, STATUS, MAP_CENTER, MAP_ZOOM } from './config'
import type { ModalController } from './modal'

export class MapController {
  private map: L.Map
  private clusterGroup: L.MarkerClusterGroup
  private markers: Map<string, L.Marker> = new Map()
  private modal: ModalController

  constructor(modal: ModalController) {
    this.modal = modal

    this.map = L.map('map', {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: false,
    })

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(this.map)

    L.control.zoom({ position: 'bottomright' }).addTo(this.map)

    this.clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      spiderfyDistanceMultiplier: 1.8,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    })
    this.map.addLayer(this.clusterGroup)

    document.getElementById('reset-view')?.addEventListener('click', () => {
      this.map.setView(MAP_CENTER, MAP_ZOOM, { animate: true })
    })
  }

  renderProjects(projects: ProcessedProject[]): void {
    this.clusterGroup.clearLayers()
    this.markers.clear()

    projects.forEach(p => {
      const marker = this.createMarker(p)
      this.markers.set(p.id, marker)
      this.clusterGroup.addLayer(marker)
    })
  }

  private createMarker(p: ProcessedProject): L.Marker {
    const theme = THEMES[p.theme]
    const status = STATUS[p.status]

    const icon = L.divIcon({
      className: '',
      html: `<div class="marker-dot" style="background:${theme.color}" title="${p.name}"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -14],
    })

    const marker = L.marker([p.lat, p.lng], { icon })

    marker.bindPopup(this.buildPopup(p, theme, status), {
      maxWidth: 260,
      closeButton: false,
      className: 'clean-popup',
    })

    marker.on('click', () => {
      this.modal.open(p)
      marker.closePopup()
    })

    marker.on('mouseover', () => marker.openPopup())
    marker.on('mouseout', () => marker.closePopup())

    return marker
  }

  private buildPopup(
    p: ProcessedProject,
    theme: { label: string; icon: string; color: string },
    status: { label: string; icon: string; color: string }
  ): string {
    return `
      <div class="popup-theme-bar" style="background:${theme.color}"></div>
      <div class="popup-inner">
        <div class="popup-name">${p.name}</div>
        <div class="popup-tags">
          <span class="popup-tag" style="background:${theme.color}">${theme.icon} ${theme.label}</span>
          <span class="popup-tag" style="background:${status.color}">${status.label}</span>
        </div>
        <button class="popup-btn" onclick="window.__openProject('${encodeURIComponent(p.id)}')">
          Voir les détails →
        </button>
      </div>
    `
  }

  fitToProjects(projects: ProcessedProject[]): void {
    if (projects.length === 0) return
    const bounds = L.latLngBounds(projects.map(p => [p.lat, p.lng]))
    this.map.fitBounds(bounds.pad(0.1), { maxZoom: 13 })
  }

  getMap(): L.Map {
    return this.map
  }
}
