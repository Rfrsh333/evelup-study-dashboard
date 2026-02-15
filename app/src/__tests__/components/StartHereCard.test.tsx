import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StartHereCard } from '@/components/common/StartHereCard'

// Mock i18n
vi.mock('@/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dashboard.startHere.title': 'Start hier',
        'dashboard.startHere.subtitle': 'Welkom bij LevelUp',
        'dashboard.startHere.compact': 'Geen data',
        'dashboard.startHere.bullets.importCalendar': 'Import je agenda',
        'dashboard.startHere.bullets.importGrades': 'Import je cijfers',
        'dashboard.startHere.bullets.makeFocusBlocks': 'Maak focusblokken',
        'dashboard.startHere.cta.importCalendar': 'Importeer Agenda',
        'dashboard.startHere.cta.importGrades': 'Importeer Cijfers',
        'dashboard.startHere.cta.viewWeek': 'Bekijk week',
      }
      return translations[key] || key
    },
  }),
}))

describe('StartHereCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('full mode (default)', () => {
    it('should render title and subtitle', () => {
      render(<StartHereCard />)
      expect(screen.getByText('Start hier')).toBeInTheDocument()
      expect(screen.getByText('Welkom bij LevelUp')).toBeInTheDocument()
    })

    it('should render 3 bullet points', () => {
      render(<StartHereCard />)
      expect(screen.getByText(/Import je agenda/)).toBeInTheDocument()
      expect(screen.getByText(/Import je cijfers/)).toBeInTheDocument()
      expect(screen.getByText(/Maak focusblokken/)).toBeInTheDocument()
    })

    it('should render 3 action buttons', () => {
      render(<StartHereCard />)
      expect(screen.getByRole('button', { name: 'Importeer Agenda' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Importeer Cijfers' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Bekijk week' })).toBeInTheDocument()
    })

    it('should dispatch navigate event to calendar when Import Agenda clicked', async () => {
      const user = userEvent.setup()
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

      render(<StartHereCard />)
      const calendarButton = screen.getByRole('button', { name: 'Importeer Agenda' })
      await user.click(calendarButton)

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app:navigate',
          detail: { view: 'settings', focus: 'calendar' },
        })
      )
    })

    it('should dispatch navigate event to grades when Import Cijfers clicked', async () => {
      const user = userEvent.setup()
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

      render(<StartHereCard />)
      const gradesButton = screen.getByRole('button', { name: 'Importeer Cijfers' })
      await user.click(gradesButton)

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app:navigate',
          detail: { view: 'settings', focus: 'grades' },
        })
      )
    })

    it('should dispatch navigate event to week view when Bekijk week clicked', async () => {
      const user = userEvent.setup()
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

      render(<StartHereCard />)
      const weekButton = screen.getByRole('button', { name: 'Bekijk week' })
      await user.click(weekButton)

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app:navigate',
          detail: { view: 'week' },
        })
      )
    })
  })

  describe('compact mode', () => {
    it('should only render title and view week button', () => {
      render(<StartHereCard compact />)

      expect(screen.getByText('Start hier')).toBeInTheDocument()
      expect(screen.getByText('Geen data')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Bekijk week' })).toBeInTheDocument()
    })

    it('should not render import buttons in compact mode', () => {
      render(<StartHereCard compact />)

      expect(screen.queryByRole('button', { name: 'Importeer Agenda' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Importeer Cijfers' })).not.toBeInTheDocument()
    })

    it('should not render bullet points in compact mode', () => {
      render(<StartHereCard compact />)

      expect(screen.queryByText(/Import je agenda/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Import je cijfers/)).not.toBeInTheDocument()
    })
  })
})
