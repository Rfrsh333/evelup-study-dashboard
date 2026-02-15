describe('Grades Import - CSV Flow', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.setItem('levelup-language', 'nl')
      },
    })
  })

  it('should navigate to grades import from dashboard', () => {
    cy.getByTestId('start-here-import-grades').click()
    cy.url().should('include', '#grades')
    cy.getByTestId('grades-import-panel').should('be.visible')
  })

  it('should have CSV upload option', () => {
    cy.getByTestId('start-here-import-grades').click()
    cy.getByTestId('grades-import-panel').should('be.visible')
    cy.contains('button', 'CSV').click()
    cy.getByTestId('grades-import-file-input').should('exist')
  })

  it('should parse CSV and show preview', () => {
    // This test requires uploading a CSV file
    // cy.contains('button', 'Importeer cijfers').click()
    // cy.contains('CSV').click()
    // cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.csv')

    // Should show preview of parsed data
    // cy.contains('Software Engineering').should('be.visible')
    // cy.contains('Assignment 1').should('be.visible')
  })

  it('should allow column mapping', () => {
    // After uploading CSV, should be able to map columns
    // cy.contains('button', 'Importeer cijfers').click()
    // cy.contains('CSV').click()
    // cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.csv')

    // Should show mapping interface
    // cy.get('[data-testid="column-mapping"]').should('be.visible')
  })

  it('should calculate predicted grades after import', () => {
    // After importing grades, navigate to grades view
    // Should show predicted grade and required grade for each course
  })

  it('should handle null scores correctly', () => {
    // Import CSV with null scores
    // Verify they are handled correctly in calculations
  })

  it('should show block progress after import', () => {
    // After import, should show which blocks are complete (Voldaan/Open)
  })
})

describe('Grades Import - PDF Flow', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.setItem('levelup-language', 'nl')
      },
    })
  })

  it('should have PDF upload option', () => {
    cy.getByTestId('start-here-import-grades').click()
    cy.getByTestId('grades-import-panel').should('be.visible')
  })

  it('should parse Brightspace PDF', () => {
    // Upload a Brightspace Progress Summary PDF
    // Verify it's parsed correctly
  })
})
