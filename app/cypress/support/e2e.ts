// Cypress E2E support file
// Import commands.ts using ES2015 syntax:
import './commands'
export {}

// Prevent TypeScript errors for custom commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>
    }
  }
}
