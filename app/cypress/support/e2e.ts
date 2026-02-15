// Cypress E2E support file
// Import commands.ts using ES2015 syntax:
import './commands'

// Prevent TypeScript errors for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>
    }
  }
}
