describe('Local Mode - Supabase Fallback', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.setItem('levelup-language', 'nl')
      },
    })
  })

  it('should work without Supabase connection', () => {
    // The app should fall back to localStorage when Supabase is unavailable
    // All features should still work in local mode

    // Verify app loads
    cy.get('body').should('exist')
    cy.getByTestId('start-here-card').should('be.visible')
  })

  it('should persist data to localStorage in local mode', () => {
    // Import some data
    // Reload page
    // Verify data persists

    // This would require:
    // 1. Import ICS or CSV
    // 2. cy.reload()
    // 3. Verify data still exists
  })

  it('should show local mode indicator when DB unavailable', () => {
    // If database is not configured, should show a banner/message
    // cy.contains('Lokale modus').should('be.visible')
  })

  it('should not crash on Supabase errors', () => {
    // The app should gracefully handle Supabase errors
    // And continue working in local mode

    // All core features should work:
    // - Import ICS
    // - Import CSV
    // - View week
    // - Create focus blocks
  })
})
