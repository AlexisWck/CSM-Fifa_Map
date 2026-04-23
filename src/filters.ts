import type { ProcessedProject, FilterState, ThemeKey, StatusKey, PartnerKey } from './types'
import { THEMES, STATUS, PARTNERS } from './config'

type OnChangeCallback = (state: FilterState) => void

export class FilterController {
  private state: FilterState
  private onChange: OnChangeCallback
  private allProjects: ProcessedProject[] = []

  constructor(onChange: OnChangeCallback) {
    this.onChange = onChange
    // Empty sets = no filter applied = show all
    this.state = {
      themes:   new Set<ThemeKey>(),
      statuses: new Set<StatusKey>(),
      partners: new Set<PartnerKey>(),
      sections: new Set<string>(),
      search:   '',
    }
  }

  init(projects: ProcessedProject[]): void {
    this.allProjects = projects
    const sections = [...new Set(projects.map(p => p.section).filter(Boolean))].sort()

    this.renderChips('theme-filters', Object.entries(THEMES).map(([key, cfg]) => ({
      key, label: cfg.label, icon: cfg.icon, color: cfg.color
    })), this.state.themes as Set<string>, (key, active) => {
      if (active) this.state.themes.add(key as ThemeKey)
      else this.state.themes.delete(key as ThemeKey)
      this.emitWithBadge()
    })

    this.renderChips('status-filters', Object.entries(STATUS).map(([key, cfg]) => ({
      key, label: cfg.label, icon: cfg.icon, color: cfg.color
    })), this.state.statuses as Set<string>, (key, active) => {
      if (active) this.state.statuses.add(key as StatusKey)
      else this.state.statuses.delete(key as StatusKey)
      this.emitWithBadge()
    })

    this.renderChips('partner-filters', Object.entries(PARTNERS).map(([key, cfg]) => ({
      key, label: cfg.label, color: '#10B981'
    })), this.state.partners as Set<string>, (key, active) => {
      if (active) this.state.partners.add(key as PartnerKey)
      else this.state.partners.delete(key as PartnerKey)
      this.emitWithBadge()
    })

    this.renderChips('section-filters', sections.map(s => ({
      key: s, label: s, color: '#6B7280'
    })), this.state.sections, (key, active) => {
      if (active) this.state.sections.add(key)
      else this.state.sections.delete(key)
      this.emitWithBadge()
    })

    this.setupSearch()
    this.setupAccordions()
    this.setupReset()
  }

  private renderChips(
    containerId: string,
    items: Array<{ key: string; label: string; icon?: string; color?: string }>,
    activeSet: Set<string>,
    onToggle: (key: string, active: boolean) => void
  ): void {
    const container = document.getElementById(containerId)
    if (!container) return

    container.innerHTML = items.map(item => `
      <button
        class="chip ${activeSet.has(item.key) ? 'active' : ''}"
        data-key="${item.key}"
        style="--chip-color: ${item.color || '#10B981'}"
        title="${item.label}"
      >
        ${item.icon ? `<span class="chip-icon">${item.icon}</span>` : ''}
        ${item.label}
      </button>
    `).join('')

    container.querySelectorAll<HTMLButtonElement>('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.key!
        const nowActive = !chip.classList.contains('active')
        chip.classList.toggle('active', nowActive)
        onToggle(key, nowActive)
      })
    })
  }

  private setupSearch(): void {
    const input = document.getElementById('search-input') as HTMLInputElement
    const clearBtn = document.getElementById('search-clear')

    input.addEventListener('input', () => {
      this.state.search = input.value.trim().toLowerCase()
      clearBtn?.classList.toggle('visible', this.state.search.length > 0)
      this.emitWithBadge()
    })

    clearBtn?.addEventListener('click', () => {
      input.value = ''
      this.state.search = ''
      clearBtn.classList.remove('visible')
      input.focus()
      this.emitWithBadge()
    })
  }

  private setupAccordions(): void {
    document.querySelectorAll<HTMLButtonElement>('.filter-section-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.filter-section')!.classList.toggle('collapsed')
      })
    })
  }

  private setupReset(): void {
    document.getElementById('reset-filters')?.addEventListener('click', () => {
      this.reset()
    })
  }

  private reset(): void {
    this.state.themes.clear()
    this.state.statuses.clear()
    this.state.partners.clear()
    this.state.sections.clear()
    this.state.search = ''

    const input = document.getElementById('search-input') as HTMLInputElement
    if (input) input.value = ''
    document.getElementById('search-clear')?.classList.remove('visible')

    document.querySelectorAll<HTMLButtonElement>('.chip.active').forEach(c => c.classList.remove('active'))
    this.emitWithBadge()
  }

  private countActiveFilters(): number {
    return this.state.themes.size + this.state.statuses.size +
           this.state.partners.size + this.state.sections.size +
           (this.state.search ? 1 : 0)
  }

  private emitWithBadge(): void {
    const count = this.countActiveFilters()
    const badge = document.getElementById('filter-badge')
    const resetBtn = document.getElementById('reset-filters')

    if (badge) {
      badge.textContent = count > 0 ? String(count) : ''
      badge.classList.toggle('visible', count > 0)
    }
    if (resetBtn) {
      resetBtn.classList.toggle('visible', count > 0)
    }

    this.onChange(this.state)
  }

  apply(projects: ProcessedProject[]): ProcessedProject[] {
    const { themes, statuses, partners, sections, search } = this.state

    return projects.filter(p => {
      if (themes.size > 0   && !themes.has(p.theme)) return false
      if (statuses.size > 0 && !statuses.has(p.status)) return false
      if (partners.size > 0 && !p.partners.some(pk => partners.has(pk))) return false
      if (sections.size > 0 && !sections.has(p.section)) return false
      if (search && !p.name.toLowerCase().includes(search)) return false
      return true
    })
  }

  private emit(): void {
    this.onChange(this.state)
  }

  getState(): FilterState {
    return this.state
  }
}
