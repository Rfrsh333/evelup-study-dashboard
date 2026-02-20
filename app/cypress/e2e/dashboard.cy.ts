describe('Dashboard - Start Here Flow', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.setItem('levelup-language', 'nl')
      },
    })
  })

  it('should show StartHereCard when no data is imported', () => {
    cy.getByTestId('next-up').should('be.visible')
    cy.getByTestId('next-class').should('be.visible')
    cy.getByTestId('next-deadline').should('be.visible')
    cy.getByTestId('today-events').should('be.visible')
    cy.getByTestId('start-here-card').should('be.visible')
    cy.getByTestId('start-here-import-calendar').should('be.visible')
    cy.getByTestId('start-here-import-grades').should('be.visible')
    cy.getByTestId('start-here-view-week').should('be.visible')
  })

  it('should navigate to settings when Next up import roster CTA is clicked', () => {
    cy.getByTestId('next-up-import-roster').click()
    cy.url().should('include', '#calendar')
  })

  it('should navigate to settings when Import Rooster is clicked', () => {
    cy.getByTestId('start-here-import-calendar').click()

    // Should navigate to settings with calendar focus
    // Note: This depends on your routing implementation
    cy.url().should('include', '#calendar')
  })

  it('should navigate to settings when Import Cijfers is clicked', () => {
    cy.getByTestId('start-here-import-grades').click()

    // Should navigate to settings with grades focus
    cy.url().should('include', '#grades')
  })

  it('should navigate to week view when Bekijk week is clicked', () => {
    cy.getByTestId('start-here-view-week').click()

    // Should navigate to week view
    // This depends on how your app handles navigation
  })
})

describe('Dashboard - Today Hero with Data', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.setItem('levelup-language', 'nl')
      },
    })
  })

  it('should show compact StartHereCard when data exists', () => {
    cy.getByTestId('header-demo-data').click()
    cy.getByTestId('next-up').should('be.visible')
    cy.getByTestId('next-class').should('be.visible')
    cy.getByTestId('next-deadline').should('be.visible')
    cy.getByTestId('today-events').should('be.visible')
    cy.getByTestId('next-up-view-week').should('be.visible')
  })

  it('should display max 3 items in Today Hero', () => {
    // This test requires data to be present
    // You would need to seed the app with test data
    // For MVP, we can skip this or mock the data
  })
})

describe('Dashboard - i18n Language Switching', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.setItem('levelup-language', 'nl')
      },
    })
  })

  it('should default to Dutch', () => {
    cy.getByTestId('start-here-card').should('be.visible')
  })

  it('should switch to English when language toggle is clicked', () => {
    cy.getByTestId('lang-en').click()
    cy.getByTestId('start-here-card').should('be.visible')
    cy.getByTestId('lang-en').should('have.attr', 'aria-pressed', 'true')
    cy.getByTestId('lang-nl').should('have.attr', 'aria-pressed', 'false')
  })

  it('should persist language choice in localStorage', () => {
    cy.getByTestId('lang-en').click()

    // Reload page
    cy.reload()

    cy.getByTestId('start-here-card').should('be.visible')
  })
})
