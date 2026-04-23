import type { ProcessedProject } from './types'
import { PARTNERS } from './config'

export class UIController {
  private tabBtns: NodeListOf<HTMLButtonElement>
  private panels: NodeListOf<HTMLElement>

  constructor() {
    this.tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn')
    this.panels = document.querySelectorAll<HTMLElement>('.sidebar-panel')
    this.setupTabs()
    this.renderPartners()
  }

  private setupTabs(): void {
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.panel
        this.tabBtns.forEach(b => b.classList.remove('active'))
        this.panels.forEach(p => p.classList.remove('active'))
        btn.classList.add('active')
        document.getElementById(`panel-${target}`)?.classList.add('active')
      })
    })
  }

  private renderPartners(): void {
    const grid = document.getElementById('partners-grid')
    if (!grid) return

    grid.innerHTML = (Object.entries(PARTNERS) as [string, { label: string; logo?: string }][])
      .map(([, partner]) => `
        <div class="partner-card">
          ${partner.logo
            ? `<img class="partner-logo" src="${partner.logo}" alt="${partner.label}" onerror="this.outerHTML='<div class=\\'partner-logo-placeholder\\'>🤝</div>'">`
            : `<div class="partner-logo-placeholder">🤝</div>`
          }
          <span class="partner-name">${partner.label}</span>
        </div>
      `).join('')
  }

  updateStats(projects: ProcessedProject[]): void {
    const visibleEl = document.getElementById('visible-count')
    const totalEl = document.getElementById('total-count')
    if (visibleEl) visibleEl.textContent = String(projects.length)
    if (totalEl) totalEl.textContent = String(projects.length)
    this.renderAboutStats(projects)
  }

  setTotalCount(total: number): void {
    const el = document.getElementById('total-count')
    if (el) el.textContent = String(total)
  }

  updateVisibleCount(count: number): void {
    const el = document.getElementById('visible-count')
    if (el) el.textContent = String(count)
  }

  renderAboutStats(projects: ProcessedProject[]): void {
    const statsEl = document.getElementById('about-stats')
    if (!statsEl) return

    const themes = new Set(projects.map(p => p.theme)).size
    const sections = new Set(projects.map(p => p.section)).size
    const completed = projects.filter(p => p.status === 'termine').length

    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${projects.length}</div>
        <div class="stat-label">Projets</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${completed}</div>
        <div class="stat-label">Terminés</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${themes}</div>
        <div class="stat-label">Thèmes</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${sections}</div>
        <div class="stat-label">Régions</div>
      </div>
    `
  }
}
