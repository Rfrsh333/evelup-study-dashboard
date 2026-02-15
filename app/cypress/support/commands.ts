// Custom Cypress commands

// Example:
// Cypress.Commands.add('login', (email, password) => { ... })

Cypress.Commands.add('getByTestId', (id: string) => cy.get(`[data-testid="${id}"]`))
