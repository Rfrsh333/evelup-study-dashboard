// Cypress E2E support file
// Import commands.ts using ES2015 syntax:
import './commands'

// Prevent TypeScript errors for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom command types here if needed
      // Example: login(email: string, password: string): Chainable<void>
    }
  }
}
