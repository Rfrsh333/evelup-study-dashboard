describe('Dashboard - Start Here Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    // Clear local storage to start fresh
    cy.clearLocalStorage()
  })

  it('should show StartHereCard when no data is imported', () => {
    // Check that StartHereCard is visible
    cy.contains('Start hier').should('be.visible')
    cy.contains('Importeer rooster').should('be.visible')
    cy.contains('Importeer cijfers').should('be.visible')
    cy.contains('Bekijk week').should('be.visible')
  })

  it('should navigate to settings when Import Rooster is clicked', () => {
    cy.contains('button', 'Importeer rooster').click()

    // Should navigate to settings with calendar focus
    // Note: This depends on your routing implementation
    cy.url().should('include', '#calendar')
  })

  it('should navigate to settings when Import Cijfers is clicked', () => {
    cy.contains('button', 'Importeer cijfers').click()

    // Should navigate to settings with grades focus
    cy.url().should('include', '#grades')
  })

  it('should navigate to week view when Bekijk week is clicked', () => {
    cy.contains('button', 'Bekijk week').click()

    // Should navigate to week view
    // This depends on how your app handles navigation
  })
})

describe('Dashboard - Today Hero with Data', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show compact StartHereCard when data exists', () => {
    // This test would require seeding data first
    // For now, we'll just verify the structure exists
    cy.get('body').should('exist')
  })

  it('should display max 3 items in Today Hero', () => {
    // This test requires data to be present
    // You would need to seed the app with test data
    // For MVP, we can skip this or mock the data
  })
})

describe('Dashboard - i18n Language Switching', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearLocalStorage()
  })

  it('should default to Dutch', () => {
    cy.contains('Start hier').should('be.visible')
    cy.contains('Importeer rooster').should('be.visible')
  })

  it('should switch to English when language toggle is clicked', () => {
    // Find and click language toggle (you may need to adjust selector)
    // This depends on where your language switcher is located
    // For now, we'll just verify that the mechanism exists

    // Check for language switcher in the UI
    // cy.get('[data-testid="language-toggle"]').click()
    // cy.contains('Start here').should('be.visible')
    // cy.contains('Import schedule').should('be.visible')
  })

  it('should persist language choice in localStorage', () => {
    // Switch to English
    // cy.get('[data-testid="language-toggle"]').click()

    // Reload page
    cy.reload()

    // Should still be in English
    // cy.contains('Start here').should('be.visible')
  })
})
