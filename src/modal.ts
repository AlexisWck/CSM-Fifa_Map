import type { ProcessedProject } from './types'
import { THEMES, STATUS, PARTNERS } from './config'

export class ModalController {
  private overlay: HTMLElement
  private contentEl: HTMLElement
  private current: ProcessedProject | null = null
  private openedFromUrl = false

  constructor() {
    this.overlay = document.getElementById('modal-overlay')!
    this.contentEl = document.getElementById('modal-content')!

    document.getElementById('modal-close')!.addEventListener('click', () => this.close())
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close()
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close()
    })
  }

  open(project: ProcessedProject, updateUrl = true): void {
    this.current = project
    this.openedFromUrl = !updateUrl
    this.render(project)
    this.overlay.classList.add('open')
    document.body.style.overflow = 'hidden'
    if (updateUrl) this.pushUrlState(project)
  }

  close(): void {
    this.overlay.classList.remove('open')
    document.body.style.overflow = ''
    this.current = null
    if (!this.openedFromUrl) this.clearUrlState()
    this.openedFromUrl = false
  }

  private render(p: ProcessedProject): void {
    const theme = THEMES[p.theme]
    const status = STATUS[p.status]

    const heroStyle = p.photo
      ? `background: linear-gradient(135deg, ${theme.color}cc, ${theme.color}88)`
      : `background: linear-gradient(135deg, ${theme.color} 0%, ${this.darken(theme.color)} 100%)`

    const partnersHtml = p.partners.map(key => {
      const partner = PARTNERS[key]
      return partner
        ? `<span class="modal-partner-badge">${partner.label}</span>`
        : ''
    }).join('')

    const yearHtml = p.year
      ? `<div class="modal-info-chip"><strong>${p.year}</strong></div>`
      : ''

    const sectionHtml = p.section
      ? `<div class="modal-info-chip">📍 <strong>${p.section}</strong></div>`
      : ''

    this.contentEl.innerHTML = `
      <div class="modal-hero" style="${heroStyle}">
        ${p.photo ? `<img src="${p.photo}" alt="${p.name}" onerror="this.style.display='none'">` : ''}
        <div class="modal-hero-content">
          <div class="modal-status-badge" style="background:rgba(255,255,255,0.15)">
            ${status.icon} ${status.label}
          </div>
          <h2 class="modal-title">${p.name}</h2>
        </div>
      </div>

      <div class="modal-body">
        <div class="modal-meta">
          <span class="modal-tag" style="background:${theme.color}">
            ${theme.icon} ${theme.label}
          </span>
        </div>

        ${yearHtml || sectionHtml ? `
          <div class="modal-info-row">${yearHtml}${sectionHtml}</div>
        ` : ''}

        <div class="modal-section-label">Description</div>
        <p class="modal-description ${!p.description ? 'empty' : ''}">
          ${p.description || 'Aucune description disponible pour ce projet.'}
        </p>

        ${partnersHtml ? `
          <div class="modal-section-label">Partenaires</div>
          <div class="modal-partners">${partnersHtml}</div>
        ` : ''}

        <button class="share-btn" id="modal-share-btn">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M13 7H15a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2M10 3v9m-3-3 3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Partager ce projet
        </button>
      </div>
    `

    document.getElementById('modal-share-btn')?.addEventListener('click', () => {
      this.shareProject(p)
    })
  }

  private pushUrlState(p: ProcessedProject): void {
    const url = new URL(window.location.href)
    url.searchParams.set('project', p.name)
    window.history.pushState({}, '', url.toString())
  }

  private clearUrlState(): void {
    const url = new URL(window.location.href)
    url.searchParams.delete('project')
    window.history.replaceState({}, '', url.toString())
  }

  private async shareProject(p: ProcessedProject): Promise<void> {
    const url = new URL(window.location.href)
    url.searchParams.set('project', p.name)
    const shareUrl = url.toString()

    if (navigator.share) {
      try {
        await navigator.share({ title: p.name, url: shareUrl })
        return
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(shareUrl)
    const btn = document.getElementById('modal-share-btn')
    if (btn) {
      const original = btn.innerHTML
      btn.textContent = '✓ Lien copié !'
      setTimeout(() => { btn.innerHTML = original }, 2000)
    }
  }

  private darken(hex: string): string {
    const n = parseInt(hex.slice(1), 16)
    const r = Math.max(0, (n >> 16) - 40)
    const g = Math.max(0, ((n >> 8) & 0xff) - 40)
    const b = Math.max(0, (n & 0xff) - 40)
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
  }

  checkUrlAndOpen(projects: ProcessedProject[]): void {
    const params = new URLSearchParams(window.location.search)
    const name = params.get('project')
    if (!name) return
    const match = projects.find(p => p.name === name)
    if (match) this.open(match, false)
  }
}
