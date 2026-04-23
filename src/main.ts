import './style.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'

import type { ProjectCollection, ProcessedProject } from './types'
import { MapController } from './map'
import { FilterController } from './filters'
import { ModalController } from './modal'
import { UIController } from './ui'

let allProjects: ProcessedProject[] = []
let mapCtrl: MapController
let filterCtrl: FilterController
let modalCtrl: ModalController
let uiCtrl: UIController

async function init(): Promise<void> {
  modalCtrl = new ModalController()
  uiCtrl = new UIController()

  filterCtrl = new FilterController((state) => {
    const visible = filterCtrl.apply(allProjects)
    mapCtrl.renderProjects(visible)
    uiCtrl.updateVisibleCount(visible.length)
  })

  mapCtrl = new MapController(modalCtrl)

  // Expose helper for popup buttons
  ;(window as unknown as Record<string, unknown>).__openProject = (encodedId: string) => {
    const id = decodeURIComponent(encodedId)
    const project = allProjects.find(p => p.id === id)
    if (project) modalCtrl.open(project)
  }

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}project.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data: ProjectCollection = await response.json()

    allProjects = data.features.map((feature, i) => ({
      id: String(i),
      name: feature.properties.Name,
      description: feature.properties.description || '',
      theme: feature.properties.theme,
      status: feature.properties.status,
      partners: feature.properties.partners || [],
      section: feature.properties.section || '',
      photo: feature.properties.photo,
      year: feature.properties.year,
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    }))

    filterCtrl.init(allProjects)

    const visible = filterCtrl.apply(allProjects)
    mapCtrl.renderProjects(visible)
    mapCtrl.fitToProjects(visible)

    uiCtrl.updateVisibleCount(visible.length)
    uiCtrl.setTotalCount(allProjects.length)
    uiCtrl.renderAboutStats(allProjects)

    modalCtrl.checkUrlAndOpen(allProjects)

  } catch (err) {
    console.error('Erreur de chargement des projets:', err)
    showLoadError()
  }
}

function showLoadError(): void {
  const map = document.getElementById('map')
  if (map) {
    map.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:system-ui;color:#71717A;">
        <div style="text-align:center">
          <div style="font-size:32px;margin-bottom:12px">⚠️</div>
          <p>Impossible de charger les données des projets.</p>
          <p style="font-size:13px;margin-top:6px">Vérifiez que <code>public/project.json</code> existe.</p>
        </div>
      </div>
    `
  }
}

document.addEventListener('DOMContentLoaded', init)
